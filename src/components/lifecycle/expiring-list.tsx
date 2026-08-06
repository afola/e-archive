'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle,
  Clock,
  CalendarPlus,
  Trash2,
  Eye,
  CheckCircle,
  X,
  ChevronDown,
  ChevronUp,
  Loader2,
  MoreHorizontal,
  Archive
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

interface ArchiveItem {
  id: string
  reference: string
  title: string
  type: string
  typeName: string
  retentionEndDate: string
  daysLeft?: number
  status: string
  agencyName: string
  boxNumber?: string
  locationCode?: string
  clientName?: string
}

interface ExpiringListProps {
  archives: ArchiveItem[]
  onExtend?: (archiveIds: string[], newDate: string, reason: string) => Promise<void>
  onDestroy?: (archiveIds: string[], reason: string) => Promise<void>
  onView?: (archive: ArchiveItem) => void
}

const EXTEND_OPTIONS = [
  { value: '1', label: '1 an' },
  { value: '2', label: '2 ans' },
  { value: '3', label: '3 ans' },
  { value: '5', label: '5 ans' },
]

type FilterType = 'all' | 'expired' | 'thisMonth' | 'in3Months'

export function ExpiringList({ archives, onExtend, onDestroy, onView }: ExpiringListProps) {
  const [selectedArchives, setSelectedArchives] = useState<string[]>([])
  const [filter, setFilter] = useState<FilterType>('all')
  const [showExtendDialog, setShowExtendDialog] = useState(false)
  const [showDestroyDialog, setShowDestroyDialog] = useState(false)
  const [extendYears, setExtendYears] = useState('1')
  const [customDate, setCustomDate] = useState('')
  const [reason, setReason] = useState('')
  const [destroyReason, setDestroyReason] = useState('Fin de durée de conservation')
  const [isLoading, setIsLoading] = useState(false)
  const [expandedArchive, setExpandedArchive] = useState<string | null>(null)
  const { toast } = useToast()

  // Filter archives based on days left
  const filteredArchives = useMemo(() => {
    const sorted = [...archives].sort((a, b) => (a.daysLeft || 0) - (b.daysLeft || 0))
    
    switch (filter) {
      case 'expired':
        return sorted.filter(a => (a.daysLeft ?? 0) <= 0)
      case 'thisMonth':
        return sorted.filter(a => {
          const days = a.daysLeft ?? 0
          return days > 0 && days <= 30
        })
      case 'in3Months':
        return sorted.filter(a => {
          const days = a.daysLeft ?? 0
          return days > 30 && days <= 90
        })
      default:
        return sorted
    }
  }, [archives, filter])

  // Calculate summary stats
  const stats = useMemo(() => {
    const expired = archives.filter(a => (a.daysLeft ?? 0) <= 0).length
    const thisMonth = archives.filter(a => {
      const days = a.daysLeft ?? 0
      return days > 0 && days <= 30
    }).length
    const in3Months = archives.filter(a => {
      const days = a.daysLeft ?? 0
      return days > 30 && days <= 90
    }).length
    
    return { expired, thisMonth, in3Months, total: archives.length }
  }, [archives])

  const handleSelectAll = () => {
    if (selectedArchives.length === filteredArchives.length) {
      setSelectedArchives([])
    } else {
      setSelectedArchives(filteredArchives.map(a => a.id))
    }
  }

  const handleSelectArchive = (archiveId: string) => {
    setSelectedArchives(prev =>
      prev.includes(archiveId)
        ? prev.filter(id => id !== archiveId)
        : [...prev, archiveId]
    )
  }

  const handleExtend = async () => {
    if (selectedArchives.length === 0) return
    
    setIsLoading(true)
    try {
      // Calculate new date
      let newDate: string
      if (customDate) {
        newDate = customDate
      } else {
        const date = new Date()
        date.setFullYear(date.getFullYear() + parseInt(extendYears))
        newDate = date.toISOString().split('T')[0]
      }
      
      await onExtend?.(selectedArchives, newDate, reason)
      setSelectedArchives([])
      setReason('')
      setCustomDate('')
      setShowExtendDialog(false)
      toast({
        title: 'Succès',
        description: `${selectedArchives.length} archive(s) prolongée(s) avec succès`
      })
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de prolonger les archives',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDestroy = async () => {
    if (selectedArchives.length === 0) return
    
    setIsLoading(true)
    try {
      await onDestroy?.(selectedArchives, destroyReason)
      setSelectedArchives([])
      setDestroyReason('Fin de durée de conservation')
      setShowDestroyDialog(false)
      toast({
        title: 'Succès',
        description: 'Demande de destruction créée avec succès'
      })
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la demande de destruction',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getUrgencyColor = (daysLeft: number): string => {
    if (daysLeft <= 0) return 'bg-red-500'
    if (daysLeft <= 30) return 'bg-red-400'
    if (daysLeft <= 90) return 'bg-orange-400'
    return 'bg-green-400'
  }

  const getUrgencyBadge = (daysLeft: number) => {
    if (daysLeft <= 0) {
      return <Badge className="bg-red-100 text-red-700 border-red-200">Expiré</Badge>
    }
    if (daysLeft <= 30) {
      return <Badge className="bg-red-100 text-red-700 border-red-200">{daysLeft}j restants</Badge>
    }
    if (daysLeft <= 90) {
      return <Badge className="bg-orange-100 text-orange-700 border-orange-200">{daysLeft}j</Badge>
    }
    return <Badge className="bg-green-100 text-green-700 border-green-200">{daysLeft}j</Badge>
  }

  const filterButtons: { key: FilterType; label: string; count: number }[] = [
    { key: 'all', label: 'Toutes', count: stats.total },
    { key: 'expired', label: 'Expirées', count: stats.expired },
    { key: 'thisMonth', label: 'Ce mois', count: stats.thisMonth },
    { key: 'in3Months', label: '3 mois', count: stats.in3Months },
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Archives à échéance
            </CardTitle>
            <CardDescription>
              Gérez les archives approchant de leur fin de conservation
            </CardDescription>
          </div>
          {selectedArchives.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExtendDialog(true)}
              >
                <CalendarPlus className="h-4 w-4 mr-2" />
                Prolonger ({selectedArchives.length})
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDestroyDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Détruire
              </Button>
            </div>
          )}
        </div>
        
        {/* Filter buttons */}
        <div className="flex items-center gap-2 mt-4">
          {filterButtons.map((btn) => (
            <Button
              key={btn.key}
              variant={filter === btn.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(btn.key)}
              className="relative"
            >
              {btn.label}
              {btn.count > 0 && (
                <Badge
                  variant="secondary"
                  className={cn(
                    'ml-2 h-5 min-w-5 flex items-center justify-center',
                    btn.key === 'expired' && filter !== btn.key && 'bg-red-100 text-red-700',
                    btn.key === 'thisMonth' && filter !== btn.key && 'bg-orange-100 text-orange-700'
                  )}
                >
                  {btn.count}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredArchives.length > 0 ? (
          <>
            {/* Select all */}
            <div className="flex items-center gap-2 mb-4 pb-4 border-b">
              <Checkbox
                id="select-all-expiring"
                checked={selectedArchives.length === filteredArchives.length && filteredArchives.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="select-all-expiring" className="text-sm text-muted-foreground">
                Tout sélectionner ({filteredArchives.length} archives)
              </Label>
            </div>

            {/* Archive list */}
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-2">
                <AnimatePresence>
                  {filteredArchives.map((archive, index) => {
                    const daysLeft = archive.daysLeft ?? 0
                    const isExpanded = expandedArchive === archive.id
                    
                    return (
                      <motion.div
                        key={archive.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.02 }}
                        className={cn(
                          'rounded-lg border transition-all',
                          selectedArchives.includes(archive.id) && 'bg-primary/5 border-primary/30',
                          daysLeft <= 0 && 'border-l-4 border-l-red-500',
                          daysLeft > 0 && daysLeft <= 30 && 'border-l-4 border-l-orange-500'
                        )}
                      >
                        <div
                          className="flex items-start gap-3 p-4 cursor-pointer"
                          onClick={() => setExpandedArchive(isExpanded ? null : archive.id)}
                        >
                          <Checkbox
                            checked={selectedArchives.includes(archive.id)}
                            onCheckedChange={() => handleSelectArchive(archive.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="font-mono text-xs">
                                {archive.reference}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {archive.typeName}
                              </Badge>
                              {getUrgencyBadge(daysLeft)}
                            </div>
                            
                            <p className="text-sm font-medium truncate">{archive.title}</p>
                            
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Archive className="h-3 w-3" />
                                {archive.agencyName}
                              </span>
                              {archive.boxNumber && (
                                <span>Boîte: {archive.boxNumber}</span>
                              )}
                              <span className={cn(
                                daysLeft <= 30 && 'text-red-600 font-medium'
                              )}>
                                Échéance: {formatDate(archive.retentionEndDate)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onView?.(archive)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Voir les détails
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedArchives([archive.id])
                                    setShowExtendDialog(true)
                                  }}
                                >
                                  <CalendarPlus className="h-4 w-4 mr-2" />
                                  Prolonger
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => {
                                    setSelectedArchives([archive.id])
                                    setShowDestroyDialog(true)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Demander destruction
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                        
                        {/* Expanded details */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t bg-muted/30"
                            >
                              <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <Label className="text-xs text-muted-foreground">Client</Label>
                                  <p className="font-medium">{archive.clientName || 'N/A'}</p>
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground">Statut</Label>
                                  <p className="font-medium">{archive.status}</p>
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground">Localisation</Label>
                                  <p className="font-medium">{archive.locationCode || 'N/A'}</p>
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground">Type</Label>
                                  <p className="font-medium">{archive.typeName}</p>
                                </div>
                              </div>
                              
                              <div className="px-4 pb-4 flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => onView?.(archive)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Voir
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedArchives([archive.id])
                                    setShowExtendDialog(true)
                                  }}
                                >
                                  <CalendarPlus className="h-4 w-4 mr-2" />
                                  Prolonger
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setSelectedArchives([archive.id])
                                    setShowDestroyDialog(true)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Détruire
                                </Button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mb-4 text-green-500" />
            <p className="text-lg font-medium">Aucune archive à échéance</p>
            <p className="text-sm">Toutes les archives sont dans leur période de conservation</p>
          </div>
        )}
      </CardContent>

      {/* Extend dialog */}
      <Dialog open={showExtendDialog} onOpenChange={setShowExtendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Prolonger la conservation</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point de prolonger la durée de conservation de {selectedArchives.length} archive(s).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Duration de prolongation</Label>
              <Select value={extendYears} onValueChange={setExtendYears}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXTEND_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Ou spécifier une date exacte</Label>
              <Input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Motif de prolongation</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Expliquez le motif de la prolongation..."
                rows={3}
              />
            </div>
            
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200">
              <div className="flex items-start gap-2">
                <CalendarPlus className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-200">Nouvelle date de fin</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {customDate ? formatDate(customDate) : `Dans ${extendYears} an(s)`}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExtendDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleExtend} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirmer la prolongation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Destroy dialog */}
      <Dialog open={showDestroyDialog} onOpenChange={setShowDestroyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Demander la destruction</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point de créer une demande de destruction pour {selectedArchives.length} archive(s).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Motif de destruction</Label>
              <Textarea
                value={destroyReason}
                onChange={(e) => setDestroyReason(e.target.value)}
                placeholder="Expliquez le motif de la destruction..."
                rows={3}
              />
            </div>
            
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800 dark:text-red-200">Attention</p>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Cette action nécessitera une approbation. Les archives sélectionnées seront définitivement détruites après validation.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDestroyDialog(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDestroy} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Créer la demande
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

// Compact version for dashboard use
export function ExpiringListCompact({ 
  archives, 
  onView,
  maxItems = 5 
}: { 
  archives: ArchiveItem[]
  onView?: (archive: ArchiveItem) => void
  maxItems?: number
}) {
  const sortedArchives = useMemo(() => {
    return [...archives]
      .sort((a, b) => (a.daysLeft || 0) - (b.daysLeft || 0))
      .slice(0, maxItems)
  }, [archives, maxItems])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          Archives à échéance
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {sortedArchives.length > 0 ? (
          <div className="space-y-2">
            {sortedArchives.map((archive) => {
              const daysLeft = archive.daysLeft ?? 0
              
              return (
                <div
                  key={archive.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                  onClick={() => onView?.(archive)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={cn(
                      'w-2 h-2 rounded-full shrink-0',
                      daysLeft <= 0 ? 'bg-red-500' :
                      daysLeft <= 30 ? 'bg-orange-500' : 'bg-green-500'
                    )} />
                    <span className="font-mono text-xs truncate">{archive.reference}</span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      'text-xs shrink-0',
                      daysLeft <= 0 && 'bg-red-50 text-red-700',
                      daysLeft > 0 && daysLeft <= 30 && 'bg-orange-50 text-orange-700'
                    )}
                  >
                    {daysLeft <= 0 ? 'Expiré' : `${daysLeft}j`}
                  </Badge>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-4 text-sm text-muted-foreground">
            Aucune archive à échéance
          </div>
        )}
      </CardContent>
    </Card>
  )
}
