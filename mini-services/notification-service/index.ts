import { createServer } from 'http'
import { Server } from 'socket.io'

const PORT = 3002

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3000', 'http://21.0.3.216:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

// Store connected users
const connectedUsers = new Map<string, string>() // userId -> socketId

io.on('connection', (socket) => {
  console.log(`[WS] Client connected: ${socket.id}`)
  
  // User authentication
  socket.on('authenticate', (userId: string) => {
    connectedUsers.set(userId, socket.id)
    socket.join(`user:${userId}`)
    console.log(`[WS] User authenticated: ${userId}`)
    
    // Send welcome notification
    socket.emit('notification', {
      id: `notif-${Date.now()}`,
      type: 'INFO',
      title: 'Connexion réussie',
      message: 'Vous êtes connecté au service de notifications',
      timestamp: new Date().toISOString(),
    })
  })
  
  // Join agency room
  socket.on('join-agency', (agencyId: string) => {
    socket.join(`agency:${agencyId}`)
    console.log(`[WS] User joined agency: ${agencyId}`)
  })
  
  // Leave agency room
  socket.on('leave-agency', (agencyId: string) => {
    socket.leave(`agency:${agencyId}`)
  })
  
  // Handle workflow events
  socket.on('workflow:request', (data) => {
    console.log('[WS] Workflow request:', data)
    // Broadcast to validators
    io.emit('workflow:pending', data)
  })
  
  socket.on('workflow:approve', (data) => {
    console.log('[WS] Workflow approved:', data)
    // Notify requester
    if (data.requesterId) {
      io.to(`user:${data.requesterId}`).emit('notification', {
        id: `notif-${Date.now()}`,
        type: 'SUCCESS',
        title: 'Demande approuvée',
        message: `Votre demande "${data.title}" a été approuvée`,
        link: `/workflows?id=${data.workflowId}`,
        timestamp: new Date().toISOString(),
      })
    }
  })
  
  socket.on('workflow:reject', (data) => {
    console.log('[WS] Workflow rejected:', data)
    // Notify requester
    if (data.requesterId) {
      io.to(`user:${data.requesterId}`).emit('notification', {
        id: `notif-${Date.now()}`,
        type: 'ALERT',
        title: 'Demande rejetée',
        message: `Votre demande "${data.title}" a été rejetée. Motif: ${data.reason}`,
        link: `/workflows?id=${data.workflowId}`,
        timestamp: new Date().toISOString(),
      })
    }
  })
  
  // Handle archive events
  socket.on('archive:create', (data) => {
    console.log('[WS] Archive created:', data)
    io.emit('archive:created', data)
  })
  
  socket.on('archive:update', (data) => {
    console.log('[WS] Archive updated:', data)
    io.emit('archive:updated', data)
  })
  
  socket.on('archive:delete', (data) => {
    console.log('[WS] Archive deleted:', data)
    io.emit('archive:deleted', data)
  })
  
  // Handle movement events
  socket.on('movement:create', (data) => {
    console.log('[WS] Movement created:', data)
    io.emit('movement:created', data)
  })
  
  // Handle disconnection
  socket.on('disconnect', () => {
    // Remove user from connected users
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId)
        console.log(`[WS] User disconnected: ${userId}`)
        break
      }
    }
  })
})

// API for sending notifications from Next.js
// This would typically be called from Next.js API routes
export function sendNotificationToUser(userId: string, notification: object) {
  io.to(`user:${userId}`).emit('notification', notification)
}

export function sendNotificationToAgency(agencyId: string, notification: object) {
  io.to(`agency:${agencyId}`).emit('notification', notification)
}

export function broadcastNotification(notification: object) {
  io.emit('notification', notification)
}

// Start server
httpServer.listen(PORT, () => {
  console.log(`[WS] Notification service running on port ${PORT}`)
})

export { io }
