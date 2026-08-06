'use client'

import { motion } from 'framer-motion'
import { format, formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { 
  Clock, 
  User, 
  FileText, 
  ArrowRightLeft, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Building2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimelineEvent {
  id: string
  type: 'create' | 'update' | 'view' | 'download' | 'move' | 'borrow' | 'return' | 'approve' | 'reject' | 'delete' | 'transfer'
  title: string
  description?: string
  user: string
  timestamp: string
  details?: Record<string, unknown>
}

interface ArchiveTimelineProps {
  events: TimelineEvent[]
  className?: string
}

const eventConfig: Record<string, { icon: typeof Clock; color: string; bgColor: string }> = {
  create: { icon: FileText, color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-950' },
  update: { icon: Edit, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-950' },
  view: { icon: Eye, color: 'text-gray-600', bgColor: 'bg-gray-100 dark:bg-gray-800' },
  download: { icon: Download, color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-950' },
  move: { icon: ArrowRightLeft, color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-950' },
  borrow: { icon: FileText, color: 'text-teal-600', bgColor: 'bg-teal-100 dark:bg-teal-950' },
  return: { icon: ArrowRightLeft, color: 'text-indigo-600', bgColor: 'bg-indigo-100 dark:bg-indigo-950' },
  approve: { icon: CheckCircle, color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-950' },
  reject: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-950' },
  delete: { icon: Trash2, color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-950' },
  transfer: { icon: Building2, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-950' },
}

export function ArchiveTimeline({ events, className }: ArchiveTimelineProps) {
  return (
    <div className={cn('relative space-y-4', className)}>
      {/* Timeline line */}
      <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />
      
      {events.map((event, index) => {
        const config = eventConfig[event.type] || eventConfig.view
        const Icon = config.icon
        
        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative flex gap-4"
          >
            {/* Icon */}
            <div className={cn(
              'relative z-10 flex items-center justify-center w-6 h-6 rounded-full',
              config.bgColor
            )}>
              <Icon className={cn('h-3.5 w-3.5', config.color)} />
            </div>
            
            {/* Content */}
            <div className="flex-1 -mt-1 pb-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{event.title}</p>
                  {event.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {event.description}
                    </p>
                  )}
                </div>
                <time className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(event.timestamp), { 
                    addSuffix: true, 
                    locale: fr 
                  })}
                </time>
              </div>
              
              <div className="flex items-center gap-2 mt-1.5">
                <User className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{event.user}</span>
                <span className="text-xs text-muted-foreground">•</span>
                <time className="text-xs text-muted-foreground">
                  {format(new Date(event.timestamp), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                </time>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// Generate mock timeline events
export function generateMockTimeline(archiveId: string): TimelineEvent[] {
  const now = new Date()
  
  return [
    {
      id: '1',
      type: 'create',
      title: 'Archive créée',
      description: 'Création initiale de l\'archive',
      user: 'Marie Martin',
      timestamp: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      type: 'update',
      title: 'Métadonnées mises à jour',
      description: 'Ajout de mots-clés et mise à jour de la localisation',
      user: 'Pierre Bernard',
      timestamp: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      type: 'borrow',
      title: 'Emprunt demandé',
      description: 'Demande d\'emprunt pour consultation',
      user: 'Thomas Leroy',
      timestamp: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      type: 'approve',
      title: 'Emprunt approuvé',
      description: 'Approbation par le responsable archives',
      user: 'Marie Martin',
      timestamp: new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '5',
      type: 'view',
      title: 'Document consulté',
      user: 'Thomas Leroy',
      timestamp: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '6',
      type: 'return',
      title: 'Archive restituée',
      description: 'Retour après emprunt',
      user: 'Thomas Leroy',
      timestamp: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '7',
      type: 'download',
      title: 'Fichier téléchargé',
      description: 'Téléchargement de la copie numérique',
      user: 'Sophie Petit',
      timestamp: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '8',
      type: 'view',
      title: 'Fiche consultée',
      user: 'Luc Moreau',
      timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]
}
