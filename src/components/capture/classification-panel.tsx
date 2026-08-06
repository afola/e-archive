'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Tag,
  Sparkles,
  FileText,
  FileCheck,
  Building2,
  User,
  Calendar,
  Hash,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export interface ClassificationSuggestion {
  type: string
  label: string
  confidence: number
}

export interface ClassificationTag {
  id: string
  name: string
  category: string
}

export interface ClassificationMetadata {
  title?: string
  clientName?: string
  accountNumber?: string
  documentDate?: string
  reference?: string
  agency?: string
  confidentiality?: string
  retentionPeriod?: number
}

export interface ClassificationResult {
  fileId: string
  suggestions: ClassificationSuggestion[]
  tags: ClassificationTag[]
  metadata: ClassificationMetadata
  isValid: boolean
  validationErrors: string[]
}

interface ClassificationPanelProps {
  result: ClassificationResult | null
  onConfirm?: (fileId: string, classification: {
    type: string
    tags: string[]
    metadata: ClassificationMetadata
  }) => void
  onReclassify?: (fileId: string) => void
}

const DOCUMENT_TYPES = [
  { value: 'contract', label: 'Contrat' },
  { value: 'invoice', label: 'Facture' },
  { value: 'statement', label: 'Relevé bancaire' },
  { value: 'correspondence', label: 'Correspondance' },
  { value: 'identity', label: "Pièce d'identité" },
  { value: 'form', label: 'Formulaire' },
  { value: 'report', label: 'Rapport' },
  { value: 'legal', label: 'Document légal' },
  { value: 'other', label: 'Autre' },
]

const CONFIDENTIALITY_LEVELS = [
  { value: 'PUBLIC', label: 'Public' },
  { value: 'INTERNAL', label: 'Interne' },
  { value: 'CONFIDENTIAL', label: 'Confidentiel' },
  { value: 'SECRET', label: 'Secret' },
]

const RETENTION_PERIODS = [
  { value: '5', label: '5 ans' },
  { value: '10', label: '10 ans' },
  { value: '15', label: '15 ans' },
  { value: '30', label: '30 ans' },
  { value: '99', label: 'Permanent' },
]

const AVAILABLE_TAGS = [
  { id: 'urgent', name: 'Urgent', category: 'priority' },
  { id: 'client', name: 'Client', category: 'entity' },
  { id: 'compliance', name: 'Conformité', category: 'regulatory' },
  { id: 'audit', name: 'Audit', category: 'regulatory' },
  { id: 'legal', name: 'Juridique', category: 'regulatory' },
  { id: 'financial', name: 'Financier', category: 'domain' },
  { id: 'hr', name: 'RH', category: 'domain' },
  { id: 'tax', name: 'Fiscal', category: 'domain' },
]

function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.9) return 'bg-emerald-500'
  if (confidence >= 0.7) return 'bg-amber-500'
  return 'bg-red-500'
}

export function ClassificationPanel({
  result,
  onConfirm,
  onReclassify,
}: ClassificationPanelProps) {
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [metadata, setMetadata] = useState<ClassificationMetadata>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize from result
  const initializeFromResult = () => {
    if (result) {
      const topSuggestion = result.suggestions[0]
      if (topSuggestion) {
        setSelectedType(topSuggestion.type)
      }
      setSelectedTags(result.tags.map((t) => t.id))
      setMetadata(result.metadata)
    }
  }

  // Run initialization on mount
  useState(() => {
    initializeFromResult()
  })

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    )
  }

  const handleConfirm = async () => {
    if (!result || !selectedType) {
      toast.error('Veuillez sélectionner un type de document')
      return
    }

    setIsSubmitting(true)
    try {
      await onConfirm?.(result.fileId, {
        type: selectedType,
        tags: selectedTags,
        metadata,
      })
      toast.success('Classification enregistrée avec succès')
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!result) {
    return (
      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center h-64">
          <Sparkles className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground text-center">
            La classification apparaîtra après l&apos;analyse OCR
          </p>
        </CardContent>
      </Card>
    )
  }

  const topSuggestion = result.suggestions[0]

  return (
    <div className="space-y-4">
      {/* Suggested Type */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            Type suggéré
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.suggestions.slice(0, 3).map((suggestion, index) => (
            <motion.div
              key={suggestion.type}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {index === 0 && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  )}
                  <span
                    className={cn(
                      'font-medium',
                      index === 0 ? 'text-emerald-600' : 'text-muted-foreground'
                    )}
                  >
                    {suggestion.label}
                  </span>
                </div>
                <Badge
                  variant={index === 0 ? 'default' : 'outline'}
                  className="text-xs"
                >
                  {Math.round(suggestion.confidence * 100)}%
                </Badge>
              </div>
              <Progress
                value={suggestion.confidence * 100}
                className={cn('h-1.5', '[&>div]:' + getConfidenceColor(suggestion.confidence))}
              />
            </motion.div>
          ))}

          <div className="pt-2">
            <Label className="text-xs text-muted-foreground">
              Type sélectionné
            </Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Choisir un type" />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            Tags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-40">
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag.id)
                return (
                  <Badge
                    key={tag.id}
                    variant={isSelected ? 'default' : 'outline'}
                    className={cn(
                      'cursor-pointer transition-all',
                      isSelected && 'bg-primary text-primary-foreground'
                    )}
                    onClick={() => toggleTag(tag.id)}
                  >
                    {tag.name}
                  </Badge>
                )
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Metadata Form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-muted-foreground" />
            Métadonnées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-80">
            <div className="space-y-4 pr-4">
              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Titre du document
                </Label>
                <Input
                  value={metadata.title || ''}
                  onChange={(e) =>
                    setMetadata({ ...metadata, title: e.target.value })
                  }
                  placeholder="Titre du document"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Nom du client
                </Label>
                <Input
                  value={metadata.clientName || ''}
                  onChange={(e) =>
                    setMetadata({ ...metadata, clientName: e.target.value })
                  }
                  placeholder="Nom du client"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    N° Compte
                  </Label>
                  <Input
                    value={metadata.accountNumber || ''}
                    onChange={(e) =>
                      setMetadata({ ...metadata, accountNumber: e.target.value })
                    }
                    placeholder="Numéro de compte"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    Référence
                  </Label>
                  <Input
                    value={metadata.reference || ''}
                    onChange={(e) =>
                      setMetadata({ ...metadata, reference: e.target.value })
                    }
                    placeholder="Référence"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Date document
                  </Label>
                  <Input
                    type="date"
                    value={metadata.documentDate || ''}
                    onChange={(e) =>
                      setMetadata({ ...metadata, documentDate: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    Agence
                  </Label>
                  <Input
                    value={metadata.agency || ''}
                    onChange={(e) =>
                      setMetadata({ ...metadata, agency: e.target.value })
                    }
                    placeholder="Agence"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Confidentialité</Label>
                  <Select
                    value={metadata.confidentiality || ''}
                    onValueChange={(v) =>
                      setMetadata({ ...metadata, confidentiality: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONFIDENTIALITY_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Durée conservation</Label>
                  <Select
                    value={metadata.retentionPeriod?.toString() || ''}
                    onValueChange={(v) =>
                      setMetadata({ ...metadata, retentionPeriod: parseInt(v) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {RETENTION_PERIODS.map((period) => (
                        <SelectItem key={period.value} value={period.value}>
                          {period.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Validation Errors */}
      {result.validationErrors.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-600">
                  Points d&apos;attention
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {result.validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => onReclassify?.(result.fileId)}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Reclassifier
        </Button>
        <Button
          className="flex-1"
          onClick={handleConfirm}
          disabled={!selectedType || isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4 mr-2" />
          )}
          Confirmer
        </Button>
      </div>
    </div>
  )
}
