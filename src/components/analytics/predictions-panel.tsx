'use client'

import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  HardDrive,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface PredictionData {
  month: string
  predictedVolume: number
  confidenceInterval: {
    lower: number
    upper: number
  }
  trend: 'up' | 'down' | 'stable'
  trendPercent: number
}

interface StorageRecommendation {
  type: 'warning' | 'info' | 'success'
  title: string
  description: string
  action?: string
}

interface WorkloadPrediction {
  period: string
  expectedWorkload: number
  category: 'low' | 'medium' | 'high'
  staffNeeded: number
}

interface StaffingSuggestion {
  role: string
  currentCount: number
  suggestedCount: number
  reason: string
}

interface PredictionsPanelProps {
  volumePredictions: PredictionData[]
  storageRecommendations: StorageRecommendation[]
  workloadPredictions: WorkloadPrediction[]
  staffingSuggestions: StaffingSuggestion[]
  className?: string
}

function VolumePredictionCard({ prediction, index }: { prediction: PredictionData; index: number }) {
  const trendIcon = prediction.trend === 'up' ? ArrowUpRight : prediction.trend === 'down' ? ArrowDownRight : Minus
  const trendColor = prediction.trend === 'up' ? 'text-emerald-600' : prediction.trend === 'down' ? 'text-red-600' : 'text-gray-500'
  const TrendIcon = trendIcon

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
    >
      <div className="text-sm font-medium text-muted-foreground w-20">{prediction.month}</div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">{prediction.predictedVolume.toLocaleString('fr-FR')}</span>
          <TrendIcon className={cn('h-4 w-4', trendColor)} />
          <span className={cn('text-xs font-medium', trendColor)}>
            {prediction.trendPercent > 0 ? '+' : ''}{prediction.trendPercent}%
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
          <span>IC 95%:</span>
          <span>{prediction.confidenceInterval.lower.toLocaleString('fr-FR')}</span>
          <span>-</span>
          <span>{prediction.confidenceInterval.upper.toLocaleString('fr-FR')}</span>
        </div>
      </div>
    </motion.div>
  )
}

function StorageRecommendationCard({ rec, index }: { rec: StorageRecommendation; index: number }) {
  const iconMap = {
    warning: AlertTriangle,
    info: Lightbulb,
    success: CheckCircle,
  }
  const colorMap = {
    warning: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30',
    info: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30',
    success: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30',
  }
  const Icon = iconMap[rec.type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex gap-3 p-3 rounded-lg border"
    >
      <div className={cn('p-2 rounded-lg shrink-0', colorMap[rec.type])}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{rec.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{rec.description}</p>
        {rec.action && (
          <Badge variant="outline" className="mt-2 text-xs cursor-pointer hover:bg-muted">
            {rec.action}
          </Badge>
        )}
      </div>
    </motion.div>
  )
}

function WorkloadCard({ workload, index }: { workload: WorkloadPrediction; index: number }) {
  const colorMap = {
    low: 'bg-emerald-500',
    medium: 'bg-amber-500',
    high: 'bg-red-500',
  }
  const percentage = Math.min((workload.expectedWorkload / 200) * 100, 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{workload.period}</span>
        <Badge variant={workload.category === 'high' ? 'destructive' : workload.category === 'medium' ? 'default' : 'secondary'}>
          {workload.expectedWorkload} tâches
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <Progress value={percentage} className="h-2 flex-1" />
        <div className={cn('w-2 h-2 rounded-full', colorMap[workload.category])} />
      </div>
      <p className="text-xs text-muted-foreground">
        {workload.staffNeeded} personnes recommandées
      </p>
    </motion.div>
  )
}

function StaffingCard({ suggestion, index }: { suggestion: StaffingSuggestion; index: number }) {
  const diff = suggestion.suggestedCount - suggestion.currentCount
  const needsMore = diff > 0

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
    >
      <div>
        <p className="font-medium text-sm">{suggestion.role}</p>
        <p className="text-xs text-muted-foreground">{suggestion.reason}</p>
      </div>
      <div className="text-right">
        <div className="flex items-center gap-2">
          <span className="text-sm">{suggestion.currentCount}</span>
          <span className="text-muted-foreground">→</span>
          <span className={cn('font-bold', needsMore ? 'text-amber-600' : 'text-emerald-600')}>
            {suggestion.suggestedCount}
          </span>
        </div>
        {diff !== 0 && (
          <Badge variant={needsMore ? 'destructive' : 'success'} className="text-xs mt-1">
            {needsMore ? '+' : ''}{diff}
          </Badge>
        )}
      </div>
    </motion.div>
  )
}

export function PredictionsPanel({
  volumePredictions,
  storageRecommendations,
  workloadPredictions,
  staffingSuggestions,
  className,
}: PredictionsPanelProps) {
  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-2 gap-6', className)}>
      {/* Volume Predictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Prévisions volumétrie
          </CardTitle>
          <CardDescription>Prédictions sur 3 mois avec intervalle de confiance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {volumePredictions.map((pred, index) => (
            <VolumePredictionCard key={pred.month} prediction={pred} index={index} />
          ))}
          <p className="text-xs text-muted-foreground mt-4 italic">
            Basé sur l&apos;analyse des tendances historiques et saisonnières
          </p>
        </CardContent>
      </Card>

      {/* Storage Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-blue-600" />
            Recommandations stockage
          </CardTitle>
          <CardDescription>Suggestions basées sur les prévisions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {storageRecommendations.map((rec, index) => (
            <StorageRecommendationCard key={index} rec={rec} index={index} />
          ))}
        </CardContent>
      </Card>

      {/* Workload Predictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-amber-600" />
            Prévisions charge de travail
          </CardTitle>
          <CardDescription>Anticipation des besoins opérationnels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {workloadPredictions.map((workload, index) => (
            <WorkloadCard key={workload.period} workload={workload} index={index} />
          ))}
        </CardContent>
      </Card>

      {/* Staffing Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-teal-600" />
            Suggestions effectifs
          </CardTitle>
          <CardDescription>Recommandations de staffing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {staffingSuggestions.map((suggestion, index) => (
            <StaffingCard key={suggestion.role} suggestion={suggestion} index={index} />
          ))}
          <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              💡 Ces suggestions sont basées sur les prévisions de charge et les performances historiques de l&apos;équipe.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
