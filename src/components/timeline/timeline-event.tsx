'use client'

import { motion } from 'framer-motion'
import { format, formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import Link from 'next/link'
import {
  FileText,
  Edit,
  Eye,
  Download,
  Trash2,
  GitBranch,
  CheckCircle,
  XCircle,
  ArrowRightLeft,
  Package,
  Clock,
  User,
  ExternalLink,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface TimelineEventType {
  id: string
  type: 'document_created' | 'document_modified' | 'document_viewed' | 'document_downloaded' |
        'document_deleted' | 'workflow_started' | 'workflow_approved' | 'workflow_rejected' |
        'movement_created' | 'movement_executed' | 'movement_returned'
  entityType: 'archive' | 'workflow' | 'movement'
  entityId: string
  entityReference: string
  entityTitle: string
  actor: {
    id: string
    name: string
    avatar?: string
  }
  timestamp: string
  description: string
  metadata?: Record<string, unknown>
}

interface TimelineEventProps {
  event: TimelineEventType
  variant?: 'card' | 'dot'
  onClick?: () => void
  showLink?: boolean
}

export const eventConfig: Record<string, { 
  icon: typeof FileText
  color: string
  bgColor: string
  label: string
}> = {
  document_created: { 
    icon: FileText, 
    color: 'text-emerald-600', 
    bgColor: 'bg-emerald-100 dark:bg-emerald-950', 
    label: 'Création' 
  },
  document_modified: { 
    icon: Edit, 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-100 dark:bg-blue-950', 
    label: 'Modification' 
  },
  document_viewed: { 
    icon: Eye, 
    color: 'text-gray-600', 
    bgColor: 'bg-gray-100 dark:bg-gray-800', 
    label: 'Consultation' 
  },
  document_downloaded: { 
    icon: Download, 
    color: 'text-purple-600', 
    bgColor: 'bg-purple-100 dark:bg-purple-950', 
    label: 'Téléchargement' 
  },
  document_deleted: { 
    icon: Trash2, 
    color: 'text-red-600', 
    bgColor: 'bg-red-100 dark:bg-red-950', 
    label: 'Suppression' 
  },
  workflow_started: { 
    icon: GitBranch, 
    color: 'text-amber-600', 
    bgColor: 'bg-amber-100 dark:bg-amber-950', 
    label: 'Workflow' 
  },
  workflow_approved: { 
    icon: CheckCircle, 
    color: 'text-emerald-600', 
    bgColor: 'bg-emerald-100 dark:bg-emerald-950', 
    label: 'Approbation' 
  },
  workflow_rejected: { 
    icon: XCircle, 
    color: 'text-red-600', 
    bgColor: 'bg-red-100 dark:bg-red-950', 
    label: 'Rejet' 
  },
  movement_created: { 
    icon: ArrowRightLeft, 
    color: 'text-teal-600', 
    bgColor: 'bg-teal-100 dark:bg-teal-950', 
    label: 'Mouvement' 
  },
  movement_executed: { 
    icon: Package, 
    color: 'text-indigo-600', 
    bgColor: 'bg-indigo-100 dark:bg-indigo-950', 
    label: 'Exécution' 
  },
  movement_returned: { 
    icon: ArrowRightLeft, 
    color: 'text-cyan-600', 
    bgColor: 'bg-cyan-100 dark:bg-cyan-950', 
    label: 'Retour' 
  },
}

export function TimelineEventCard({ event, variant = 'card', onClick, showLink = true }: TimelineEventProps) {
  const config = eventConfig[event.type] || eventConfig.document_viewed
  const Icon = config.icon

  if (variant === 'dot') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="group relative"
        onClick={onClick}
      >
        <div
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all',
            'hover:scale-110 hover:shadow-lg',
            config.bgColor
          )}
        >
          <Icon className={cn('h-5 w-5', config.color)} />
        </div>
        
        {/* Hover tooltip */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-50">
          <Card className="w-64 shadow-lg">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className={cn('text-xs', config.color)}>
                  {config.label}
                </Badge>
              </div>
              <p className="text-sm font-medium truncate">{event.entityTitle}</p>
              <p className="text-xs text-muted-foreground mt-1">{event.actor.name}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(event.timestamp), 'dd/MM/yyyy HH:mm', { locale: fr })}
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn(
        'overflow-hidden hover:shadow-md transition-shadow cursor-pointer',
        'border-l-4',
        config.color.replace('text-', 'border-l-')
      )} onClick={onClick}>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className={cn(
              'shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
              config.bgColor
            )}>
              <Icon className={cn('h-5 w-5', config.color)} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={cn('text-xs', config.color)}>
                      {config.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {event.entityReference}
                    </span>
                  </div>
                  <h4 className="font-medium mt-1 truncate">{event.description}</h4>
                </div>
                <time className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(event.timestamp), { 
                    addSuffix: true, 
                    locale: fr 
                  })}
                </time>
              </div>

              {/* Metadata */}
              {event.metadata && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {Object.entries(event.metadata).slice(0, 3).map(([key, value]) => (
                    value && typeof value === 'string' && (
                      <span key={key} className="text-xs bg-muted px-2 py-0.5 rounded">
                        {value}
                      </span>
                    )
                  ))}
                </div>
              )}

              {/* Actor */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{event.actor.name}</span>
                  <span className="text-muted-foreground">•</span>
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <time className="text-sm text-muted-foreground">
                    {format(new Date(event.timestamp), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                  </time>
                </div>
                
                {showLink && (
                  <Link
                    href={`/${event.entityType === 'archive' ? 'archives' : event.entityType === 'workflow' ? 'workflows' : 'movements'}?id=${event.entityId}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    Voir détails
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function TimelineEventCompact({ event, onClick }: TimelineEventProps) {
  const config = eventConfig[event.type] || eventConfig.document_viewed
  const Icon = config.icon

  return (
    <div
      className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className={cn(
        'shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
        config.bgColor
      )}>
        <Icon className={cn('h-4 w-4', config.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{event.description}</p>
        <p className="text-xs text-muted-foreground">
          {event.actor.name} • {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true, locale: fr })}
        </p>
      </div>
    </div>
  )
}
