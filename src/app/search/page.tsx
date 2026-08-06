'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Save,
  History,
  Star,
  Download,
  Filter,
  X,
  FileText,
  Building2,
  User,
  Calendar,
  Hash,
  MapPin,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArchiveTable } from '@/components/archive/archive-table'
import { StatusBadge } from '@/components/archive/status-badge'
import { ConfidentialityBadge } from '@/components/archive/confidentiality-badge'
import { mockArchives, archiveTypes, mockAgencies } from '@/data/mock-data'
import { ArchiveFilters, ArchiveStatus, ConfidentialityLevel } from '@/store/archive-store'
import { formatDate } from '@/lib/utils'

// Saved searches
const savedSearches = [
  { id: '1', name: 'Dossiers crédit Lyon', count: 45, lastUsed: '2024-01-15' },
  { id: '2', name: 'KYC clients VIP', count: 23, lastUsed: '2024-01-14' },
  { id: '3', name: 'Archives à détruire 2024', count: 12, lastUsed: '2024-01-10' },
  { id: '4', name: 'Documents juridiques Marseille', count: 67, lastUsed: '2024-01-08' },
]

// Recent searches
const recentSearches = [
  { id: '1', query: 'Martin SARL', timestamp: '2024-01-16T10:30:00Z' },
  { id: '2', query: 'ARC-CREDIT-000042', timestamp: '2024-01-16T09:15:00Z' },
  { id: '3', query: 'KYC client 75001', timestamp: '2024-01-15T16:45:00Z' },
  { id: '4', query: 'Contrat immobilier', timestamp: '2024-01-15T14:20:00Z' },
  { id: '5', query: 'Contentieux 2023', timestamp: '2024-01-14T11:00:00Z' },
]

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<ArchiveFilters>({})
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [activeFilters, setActiveFilters] = useState<{ type: string; label: string; value: string }[]>([])

  // Filter archives
  const filteredArchives = useMemo(() => {
    let results = mockArchives

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      results = results.filter(a => 
        a.reference.toLowerCase().includes(query) ||
        a.title.toLowerCase().includes(query) ||
        a.clientName?.toLowerCase().includes(query) ||
        a.accountNumber?.toLowerCase().includes(query) ||
        a.clientNumber?.toLowerCase().includes(query)
      )
    }

    if (filters.status && filters.status.length > 0) {
      results = results.filter(a => filters.status!.includes(a.status))
    }

    if (filters.type && filters.type.length > 0) {
      results = results.filter(a => filters.type!.includes(a.type))
    }

    if (filters.agency && filters.agency.length > 0) {
      results = results.filter(a => filters.agency!.includes(a.agencyId))
    }

    if (filters.confidentiality && filters.confidentiality.length > 0) {
      results = results.filter(a => filters.confidentiality!.includes(a.confidentiality))
    }

    return results
  }, [searchQuery, filters])

  const addFilter = (type: string, label: string, value: string) => {
    setActiveFilters([...activeFilters, { type, label, value }])
  }

  const removeFilter = (index: number) => {
    setActiveFilters(activeFilters.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Centre de recherche</h1>
        <p className="text-muted-foreground">
          Recherche multicritères dans les archives
        </p>
      </div>

      {/* Main search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Rechercher par référence, client, compte, mot-clé..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
            <Button size="lg">
              <Search className="h-5 w-5 mr-2" />
              Rechercher
            </Button>
          </div>

          {/* Active filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {activeFilters.map((filter, index) => (
                <Badge key={index} variant="secondary" className="gap-1 pl-3">
                  <span className="text-muted-foreground">{filter.type}:</span>
                  <span>{filter.label}</span>
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive ml-1"
                    onClick={() => removeFilter(index)}
                  />
                </Badge>
              ))}
              <Button variant="ghost" size="sm" onClick={() => setActiveFilters([])}>
                Effacer tout
              </Button>
            </div>
          )}

          {/* Quick filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              variant={showAdvanced ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtres avancés
            </Button>
            
            <Select onValueChange={(v) => addFilter('Statut', v, v)}>
              <SelectTrigger className="w-[140px] h-8">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="ON_LOAN">En prêt</SelectItem>
                <SelectItem value="IN_TRANSFER">En transfert</SelectItem>
                <SelectItem value="EXPIRED">Expirée</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={(v) => addFilter('Type', v, v)}>
              <SelectTrigger className="w-[160px] h-8">
                <SelectValue placeholder="Type d'archive" />
              </SelectTrigger>
              <SelectContent>
                {archiveTypes.map(type => (
                  <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={(v) => addFilter('Agence', v, v)}>
              <SelectTrigger className="w-[180px] h-8">
                <SelectValue placeholder="Agence" />
              </SelectTrigger>
              <SelectContent>
                {mockAgencies.map(agency => (
                  <SelectItem key={agency.id} value={agency.name}>{agency.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Advanced filters panel */}
      {showAdvanced && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Filtres avancés</CardTitle>
              <CardDescription>Affinez votre recherche avec des critères supplémentaires</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <User className="h-3 w-3" />
                    Client
                  </label>
                  <Input placeholder="Nom client..." />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Hash className="h-3 w-3" />
                    N° Compte
                  </label>
                  <Input placeholder="Numéro de compte..." />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    Date document
                  </label>
                  <div className="flex gap-2">
                    <Input type="date" className="text-xs" />
                    <Input type="date" className="text-xs" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="h-3 w-3" />
                    Emplacement
                  </label>
                  <Input placeholder="Code boîte, rayon..." />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Saved searches */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Recherches sauvegardées
                </CardTitle>
                <Button variant="ghost" size="sm" className="h-7">
                  <Save className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[200px]">
                <div className="space-y-1 p-3 pt-0">
                  {savedSearches.map((search) => (
                    <button
                      key={search.id}
                      className="w-full text-left p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{search.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {search.count}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Utilisé le {formatDate(search.lastUsed)}
                      </p>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Recent searches */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <History className="h-4 w-4" />
                Recherches récentes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[200px]">
                <div className="space-y-1 p-3 pt-0">
                  {recentSearches.map((search) => (
                    <button
                      key={search.id}
                      onClick={() => setSearchQuery(search.query)}
                      className="w-full text-left p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Search className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm">{search.query}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 ml-5">
                        {new Date(search.timestamp).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">
                    Résultats
                    {filteredArchives.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {filteredArchives.length} trouvé{filteredArchives.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exporter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ArchiveTable data={filteredArchives} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
