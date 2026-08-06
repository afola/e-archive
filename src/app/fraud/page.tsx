'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, 
  AlertTriangle, 
  Search, 
  Filter, 
  RefreshCw, 
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  FileSearch,
  BarChart3,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { RiskGauge } from '@/components/fraud/risk-gauge'
import { AnomalyCard } from '@/components/fraud/anomaly-card'
import { InvestigationDialog } from '@/components/fraud/investigation-dialog'
import { fetchWithCurrentAuth } from '@/lib/auth/auth-store'
import { cn } from '@/lib/utils'
import type { Anomaly, FraudStatistics } from '@/types/fraud'

interface FraudData {
  content: Anomaly[]
  totalElements: number
  totalPages: number
  statistics: FraudStatistics
}

export default function FraudPage() {
  const [data, setData] = useState<FraudData | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [riskFilter, setRiskFilter] = useState<string>('all')
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [page, setPage] = useState(0)
  
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (typeFilter !== 'all') params.append('type', typeFilter)
      if (riskFilter !== 'all') params.append('riskLevel', riskFilter)
      if (search) params.append('search', search)
      params.append('page', page.toString())
      params.append('size', '10')
      
      const response = await fetchWithCurrentAuth(`/fraud?${params.toString()}`)
      const result = await response.json()
      setData(result)
    } catch {
      toast.error('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, typeFilter, riskFilter, search, page])
  
  useEffect(() => {
    fetchData()
  }, [fetchData])
  
  const handleInvestigate = (anomaly: Anomaly) => {
    setSelectedAnomaly(anomaly)
    setDialogOpen(true)
  }
  
  const handleViewDetails = (anomaly: Anomaly) => {
    setSelectedAnomaly(anomaly)
    setDialogOpen(true)
  }
  
  const handleSubmitInvestigation = async (
    anomalyId: string, 
    status: Anomaly['status'], 
    notes: string
  ) => {
    try {
      const response = await fetchWithCurrentAuth('/fraud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anomalyId,
          status,
          notes,
          investigatedBy: 'Utilisateur actuel',
        }),
      })
      
      if (response.ok) {
        toast.success('Investigation enregistrée avec succès')
        fetchData()
      } else {
        toast.error('Erreur lors de l\'enregistrement')
      }
    } catch {
      toast.error('Erreur lors de l\'enregistrement')
    }
  }
  
  const resetFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setTypeFilter('all')
    setRiskFilter('all')
    setPage(0)
  }
  
  const stats = data?.statistics
  
  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-7 w-7 text-red-500" />
              Détection de Fraude
            </h1>
            <p className="text-muted-foreground mt-1">
              Surveillance et analyse des anomalies documentaires
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchData} disabled={loading}>
              <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
              Actualiser
            </Button>
          </div>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Nouvelles anomalies</p>
                    <p className="text-2xl font-bold">{stats?.newAnomalies || 0}</p>
                  </div>
                  <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-950/30">
                    <AlertCircle className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-l-4 border-l-amber-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">En investigation</p>
                    <p className="text-2xl font-bold">{stats?.investigatingAnomalies || 0}</p>
                  </div>
                  <div className="p-3 rounded-full bg-amber-50 dark:bg-amber-950/30">
                    <Clock className="h-5 w-5 text-amber-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-l-4 border-l-red-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Fraudes confirmées</p>
                    <p className="text-2xl font-bold">{stats?.confirmedFrauds || 0}</p>
                  </div>
                  <div className="p-3 rounded-full bg-red-50 dark:bg-red-950/30">
                    <XCircle className="h-5 w-5 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-l-4 border-l-emerald-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Faux positifs</p>
                    <p className="text-2xl font-bold">{stats?.falsePositives || 0}</p>
                  </div>
                  <div className="p-3 rounded-full bg-emerald-50 dark:bg-emerald-950/30">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        {/* Risk Gauge and Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Risk Gauge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2"
          >
            <RiskGauge 
              score={stats?.averageRiskScore || 0} 
              title="Score de Risque Global"
              size="lg"
            />
          </motion.div>
          
          {/* Risk Distribution */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="h-5 w-5 text-muted-foreground" />
                  Distribution des risques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats?.riskDistribution && (
                  <>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-emerald-500" />
                          <span className="text-sm">Faible</span>
                        </div>
                        <Badge variant="outline">{stats.riskDistribution.low}</Badge>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(stats.riskDistribution.low / stats.totalAnomalies) * 100}%` }}
                          transition={{ duration: 0.5 }}
                          className="h-full bg-emerald-500"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-amber-500" />
                          <span className="text-sm">Modéré</span>
                        </div>
                        <Badge variant="outline">{stats.riskDistribution.medium}</Badge>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(stats.riskDistribution.medium / stats.totalAnomalies) * 100}%` }}
                          transition={{ duration: 0.5 }}
                          className="h-full bg-amber-500"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-orange-500" />
                          <span className="text-sm">Élevé</span>
                        </div>
                        <Badge variant="outline">{stats.riskDistribution.high}</Badge>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(stats.riskDistribution.high / stats.totalAnomalies) * 100}%` }}
                          transition={{ duration: 0.5 }}
                          className="h-full bg-orange-500"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          <span className="text-sm">Critique</span>
                        </div>
                        <Badge variant="destructive">{stats.riskDistribution.critical}</Badge>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(stats.riskDistribution.critical / stats.totalAnomalies) * 100}%` }}
                          transition={{ duration: 0.5 }}
                          className="h-full bg-red-500"
                        />
                      </div>
                    </div>
                  </>
                )}
                
                <Separator />
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total anomalies</span>
                  <span className="font-bold">{stats?.totalAnomalies || 0}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par référence, titre..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setPage(0)
                    }}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0) }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="NEW">Nouveau</SelectItem>
                  <SelectItem value="INVESTIGATING">En cours</SelectItem>
                  <SelectItem value="CONFIRMED_FRAUD">Fraude confirmée</SelectItem>
                  <SelectItem value="FALSE_POSITIVE">Faux positif</SelectItem>
                  <SelectItem value="NEEDS_REVIEW">À réviser</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(0) }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="DUPLICATE">Doublon</SelectItem>
                  <SelectItem value="MODIFIED">Modifié</SelectItem>
                  <SelectItem value="SUSPICIOUS">Suspect</SelectItem>
                  <SelectItem value="MISSING">Manquant</SelectItem>
                  <SelectItem value="INCONSISTENT">Incohérent</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={riskFilter} onValueChange={(v) => { setRiskFilter(v); setPage(0) }}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Risque" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous niveaux</SelectItem>
                  <SelectItem value="LOW">Faible</SelectItem>
                  <SelectItem value="MEDIUM">Modéré</SelectItem>
                  <SelectItem value="HIGH">Élevé</SelectItem>
                  <SelectItem value="CRITICAL">Critique</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="ghost" onClick={resetFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Anomaly List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : data?.content.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileSearch className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Aucune anomalie trouvée</p>
                <p className="text-muted-foreground">Essayez de modifier vos filtres</p>
              </CardContent>
            </Card>
          ) : (
            data?.content.map((anomaly, index) => (
              <motion.div
                key={anomaly.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <AnomalyCard
                  anomaly={anomaly}
                  onInvestigate={handleInvestigate}
                  onClick={handleViewDetails}
                />
              </motion.div>
            ))
          )}
        </div>
        
        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <Button
              variant="outline"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              Précédent
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page + 1} sur {data.totalPages}
            </span>
            <Button
              variant="outline"
              disabled={page >= data.totalPages - 1}
              onClick={() => setPage(page + 1)}
            >
              Suivant
            </Button>
          </div>
        )}
      </div>
      
      {/* Sidebar with Trend */}
      <aside className="hidden lg:block w-80 border-l bg-muted/30 p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              Tendance sur 30 jours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats?.trendData.slice(-14).map((item, index) => {
                const maxCount = Math.max(...(stats?.trendData.map(d => d.count) || [1]))
                const height = (item.count / maxCount) * 100
                
                return (
                  <div key={item.date} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-20 shrink-0">
                      {new Date(item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                    </span>
                    <div className="flex-1 h-4 bg-muted rounded overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${height}%` }}
                        transition={{ delay: index * 0.02 }}
                        className={cn(
                          'h-full rounded',
                          item.count > 3 ? 'bg-red-500' : item.count > 1 ? 'bg-amber-500' : 'bg-emerald-500'
                        )}
                      />
                    </div>
                    <span className="text-xs font-medium w-4 text-right">{item.count}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
        
        {/* Quick Stats */}
        <Card className="mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Statistiques rapides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Score moyen</span>
              <span className="font-bold">{stats?.averageRiskScore || 0}/100</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total anomalies</span>
              <span className="font-bold">{stats?.totalAnomalies || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Taux de résolution</span>
              <span className="font-bold text-emerald-600">
                {stats?.totalAnomalies 
                  ? Math.round(((stats.confirmedFrauds + stats.falsePositives) / stats.totalAnomalies) * 100)
                  : 0}%
              </span>
            </div>
          </CardContent>
        </Card>
      </aside>
      
      {/* Investigation Dialog */}
      <InvestigationDialog
        anomaly={selectedAnomaly}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmitInvestigation}
      />
    </div>
  )
}
