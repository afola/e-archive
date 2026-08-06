'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  ChevronDown,
  ChevronUp,
  Loader2,
  Shield
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
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
}

interface DestructionRequest {
  id: string
  archiveIds: string[]
  archives: ArchiveItem[]
  requestedBy: string
  requestedByName: string
  requestedAt: string
  reason: string
  status: 'PENDING' | 'APPROVED' | 'EXECUTED' | 'REJECTED'
  approvedBy?: string
  approvedByName?: string
  approvedAt?: string
  executedAt?: string
  method?: 'SHRED' | 'INCINERATE' | 'DIGITAL_DELETE' | 'PULP'
}

interface DestructionWorkflowProps {
  readyForDestruction: ArchiveItem[]
  pendingRequests: DestructionRequest[]
  onCreateRequest: (archiveIds: string[], reason: string) => Promise<void>
  onApproveRequest: (requestId: string) => Promise<void>
  onRejectRequest: (requestId: string) => Promise<void>
  onExecuteDestruction: (requestId: string, method: string) => Promise<void>
}

const DESTRUCTION_METHODS = [
  { value: 'SHRED', label: 'Broyage', description: 'Destruction par broyeur industriel' },
  { value: 'INCINERATE', label: 'Incinération', description: 'Destruction par le feu' },
  { value: 'PULP', label: 'Pulpage', description: 'Transformation en pâte à papier' },
  { value: 'DIGITAL_DELETE', label: 'Suppression numérique', description: 'Suppression sécurisée des fichiers' },
]

export function DestructionWorkflow({
  readyForDestruction,
  pendingRequests,
  onCreateRequest,
  onApproveRequest,
  onRejectRequest,
  onExecuteDestruction
}: DestructionWorkflowProps) {
  const [selectedArchives, setSelectedArchives] = useState<string[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showExecuteDialog, setShowExecuteDialog] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<DestructionRequest | null>(null)
  const [reason, setReason] = useState('Fin de durée de conservation')
  const [method, setMethod] = useState('SHRED')
  const [isLoading, setIsLoading] = useState(false)
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSelectAll = () => {
    if (selectedArchives.length === readyForDestruction.length) {
      setSelectedArchives([])
    } else {
      setSelectedArchives(readyForDestruction.map(a => a.id))
    }
  }

  const handleSelectArchive = (archiveId: string) => {
    setSelectedArchives(prev =>
      prev.includes(archiveId)
        ? prev.filter(id => id !== archiveId)
        : [...prev, archiveId]
    )
  }

  const handleCreateRequest = async () => {
    if (selectedArchives.length === 0) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner au moins une archive',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)
    try {
      await onCreateRequest(selectedArchives, reason)
      setSelectedArchives([])
      setReason('Fin de durée de conservation')
      setShowCreateDialog(false)
      toast({
        title: 'Succès',
        description: 'Demande de destruction créée avec succès'
      })
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la demande',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (requestId: string) => {
    setIsLoading(true)
    try {
      await onApproveRequest(requestId)
      toast({
        title: 'Succès',
        description: 'Demande approuvée avec succès'
      })
    } catch {
      toast({
        title: 'Erreur',
        description: "Impossible d'approuver la demande",
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async (requestId: string) => {
    setIsLoading(true)
    try {
      await onRejectRequest(requestId)
      toast({
        title: 'Succès',
        description: 'Demande rejetée'
      })
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de rejeter la demande',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleExecute = async () => {
    if (!selectedRequest) return
    
    setIsLoading(true)
    try {
      await onExecuteDestruction(selectedRequest.id, method)
      setShowExecuteDialog(false)
      setSelectedRequest(null)
      toast({
        title: 'Succès',
        description: 'Destruction exécutée avec succès'
      })
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'exécuter la destruction',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: DestructionRequest['status']) => {
    const config = {
      PENDING: { label: 'En attente', color: 'bg-amber-100 text-amber-700', icon: Clock },
      APPROVED: { label: 'Approuvée', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      EXECUTED: { label: 'Exécutée', color: 'bg-blue-100 text-blue-700', icon: Trash2 },
      REJECTED: { label: 'Rejetée', color: 'bg-red-100 text-red-700', icon: XCircle }
    }
    return config[status]
  }

  return (
    <div className="space-y-6">
      {/* Ready for destruction section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-500" />
                Archives prêtes pour destruction
              </CardTitle>
              <CardDescription>
                {readyForDestruction.length} archive(s) ont dépassé leur durée de conservation
              </CardDescription>
            </div>
            {selectedArchives.length > 0 && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <FileText className="h-4 w-4 mr-2" />
                Créer demande ({selectedArchives.length})
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {readyForDestruction.length > 0 ? (
            <>
              <div className="flex items-center gap-2 mb-4 pb-4 border-b">
                <Checkbox
                  id="select-all"
                  checked={selectedArchives.length === readyForDestruction.length}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all" className="text-sm text-muted-foreground">
                  Tout sélectionner
                </Label>
              </div>
              
              <ScrollArea className="h-72">
                <div className="space-y-2">
                  {readyForDestruction.map((archive) => (
                    <motion.div
                      key={archive.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        'flex items-start gap-3 p-3 rounded-lg border transition-colors',
                        selectedArchives.includes(archive.id) && 'bg-primary/5 border-primary/20'
                      )}
                    >
                      <Checkbox
                        checked={selectedArchives.includes(archive.id)}
                        onCheckedChange={() => handleSelectArchive(archive.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="font-mono text-xs">
                            {archive.reference}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {archive.typeName}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium truncate">{archive.title}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span>{archive.agencyName}</span>
                          {archive.boxNumber && <span>Boîte: {archive.boxNumber}</span>}
                          <span className="text-red-600">
                            Expirée le {formatDate(archive.retentionEndDate)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mb-4 text-green-500" />
              <p className="text-lg font-medium">Aucune archive à détruire</p>
              <p className="text-sm">Toutes les archives sont dans leur période de conservation</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending requests section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            Demandes en cours
          </CardTitle>
          <CardDescription>
            {pendingRequests.length} demande(s) de destruction en attente de traitement
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingRequests.length > 0 ? (
            <div className="space-y-3">
              {pendingRequests.map((request) => {
                const statusConfig = getStatusBadge(request.status)
                const StatusIcon = statusConfig.icon
                const isExpanded = expandedRequest === request.id

                return (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border rounded-lg overflow-hidden"
                  >
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
                      onClick={() => setExpandedRequest(isExpanded ? null : request.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn('p-2 rounded-lg', statusConfig.color.split(' ')[0])}>
                          <StatusIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">Demande #{request.id.slice(-6)}</p>
                          <p className="text-sm text-muted-foreground">
                            {request.archives.length} archive(s) • {formatDate(request.requestedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={statusConfig.color}>
                          {statusConfig.label}
                        </Badge>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t"
                        >
                          <div className="p-4 space-y-4">
                            <div>
                              <Label className="text-xs text-muted-foreground">Motif</Label>
                              <p className="text-sm">{request.reason}</p>
                            </div>
                            
                            <div>
                              <Label className="text-xs text-muted-foreground">Archives concernées</Label>
                              <ScrollArea className="h-32 mt-2">
                                <div className="space-y-1">
                                  {request.archives.map((archive) => (
                                    <div key={archive.id} className="flex items-center justify-between p-2 rounded bg-muted/50 text-sm">
                                      <span className="font-mono text-xs">{archive.reference}</span>
                                      <span className="text-muted-foreground truncate max-w-[200px]">{archive.title}</span>
                                    </div>
                                  ))}
                                </div>
                              </ScrollArea>
                            </div>

                            {request.status === 'PENDING' && (
                              <div className="flex gap-2 pt-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleReject(request.id)
                                  }}
                                  disabled={isLoading}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Rejeter
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleApprove(request.id)
                                  }}
                                  disabled={isLoading}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approuver
                                </Button>
                              </div>
                            )}

                            {request.status === 'APPROVED' && (
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedRequest(request)
                                  setShowExecuteDialog(true)
                                }}
                                disabled={isLoading}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Exécuter la destruction
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mb-2" />
              <p>Aucune demande en cours</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create request dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer une demande de destruction</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point de créer une demande de destruction pour {selectedArchives.length} archive(s).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Motif de destruction</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Expliquez le motif de la destruction..."
                rows={3}
              />
            </div>
            
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">Attention</p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Cette action nécessitera une approbation avant d'être exécutée.
                    Les archives sélectionnées seront définitivement détruites.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateRequest} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Créer la demande
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Execute destruction dialog */}
      <Dialog open={showExecuteDialog} onOpenChange={setShowExecuteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exécuter la destruction</DialogTitle>
            <DialogDescription>
              Choisissez la méthode de destruction pour cette demande.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Méthode de destruction</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DESTRUCTION_METHODS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      <div>
                        <span className="font-medium">{m.label}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {m.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200">
              <div className="flex items-start gap-2">
                <Shield className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800 dark:text-red-200">Action irréversible</p>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Cette action est définitive. Un certificat de destruction sera généré automatiquement.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExecuteDialog(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleExecute} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirmer la destruction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
