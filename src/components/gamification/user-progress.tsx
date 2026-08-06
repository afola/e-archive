'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Zap, Target, Award, Clock, Star, Flame, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'

interface UserProgressData {
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

interface UserProgressProps {
  progress: UserProgressData
  compact?: boolean
}

const LEVEL_COLORS = [
  'from-gray-400 to-gray-500',      // 1-5
  'from-green-400 to-emerald-500',  // 6-10
  'from-blue-400 to-cyan-500',      // 11-15
  'from-purple-400 to-pink-500',    // 16-20
  'from-amber-400 to-orange-500',   // 21+
]

const LEVEL_TITLES: Record<number, string> = {
  1: 'Novice',
  2: 'Débutant',
  3: 'Apprenti',
  4: 'Assistant',
  5: 'Collaborateur',
  6: 'Confirmé',
  7: 'Expert',
  8: 'Spécialiste',
  9: 'Vétéran',
  10: 'Maître',
  11: 'Champion',
  12: 'Légende',
  13: 'Élite',
  14: 'Grand Maître',
  15: 'Archimage',
  16: 'Divin',
  17: 'Céleste',
  18: 'Mythique',
  19: 'Transcendant',
  20: 'Ultime',
}

const ACTIVITY_ICONS: Record<string, typeof Target> = {
  archive_created: Target,
  search: TrendingUp,
  workflow_approved: Award,
  badge_earned: Zap,
  destruction: Flame,
  export: TrendingUp
}

const ACTIVITY_COLORS: Record<string, string> = {
  archive_created: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
  search: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
  workflow_approved: 'bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
  badge_earned: 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
  destruction: 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400',
  export: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400'
}

export function UserProgress({ progress, compact = false }: UserProgressProps) {
  const levelColorIndex = Math.min(Math.floor((progress.level - 1) / 5), LEVEL_COLORS.length - 1)
  const progressPercent = (progress.xpProgress / progress.xpNeeded) * 100
  const levelTitle = LEVEL_TITLES[Math.min(progress.level, 20)] || 'Légendaire'
  const xpToNextLevel = progress.xpNeeded - progress.xpProgress

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
      {/* Gradient header with animated background */}
      <div className={cn('h-28 bg-gradient-to-r relative overflow-hidden', LEVEL_COLORS[levelColorIndex])}>
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Animated particles */}
        <motion.div
          animate={{ 
            x: [0, 100, 0],
            y: [0, -20, 0],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute top-4 right-4"
        >
          <Star className="h-6 w-6 text-white/40" />
        </motion.div>
        <motion.div
          animate={{ 
            x: [0, -50, 0],
            y: [0, 30, 0],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
          className="absolute top-8 right-20"
        >
          <Star className="h-4 w-4 text-white/30" />
        </motion.div>
        
        {/* Level badge */}
        <div className="absolute top-4 right-4">
          <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
            <Flame className="h-3 w-3 mr-1" />
            Niveau {progress.level}
          </Badge>
        </div>
        
        {/* Avatar */}
        <div className="absolute -bottom-10 left-6">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-white dark:border-gray-900 shadow-xl">
              <AvatarImage src={progress.user.avatar} alt={progress.user.name} />
              <AvatarFallback className="text-2xl font-bold">{progress.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full w-10 h-10 flex items-center justify-center text-base font-bold text-white shadow-lg border-2 border-white dark:border-gray-900"
            >
              {progress.level}
            </motion.div>
          </div>
        </div>
      </div>

      <CardHeader className="pt-14 pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{progress.user.name}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {levelTitle}
              </Badge>
              {progress.user.department && (
                <span className="text-xs text-muted-foreground">{progress.user.department}</span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1">
              <Zap className="h-4 w-4 text-amber-500" />
              <p className="text-2xl font-bold text-primary">{progress.totalPoints.toLocaleString()}</p>
            </div>
            <p className="text-xs text-muted-foreground">points totaux</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* XP Progress Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Niveau {progress.level}</span>
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Niveau {progress.level + 1}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {xpToNextLevel.toLocaleString()} XP restants
            </span>
          </div>
          
          <div className="relative">
            <Progress value={progressPercent} className="h-4" />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute top-0 left-0 h-full flex items-center justify-center w-full"
            >
              <span className="text-xs font-bold text-white drop-shadow-md">
                {Math.round(progressPercent)}%
              </span>
            </motion.div>
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{progress.xpProgress.toLocaleString()} XP</span>
            <span>{progress.xpNeeded.toLocaleString()} XP</span>
          </div>
        </div>

        {/* Quick stats grid */}
        <div className="grid grid-cols-3 gap-3">
          <StatsCard
            icon={Award}
            value={progress.earnedBadges.length}
            label="Badges"
            color="bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
          />
          <StatsCard
            icon={Target}
            value={progress.stats.archivesCreated}
            label="Archives"
            color="bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
          />
          <StatsCard
            icon={Flame}
            value={progress.stats.consecutiveDays}
            label="Jours suite"
            color="bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400"
          />
        </div>

        {/* Detailed stats */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            Statistiques détaillées
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <DetailedStat label="Recherches" value={progress.stats.searches} />
            <DetailedStat label="Workflows approuvés" value={progress.stats.workflowsApproved} />
            <DetailedStat label="Destructions" value={progress.stats.destructions} />
            <DetailedStat label="Exports" value={progress.stats.exports} />
          </div>
        </div>

        {/* Recent activity */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Activité récente
            </h4>
            <Badge variant="outline" className="text-xs">
              Dernières 24h
            </Badge>
          </div>
          <ScrollArea className="h-40">
            <div className="space-y-2">
              {progress.recentActivity.map((activity, index) => {
                const Icon = ACTIVITY_ICONS[activity.type] || Target
                const colorClass = ACTIVITY_COLORS[activity.type] || 'bg-gray-100 text-gray-600'
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className={cn('p-2 rounded-lg', colorClass)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(activity.timestamp)}
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 font-bold">
                      +{activity.points}
                    </Badge>
                  </motion.div>
                )
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Next level preview */}
        <Card className="bg-gradient-to-r from-muted/50 to-muted/30 border-dashed">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950">
                <Star className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Prochain niveau</p>
                <p className="text-xs text-muted-foreground">
                  Débloquez {LEVEL_TITLES[Math.min(progress.level + 1, 20)] || 'Ultime'} avec {xpToNextLevel.toLocaleString()} XP
                </p>
              </div>
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}

function StatsCard({ 
  icon: Icon, 
  value, 
  label, 
  color 
}: { 
  icon: typeof Target
  value: number
  label: string
  color: string
}) {
  return (
    <div className="text-center p-3 rounded-xl bg-muted/30 border">
      <div className={cn('w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center', color)}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function DetailedStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-semibold text-sm">{value}</span>
    </div>
  )
}

// Export compact version
export function UserProgressCompact({ progress }: { progress: UserProgressData }) {
  return <UserProgress progress={progress} compact />
}

// Export level badge component
export function UserLevelBadge({ level, size = 'md' }: { level: number; size?: 'sm' | 'md' | 'lg' }) {
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

// Export XP bar component
export function XPProgressBar({ 
  current, 
  needed, 
  showLabel = true 
}: { 
  current: number
  needed: number
  showLabel?: boolean
}) {
  const percent = (current / needed) * 100
  
  return (
    <div className="space-y-1">
      <Progress value={percent} className="h-2" />
      {showLabel && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{current.toLocaleString()} XP</span>
          <span>{needed.toLocaleString()} XP</span>
        </div>
      )}
    </div>
  )
}

// Export type
export type { UserProgressData }
