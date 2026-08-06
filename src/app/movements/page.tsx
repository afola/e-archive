'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRightLeft,
  Plus,
  Download,
  Filter,
  Calendar,
  Building2,
  User,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Printer,
  QrCode,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { mockMovements, mockArchives, mockUsers, mockAgencies } from '@/data/mock-data'
import { Movement } from '@/store/archive-store'
import { formatDate, formatBytes } from '@/lib/utils'
import { cn } from '@/lib/utils'

const movementTypeConfig = {
  ENTRY: { label: 'Entrée', color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-950' },
  EXIT: { label: 'Sortie', color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-950' },
  RETURN: { label: 'Retour', color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-950' },
  TRANSFER: { label: 'Transfert', color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-950' },
  DESTRUCTION: { label: 'Destruction', color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-950' },
  QUARANTINE: { label: 'Quarantaine', color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-950' },
}

const movementStatusConfig = {
  PENDING: { label: 'En attente', icon: Clock, color: 'text-amber-600' },
  APPROVED: { label: 'Approuvé', icon: CheckCircle, color: 'text-emerald-600' },
  EXECUTED: { label: 'Exécuté', icon: CheckCircle, color: 'text-blue-600' },
  CANCELLED: { label: 'Annulé', icon: XCircle, color: 'text-gray-600' },
}

export default function MovementsPage() {
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null)

  const filteredMovements = useMemo(() => {
    return mockMovements.filter(m => {
      if (selectedType !== 'all' && m.type !== selectedType) return false
      if (selectedStatus !== 'all' && m.status !== selectedStatus) return false
      return true
    })
  }, [selectedType, selectedStatus])

  const getTypeConfig = (type: string) => movementTypeConfig[type as keyof typeof movementTypeConfig] || movementTypeConfig.ENTRY
  const getStatusConfig = (status: string) => movementStatusConfig[status as keyof typeof movementStatusConfig] || movementStatusConfig.PENDING

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mouvements physiques</h1>
          <p className="text-muted-foreground">
            Suivi des entrées, sorties et transferts d'archives
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <QrCode className="h-4 w-4 mr-2" />
            Scanner
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Imprimer bon
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau mouvement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Enregistrer un mouvement</DialogTitle>
                <DialogDescription>
                  Créez une nouvelle demande de mouvement d'archive
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label>Type de mouvement</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ENTRY">Entrée en stock</SelectItem>
                      <SelectItem value="EXIT">Sortie temporaire</SelectItem>
                      <SelectItem value="RETURN">Retour / Restitution</SelectItem>
                      <SelectItem value="TRANSFER">Transfert entre sites</SelectItem>
                      <SelectItem value="QUARANTINE">Mise en quarantaine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Archive</Label>
                  <Input placeholder="Rechercher une archive..." />
                </div>
                <div className="space-y-2">
                  <Label>Site d'origine</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockAgencies.map(a => (
                        <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Site de destination</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockAgencies.map(a => (
                        <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Motif</Label>
                  <Textarea placeholder="Décrivez le motif du mouvement..." />
                </div>
                <div className="space-y-2">
                  <Label>Date de retour prévue</Label>
                  <Input type="date" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">Annuler</Button>
                <Button>Enregistrer</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950">
                <ArrowRightLeft className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Entrées ce mois</p>
                <p className="text-2xl font-bold">45</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950">
                <ArrowRightLeft className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sorties en cours</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950">
                <ArrowRightLeft className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Transferts</p>
                <p className="text-2xl font-bold">8</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-950">
                <Clock className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold">{mockMovements.filter(m => m.status === 'PENDING').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Type de mouvement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="ENTRY">Entrée</SelectItem>
            <SelectItem value="EXIT">Sortie</SelectItem>
            <SelectItem value="RETURN">Retour</SelectItem>
            <SelectItem value="TRANSFER">Transfert</SelectItem>
            <SelectItem value="DESTRUCTION">Destruction</SelectItem>
            <SelectItem value="QUARANTINE">Quarantaine</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="PENDING">En attente</SelectItem>
            <SelectItem value="APPROVED">Approuvé</SelectItem>
            <SelectItem value="EXECUTED">Exécuté</SelectItem>
            <SelectItem value="CANCELLED">Annulé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Movements list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Historique des mouvements</CardTitle>
              <CardDescription>
                {filteredMovements.length} mouvement{filteredMovements.length > 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <div className="divide-y">
                  {filteredMovements.map((movement, index) => {
                    const typeConf = getTypeConfig(movement.type)
                    const statusConf = getStatusConfig(movement.status)
                    const StatusIcon = statusConf.icon

                    return (
                      <motion.div
                        key={movement.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedMovement(movement)}
                        className={cn(
                          'p-4 hover:bg-muted/50 cursor-pointer transition-colors',
                          selectedMovement?.id === movement.id && 'bg-muted/50'
                        )}
                      >
                        <div className="flex items-start gap-4">
                          <div className={cn('p-2 rounded-lg', typeConf.bgColor)}>
                            <ArrowRightLeft className={cn('h-5 w-5', typeConf.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className={cn('text-xs', typeConf.color)}>
                                {typeConf.label}
                              </Badge>
                              <Badge variant="outline" className={cn('text-xs gap-1', statusConf.color)}>
                                <StatusIcon className="h-3 w-3" />
                                {statusConf.label}
                              </Badge>
                              {movement.receiptNumber && (
                                <span className="text-xs font-mono text-muted-foreground">
                                  {movement.receiptNumber}
                                </span>
                              )}
                            </div>
                            <p className="font-medium text-sm truncate">{movement.archiveTitle}</p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {movement.archiveReference}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {movement.requestedByName}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(movement.requestedAt)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            {movement.fromAgency && movement.toAgency && (
                              <div className="text-xs text-muted-foreground">
                                <span>{movement.fromAgency}</span>
                                <span className="mx-1">→</span>
                                <span>{movement.toAgency}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Movement detail */}
        <div>
          {selectedMovement ? (
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-base">Détail du mouvement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground">Archive</p>
                  <p className="font-medium">{selectedMovement.archiveTitle}</p>
                  <p className="text-sm font-mono text-muted-foreground">
                    {selectedMovement.archiveReference}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Type</p>
                    <Badge variant="outline" className={cn(getTypeConfig(selectedMovement.type).color)}>
                      {getTypeConfig(selectedMovement.type).label}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Statut</p>
                    <Badge variant="outline" className={cn(getStatusConfig(selectedMovement.status).color)}>
                      {getStatusConfig(selectedMovement.status).label}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Demandeur</p>
                    <p className="text-sm">{selectedMovement.requestedByName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Date demande</p>
                    <p className="text-sm">{formatDate(selectedMovement.requestedAt, 'long')}</p>
                  </div>
                  {selectedMovement.approvedByName && (
                    <>
                      <div>
                        <p className="text-xs text-muted-foreground">Approuvé par</p>
                        <p className="text-sm">{selectedMovement.approvedByName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Date approbation</p>
                        <p className="text-sm">{formatDate(selectedMovement.approvedAt!, 'long')}</p>
                      </div>
                    </>
                  )}
                </div>

                {selectedMovement.reason && (
                  <div>
                    <p className="text-xs text-muted-foreground">Motif</p>
                    <p className="text-sm">{selectedMovement.reason}</p>
                  </div>
                )}

                {selectedMovement.fromLocation && (
                  <div>
                    <p className="text-xs text-muted-foreground">Origine</p>
                    <p className="text-sm font-mono">{selectedMovement.fromLocation}</p>
                  </div>
                )}

                {selectedMovement.toLocation && (
                  <div>
                    <p className="text-xs text-muted-foreground">Destination</p>
                    <p className="text-sm font-mono">{selectedMovement.toLocation}</p>
                  </div>
                )}

                {selectedMovement.expectedReturnDate && (
                  <div>
                    <p className="text-xs text-muted-foreground">Retour prévu</p>
                    <p className="text-sm">{formatDate(selectedMovement.expectedReturnDate)}</p>
                  </div>
                )}

                <Separator className="my-4" />

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Printer className="h-4 w-4 mr-2" />
                    Bon
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <QrCode className="h-4 w-4 mr-2" />
                    QR Code
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-6">
              <CardContent className="p-6 text-center text-muted-foreground">
                <ArrowRightLeft className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Sélectionnez un mouvement pour voir les détails</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

// Import Separator
import { Separator } from '@/components/ui/separator'
