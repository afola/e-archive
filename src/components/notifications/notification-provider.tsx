'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSocket, Notification } from '@/hooks/use-socket'
import { useToast } from '@/hooks/use-toast'
import { Bell, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface NotificationItem extends Notification {
  isRead: boolean
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { subscribeToNotifications } = useSocket()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  
  useEffect(() => {
    const unsubscribe = subscribeToNotifications((notification) => {
      // Add to notifications list
      setNotifications(prev => [
        { ...notification, isRead: false },
        ...prev.slice(0, 49) // Keep max 50 notifications
      ])
      
      // Show toast
      const icon = {
        'SUCCESS': <CheckCircle className="h-4 w-4 text-emerald-500" />,
        'WARNING': <AlertTriangle className="h-4 w-4 text-amber-500" />,
        'ALERT': <XCircle className="h-4 w-4 text-red-500" />,
        'INFO': <Info className="h-4 w-4 text-blue-500" />,
      }[notification.type] || <Bell className="h-4 w-4" />
      
      toast({
        title: (
          <div className="flex items-center gap-2">
            {icon}
            <span>{notification.title}</span>
          </div>
        ),
        description: notification.message,
        variant: notification.type === 'ALERT' ? 'destructive' : 'default',
      })
    })
    
    return unsubscribe
  }, [subscribeToNotifications, toast])
  
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    )
  }, [])
  
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }, [])
  
  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])
  
  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])
  
  const unreadCount = notifications.filter(n => !n.isRead).length
  
  return (
    <>
      {children}
    </>
  )
}

export type { NotificationItem }
export { useNotifications }

// Hook to access notifications
function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    )
  }, [])
  
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }, [])
  
  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])
  
  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])
  
  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [
      { ...notification, isRead: false },
      ...prev.slice(0, 49)
    ])
  }, [])
  
  return {
    notifications,
    unreadCount: notifications.filter(n => !n.isRead).length,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
    addNotification,
  }
}
