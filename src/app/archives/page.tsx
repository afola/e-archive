'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Download,
  Upload,
  LayoutGrid,
  List,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  FileDown,
  ArrowRightLeft,
  BookOpen,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ArchiveTable } from '@/components/archive/archive-table'
import { AdvancedFilterPanel } from '@/components/archive/filter-panel'
import { ArchiveDialog } from '@/components/archive/archive-dialog'
import { StatusBadge } from '@/components/archive/status-badge'
import { ConfidentialityBadge } from '@/components/archive/confidentiality-badge'
import { FileAttachmentList, AttachedFile } from '@/components/archive/file-attachment-list'
import { mockArchives, archiveTypes } from '@/data/mock-data'
import { ArchiveFilters, Archive } from '@/store/archive-store'
import { cn, formatDate } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { generateArchivePDF, generateArchivesListPDF } from '@/lib/export/pdf'
import { exportArchivesToExcel } from '@/lib/export/excel'

export default function ArchivesPage() {
  const { toast } = useToast()
  const [filters, setFilters] = useState<ArchiveFilters>({})
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [selectedArchive, setSelectedArchive] = useState<Archive | null>(null)
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isBorrowDialogOpen, setIsBorrowDialogOpen] = useState(false)
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false)
  
  // Local state for archives (simulating database)
  const [archives, setArchives] = useState<Archive[]>(mockArchives)

  // Filter archives based on current filters
  const filteredArchives = useMemo(() => {
    return archives.filter(archive => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch = 
          archive.reference.toLowerCase().includes(searchLower) ||
          archive.title.toLowerCase().includes(searchLower) ||
          (archive.clientName?.toLowerCase().includes(searchLower)) ||
          (archive.accountNumber?.toLowerCase().includes(searchLower))
        if (!matchesSearch) return false
      }
      
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(archive.status)) return false
      }
      
      if (filters.type && filters.type.length > 0) {
        if (!filters.type.includes(archive.type)) return false
      }
      
      if (filters.agency && filters.agency.length > 0) {
        if (!filters.agency.includes(archive.agencyId)) return false
      }
      
      if (filters.confidentiality && filters.confidentiality.length > 0) {
        if (!filters.confidentiality.includes(archive.confidentiality)) return false
      }
      
      if (filters.clientName) {
        if (!archive.clientName?.toLowerCase().includes(filters.clientName.toLowerCase())) return false
      }
      
      if (filters.accountNumber) {
        if (!archive.accountNumber?.toLowerCase().includes(filters.accountNumber.toLowerCase())) return false
      }
      
      return true
    })
  }, [filters, archives])

  // Handlers
  const handleCreate = async (data: Partial<Archive>) => {
    const newArchive: Archive = {
      ...data,
      id: `arch-${Date.now()}`,
      version: 1,
      status: 'ACTIVE',
      hasDigitalCopy: data.hasDigitalCopy ?? false,
      archiveDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Archive
    
    setArchives(prev => [newArchive, ...prev])
    toast({
      title: 'Archive créée',
      description: `L'archive "${newArchive.title}" a été créée avec succès.`,
    })
  }

  const handleEdit = async (data: Partial<Archive>) => {
    if (!selectedArchive) return
    
    setArchives(prev => prev.map(a => 
      a.id === selectedArchive.id 
        ? { ...a, ...data, version: a.version + 1, updatedAt: new Date().toISOString() }
        : a
    ))
    toast({
      title: 'Archive modifiée',
      description: `L'archive "${data.title}" a été modifiée avec succès.`,
    })
  }

  const handleDelete = () => {
    if (!selectedArchive) return
    
    setArchives(prev => prev.filter(a => a.id !== selectedArchive.id))
    setIsDeleteDialogOpen(false)
    setSelectedArchive(null)
    toast({
      title: 'Archive supprimée',
      description: `L'archive "${selectedArchive.title}" a été supprimée.`,
    })
  }

  const handleView = (archive: Archive) => {
    setSelectedArchive(archive)
    setIsViewDialogOpen(true)
  }

  const handleEditClick = (archive: Archive) => {
    setSelectedArchive(archive)
    setIsEditDialogOpen(true)
  }

  const handleDownload = (archive: Archive) => {
    if (archive.filePath) {
      // Create download link
      const link = document.createElement('a')
      link.href = archive.filePath
      link.download = archive.fileName || 'document.pdf'
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast({
        title: 'Téléchargement',
        description: `Téléchargement de "${archive.fileName || archive.title}"...`,
      })
    } else {
      toast({
        title: 'Aucun fichier',
        description: 'Cette archive n\'a pas de version numérique.',
      })
    }
  }

  const handleMove = (archive: Archive) => {
    setSelectedArchive(archive)
    setIsMoveDialogOpen(true)
  }

  const handleBorrow = (archive: Archive) => {
    setSelectedArchive(archive)
    setIsBorrowDialogOpen(true)
  }

  const handleBorrowConfirm = () => {
    if (!selectedArchive) return
    
    setArchives(prev => prev.map(a => 
      a.id === selectedArchive.id 
        ? { ...a, status: 'ON_LOAN' as const }
        : a
    ))
    setIsBorrowDialogOpen(false)
    toast({
      title: 'Emprunt enregistré',
      description: `L'archive "${selectedArchive.title}" a été marquée comme empruntée.`,
    })
  }

  const handleMoveConfirm = (newAgencyId: string) => {
    if (!selectedArchive) return
    
    const newAgency = archives.find(a => a.agencyId === newAgencyId)
    setArchives(prev => prev.map(a => 
      a.id === selectedArchive.id 
        ? { 
            ...a, 
            agencyId: newAgencyId,
            agencyName: newAgency?.agencyName || a.agencyName,
            status: 'IN_TRANSFER' as const 
          }
        : a
    ))
    setIsMoveDialogOpen(false)
    toast({
      title: 'Transfert initié',
      description: `Le transfert de "${selectedArchive.title}" a été initié.`,
    })
  }

  const resetFilters = () => {
    setFilters({})
  }

  // Export handlers
  const handleExportPDF = useCallback(() => {
    if (filteredArchives.length === 0) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Aucune archive à exporter' })
      return
    }
    
    const doc = generateArchivesListPDF(filteredArchives)
    doc.save(`archives_${new Date().toISOString().split('T')[0]}.pdf`)
    toast({ title: 'Export PDF', description: `${filteredArchives.length} archives exportées en PDF` })
  }, [filteredArchives, toast])

  const handleExportExcel = useCallback(() => {
    if (filteredArchives.length === 0) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Aucune archive à exporter' })
      return
    }
    
    exportArchivesToExcel(filteredArchives, 'archives')
    toast({ title: 'Export Excel', description: `${filteredArchives.length} archives exportées en Excel` })
  }, [filteredArchives, toast])

  const handleExportArchivePDF = useCallback((archive: Archive) => {
    const doc = generateArchivePDF(archive)
    doc.save(`archive_${archive.reference}.pdf`)
    toast({ title: 'Fiche générée', description: `Fiche PDF pour ${archive.reference}` })
  }, [toast])

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestion des Archives</h1>
          <p className="text-muted-foreground">
            {filteredArchives.length} archive{filteredArchives.length > 1 ? 's' : ''} trouvée{filteredArchives.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => toast({ title: 'Import', description: 'Fonctionnalité d\'import à venir' })}>
            <Upload className="h-4 w-4 mr-2" />
            Importer
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportPDF}>
                <FileText className="h-4 w-4 mr-2" />
                Exporter en PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportExcel}>
                <FileDown className="h-4 w-4 mr-2" />
                Exporter en Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle archive
          </Button>
        </div>
      </div>

      {/* Filters */}
      <AdvancedFilterPanel
        filters={filters}
        onFiltersChange={setFilters}
        onReset={resetFilters}
      />

      {/* View toggle and results */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'table' | 'cards')}>
            <TabsList className="h-8">
              <TabsTrigger value="table" className="text-xs px-3">
                <List className="h-4 w-4 mr-1" />
                Tableau
              </TabsTrigger>
              <TabsTrigger value="cards" className="text-xs px-3">
                <LayoutGrid className="h-4 w-4 mr-1" />
                Cartes
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Tri par:</span>
          <select 
            className="border rounded px-2 py-1 text-sm bg-background"
            onChange={(e) => {
              const field = e.target.value
              setArchives(prev => [...prev].sort((a, b) => {
                if (field.includes('récent')) return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                if (field.includes('ancien')) return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                if (field === 'Référence') return a.reference.localeCompare(b.reference)
                if (field.includes('conservation')) return new Date(a.retentionEndDate).getTime() - new Date(b.retentionEndDate).getTime()
                return 0
              }))
            }}
          >
            <option>Date archive (récent)</option>
            <option>Date archive (ancien)</option>
            <option>Référence</option>
            <option>Fin conservation</option>
          </select>
        </div>
      </div>

      {/* Table view */}
      {viewMode === 'table' && (
        <ArchiveTable
          data={filteredArchives}
          onView={handleView}
          onEdit={handleEditClick}
          onDownload={handleDownload}
          onMove={handleMove}
          onBorrow={handleBorrow}
          onDelete={(archive) => {
            setSelectedArchive(archive)
            setIsDeleteDialogOpen(true)
          }}
        />
      )}

      {/* Cards view */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredArchives.slice(0, 30).map((archive, index) => (
            <motion.div
              key={archive.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-mono text-sm font-medium text-blue-600">
                        {archive.reference}
                      </p>
                      <CardTitle className="text-base mt-1 line-clamp-1">
                        {archive.title}
                      </CardTitle>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(archive)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Voir les détails
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditClick(archive)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        {archive.hasDigitalCopy && (
                          <DropdownMenuItem onClick={() => handleDownload(archive)}>
                            <FileDown className="h-4 w-4 mr-2" />
                            Télécharger
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleBorrow(archive)}>
                          <BookOpen className="h-4 w-4 mr-2" />
                          Emprunter
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleMove(archive)}>
                          <ArrowRightLeft className="h-4 w-4 mr-2" />
                          Transférer
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => {
                            setSelectedArchive(archive)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={archive.status} size="sm" />
                    <ConfidentialityBadge level={archive.confidentiality} size="sm" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p className="font-medium">{archive.typeName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Agence</p>
                      <p className="font-medium truncate">{archive.agencyName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Date archive</p>
                      <p className="font-medium">{formatDate(archive.archiveDate)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Fin conservation</p>
                      <p className="font-medium">{formatDate(archive.retentionEndDate)}</p>
                    </div>
                  </div>
                  
                  {archive.clientName && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">Client</p>
                      <p className="text-sm font-medium">{archive.clientName}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs text-muted-foreground">
                      v{archive.version} • {archive.hasDigitalCopy ? '📁 Numérique' : '📄 Physique'}
                    </span>
                    <div className="flex gap-1">
                      {archive.hasDigitalCopy && (
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleDownload(archive)}>
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <ArchiveDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSave={handleCreate}
      />

      {/* Edit Dialog */}
      <ArchiveDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        archive={selectedArchive}
        onSave={handleEdit}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l'archive "{selectedArchive?.title}" ? 
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Details Dialog */}
      <AlertDialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <span className="font-mono text-blue-600">{selectedArchive?.reference}</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base font-medium text-foreground">
              {selectedArchive?.title}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <StatusBadge status={selectedArchive?.status || 'ACTIVE'} />
              <ConfidentialityBadge level={selectedArchive?.confidentiality || 'NORMAL'} />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Type</p>
                <p className="font-medium">{selectedArchive?.typeName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Catégorie</p>
                <p className="font-medium">{selectedArchive?.category || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Agence</p>
                <p className="font-medium">{selectedArchive?.agencyName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Département</p>
                <p className="font-medium">{selectedArchive?.department || '-'}</p>
              </div>
              {selectedArchive?.clientName && (
                <div>
                  <p className="text-muted-foreground">Client</p>
                  <p className="font-medium">{selectedArchive.clientName}</p>
                </div>
              )}
              {selectedArchive?.accountNumber && (
                <div>
                  <p className="text-muted-foreground">Compte</p>
                  <p className="font-medium font-mono text-xs">{selectedArchive.accountNumber}</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground">Date d'archivage</p>
                <p className="font-medium">{selectedArchive?.archiveDate ? formatDate(selectedArchive.archiveDate) : '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Fin de conservation</p>
                <p className="font-medium">{selectedArchive?.retentionEndDate ? formatDate(selectedArchive.retentionEndDate) : '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Version</p>
                <p className="font-medium">v{selectedArchive?.version}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Format</p>
                <p className="font-medium">{selectedArchive?.hasDigitalCopy ? 'Numérique' : 'Physique'}</p>
              </div>
            </div>

            {selectedArchive?.description && (
              <div className="pt-2 border-t">
                <p className="text-muted-foreground text-sm">Description</p>
                <p className="text-sm mt-1">{selectedArchive.description}</p>
              </div>
            )}

            {selectedArchive?.locationCode && (
              <div className="pt-2 border-t">
                <p className="text-muted-foreground text-sm">Localisation physique</p>
                <p className="text-sm mt-1 font-mono">{selectedArchive.locationCode}</p>
              </div>
            )}

            {/* Documents joints */}
            {(selectedArchive?.filePath || selectedArchive?.hasDigitalCopy) && (
              <div className="pt-2 border-t">
                <p className="text-muted-foreground text-sm mb-3">Documents joints</p>
                <FileAttachmentList
                  files={[
                    {
                      name: selectedArchive?.fileName || 'Document',
                      url: selectedArchive?.filePath || '',
                      size: selectedArchive?.fileSize,
                      type: 'application/pdf',
                    }
                  ] as AttachedFile[]}
                  onPreview={(file) => {
                    window.open(file.url, '_blank')
                  }}
                  readonly
                />
              </div>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Fermer</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setIsViewDialogOpen(false)
              handleEditClick(selectedArchive!)
            }}>
              Modifier
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Borrow Dialog */}
      <AlertDialog open={isBorrowDialogOpen} onOpenChange={setIsBorrowDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Emprunter l'archive</AlertDialogTitle>
            <AlertDialogDescription>
              Voulez-vous emprunter l'archive "{selectedArchive?.title}" ?
              L'archive sera marquée comme "En prêt" jusqu'à sa restitution.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleBorrowConfirm}>
              Confirmer l'emprunt
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Move Dialog */}
      <AlertDialog open={isMoveDialogOpen} onOpenChange={setIsMoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Transférer l'archive</AlertDialogTitle>
            <AlertDialogDescription>
              Sélectionnez l'agence de destination pour "{selectedArchive?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <select 
              id="targetAgency" 
              className="w-full border rounded px-3 py-2 text-sm bg-background"
              defaultValue=""
            >
              <option value="" disabled>Sélectionner une agence</option>
              <option value="AG001">Siège Central Paris</option>
              <option value="AG002">Agence Lyon Centre</option>
              <option value="AG003">Agence Marseille Vieux-Port</option>
              <option value="AG004">Agence Bordeaux Centre</option>
              <option value="AG005">Agence Nice Centre</option>
              <option value="AG006">Agence Strasbourg Centre</option>
            </select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              const select = document.getElementById('targetAgency') as HTMLSelectElement
              if (select?.value) {
                handleMoveConfirm(select.value)
              }
            }}>
              Confirmer le transfert
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
