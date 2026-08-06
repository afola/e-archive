'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Medal, Crown, TrendingUp, Users, ChevronUp, ChevronDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface LeaderboardEntry {
  id: string
  name: string
  avatar: string
  department: string
  agency: string
  points: number
  level: number
  badges: number
  weeklyPoints: number
  monthlyPoints: number
  rank: number
}

interface LeaderboardProps {
  leaderboard: LeaderboardEntry[]
  currentUserId?: string
  onUserClick?: (userId: string) => void
}

const RANK_STYLES: Record<number, { bg: string; border: string; icon: typeof Trophy }> = {
  1: { bg: 'bg-gradient-to-r from-yellow-400 to-amber-500', border: 'border-yellow-400', icon: Crown },
  2: { bg: 'bg-gradient-to-r from-slate-300 to-slate-400', border: 'border-slate-400', icon: Medal },
  3: { bg: 'bg-gradient-to-r from-amber-600 to-amber-700', border: 'border-amber-600', icon: Medal },
}

export function Leaderboard({ leaderboard, currentUserId, onUserClick }: LeaderboardProps) {
  const [period, setPeriod] = useState<'all' | 'weekly' | 'monthly'>('all')
  
  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    if (period === 'weekly') return b.weeklyPoints - a.weeklyPoints
    if (period === 'monthly') return b.monthlyPoints - a.monthlyPoints
    return b.points - a.points
  }).map((entry, index) => ({ ...entry, rank: index + 1 }))

  const topThree = sortedLeaderboard.slice(0, 3)
  const restOfList = sortedLeaderboard.slice(3)
  const currentUserEntry = sortedLeaderboard.find(e => e.id === currentUserId)

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Classement
            </CardTitle>
            <CardDescription>Les meilleurs contributeurs</CardDescription>
          </div>
          <Tabs value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
            <TabsList className="grid grid-cols-3 h-8">
              <TabsTrigger value="weekly" className="text-xs">Semaine</TabsTrigger>
              <TabsTrigger value="monthly" className="text-xs">Mois</TabsTrigger>
              <TabsTrigger value="all" className="text-xs">Tout</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {/* Top 3 podium */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* 2nd place */}
          <div className="pt-8">
            <LeaderboardPodium entry={topThree[1]} rank={2} onClick={() => onUserClick?.(topThree[1]?.id)} />
          </div>
          {/* 1st place */}
          <div>
            <LeaderboardPodium entry={topThree[0]} rank={1} onClick={() => onUserClick?.(topThree[0]?.id)} isHighlighted />
          </div>
          {/* 3rd place */}
          <div className="pt-12">
            <LeaderboardPodium entry={topThree[2]} rank={3} onClick={() => onUserClick?.(topThree[2]?.id)} />
          </div>
        </div>

        {/* Rest of leaderboard */}
        <ScrollArea className="h-72">
          <div className="space-y-2">
            {restOfList.map((entry, index) => {
              const isCurrentUser = entry.id === currentUserId
              
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => onUserClick?.(entry.id)}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer',
                    isCurrentUser ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50'
                  )}
                >
                  <span className="w-8 text-center font-bold text-muted-foreground">
                    {entry.rank}
                  </span>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={entry.avatar} alt={entry.name} />
                    <AvatarFallback>{entry.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{entry.name}</p>
                      {isCurrentUser && (
                        <Badge variant="secondary" className="text-xs">Vous</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{entry.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">
                      {period === 'weekly' ? entry.weeklyPoints : period === 'monthly' ? entry.monthlyPoints : entry.points}
                    </p>
                    <p className="text-xs text-muted-foreground">pts</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </ScrollArea>

        {/* Current user position if not in top list */}
        {currentUserEntry && currentUserEntry.rank > 3 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Votre position</span>
              <Badge variant="outline" className="gap-1">
                <TrendingUp className="h-3 w-3" />
                #{currentUserEntry.rank}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function LeaderboardPodium({ 
  entry, 
  rank, 
  onClick,
  isHighlighted = false 
}: { 
  entry?: LeaderboardEntry
  rank: number
  onClick?: () => void
  isHighlighted?: boolean 
}) {
  if (!entry) return null
  
  const style = RANK_STYLES[rank]
  const RankIcon = style.icon

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
      className={cn(
        'flex flex-col items-center p-4 rounded-xl cursor-pointer transition-all',
        isHighlighted ? 'bg-gradient-to-b from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-2' : 'bg-muted/50 hover:bg-muted'
      )}
      style={isHighlighted ? { borderColor: 'rgb(234, 179, 8)' } : undefined}
    >
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center mb-2',
        style.bg
      )}>
        <RankIcon className="h-4 w-4 text-white" />
      </div>
      <Avatar className={cn('h-14 w-14 mb-2 border-2', style.border)}>
        <AvatarImage src={entry.avatar} alt={entry.name} />
        <AvatarFallback>{entry.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
      </Avatar>
      <p className="font-medium text-sm text-center truncate max-w-[120px]">{entry.name}</p>
      <p className="text-xs text-muted-foreground mb-2">Niv. {entry.level}</p>
      <Badge className={cn('font-bold', style.bg)}>
        {entry.points} pts
      </Badge>
    </motion.div>
  )
}

// Compact leaderboard variant
export function LeaderboardCompact({ 
  leaderboard, 
  limit = 5 
}: { 
  leaderboard: LeaderboardEntry[]
  limit?: number 
}) {
  return (
    <div className="space-y-2">
      {leaderboard.slice(0, limit).map((entry, index) => (
        <motion.div
          key={entry.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <span className={cn(
            'w-6 text-center font-bold',
            entry.rank === 1 ? 'text-yellow-500' :
            entry.rank === 2 ? 'text-slate-400' :
            entry.rank === 3 ? 'text-amber-600' :
            'text-muted-foreground'
          )}>
            {entry.rank}
          </span>
          <Avatar className="h-8 w-8">
            <AvatarImage src={entry.avatar} alt={entry.name} />
            <AvatarFallback className="text-xs">{entry.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{entry.name}</p>
          </div>
          <span className="text-sm font-bold text-primary">{entry.points}</span>
        </motion.div>
      ))}
    </div>
  )
}
