'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  Hash,
  Calendar,
  Euro,
  User,
  Building2,
  CreditCard,
  Edit2,
  Check,
  X,
  Copy,
  CheckCheck,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export interface ExtractedEntity {
  id: string
  type: 'iban' | 'amount' | 'date' | 'name' | 'reference' | 'account' | 'agency'
  value: string
  confidence: number
  position?: { start: number; end: number }
}

export interface OCRResult {
  fileId: string
  fileName: string
  extractedText: string
  entities: ExtractedEntity[]
  overallConfidence: number
  processingTime?: number
  language?: string
}

interface OCRResultsProps {
  result: OCRResult | null
  onTextUpdate?: (fileId: string, newText: string) => void
  onEntityUpdate?: (fileId: string, entityId: string, newValue: string) => void
}

const ENTITY_CONFIG: Record<
  ExtractedEntity['type'],
  { label: string; icon: typeof Hash; color: string; bgColor: string }
> = {
  iban: {
    label: 'IBAN',
    icon: CreditCard,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  amount: {
    label: 'Montant',
    icon: Euro,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  date: {
    label: 'Date',
    icon: Calendar,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
  name: {
    label: 'Nom',
    icon: User,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
  },
  reference: {
    label: 'Référence',
    icon: Hash,
    color: 'text-slate-600',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
  },
  account: {
    label: 'Compte',
    icon: Building2,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
  },
  agency: {
    label: 'Agence',
    icon: Building2,
    color: 'text-teal-600',
    bgColor: 'bg-teal-100 dark:bg-teal-900/30',
  },
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.9) return 'text-emerald-600'
  if (confidence >= 0.7) return 'text-amber-600'
  return 'text-red-600'
}

function getConfidenceLabel(confidence: number): string {
  if (confidence >= 0.9) return 'Excellent'
  if (confidence >= 0.7) return 'Bon'
  if (confidence >= 0.5) return 'Moyen'
  return 'Faible'
}

export function OCRResults({ result, onTextUpdate, onEntityUpdate }: OCRResultsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedText, setEditedText] = useState('')
  const [editingEntity, setEditingEntity] = useState<string | null>(null)
  const [editedEntityValue, setEditedEntityValue] = useState('')
  const [copiedText, setCopiedText] = useState(false)

  const handleStartEdit = () => {
    if (result) {
      setEditedText(result.extractedText)
      setIsEditing(true)
    }
  }

  const handleSaveEdit = () => {
    if (result && onTextUpdate) {
      onTextUpdate(result.fileId, editedText)
      toast.success('Texte modifié avec succès')
    }
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedText('')
  }

  const handleStartEntityEdit = (entity: ExtractedEntity) => {
    setEditingEntity(entity.id)
    setEditedEntityValue(entity.value)
  }

  const handleSaveEntityEdit = (entity: ExtractedEntity) => {
    if (result && onEntityUpdate && editedEntityValue !== entity.value) {
      onEntityUpdate(result.fileId, entity.id, editedEntityValue)
      toast.success('Entité modifiée avec succès')
    }
    setEditingEntity(null)
    setEditedEntityValue('')
  }

  const handleCopyText = async () => {
    if (result) {
      await navigator.clipboard.writeText(result.extractedText)
      setCopiedText(true)
      toast.success('Texte copié dans le presse-papier')
      setTimeout(() => setCopiedText(false), 2000)
    }
  }

  // Highlight entities in text
  const highlightedText = useMemo(() => {
    if (!result) return ''

    let text = result.extractedText
    const sortedEntities = [...result.entities].sort(
      (a, b) => (b.position?.start || 0) - (a.position?.start || 0)
    )

    for (const entity of sortedEntities) {
      if (entity.position) {
        const config = ENTITY_CONFIG[entity.type]
        const before = text.slice(0, entity.position.start)
        const value = text.slice(entity.position.start, entity.position.end)
        const after = text.slice(entity.position.end)

        text = `${before}<mark class="${config.bgColor} ${config.color} px-1 rounded font-medium">${value}</mark>${after}`
      }
    }

    return text
  }, [result])

  if (!result) {
    return (
      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center h-64">
          <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground text-center">
            Sélectionnez un document pour voir les résultats OCR
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with confidence */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              Résultats OCR
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {result.language || 'Français'}
              </Badge>
              {result.processingTime && (
                <Badge variant="secondary" className="text-xs">
                  {result.processingTime}ms
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Confiance globale</span>
              <span
                className={cn(
                  'text-sm font-semibold',
                  getConfidenceColor(result.overallConfidence)
                )}
              >
                {Math.round(result.overallConfidence * 100)}% -{' '}
                {getConfidenceLabel(result.overallConfidence)}
              </span>
            </div>
            <Progress
              value={result.overallConfidence * 100}
              className={cn(
                'h-2',
                result.overallConfidence >= 0.9 && '[&>div]:bg-emerald-500',
                result.overallConfidence >= 0.7 &&
                  result.overallConfidence < 0.9 &&
                  '[&>div]:bg-amber-500',
                result.overallConfidence < 0.7 && '[&>div]:bg-red-500'
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Entities */}
      {result.entities.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              Entités extraites ({result.entities.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="max-h-64">
              <div className="divide-y divide-border px-6 pb-4">
                {result.entities.map((entity, index) => {
                  const config = ENTITY_CONFIG[entity.type]
                  const Icon = config.icon

                  return (
                    <motion.div
                      key={entity.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 py-3"
                    >
                      <div
                        className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                          config.bgColor
                        )}
                      >
                        <Icon className={cn('h-4 w-4', config.color)} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {config.label}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-xs',
                              entity.confidence >= 0.9 && 'border-emerald-500 text-emerald-600',
                              entity.confidence >= 0.7 &&
                                entity.confidence < 0.9 &&
                                'border-amber-500 text-amber-600',
                              entity.confidence < 0.7 && 'border-red-500 text-red-600'
                            )}
                          >
                            {Math.round(entity.confidence * 100)}%
                          </Badge>
                        </div>

                        {editingEntity === entity.id ? (
                          <div className="flex items-center gap-2 mt-1">
                            <input
                              type="text"
                              value={editedEntityValue}
                              onChange={(e) => setEditedEntityValue(e.target.value)}
                              className="flex-1 px-2 py-1 text-sm border rounded bg-background"
                              autoFocus
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() => handleSaveEntityEdit(entity)}
                            >
                              <Check className="h-3 w-3 text-emerald-600" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() => setEditingEntity(null)}
                            >
                              <X className="h-3 w-3 text-red-600" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm font-medium truncate">{entity.value}</p>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-5 w-5 opacity-0 group-hover:opacity-100"
                              onClick={() => handleStartEntityEdit(entity)}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Extracted Text */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Texte extrait
            </CardTitle>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelEdit}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Annuler
                  </Button>
                  <Button size="sm" onClick={handleSaveEdit}>
                    <Check className="h-4 w-4 mr-1" />
                    Sauvegarder
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopyText}
                  >
                    {copiedText ? (
                      <CheckCheck className="h-4 w-4 mr-1 text-emerald-600" />
                    ) : (
                      <Copy className="h-4 w-4 mr-1" />
                    )}
                    Copier
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleStartEdit}
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Modifier
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-80">
            {isEditing ? (
              <Textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
                placeholder="Texte extrait..."
              />
            ) : (
              <div
                className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap font-mono text-sm bg-muted/30 p-4 rounded-lg"
                dangerouslySetInnerHTML={{ __html: highlightedText }}
              />
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
