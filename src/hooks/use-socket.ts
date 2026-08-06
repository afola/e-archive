'use client'

import { useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/lib/auth/auth-store'

export interface Notification {
  id: string
  type: 'ALERT' | 'INFO' | 'WARNING' | 'SUCCESS'
  title: string
  message: string
  link?: string
  timestamp: string
}

export function useSocket() {
  const socketRef = useRef<Socket | null>(null)
  const { user, isAuthenticated } = useAuthStore()
  
  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
      return
    }
    
    // Connect to WebSocket server with port transformation
    socketRef.current = io('/?XTransformPort=3002', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })
    
    const socket = socketRef.current
    
    socket.on('connect', () => {
      console.log('[Socket] Connected')
      socket.emit('authenticate', user.id)
      
      if (user.agencyId) {
        socket.emit('join-agency', user.agencyId)
      }
    })
    
    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected')
    })
    
    socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message)
    })
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [isAuthenticated, user])
  
  const subscribeToNotifications = useCallback((callback: (notification: Notification) => void) => {
    if (!socketRef.current) return () => {}
    
    socketRef.current.on('notification', callback)
    
    return () => {
      socketRef.current?.off('notification', callback)
    }
  }, [])
  
  const subscribeToWorkflowEvents = useCallback((callback: (event: unknown) => void) => {
    if (!socketRef.current) return () => {}
    
    socketRef.current.on('workflow:pending', callback)
    socketRef.current.on('workflow:approved', callback)
    socketRef.current.on('workflow:rejected', callback)
    
    return () => {
      socketRef.current?.off('workflow:pending', callback)
      socketRef.current?.off('workflow:approved', callback)
      socketRef.current?.off('workflow:rejected', callback)
    }
  }, [])
  
  const subscribeToArchiveEvents = useCallback((callback: (event: unknown) => void) => {
    if (!socketRef.current) return () => {}
    
    socketRef.current.on('archive:created', callback)
    socketRef.current.on('archive:updated', callback)
    socketRef.current.on('archive:deleted', callback)
    
    return () => {
      socketRef.current?.off('archive:created', callback)
      socketRef.current?.off('archive:updated', callback)
      socketRef.current?.off('archive:deleted', callback)
    }
  }, [])
  
  const emitWorkflowRequest = useCallback((data: unknown) => {
    socketRef.current?.emit('workflow:request', data)
  }, [])
  
  const emitWorkflowApprove = useCallback((data: unknown) => {
    socketRef.current?.emit('workflow:approve', data)
  }, [])
  
  const emitWorkflowReject = useCallback((data: unknown) => {
    socketRef.current?.emit('workflow:reject', data)
  }, [])
  
  const emitArchiveCreate = useCallback((data: unknown) => {
    socketRef.current?.emit('archive:create', data)
  }, [])
  
  const emitArchiveUpdate = useCallback((data: unknown) => {
    socketRef.current?.emit('archive:update', data)
  }, [])
  
  const emitArchiveDelete = useCallback((data: unknown) => {
    socketRef.current?.emit('archive:delete', data)
  }, [])
  
  return {
    subscribeToNotifications,
    subscribeToWorkflowEvents,
    subscribeToArchiveEvents,
    emitWorkflowRequest,
    emitWorkflowApprove,
    emitWorkflowReject,
    emitArchiveCreate,
    emitArchiveUpdate,
    emitArchiveDelete,
  }
}
