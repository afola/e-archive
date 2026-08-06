'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  Trash2,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  Shield,
  Download,
  RefreshCw,
  ChevronRight,
  Archive,
  CalendarClock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { RetentionCalendar, RetentionCalendarStats } from '@/components/lifecycle/retention-calendar'
import { ExpiringList } from '@/components/lifecycle/expiring-list'
import { DestructionWorkflow } from '@/components/lifecycle/destruction-workflow'
import { DestructionCertificate, CertificateList } from '@/components/lifecycle/destruction-certificate'
import { useToast } from '@/hooks/use-toast'
import { fetchWithCurrentAuth } from '@/lib/auth/auth-store'
import { formatDate, cn } from '@/lib/utils'

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

interface DestructionCertificateData {
  id: string
  requestId: string
  archiveIds: string[]
  archives: ArchiveItem[]
  destructionDate: string
  method: 'SHRED' | 'INCINERATE' | 'DIGITAL_DELETE' | 'PULP'
  witness: string
  witnessName: string
  operator: string
  operatorName: string
  approvedBy: string
  approvedByName: string
  notes?: string
  createdAt: string
}

interface LifecycleData {
  archivesWithDaysLeft: ArchiveItem[]
  expiringThisMonth: ArchiveItem[]
  expiringIn3Months: ArchiveItem[]
  expiringIn6Months: ArchiveItem[]
  expiredArchives: ArchiveItem[]
  readyForDestruction: ArchiveItem[]
  pendingDestruction: ArchiveItem[]
  retentionRules: {
    id: string
    type: string
    typeName: string
    retentionYears: number
    category: string
    color: string
    archiveCount: number
    expiringCount: number
  }[]
  stats: {
    totalArchives: number
    expiringThisMonth: number
    expiringIn3Months: number
    expiringIn6Months: number
    expired: number
    readyForDestruction: number
    pendingDestruction: number
    destroyedThisMonth: number
    transferredThisMonth: number
    extendedThisMonth?: number
  }
}

export default function LifecyclePage() {
  const [data, setData] = useState<LifecycleData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [destructionRequests, setDestructionRequests] = useState<DestructionRequest[]>([])
  const [certificates, setCertificates] = useState<DestructionCertificateData[]>([])
  const [selectedCertificate, setSelectedCertificate] = useState<DestructionCertificateData | null>(null)
  const [activeTab, setActiveTab] = useState('calendar')
  const { toast } = useToast()

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [lifecycleRes, destructionRes] = await Promise.all([
        fetchWithCurrentAuth('/lifecycle'),
        fetchWithCurrentAuth('/lifecycle/destruction')
      ])
      
      const lifecycleData = await lifecycleRes.json()
      const destructionData = await destructionRes.json()
      
      setData(lifecycleData)
      setDestructionRequests([
        ...destructionData.pendingRequests,
        ...destructionData.approvedRequests
      ])
      setCertificates(destructionData.certificates || [])
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleCreateDestructionRequest = async (archiveIds: string[], reason: string) => {
    const response = await fetchWithCurrentAuth('/lifecycle/destruction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create',
        archiveIds,
        reason
      })
    })
    
    if (!response.ok) throw new Error('Failed to create request')
    
    const result = await response.json()
    setDestructionRequests(prev => [...prev, result.request])
    // Refresh data to update stats
    fetchData()
  }

  const handleExtendRetention = async (archiveIds: string[], newDate: string, reason: string) => {
    const response = await fetchWithCurrentAuth('/lifecycle', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        archiveIds,
        newDate,
        reason
      })
    })
    
    if (!response.ok) throw new Error('Failed to extend retention')
    
    // Refresh data to update stats
    fetchData()
  }

  const handleApproveRequest = async (requestId: string) => {
    const response = await fetchWithCurrentAuth('/lifecycle/destruction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'approve',
        requestId
      })
    })
    
    if (!response.ok) throw new Error('Failed to approve request')
    
    const result = await response.json()
    setDestructionRequests(prev =>
      prev.map(r => r.id === requestId ? result.request : r)
    )
  }

  const handleRejectRequest = async (requestId: string) => {
    const response = await fetchWithCurrentAuth('/lifecycle/destruction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'reject',
        requestId
      })
    })
    
    if (!response.ok) throw new Error('Failed to reject request')
    
    const result = await response.json()
    setDestructionRequests(prev => prev.filter(r => r.id !== requestId))
  }

  const handleExecuteDestruction = async (requestId: string, method: string) => {
    const response = await fetchWithCurrentAuth('/lifecycle/destruction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'execute',
        requestId,
        method
      })
    })
    
    if (!response.ok) throw new Error('Failed to execute destruction')
    
    const result = await response.json()
    setDestructionRequests(prev => prev.filter(r => r.id !== requestId))
    setCertificates(prev => [result.certificate, ...prev])
    setSelectedCertificate(result.certificate)
    setActiveTab('certificates')
  }

  const handleViewArchive = (archive: ArchiveItem) => {
    toast({
      title: 'Archive sélectionnée',
      description: `${archive.reference} - ${archive.title}`
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Chargement des données...</p>
        </div>
      </div>
    )
  }

  if (!data) return null

  const complianceRate = Math.round(
    ((data.stats.totalArchives - data.stats.expired) / data.stats.totalArchives) * 100
  )

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cycle de Vie des Archives</h1>
          <p className="text-muted-foreground">
            Gestion des durées de conservation, destructions et transferts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter rapport
          </Button>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Taux de conformité</span>
              <Shield className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold">{complianceRate}%</div>
            <Progress value={complianceRate} className="h-2 mt-2" />
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Prêtes pour destruction</p>
                <p className="text-2xl font-bold">{data.stats.readyForDestruction}</p>
              </div>
              <Trash2 className="h-8 w-8 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En attente d'approbation</p>
                <p className="text-2xl font-bold">{data.stats.pendingDestruction}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Détruites ce mois</span>
                <span className="font-bold">{data.stats.destroyedThisMonth}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Prolongées ce mois</span>
                <span className="font-bold">{data.stats.extendedThisMonth || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar stats */}
      <RetentionCalendarStats archives={data.archivesWithDaysLeft} />

      {/* Main content tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="calendar" className="gap-2">
            <Calendar className="h-4 w-4" />
            Calendrier
          </TabsTrigger>
          <TabsTrigger value="expiring" className="gap-2">
            <CalendarClock className="h-4 w-4" />
            À échéance
            {data.stats.expiringThisMonth + data.stats.expired > 0 && (
              <Badge variant="destructive" className="ml-1">
                {data.stats.expiringThisMonth + data.stats.expired}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="destruction" className="gap-2">
            <Trash2 className="h-4 w-4" />
            Destruction
            {data.stats.readyForDestruction > 0 && (
              <Badge variant="destructive" className="ml-1">
                {data.stats.readyForDestruction}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="certificates" className="gap-2">
            <FileText className="h-4 w-4" />
            Certificats
          </TabsTrigger>
          <TabsTrigger value="rules" className="gap-2">
            <Shield className="h-4 w-4" />
            Règles
          </TabsTrigger>
        </TabsList>

        {/* Calendar tab */}
        <TabsContent value="calendar" className="mt-6">
          <RetentionCalendar
            archives={data.archivesWithDaysLeft}
            onArchiveClick={(archive) => {
              console.log('Archive clicked:', archive)
            }}
          />
        </TabsContent>

        {/* Expiring archives tab */}
        <TabsContent value="expiring" className="mt-6">
          <ExpiringList
            archives={data.archivesWithDaysLeft}
            onExtend={handleExtendRetention}
            onDestroy={handleCreateDestructionRequest}
            onView={handleViewArchive}
          />
        </TabsContent>

        {/* Destruction tab */}
        <TabsContent value="destruction" className="mt-6">
          <DestructionWorkflow
            readyForDestruction={data.readyForDestruction}
            pendingRequests={destructionRequests}
            onCreateRequest={handleCreateDestructionRequest}
            onApproveRequest={handleApproveRequest}
            onRejectRequest={handleRejectRequest}
            onExecuteDestruction={handleExecuteDestruction}
          />
        </TabsContent>

        {/* Certificates tab */}
        <TabsContent value="certificates" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {selectedCertificate ? (
                <DestructionCertificate
                  certificate={selectedCertificate}
                  onDownload={() => {
                    toast({
                      title: 'Succès',
                      description: 'Certificat téléchargé'
                    })
                  }}
                />
              ) : (
                <Card className="border-dashed h-full flex items-center justify-center">
                  <CardContent className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">
                      Sélectionnez un certificat pour voir les détails
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Certificats récents</CardTitle>
                  <CardDescription>
                    Liste des certificats de destruction
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CertificateList
                    certificates={certificates}
                    onSelect={setSelectedCertificate}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Rules tab */}
        <TabsContent value="rules" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Règles de Conservation par Type</CardTitle>
              <CardDescription>
                Configuration des durées de conservation pour chaque type d'archive
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr className="border-b">
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type d'archive</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Catégorie</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Durée</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Total</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">À échéance</th>
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.retentionRules.map((rule) => (
                      <tr key={rule.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: rule.color }}
                            />
                            <span className="font-medium">{rule.typeName}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">{rule.category}</Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant="secondary">{rule.retentionYears} ans</Badge>
                        </td>
                        <td className="p-4 font-mono">{rule.archiveCount}</td>
                        <td className="p-4">
                          {rule.expiringCount > 0 ? (
                            <Badge className="bg-amber-100 text-amber-700">
                              {rule.expiringCount} à traiter
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-green-600">
                              À jour
                            </Badge>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <Button variant="ghost" size="sm">
                            Voir <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
