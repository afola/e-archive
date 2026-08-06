'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Search,
  Calendar,
  LayoutGrid,
  List,
  X,
  Building2,
  FileText,
  User,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { TimelineView, TimelineViewVertical } from '@/components/timeline/timeline-view'
import { TimelineEventCard, TimelineEventType } from '@/components/timeline/timeline-event'
import { 
  TimelineFiltersPanel, 
  TimelineFiltersBar, 
  TimelineFilters 
} from '@/components/timeline/timeline-filters'
import { ProofPanel } from '@/components/blockchain/proof-panel'
import { fetchWithCurrentAuth } from '@/lib/auth/auth-store'
import { mockArchives, mockUsers } from '@/data/mock-data'
import { cn } from '@/lib/utils'

export default function TimelinePage() {
  const { toast } = useToast()
  
  // State
  const [events, setEvents] = useState<TimelineEventType[]>([])
  const [filteredEvents, setFilteredEvents] = useState<TimelineEventType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<'all' | 'client' | 'account' | 'archive'>('all')
  const [searchResults, setSearchResults] = useState<{ type: string; id: string; label: string }[]>([])
  const [selectedEntity, setSelectedEntity] = useState<{ type: string; id: string; label: string } | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<TimelineEventType | null>(null)
  const [viewMode, setViewMode] = useState<'horizontal' | 'vertical'>('horizontal')
  const [showFilters, setShowFilters] = useState(true)
  const [filters, setFilters] = useState<TimelineFilters>({
    eventTypes: [],
  })
  
  // Blockchain state
  const [blockchainProof, setBlockchainProof] = useState<any>(null)
  const [isRegistering, setIsRegistering] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  // Fetch timeline events
  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedEntity) {
        params.set('entityType', selectedEntity.type)
        params.set('entityId', selectedEntity.id)
      }
      if (filters.eventTypes.length > 0) {
        params.set('eventTypes', filters.eventTypes.join(','))
      }
      if (filters.startDate) {
        params.set('startDate', filters.startDate)
      }
      if (filters.endDate) {
        params.set('endDate', filters.endDate)
      }
      if (filters.actor) {
        params.set('actor', filters.actor)
      }

      const response = await fetchWithCurrentAuth(`/timeline?${params.toString()}`)
      const data = await response.json()
      
      if (data.success) {
        setEvents(data.data.events)
        setFilteredEvents(data.data.events)
      }
    } catch (error) {
      console.error('Failed to fetch events:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les événements',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [selectedEntity, filters, toast])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  // Search handler
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    const results: { type: string; id: string; label: string }[] = []
    const lowerQuery = query.toLowerCase()

    // Search in archives
    if (searchType === 'all' || searchType === 'archive') {
      mockArchives
        .filter(a => 
          a.reference.toLowerCase().includes(lowerQuery) ||
          a.title.toLowerCase().includes(lowerQuery)
        )
        .slice(0, 5)
        .forEach(a => {
          results.push({
            type: 'archive',
            id: a.id,
            label: `${a.reference} - ${a.title.substring(0, 50)}...`,
          })
        })
    }

    // Search clients
    if (searchType === 'all' || searchType === 'client') {
      const uniqueClients = new Set<string>()
      mockArchives
        .filter(a => a.clientName?.toLowerCase().includes(lowerQuery))
        .forEach(a => {
          if (!uniqueClients.has(a.clientName)) {
            uniqueClients.add(a.clientName)
            results.push({
              type: 'client',
              id: a.clientName,
              label: `Client: ${a.clientName}`,
            })
          }
        })
    }

    // Search accounts
    if (searchType === 'all' || searchType === 'account') {
      mockArchives
        .filter(a => a.accountNumber?.toLowerCase().includes(lowerQuery))
        .slice(0, 3)
        .forEach(a => {
          results.push({
            type: 'account',
            id: a.accountNumber,
            label: `Compte: ${a.accountNumber}`,
          })
        })
    }

    setSearchResults(results.slice(0, 10))
  }

  // Select entity
  const handleSelectEntity = (entity: { type: string; id: string; label: string }) => {
    setSelectedEntity(entity)
    setSearchQuery('')
    setSearchResults([])
  }

  // Clear selection
  const handleClearSelection = () => {
    setSelectedEntity(null)
    setEvents([])
  }

  // Reset filters
  const handleResetFilters = () => {
    setFilters({ eventTypes: [] })
  }

  // Blockchain handlers
  const handleRegisterBlockchain = async () => {
    if (!selectedEntity || selectedEntity.type !== 'archive') return
    
    setIsRegistering(true)
    try {
      const response = await fetchWithCurrentAuth('/blockchain/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: selectedEntity.id }),
      })
      const data = await response.json()
      
      if (data.success) {
        setBlockchainProof(data.data.proof)
        toast({
          title: 'Succès',
          description: 'Document enregistré sur la blockchain',
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Échec de l\'enregistrement',
        variant: 'destructive',
      })
    } finally {
      setIsRegistering(false)
    }
  }

  const handleVerifyBlockchain = async () => {
    if (!selectedEntity || selectedEntity.type !== 'archive') return
    
    setIsVerifying(true)
    try {
      const response = await fetchWithCurrentAuth('/blockchain/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: selectedEntity.id }),
      })
      const data = await response.json()
      
      if (data.success) {
        return data.data
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Échec de la vérification',
        variant: 'destructive',
      })
      return null
    } finally {
      setIsVerifying(false)
    }
  }

  // Get document info for blockchain panel
  const selectedArchive = selectedEntity?.type === 'archive' 
    ? mockArchives.find(a => a.id === selectedEntity.id)
    : null

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              Timeline & Blockchain
            </h1>
            <p className="text-muted-foreground">
              Historique des événements et certification blockchain
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'horizontal' | 'vertical')}>
              <TabsList>
                <TabsTrigger value="horizontal" className="gap-1">
                  <LayoutGrid className="h-4 w-4" />
                  <span className="hidden sm:inline">Horizontal</span>
                </TabsTrigger>
                <TabsTrigger value="vertical" className="gap-1">
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">Vertical</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Search */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par client, compte, référence..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
              
              {/* Search results dropdown */}
              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
                  >
                    {searchResults.map((result, index) => (
                      <button
                        key={`${result.type}-${result.id}`}
                        className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2"
                        onClick={() => handleSelectEntity(result)}
                      >
                        {result.type === 'archive' ? (
                          <FileText className="h-4 w-4 text-blue-600" />
                        ) : result.type === 'client' ? (
                          <User className="h-4 w-4 text-green-600" />
                        ) : (
                          <Building2 className="h-4 w-4 text-purple-600" />
                        )}
                        <span className="text-sm">{result.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Selected entity badge */}
          {selectedEntity && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1 py-1.5">
                {selectedEntity.type === 'archive' ? (
                  <FileText className="h-3 w-3" />
                ) : selectedEntity.type === 'client' ? (
                  <User className="h-3 w-3" />
                ) : (
                  <Building2 className="h-3 w-3" />
                )}
                {selectedEntity.label}
                <button
                  onClick={handleClearSelection}
                  className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </div>
          )}

          {/* Quick filters bar */}
          <TimelineFiltersBar
            filters={filters}
            onFiltersChange={setFilters}
            onReset={handleResetFilters}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Timeline */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : events.length === 0 ? (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucun événement</h3>
                <p className="text-muted-foreground">
                  {!selectedEntity 
                    ? 'Recherchez un client, compte ou document pour voir son historique'
                    : 'Aucun événement trouvé pour cette entité'}
                </p>
              </CardContent>
            </Card>
          ) : viewMode === 'horizontal' ? (
            <TimelineView
              events={filteredEvents}
              onEventClick={setSelectedEvent}
              selectedEventId={selectedEvent?.id}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Événements
                  <Badge variant="secondary">{filteredEvents.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <TimelineViewVertical
                  events={filteredEvents}
                  onEventClick={setSelectedEvent}
                  selectedEventId={selectedEvent?.id}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Filters & Blockchain */}
        {(showFilters || selectedEntity?.type === 'archive') && (
          <div className="w-80 border-l overflow-auto p-4 space-y-4">
            {/* Filters */}
            {showFilters && (
              <TimelineFiltersPanel
                filters={filters}
                onFiltersChange={setFilters}
                onReset={handleResetFilters}
              />
            )}

            {/* Blockchain panel */}
            {selectedEntity?.type === 'archive' && selectedArchive && (
              <ProofPanel
                documentId={selectedEntity.id}
                documentReference={selectedArchive.reference}
                documentTitle={selectedArchive.title}
                proof={blockchainProof}
                onRegister={handleRegisterBlockchain}
                onVerify={handleVerifyBlockchain}
                isRegistering={isRegistering}
                isVerifying={isVerifying}
              />
            )}
          </div>
        )}
      </div>

      {/* Event detail dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Détails de l&apos;événement</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <TimelineEventCard 
              event={selectedEvent} 
              variant="card" 
              showLink={true}
              onClick={() => setSelectedEvent(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
