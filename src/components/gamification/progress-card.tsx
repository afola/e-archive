'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Zap, Target, Award, Clock, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'

interface UserProgress {
  user: {
    id: string
    name: string
    avatar: string
    department?: string
    agency?: string
  }
  xp: number
  level: number
  xpProgress: number
  xpNeeded: number
  totalPoints: number
  earnedBadges: string[]
  totalBadges: number
  stats: {
    archivesCreated: number
    searches: number
    workflowsApproved: number
    destructions: number
    exports: number
    consecutiveDays: number
  }
  recentActivity: Array<{
    type: string
    points: number
    description: string
    timestamp: string
  }>
}

interface ProgressCardProps {
  progress: UserProgress
  compact?: boolean
}

const LEVEL_COLORS = [
  'from-gray-400 to-gray-500',      // 1-5
  'from-green-400 to-emerald-500',  // 6-10
  'from-blue-400 to-cyan-500',      // 11-15
  'from-purple-400 to-pink-500',    // 16-20
  'from-amber-400 to-orange-500',   // 21+
]

const ACTIVITY_ICONS: Record<string, typeof Target> = {
  archive_created: Target,
  search: TrendingUp,
  workflow_approved: Award,
  badge_earned: Zap,
  destruction: Target
}

export function ProgressCard({ progress, compact = false }: ProgressCardProps) {
  const levelColorIndex = Math.min(Math.floor((progress.level - 1) / 5), LEVEL_COLORS.length - 1)
  const progressPercent = (progress.xpProgress / progress.xpNeeded) * 100

  if (compact) {
    return (
      <Card className="overflow-hidden">
        <div className={cn('h-1 bg-gradient-to-r', LEVEL_COLORS[levelColorIndex])} />
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={progress.user.avatar} alt={progress.user.name} />
                <AvatarFallback>{progress.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                {progress.level}
              </div>
            </div>
            <div className="flex-1">
              <p className="font-medium">{progress.user.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <Progress value={progressPercent} className="h-2 flex-1" />
                <span className="text-xs text-muted-foreground">
                  {progress.xpProgress}/{progress.xpNeeded}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      {/* Gradient header */}
      <div className={cn('h-24 bg-gradient-to-r', LEVEL_COLORS[levelColorIndex], 'relative')}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute -bottom-8 left-4">
          <div className="relative">
            <Avatar className="h-20 w-20 border-4 border-white dark:border-gray-900 shadow-lg">
              <AvatarImage src={progress.user.avatar} alt={progress.user.name} />
              <AvatarFallback className="text-xl">{progress.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold text-white shadow-lg"
            >
              {progress.level}
            </motion.div>
          </div>
        </div>
      </div>

      <CardHeader className="pt-12 pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{progress.user.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{progress.user.department}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{progress.totalPoints.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">points</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* XP Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Niveau {progress.level}</span>
            <span className="font-medium">
              {progress.xpProgress.toLocaleString()} / {progress.xpNeeded.toLocaleString()} XP
            </span>
            <span className="text-muted-foreground">Niveau {progress.level + 1}</span>
          </div>
          <Progress value={progressPercent} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{Math.round(progressPercent)}% complété</span>
            <span>{(progress.xpNeeded - progress.xpProgress).toLocaleString()} XP restants</span>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold text-primary">{progress.earnedBadges.length}</p>
            <p className="text-xs text-muted-foreground">Badges</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold text-primary">{progress.stats.archivesCreated}</p>
            <p className="text-xs text-muted-foreground">Archives</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold text-primary">{progress.stats.consecutiveDays}</p>
            <p className="text-xs text-muted-foreground">Jours suite</p>
          </div>
        </div>

        {/* Stats breakdown */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Statistiques détaillées</h4>
          <div className="grid grid-cols-2 gap-2">
            <StatItem label="Recherches" value={progress.stats.searches} />
            <StatItem label="Workflows approuvés" value={progress.stats.workflowsApproved} />
            <StatItem label="Destructions" value={progress.stats.destructions} />
            <StatItem label="Exports" value={progress.stats.exports} />
          </div>
        </div>

        {/* Recent activity */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Activité récente</h4>
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Dernières 24h
            </Badge>
          </div>
          <ScrollArea className="h-32">
            <div className="space-y-2">
              {progress.recentActivity.map((activity, index) => {
                const Icon = ACTIVITY_ICONS[activity.type] || Target
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50"
                  >
                    <div className="p-2 rounded-full bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(activity.timestamp)}
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-700">
                      +{activity.points}
                    </Badge>
                  </motion.div>
                )
              })}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

// Level progress mini component
export function LevelBadge({ level, size = 'md' }: { level: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-5 w-5 text-xs',
    md: 'h-6 w-6 text-sm',
    lg: 'h-8 w-8 text-base'
  }
  
  const levelColorIndex = Math.min(Math.floor((level - 1) / 5), LEVEL_COLORS.length - 1)
  
  return (
    <div className={cn(
      'rounded-full bg-gradient-to-r flex items-center justify-center font-bold text-white shadow-lg',
      sizeClasses[size],
      LEVEL_COLORS[levelColorIndex]
    )}>
      {level}
    </div>
  )
}
