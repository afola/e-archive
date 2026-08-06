'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, 
  X, 
  Send, 
  Trash2, 
  Bot, 
  Sparkles,
  Minimize2,
  Maximize2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { useChat } from '@/hooks/use-chat'
import { ChatMessage } from './chat-message'
import { QuickActionsGrid, QuickActions } from './quick-actions'

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const { 
    messages, 
    isLoading, 
    sendMessage, 
    clearHistory, 
    addQuickAction 
  } = useChat()
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])
  
  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])
  
  const handleSend = useCallback(() => {
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue.trim())
      setInputValue('')
    }
  }, [inputValue, isLoading, sendMessage])
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])
  
  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(text)
    setTimeout(() => setCopiedId(null), 2000)
  }, [])
  
  const handleQuickAction = useCallback((action: { type: string; label: string }) => {
    addQuickAction(action as any)
  }, [addQuickAction])
  
  return (
    <TooltipProvider>
      <div className="fixed bottom-4 right-4 z-50">
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="chat-window"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className={cn(
                'bg-background border rounded-2xl shadow-2xl flex flex-col overflow-hidden',
                isExpanded 
                  ? 'fixed inset-4 sm:inset-8 rounded-2xl' 
                  : 'w-[380px] h-[580px]'
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Bot className="h-6 w-6" />
                    <Sparkles className="h-3 w-3 absolute -top-1 -right-1 text-yellow-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Assistant Archives</h3>
                    <p className="text-xs text-emerald-100">
                      {isLoading ? 'En train de réfléchir...' : 'Toujours prêt à vous aider'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white hover:bg-white/20"
                        onClick={() => setIsExpanded(!isExpanded)}
                      >
                        {isExpanded ? (
                          <Minimize2 className="h-4 w-4" />
                        ) : (
                          <Maximize2 className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isExpanded ? 'Réduire' : 'Agrandir'}
                    </TooltipContent>
                  </Tooltip>
                  
                  <AlertDialog>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white hover:bg-white/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        Effacer l'historique
                      </TooltipContent>
                    </Tooltip>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Effacer l'historique</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer tout l'historique de conversation ?
                          Cette action est irréversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={clearHistory}>
                          Effacer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white hover:bg-white/20"
                        onClick={() => setIsOpen(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Fermer
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              
              {/* Messages */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4"
              >
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-4">
                        <Bot className="h-8 w-8 text-emerald-600" />
                      </div>
                      <h4 className="font-semibold text-lg mb-2">
                        Bonjour ! 👋
                      </h4>
                      <p className="text-sm text-muted-foreground mb-6">
                        Je suis votre assistant pour la gestion des archives bancaires.
                        Comment puis-je vous aider aujourd'hui ?
                      </p>
                      <QuickActionsGrid 
                        onAction={handleQuickAction} 
                        disabled={isLoading}
                        className="max-w-[300px] mx-auto"
                      />
                    </div>
                  ) : (
                    <>
                      {messages.map((message) => (
                        <ChatMessage 
                          key={message.id} 
                          message={message} 
                          onCopy={handleCopy}
                          copiedId={copiedId}
                        />
                      ))}
                      
                      {isLoading && (
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center">
                            <Bot className="h-4 w-4 text-white" />
                          </div>
                          <div className="bg-muted rounded-2xl px-4 py-3">
                            <div className="flex gap-1">
                              <span className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                              <span className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                              <span className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Quick actions after messages */}
                      {!isLoading && messages.length > 0 && (
                        <div className="pt-4 border-t">
                          <p className="text-xs text-muted-foreground mb-2">Actions rapides:</p>
                          <QuickActions 
                            onAction={handleQuickAction} 
                            disabled={isLoading}
                            compact
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
              
              {/* Input */}
              <div className="border-t p-3 bg-background">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Posez votre question..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isLoading}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Appuyez sur Entrée pour envoyer
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="chat-button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', duration: 0.3 }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => setIsOpen(true)}
                    className="h-14 w-14 rounded-full shadow-lg bg-emerald-600 hover:bg-emerald-700 relative group"
                  >
                    <MessageCircle className="h-6 w-6" />
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white">
                      AI
                    </span>
                    <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-20" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Assistant IA Archives</p>
                </TooltipContent>
              </Tooltip>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  )
}
