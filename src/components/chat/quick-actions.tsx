'use client'

import { Search, Clock, Calendar, HelpCircle, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ChatAction } from '@/hooks/use-chat'

interface QuickAction {
  type: ChatAction['type']
  label: string
  icon: React.ReactNode
  description: string
}

const quickActions: QuickAction[] = [
  {
    type: 'search',
    label: 'Rechercher un document',
    icon: <Search className="h-4 w-4" />,
    description: 'Trouver une archive par référence ou nom'
  },
  {
    type: 'recent',
    label: 'Documents récents',
    icon: <Clock className="h-4 w-4" />,
    description: 'Voir les derniers documents modifiés'
  },
  {
    type: 'deadlines',
    label: 'Échéances cette semaine',
    icon: <Calendar className="h-4 w-4" />,
    description: 'Archives et workflows urgents'
  },
  {
    type: 'classification',
    label: 'Aide classification',
    icon: <HelpCircle className="h-4 w-4" />,
    description: 'Guide pour classifier vos documents'
  },
  {
    type: 'stats',
    label: 'Statistiques du jour',
    icon: <BarChart3 className="h-4 w-4" />,
    description: 'KPIs et métriques du système'
  }
]

interface QuickActionsProps {
  onAction: (action: ChatAction) => void
  disabled?: boolean
  className?: string
  compact?: boolean
}

export function QuickActions({ onAction, disabled, className, compact = false }: QuickActionsProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {quickActions.map((action) => (
        <Button
          key={action.type}
          variant="outline"
          size={compact ? 'sm' : 'default'}
          disabled={disabled}
          onClick={() => onAction({ type: action.type, label: action.label })}
          className={cn(
            'h-auto flex items-center gap-2 text-left',
            compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5'
          )}
        >
          <span className="flex-shrink-0 text-muted-foreground">{action.icon}</span>
          <span className="font-medium">{action.label}</span>
        </Button>
      ))}
    </div>
  )
}

export function QuickActionsGrid({ onAction, disabled, className }: QuickActionsProps) {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 gap-2', className)}>
      {quickActions.map((action) => (
        <Button
          key={action.type}
          variant="outline"
          disabled={disabled}
          onClick={() => onAction({ type: action.type, label: action.label })}
          className="h-auto flex items-start gap-3 p-3 text-left justify-start"
        >
          <span className="flex-shrink-0 text-primary mt-0.5">{action.icon}</span>
          <div className="flex flex-col items-start gap-0.5">
            <span className="font-medium text-sm">{action.label}</span>
            <span className="text-xs text-muted-foreground font-normal">
              {action.description}
            </span>
          </div>
        </Button>
      ))}
    </div>
  )
}
