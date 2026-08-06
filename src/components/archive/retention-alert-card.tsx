'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, Clock, FileWarning, ArrowRight, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface RetentionAlert {
  id: string
  archiveRef: string
  title: string
  daysLeft: number
  action: 'DESTRUCTION' | 'TRANSFER' | 'REVIEW'
}

interface RetentionAlertCardProps {
  alerts: RetentionAlert[]
  onAction?: (alert: RetentionAlert) => void
  className?: string
}

const actionConfig = {
  DESTRUCTION: { 
    label: 'Destruction', 
    icon: Trash2, 
    color: 'text-red-600',
    bgColor: 'bg-red-100 dark:bg-red-950',
    borderColor: 'border-red-200 dark:border-red-800'
  },
  TRANSFER: { 
    label: 'Transfert', 
    icon: ArrowRight, 
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-950',
    borderColor: 'border-blue-200 dark:border-blue-800'
  },
  REVIEW: { 
    label: 'Révision', 
    icon: FileWarning, 
    color: 'text-amber-600',
    bgColor: 'bg-amber-100 dark:bg-amber-950',
    borderColor: 'border-amber-200 dark:border-amber-800'
  },
}

function getUrgencyLevel(daysLeft: number) {
  if (daysLeft <= 7) return { level: 'critical', color: 'text-red-600', badge: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' }
  if (daysLeft <= 30) return { level: 'high', color: 'text-amber-600', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' }
  if (daysLeft <= 60) return { level: 'medium', color: 'text-blue-600', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400' }
  return { level: 'low', color: 'text-gray-600', badge: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' }
}

export function RetentionAlertCard({ alerts, onAction, className }: RetentionAlertCardProps) {
  if (alerts.length === 0) {
    return (
      <Card className={cn('border-dashed', className)}>
        <CardContent className="p-6 text-center">
          <div className="text-emerald-600 mb-2">
            <Clock className="h-8 w-8 mx-auto" />
          </div>
          <p className="text-sm text-muted-foreground">
            Aucune alerte de conservation
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      {alerts.map((alert, index) => {
        const urgency = getUrgencyLevel(alert.daysLeft)
        const actionConf = actionConfig[alert.action]
        const ActionIcon = actionConf.icon

        return (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={cn('overflow-hidden border-l-4', actionConf.borderColor)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-medium text-muted-foreground">
                        {alert.archiveRef}
                      </span>
                      <Badge variant="outline" className={cn('text-xs', urgency.badge)}>
                        {alert.daysLeft}j
                      </Badge>
                    </div>
                    <p className="text-sm font-medium truncate">{alert.title}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className={cn('text-xs gap-1', actionConf.bgColor, actionConf.color)}>
                        <ActionIcon className="h-3 w-3" />
                        {actionConf.label}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    {alert.daysLeft <= 30 && (
                      <AlertTriangle className={cn('h-5 w-5', urgency.color)} />
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onAction?.(alert)}
                    >
                      Traiter
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

// Summary variant for dashboard
export function RetentionAlertSummary({ 
  alerts 
}: { 
  alerts: RetentionAlert[] 
}) {
  const critical = alerts.filter(a => a.daysLeft <= 7).length
  const high = alerts.filter(a => a.daysLeft > 7 && a.daysLeft <= 30).length
  const medium = alerts.filter(a => a.daysLeft > 30 && a.daysLeft <= 60).length

  return (
    <div className="flex items-center gap-4">
      {critical > 0 && (
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm font-medium text-red-600">{critical} critique{critical > 1 ? 's' : ''}</span>
        </div>
      )}
      {high > 0 && (
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-amber-500" />
          <span className="text-sm text-amber-600">{high} urgent{high > 1 ? 's' : ''}</span>
        </div>
      )}
      {medium > 0 && (
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-blue-500" />
          <span className="text-sm text-blue-600">{medium} à venir</span>
        </div>
      )}
    </div>
  )
}
