'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Copy, 
  Edit, 
  AlertTriangle, 
  FileQuestion, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  AlertOctagon,
  ExternalLink,
  Loader2,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { RiskGaugeMini } from './risk-gauge'
import type { Anomaly } from '@/types/fraud'

interface InvestigationDialogProps {
  anomaly: Anomaly | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (anomalyId: string, status: Anomaly['status'], notes: string) => Promise<void>
}

const typeConfig: Record<Anomaly['type'], { icon: React.ElementType; label: string; color: string }> = {
  DUPLICATE: { icon: Copy, label: 'Doublon détecté', color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30' },
  MODIFIED: { icon: Edit, label: 'Document modifié', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30' },
  SUSPICIOUS: { icon: AlertTriangle, label: 'Activité suspecte', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30' },
  MISSING: { icon: FileQuestion, label: 'Document manquant', color: 'text-gray-600 bg-gray-50 dark:bg-gray-950/30' },
  INCONSISTENT: { icon: AlertCircle, label: 'Incohérence détectée', color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/30' },
}

const riskLevelConfig: Record<Anomaly['riskLevel'], { label: string; color: string }> = {
  LOW: { label: 'Faible', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800' },
  MEDIUM: { label: 'Modéré', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800' },
  HIGH: { label: 'Élevé', color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800' },
  CRITICAL: { label: 'Critique', color: 'text-red-600 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800' },
}

const statusConfig: Record<Anomaly['status'], { label: string; color: string }> = {
  NEW: { label: 'Nouveau', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400' },
  INVESTIGATING: { label: 'En cours d\'investigation', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400' },
  CONFIRMED_FRAUD: { label: 'Fraude confirmée', color: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400' },
  FALSE_POSITIVE: { label: 'Faux positif', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400' },
  NEEDS_REVIEW: { label: 'Nécessite une révision', color: 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400' },
}

export function InvestigationDialog({ 
  anomaly, 
  open, 
  onOpenChange, 
  onSubmit 
}: InvestigationDialogProps) {
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedAction, setSelectedAction] = useState<Anomaly['status'] | null>(null)
  
  if (!anomaly) return null
  
  const typeInfo = typeConfig[anomaly.type]
  const riskInfo = riskLevelConfig[anomaly.riskLevel]
  const statusInfo = statusConfig[anomaly.status]
  const TypeIcon = typeInfo.icon
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  
  const handleSubmit = async (status: Anomaly['status']) => {
    setLoading(true)
    setSelectedAction(status)
    try {
      await onSubmit(anomaly.id, status, notes)
      onOpenChange(false)
      setNotes('')
    } finally {
      setLoading(false)
      setSelectedAction(null)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <AlertOctagon className="h-5 w-5 text-red-500" />
                Investigation d'anomalie
              </DialogTitle>
              <DialogDescription className="mt-1">
                Analysez et résolvez cette anomalie détectée
              </DialogDescription>
            </div>
            <Badge className={cn('text-xs', statusInfo.color)}>
              {statusInfo.label}
            </Badge>
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* Document Info */}
            <div className="p-4 rounded-lg border bg-muted/30">
              <div className="flex items-start gap-4">
                <RiskGaugeMini score={anomaly.score} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm text-muted-foreground">
                      {anomaly.archiveReference}
                    </span>
                    <Badge variant="outline" className={cn('text-xs', riskInfo.color)}>
                      Risque {riskInfo.label}
                    </Badge>
                  </div>
                  <h4 className="font-medium">{anomaly.archiveTitle}</h4>
                </div>
                <Button variant="ghost" size="sm" className="shrink-0">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Voir document
                </Button>
              </div>
            </div>
            
            {/* Anomaly Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <h5 className="text-sm font-semibold text-muted-foreground">Type d'anomalie</h5>
                <div className={cn('flex items-center gap-2 px-3 py-2 rounded-lg', typeInfo.color)}>
                  <TypeIcon className="h-5 w-5" />
                  <span className="font-medium">{typeInfo.label}</span>
                </div>
              </div>
              <div className="space-y-3">
                <h5 className="text-sm font-semibold text-muted-foreground">Date de détection</h5>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {formatDate(anomaly.detectedAt)}
                </div>
              </div>
            </div>
            
            {/* Description */}
            <div className="space-y-2">
              <h5 className="text-sm font-semibold text-muted-foreground">Description</h5>
              <p className="text-sm bg-muted/50 p-3 rounded-lg">
                {anomaly.description}
              </p>
            </div>
            
            {/* Factors */}
            <div className="space-y-2">
              <h5 className="text-sm font-semibold text-muted-foreground">Facteurs de risque identifiés</h5>
              <div className="flex flex-wrap gap-2">
                {anomaly.factors.map((factor, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {factor}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Previous Investigation */}
            {anomaly.investigatedBy && (
              <div className="p-3 rounded-lg border bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
                  <User className="h-4 w-4" />
                  <span className="font-medium">Investigué par {anomaly.investigatedBy}</span>
                  <span className="text-amber-600 dark:text-amber-500">
                    le {formatDate(anomaly.investigatedAt!)}
                  </span>
                </div>
                {anomaly.notes && (
                  <p className="mt-2 text-sm text-amber-600 dark:text-amber-500">
                    {anomaly.notes}
                  </p>
                )}
              </div>
            )}
            
            <Separator />
            
            {/* Notes Input */}
            <div className="space-y-2">
              <h5 className="text-sm font-semibold text-muted-foreground">Notes d'investigation</h5>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ajoutez vos observations, analyses et conclusions..."
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter className="flex-col sm:flex-row gap-2 pt-4 border-t">
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="destructive"
              onClick={() => handleSubmit('CONFIRMED_FRAUD')}
              disabled={loading}
              className="flex-1 sm:flex-initial"
            >
              {loading && selectedAction === 'CONFIRMED_FRAUD' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Fraude confirmée
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSubmit('FALSE_POSITIVE')}
              disabled={loading}
              className="flex-1 sm:flex-initial"
            >
              {loading && selectedAction === 'FALSE_POSITIVE' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" />
              )}
              Faux positif
            </Button>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="secondary"
              onClick={() => handleSubmit('NEEDS_REVIEW')}
              disabled={loading}
              className="flex-1 sm:flex-initial"
            >
              {loading && selectedAction === 'NEEDS_REVIEW' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <AlertTriangle className="h-4 w-4 mr-2" />
              )}
              À réviser
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleSubmit('INVESTIGATING')}
              disabled={loading}
              className="flex-1 sm:flex-initial"
            >
              {loading && selectedAction === 'INVESTIGATING' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Clock className="h-4 w-4 mr-2" />
              )}
              En cours
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
