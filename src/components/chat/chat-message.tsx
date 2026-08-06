'use client'

import { useMemo } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Bot, User, Copy, Check, ExternalLink, FileText, Workflow, ArrowRightLeft, Users } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ChatMessage as ChatMessageType, ChatLink } from '@/hooks/use-chat'

interface ChatMessageProps {
  message: ChatMessageType
  onCopy?: (text: string) => void
  copiedId?: string | null
}

// Simple markdown parser for basic formatting
function parseMarkdown(text: string): React.ReactNode {
  // Split by lines for processing
  const lines = text.split('\n')
  
  return lines.map((line, lineIndex) => {
    let processedLine: React.ReactNode = line
    
    // Bold text
    processedLine = line.split('**').map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-semibold">{part}</strong>
      }
      return part
    })
    
    // Italic text
    if (typeof processedLine === 'string') {
      processedLine = line.split('*').map((part, i) => {
        if (i % 2 === 1) {
          return <em key={i}>{part}</em>
        }
        return part
      })
    }
    
    // Check for list items
    if (line.match(/^\d+\.\s/)) {
      return (
        <div key={lineIndex} className="ml-4">
          {processedLine}
        </div>
      )
    }
    
    if (line.startsWith('- ')) {
      return (
        <div key={lineIndex} className="ml-4 flex gap-2">
          <span className="text-muted-foreground">•</span>
          <span>{processedLine}</span>
        </div>
      )
    }
    
    // Empty line
    if (line === '') {
      return <br key={lineIndex} />
    }
    
    return <div key={lineIndex}>{processedLine}</div>
  })
}

function LinkIcon({ type }: { type: ChatLink['type'] }) {
  switch (type) {
    case 'archive':
      return <FileText className="h-3.5 w-3.5" />
    case 'workflow':
      return <Workflow className="h-3.5 w-3.5" />
    case 'movement':
      return <ArrowRightLeft className="h-3.5 w-3.5" />
    case 'user':
      return <Users className="h-3.5 w-3.5" />
    default:
      return <ExternalLink className="h-3.5 w-3.5" />
  }
}

export function ChatMessage({ message, onCopy, copiedId }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const isCopied = copiedId === message.id
  
  const formattedTime = useMemo(() => {
    try {
      return format(new Date(message.timestamp), 'HH:mm', { locale: fr })
    } catch {
      return ''
    }
  }, [message.timestamp])

  return (
    <div className={cn(
      'flex gap-3 group',
      isUser ? 'flex-row-reverse' : 'flex-row'
    )}>
      <Avatar className={cn(
        'h-8 w-8 flex-shrink-0',
        isUser ? 'bg-primary' : 'bg-emerald-600'
      )}>
        <AvatarFallback className={cn(
          'text-white text-xs font-medium',
          isUser ? 'bg-primary' : 'bg-emerald-600'
        )}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      
      <div className={cn(
        'flex flex-col gap-1 max-w-[85%]',
        isUser ? 'items-end' : 'items-start'
      )}>
        <div className={cn(
          'rounded-2xl px-4 py-2.5 text-sm',
          isUser 
            ? 'bg-primary text-primary-foreground rounded-br-md' 
            : 'bg-muted rounded-bl-md'
        )}>
          <div className="whitespace-pre-wrap break-words leading-relaxed">
            {parseMarkdown(message.content || '...')}
          </div>
        </div>
        
        {/* Links */}
        {message.links && message.links.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {message.links.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 rounded-full transition-colors"
              >
                <LinkIcon type={link.type} />
                <span className="max-w-[200px] truncate">{link.text}</span>
                <ExternalLink className="h-3 w-3 opacity-50" />
              </a>
            ))}
          </div>
        )}
        
        {/* Timestamp and actions */}
        <div className={cn(
          'flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity',
          isUser ? 'flex-row-reverse' : 'flex-row'
        )}>
          <span className="text-xs text-muted-foreground">
            {formattedTime}
          </span>
          
          {!isUser && onCopy && message.content && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => onCopy(message.content)}
            >
              {isCopied ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Copié
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 mr-1" />
                  Copier
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
