'use client'

import { useState, useCallback, useEffect } from 'react'
import { fetchWithCurrentAuth } from '@/lib/auth/auth-store'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  actions?: ChatAction[]
  links?: ChatLink[]
}

export interface ChatAction {
  type: 'search' | 'stats' | 'recent' | 'deadlines' | 'help' | 'classification'
  label: string
  data?: Record<string, unknown>
}

export interface ChatLink {
  text: string
  href: string
  type: 'archive' | 'workflow' | 'movement' | 'user'
}

interface UseChatOptions {
  storageKey?: string
  maxMessages?: number
}

export function useChat(options: UseChatOptions = {}) {
  const { storageKey = 'banking-archive-chat-history', maxMessages = 50 } = options
  
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Load messages from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsed.map((msg: ChatMessage) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
        setMessages(messagesWithDates)
      }
    } catch (err) {
      console.error('Failed to load chat history:', err)
    }
  }, [storageKey])
  
  // Save messages to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages.slice(-maxMessages)))
    } catch (err) {
      console.error('Failed to save chat history:', err)
    }
  }, [messages, storageKey, maxMessages])
  
  const sendMessage = useCallback(async (content: string, actions?: ChatAction[]) => {
    if (!content.trim() && !actions?.length) return
    
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
      actions
    }
    
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetchWithCurrentAuth('/assistant/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: content.trim(),
          history: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content
          })),
          actions
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to get response from AI assistant')
      }
      
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''
      const assistantMessageId = `msg-${Date.now()}-assistant`
      
      // Add placeholder message for streaming
      setMessages(prev => [...prev, {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date()
      }])
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                if (data.content) {
                  assistantContent += data.content
                  setMessages(prev => prev.map(m => 
                    m.id === assistantMessageId 
                      ? { ...m, content: assistantContent }
                      : m
                  ))
                }
                if (data.links) {
                  setMessages(prev => prev.map(m => 
                    m.id === assistantMessageId 
                      ? { ...m, links: data.links }
                      : m
                  ))
                }
                if (data.actions) {
                  setMessages(prev => prev.map(m => 
                    m.id === assistantMessageId 
                      ? { ...m, actions: data.actions }
                      : m
                  ))
                }
              } catch {
                // Ignore parsing errors for incomplete chunks
              }
            }
          }
        }
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      
      // Add error message as assistant response
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: `Désolé, une erreur s'est produite: ${errorMessage}. Veuillez réessayer.`,
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
    }
  }, [messages])
  
  const clearHistory = useCallback(() => {
    setMessages([])
    localStorage.removeItem(storageKey)
  }, [storageKey])
  
  const addQuickAction = useCallback((action: ChatAction) => {
    switch (action.type) {
      case 'search':
        sendMessage(`Recherche de documents: ${action.data?.query || ''}`)
        break
      case 'stats':
        sendMessage('Quelles sont les statistiques du jour ?')
        break
      case 'recent':
        sendMessage('Quels sont les documents récents ?')
        break
      case 'deadlines':
        sendMessage('Quelles sont les échéances cette semaine ?')
        break
      case 'help':
        sendMessage('Aidez-moi à classifier un document')
        break
      case 'classification':
        sendMessage('Guidez-moi pour la classification des documents')
        break
    }
  }, [sendMessage])
  
  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearHistory,
    addQuickAction
  }
}
