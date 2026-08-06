'use client'

import { motion } from 'framer-motion'
import { 
  FileText, 
  Copy, 
  Edit, 
  AlertTriangle, 
  FileQuestion, 
  AlertCircle,
  Clock,
  User,
  ChevronRight,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { RiskGaugeMini } from './risk-gauge'
import type { Anomaly } from '@/types/fraud'

interface AnomalyCardProps {
  anomaly: Anomaly
  onInvestigate?: (anomaly: Anomaly) => void
  onClick?: (anomaly: Anomaly) => void
}

const typeConfig: Record<Anomaly['type'], { icon: React.ElementType; label: string; color: string }> = {
  DUPLICATE: { icon: Copy, label: 'Doublon', color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30 dark:text-purple-400' },
  MODIFIED: { icon: Edit, label: 'Modifié', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400' },
  SUSPICIOUS: { icon: AlertTriangle, label: 'Suspect', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400' },
  MISSING: { icon: FileQuestion, label: 'Manquant', color: 'text-gray-600 bg-gray-50 dark:bg-gray-950/30 dark:text-gray-400' },
  INCONSISTENT: { icon: AlertCircle, label: 'Incohérent', color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/30 dark:text-orange-400' },
}

const riskLevelConfig: Record<Anomaly['riskLevel'], { label: string; variant: 'outline' | 'secondary' | 'destructive' | 'default' }> = {
  LOW: { label: 'Faible', variant: 'outline' },
  MEDIUM: { label: 'Modéré', variant: 'secondary' },
  HIGH: { label: 'Élevé', variant: 'default' },
  CRITICAL: { label: 'Critique', variant: 'destructive' },
}

const statusConfig: Record<Anomaly['status'], { label: string; color: string }> = {
  NEW: { label: 'Nouveau', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
  INVESTIGATING: { label: 'En cours', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
  CONFIRMED_FRAUD: { label: 'Fraude confirmée', color: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400 border-red-200 dark:border-red-800' },
  FALSE_POSITIVE: { label: 'Faux positif', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
  NEEDS_REVIEW: { label: 'À réviser', color: 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400 border-purple-200 dark:border-purple-800' },
}

export function AnomalyCard({ anomaly, onInvestigate, onClick }: AnomalyCardProps) {
  const typeInfo = typeConfig[anomaly.type]
  const riskInfo = riskLevelConfig[anomaly.riskLevel]
  const statusInfo = statusConfig[anomaly.status]
  const TypeIcon = typeInfo.icon
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.005 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={cn(
          'cursor-pointer transition-all hover:shadow-md',
          anomaly.status === 'NEW' && 'border-l-4 border-l-blue-500',
          anomaly.status === 'INVESTIGATING' && 'border-l-4 border-l-amber-500',
          anomaly.status === 'CONFIRMED_FRAUD' && 'border-l-4 border-l-red-500',
        )}
        onClick={() => onClick?.(anomaly)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Risk Score */}
            <RiskGaugeMini score={anomaly.score} />
            
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm text-muted-foreground">
                      {anomaly.archiveReference}
                    </span>
                    <Badge 
                      variant={riskInfo.variant}
                      className={cn(
                        'text-xs',
                        anomaly.riskLevel === 'CRITICAL' && 'animate-pulse'
                      )}
                    >
                      {riskInfo.label}
                    </Badge>
                  </div>
                  <h4 className="font-medium text-sm line-clamp-1">
                    {anomaly.archiveTitle}
                  </h4>
                </div>
              </div>
              
              {/* Description */}
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {anomaly.description}
              </p>
              
              {/* Meta Info */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {/* Type */}
                <div className={cn('flex items-center gap-1 px-2 py-1 rounded-full', typeInfo.color)}>
                  <TypeIcon className="h-3 w-3" />
                  <span>{typeInfo.label}</span>
                </div>
                
                {/* Status */}
                <Badge variant="outline" className={cn('text-xs', statusInfo.color)}>
                  {statusInfo.label}
                </Badge>
                
                {/* Date */}
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(anomaly.detectedAt)}</span>
                </div>
              </div>
              
              {/* Investigator info if exists */}
              {anomaly.investigatedBy && (
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>Investigué par {anomaly.investigatedBy}</span>
                </div>
              )}
              
              {/* Factors */}
              {anomaly.factors.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {anomaly.factors.slice(0, 3).map((factor, index) => (
                    <span 
                      key={index}
                      className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground"
                    >
                      {factor}
                    </span>
                  ))}
                  {anomaly.factors.length > 3 && (
                    <span className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                      +{anomaly.factors.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="flex flex-col items-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onInvestigate?.(anomaly)
                }}
                className="shrink-0"
              >
                <FileText className="h-4 w-4 mr-1" />
                Investiguer
              </Button>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Compact version for lists
export function AnomalyCardCompact({ anomaly, onClick }: { anomaly: Anomaly; onClick?: () => void }) {
  const typeInfo = typeConfig[anomaly.type]
  const riskInfo = riskLevelConfig[anomaly.riskLevel]
  const TypeIcon = typeInfo.icon
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <RiskGaugeMini score={anomaly.score} className="shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">
            {anomaly.archiveReference}
          </span>
          <div className={cn('flex items-center gap-1 px-1.5 py-0.5 rounded text-xs', typeInfo.color)}>
            <TypeIcon className="h-3 w-3" />
            <span>{typeInfo.label}</span>
          </div>
        </div>
        <p className="text-sm font-medium truncate">{anomaly.archiveTitle}</p>
      </div>
      <Badge variant={riskInfo.variant} className="text-xs">
        {riskInfo.label}
      </Badge>
    </motion.div>
  )
}
