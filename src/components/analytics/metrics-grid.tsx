'use client'

import { motion } from 'framer-motion'
import {
  Archive,
  FileCheck,
  Clock,
  HardDrive,
  AlertTriangle,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface MetricData {
  title: string
  value: number | string
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
    label?: string
  }
  sparklineData?: number[]
  color: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'teal'
}

const colorStyles = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    icon: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
    sparkline: '#3b82f6',
  },
  green: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    icon: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800',
    sparkline: '#10b981',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    icon: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
    sparkline: '#f59e0b',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    icon: 'text-red-600 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800',
    sparkline: '#ef4444',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    icon: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
    sparkline: '#8b5cf6',
  },
  teal: {
    bg: 'bg-teal-50 dark:bg-teal-950/30',
    icon: 'text-teal-600 dark:text-teal-400',
    border: 'border-teal-200 dark:border-teal-800',
    sparkline: '#14b8a6',
  },
}

interface MetricsGridProps {
  metrics: {
    totalArchives: number
    archivesThisMonth: number
    pendingWorkflows: number
    storageUsed: number
    documentsExpiring: number
    activeUsers: number
    trends?: {
      totalArchives: number
      archivesThisMonth: number
      pendingWorkflows: number
      storageUsed: number
      documentsExpiring: number
      activeUsers: number
    }
    sparklines?: {
      totalArchives: number[]
      archivesThisMonth: number[]
      pendingWorkflows: number[]
      storageUsed: number[]
      documentsExpiring: number[]
      activeUsers: number[]
    }
  }
}

function formatStorage(bytes: number): string {
  if (bytes === 0) return '0 GB'
  const gb = bytes / (1024 * 1024 * 1024)
  if (gb >= 1000) {
    return `${(gb / 1000).toFixed(1)} TB`
  }
  return `${gb.toFixed(1)} GB`
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length === 0) return null

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const width = 80
  const height = 24

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width
      const y = height - ((value - min) / range) * (height - 4) - 2
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg width={width} height={height} className="opacity-60">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  )
}

function MetricCard({ metric, index }: { metric: MetricData; index: number }) {
  const styles = colorStyles[metric.color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className={cn('relative overflow-hidden border shadow-sm hover:shadow-md transition-shadow', styles.border)}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
              <p className="text-2xl font-bold tracking-tight">{metric.value}</p>
              {metric.trend && (
                <div className={cn(
                  'flex items-center text-xs font-medium gap-1',
                  metric.trend.isPositive ? 'text-emerald-600' : 'text-red-600'
                )}>
                  {metric.trend.isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : metric.trend.value === 0 ? (
                    <Minus className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span>{Math.abs(metric.trend.value)}%</span>
                  <span className="text-muted-foreground">{metric.trend.label || 'vs. mois préc.'}</span>
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className={cn('p-2.5 rounded-lg', styles.bg)}>
                {metric.icon}
              </div>
              {metric.sparklineData && (
                <MiniSparkline data={metric.sparklineData} color={styles.sparkline} />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  const metricsData: MetricData[] = [
    {
      title: 'Total Archives',
      value: metrics.totalArchives.toLocaleString('fr-FR'),
      icon: <Archive className="h-5 w-5" />,
      color: 'blue',
      trend: metrics.trends?.totalArchives ? {
        value: metrics.trends.totalArchives,
        isPositive: metrics.trends.totalArchives > 0,
      } : undefined,
      sparklineData: metrics.sparklines?.totalArchives,
    },
    {
      title: 'Archives ce mois',
      value: metrics.archivesThisMonth.toLocaleString('fr-FR'),
      icon: <FileCheck className="h-5 w-5" />,
      color: 'green',
      trend: metrics.trends?.archivesThisMonth ? {
        value: metrics.trends.archivesThisMonth,
        isPositive: metrics.trends.archivesThisMonth > 0,
      } : undefined,
      sparklineData: metrics.sparklines?.archivesThisMonth,
    },
    {
      title: 'Workflows en attente',
      value: metrics.pendingWorkflows.toLocaleString('fr-FR'),
      icon: <Clock className="h-5 w-5" />,
      color: 'amber',
      trend: metrics.trends?.pendingWorkflows ? {
        value: metrics.trends.pendingWorkflows,
        isPositive: metrics.trends.pendingWorkflows < 0,
      } : undefined,
      sparklineData: metrics.sparklines?.pendingWorkflows,
    },
    {
      title: 'Stockage utilisé',
      value: formatStorage(metrics.storageUsed),
      icon: <HardDrive className="h-5 w-5" />,
      color: 'purple',
      trend: metrics.trends?.storageUsed ? {
        value: metrics.trends.storageUsed,
        isPositive: false,
        label: 'croissance',
      } : undefined,
      sparklineData: metrics.sparklines?.storageUsed,
    },
    {
      title: 'Documents expirant',
      value: metrics.documentsExpiring.toLocaleString('fr-FR'),
      icon: <AlertTriangle className="h-5 w-5" />,
      color: 'red',
      trend: metrics.trends?.documentsExpiring ? {
        value: metrics.trends.documentsExpiring,
        isPositive: metrics.trends.documentsExpiring < 0,
      } : undefined,
      sparklineData: metrics.sparklines?.documentsExpiring,
    },
    {
      title: 'Utilisateurs actifs',
      value: metrics.activeUsers.toLocaleString('fr-FR'),
      icon: <Users className="h-5 w-5" />,
      color: 'teal',
      trend: metrics.trends?.activeUsers ? {
        value: metrics.trends.activeUsers,
        isPositive: metrics.trends.activeUsers > 0,
      } : undefined,
      sparklineData: metrics.sparklines?.activeUsers,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {metricsData.map((metric, index) => (
        <MetricCard key={metric.title} metric={metric} index={index} />
      ))}
    </div>
  )
}
