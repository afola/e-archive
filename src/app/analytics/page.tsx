'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  RefreshCw,
  Download,
  Calendar,
  FileSpreadsheet,
  FileText,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MetricsGrid } from '@/components/analytics/metrics-grid'
import { VolumeChart } from '@/components/analytics/volume-chart'
import { TypeDistribution } from '@/components/analytics/type-distribution'
import { PredictionsPanel } from '@/components/analytics/predictions-panel'
import { ActivityHeatmap } from '@/components/analytics/activity-heatmap'
import { fetchWithCurrentAuth } from '@/lib/auth/auth-store'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface AnalyticsData {
  metrics: {
    totalArchives: number
    archivesThisMonth: number
    pendingWorkflows: number
    storageUsed: number
    documentsExpiring: number
    activeUsers: number
    trends: {
      totalArchives: number
      archivesThisMonth: number
      pendingWorkflows: number
      storageUsed: number
      documentsExpiring: number
      activeUsers: number
    }
    sparklines: {
      totalArchives: number[]
      archivesThisMonth: number[]
      pendingWorkflows: number[]
      storageUsed: number[]
      documentsExpiring: number[]
      activeUsers: number[]
    }
  }
  volumeData: Array<{ period: string; actual: number }>
  predictions: Array<{ period: string; predicted: number; lower: number; upper: number }>
  typeDistribution: Array<{
    name: string
    code: string
    value: number
    percentage: number
    color: string
  }>
  volumePredictions: Array<{
    month: string
    predictedVolume: number
    confidenceInterval: { lower: number; upper: number }
    trend: 'up' | 'down' | 'stable'
    trendPercent: number
  }>
  storageRecommendations: Array<{
    type: 'warning' | 'info' | 'success'
    title: string
    description: string
    action?: string
  }>
  workloadPredictions: Array<{
    period: string
    expectedWorkload: number
    category: 'low' | 'medium' | 'high'
    staffNeeded: number
  }>
  staffingSuggestions: Array<{
    role: string
    currentCount: number
    suggestedCount: number
    reason: string
  }>
  activityData: Array<{
    date: string
    count: number
    details?: {
      created: number
      viewed: number
      downloaded: number
      moved: number
    }
  }>
  archiveTypes: Array<{
    code: string
    name: string
    color: string
  }>
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({ from: undefined, to: undefined })
  const [selectedPeriod, setSelectedPeriod] = useState<string>('year')

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (dateRange.from) {
        params.set('startDate', dateRange.from.toISOString())
      }
      if (dateRange.to) {
        params.set('endDate', dateRange.to.toISOString())
      }

      const response = await fetchWithCurrentAuth(`/analytics?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch analytics')
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast.error('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (format: 'pdf' | 'excel') => {
    toast.success(`Export ${format.toUpperCase()} en cours...`)
    // In a real app, this would generate and download the file
    setTimeout(() => {
      toast.success(`Export ${format.toUpperCase()} terminé`)
    }, 1500)
  }

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
    const now = new Date()
    let from: Date | undefined

    switch (period) {
      case 'week':
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        from = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'quarter':
        from = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
        break
      case 'year':
        from = new Date(now.getFullYear(), 0, 1)
        break
      default:
        from = undefined
    }

    setDateRange({ from, to: now })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Chargement des analytics...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Aucune donnée disponible</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics & Prédictif</h1>
          <p className="text-muted-foreground">
            Analyse avancée et prévisions pour la gestion des archives
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Period selector */}
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="quarter">Ce trimestre</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
              <SelectItem value="all">Tout</SelectItem>
            </SelectContent>
          </Select>

          {/* Date range picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Calendar className="h-4 w-4 mr-2" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, 'dd MMM', { locale: fr })} -{' '}
                      {format(dateRange.to, 'dd MMM yyyy', { locale: fr })}
                    </>
                  ) : (
                    format(dateRange.from, 'dd MMM yyyy', { locale: fr })
                  )
                ) : (
                  'Période personnalisée'
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={{
                  from: dateRange.from,
                  to: dateRange.to,
                }}
                onSelect={(range) => {
                  setDateRange({
                    from: range?.from,
                    to: range?.to,
                  })
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          <Button variant="outline" size="sm" className="h-9" onClick={fetchAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>

          {/* Export dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                <FileText className="h-4 w-4 mr-2" />
                Export PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('excel')}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Metrics Grid */}
      <MetricsGrid metrics={data.metrics} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Volume Chart - Takes 2 columns */}
        <VolumeChart
          data={data.volumeData}
          predictions={data.predictions}
          archiveTypes={data.archiveTypes}
          className="lg:col-span-2"
        />

        {/* Type Distribution */}
        <TypeDistribution data={data.typeDistribution} />
      </div>

      {/* Activity Heatmap */}
      <ActivityHeatmap data={data.activityData} />

      {/* Predictions Panel */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-semibold">Prévisions & Recommandations</h2>
          <Badge variant="secondary" className="text-xs">
            IA
          </Badge>
        </div>
        <PredictionsPanel
          volumePredictions={data.volumePredictions}
          storageRecommendations={data.storageRecommendations}
          workloadPredictions={data.workloadPredictions}
          staffingSuggestions={data.staffingSuggestions}
        />
      </div>

      {/* Footer note */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground text-center">
            Les prédictions sont basées sur l&apos;analyse des données historiques et des tendances saisonnières.
            Elles sont mises à jour quotidiennement et ont une précision moyenne de 85%.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
