'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Warehouse,
  Building2,
  Building,
  DoorOpen,
  Archive,
  Package,
  Plus,
  RefreshCw,
  LayoutGrid,
  List,
  Filter,
  Search,
  QrCode,
  BarChart3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { LocationTree } from '@/components/storage/location-tree'
import { BoxGrid } from '@/components/storage/box-grid'
import { BoxDetails } from '@/components/storage/box-details'
import { fetchWithCurrentAuth } from '@/lib/auth/auth-store'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { StorageLocation, buildLocationTree } from '@/data/storage-data'

interface StorageStats {
  totalSites: number
  totalBuildings: number
  totalRooms: number
  totalShelves: number
  totalBoxes: number
  totalArchives: number
  averageFillLevel: number
  lowCapacity: number
  availableSpace: number
}

interface LocationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  parentId: string | null
  type: StorageLocation['type']
  onSave: (data: { name: string; code: string; capacity?: number }) => void
}

function LocationDialog({ open, onOpenChange, parentId, type, onSave }: LocationDialogProps) {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [capacity, setCapacity] = useState('25')

  const typeLabels: Record<StorageLocation['type'], string> = {
    SITE: 'Site',
    BUILDING: 'Bâtiment',
    ROOM: 'Salle',
    SHELF: 'Rayon',
    BOX: 'Boîte',
  }

  const handleSave = () => {
    if (!name || !code) return
    onSave({
      name,
      code,
      capacity: type === 'BOX' || type === 'SHELF' ? parseInt(capacity) : undefined,
    })
    setName('')
    setCode('')
    setCapacity('25')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un {typeLabels[type].toLowerCase()}</DialogTitle>
          <DialogDescription>
            Créez un nouvel emplacement de stockage
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              placeholder={`Nom du ${typeLabels[type].toLowerCase()}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Code</Label>
            <Input
              id="code"
              placeholder="Code unique"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          {(type === 'BOX' || type === 'SHELF' || type === 'ROOM') && (
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacité</Label>
              <Input
                id="capacity"
                type="number"
                placeholder="Capacité"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={!name || !code}>
            Créer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  color,
}: {
  title: string
  value: number | string
  icon: typeof Building2
  description?: string
  color: string
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg', color)}>
            <Icon className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{title}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function StoragePage() {
  const { toast } = useToast()
  const [locations, setLocations] = useState<StorageLocation[]>([])
  const [locationTree, setLocationTree] = useState<StorageLocation[]>([])
  const [stats, setStats] = useState<StorageStats | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<StorageLocation | null>(null)
  const [selectedBox, setSelectedBox] = useState<StorageLocation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newLocationParentId, setNewLocationParentId] = useState<string | null>(null)
  const [newLocationType, setNewLocationType] = useState<StorageLocation['type']>('SITE')

  // Fetch storage data
  const fetchStorageData = async () => {
    setIsLoading(true)
    try {
      const response = await fetchWithCurrentAuth('/storage')
      const data = await response.json()
      setLocationTree(data.tree || [])
      setStats(data.stats || null)
      
      // Flatten tree for searching
      const flattenLocations = (items: StorageLocation[]): StorageLocation[] => {
        return items.flatMap(item => [
          item,
          ...(item.children ? flattenLocations(item.children) : [])
        ])
      }
      setLocations(flattenLocations(data.tree || []))
    } catch (error) {
      console.error('Failed to fetch storage data:', error)
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger les données de stockage',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStorageData()
  }, [])

  // Filter locations based on search
  const filteredLocations = useMemo(() => {
    if (!searchQuery) return locationTree
    
    const searchLower = searchQuery.toLowerCase()
    
    const filterTree = (items: StorageLocation[]): StorageLocation[] => {
      return items.reduce((acc: StorageLocation[], item) => {
        const matches = 
          item.name.toLowerCase().includes(searchLower) ||
          item.code.toLowerCase().includes(searchLower)
        
        const filteredChildren = item.children ? filterTree(item.children) : []
        
        if (matches || filteredChildren.length > 0) {
          acc.push({
            ...item,
            children: filteredChildren,
          })
        }
        
        return acc
      }, [])
    }
    
    return filterTree(locationTree)
  }, [locationTree, searchQuery])

  // Get boxes for selected shelf
  const boxesForLocation = useMemo(() => {
    if (!selectedLocation) return []
    
    // If selected location is a shelf, return its boxes (children)
    if (selectedLocation.type === 'SHELF' && selectedLocation.children) {
      return selectedLocation.children.filter(c => c.type === 'BOX')
    }
    
    // If selected location is a box, return just that box
    if (selectedLocation.type === 'BOX') {
      return [selectedLocation]
    }
    
    // For other types, collect all boxes from children
    const collectBoxes = (items: StorageLocation[]): StorageLocation[] => {
      return items.flatMap(item => {
        if (item.type === 'BOX') return [item]
        if (item.children) return collectBoxes(item.children)
        return []
      })
    }
    
    return collectBoxes(selectedLocation.children || [])
  }, [selectedLocation])

  // Handle location selection
  const handleSelectLocation = (location: StorageLocation) => {
    setSelectedLocation(location)
    
    // If it's a box, also select it for details
    if (location.type === 'BOX') {
      setSelectedBox(location)
    }
  }

  // Handle box selection
  const handleSelectBox = (box: StorageLocation) => {
    setSelectedBox(box)
  }

  // Handle add location
  const handleAddLocation = (parentId: string, type: StorageLocation['type']) => {
    setNewLocationParentId(parentId)
    setNewLocationType(type)
    setDialogOpen(true)
  }

  // Handle create location
  const handleCreateLocation = async (data: { name: string; code: string; capacity?: number }) => {
    try {
      const response = await fetchWithCurrentAuth('/storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: newLocationType,
          parentId: newLocationParentId,
          ...data,
        }),
      })
      
      if (!response.ok) throw new Error('Failed to create location')
      
      toast({
        title: 'Emplacement créé',
        description: `${data.name} a été ajouté avec succès`,
      })
      
      fetchStorageData()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de créer l\'emplacement',
      })
    }
  }

  // Handle edit location
  const handleEditLocation = (location: StorageLocation) => {
    toast({
      title: 'Modification',
      description: `Modification de ${location.name} (fonctionnalité à venir)`,
    })
  }

  // Handle delete location
  const handleDeleteLocation = async (location: StorageLocation) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${location.name}" ?`)) return
    
    try {
      const response = await fetchWithCurrentAuth(`/storage?id=${encodeURIComponent(location.id)}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }
      
      toast({
        title: 'Emplacement supprimé',
        description: `${location.name} a été supprimé`,
      })
      
      fetchStorageData()
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de supprimer l\'emplacement',
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestion des Emplacements</h1>
          <p className="text-muted-foreground">
            Gérez les sites, bâtiments, salles, rayons et boîtes de stockage
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchStorageData}>
            <RefreshCw className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')} />
            Actualiser
          </Button>
          <Button 
            size="sm" 
            onClick={() => {
              setNewLocationParentId(null)
              setNewLocationType('SITE')
              setDialogOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau site
          </Button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <StatCard
            title="Sites"
            value={stats.totalSites}
            icon={Building2}
            color="bg-blue-500"
          />
          <StatCard
            title="Bâtiments"
            value={stats.totalBuildings}
            icon={Building}
            color="bg-purple-500"
          />
          <StatCard
            title="Salles"
            value={stats.totalRooms}
            icon={DoorOpen}
            color="bg-orange-500"
          />
          <StatCard
            title="Rayons"
            value={stats.totalShelves}
            icon={Archive}
            color="bg-emerald-500"
          />
          <StatCard
            title="Boîtes"
            value={stats.totalBoxes}
            icon={Package}
            color="bg-amber-500"
          />
          <StatCard
            title="Remplissage moy."
            value={`${stats.averageFillLevel}%`}
            icon={BarChart3}
            description={`${stats.lowCapacity} pleines, ${stats.availableSpace} libres`}
            color="bg-slate-500"
          />
        </div>
      )}

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Location Tree */}
        <div className="lg:col-span-3">
          <Card className="h-[calc(100vh-320px)] min-h-[500px]">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <LocationTree
              locations={filteredLocations}
              selectedLocation={selectedLocation}
              onSelectLocation={handleSelectLocation}
              onAddLocation={handleAddLocation}
              onEditLocation={handleEditLocation}
              onDeleteLocation={handleDeleteLocation}
            />
          </Card>
        </div>

        {/* Center: Box Grid */}
        <div className="lg:col-span-6">
          <Card className="h-[calc(100vh-320px)] min-h-[500px]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {selectedLocation ? (
                    <span>
                      {selectedLocation.name}
                      <Badge variant="outline" className="ml-2">
                        {boxesForLocation.length} boîte{boxesForLocation.length !== 1 ? 's' : ''}
                      </Badge>
                    </span>
                  ) : (
                    'Sélectionnez un emplacement'
                  )}
                </CardTitle>
                {selectedLocation?.type === 'SHELF' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddLocation(selectedLocation.id, 'BOX')}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter boîte
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="overflow-auto h-[calc(100%-60px)]">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : boxesForLocation.length > 0 ? (
                <BoxGrid
                  boxes={boxesForLocation}
                  selectedBoxId={selectedBox?.id || null}
                  onSelectBox={handleSelectBox}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Warehouse className="h-16 w-16 text-slate-200 dark:text-slate-700 mb-4" />
                  <p className="text-muted-foreground">
                    {selectedLocation
                      ? 'Aucune boîte dans cet emplacement'
                      : 'Sélectionnez un rayon pour voir les boîtes'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Box Details */}
        <div className="lg:col-span-3">
          <Card className="h-[calc(100vh-320px)] min-h-[500px]">
            <BoxDetails
              box={selectedBox}
              onViewArchive={(archiveId) => {
                toast({
                  title: 'Voir archive',
                  description: `Navigation vers l'archive ${archiveId}`,
                })
              }}
            />
          </Card>
        </div>
      </div>

      {/* Add Location Dialog */}
      <LocationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        parentId={newLocationParentId}
        type={newLocationType}
        onSave={handleCreateLocation}
      />
    </div>
  )
}
