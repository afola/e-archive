'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Trophy,
  Award,
  Target,
  TrendingUp,
  RefreshCw,
  Crown,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Leaderboard } from '@/components/gamification/leaderboard'
import { BadgeGallery, BadgeProgress } from '@/components/gamification/badge-gallery'
import { ProgressCard, LevelBadge } from '@/components/gamification/progress-card'
import { UserProgress, UserLevelBadge } from '@/components/gamification/user-progress'
import { ChallengeList, ActiveChallengesSummary } from '@/components/gamification/challenge-card'
import { useToast } from '@/hooks/use-toast'
import { fetchWithCurrentAuth } from '@/lib/auth/auth-store'
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

interface BadgeData {
  id: string
  name: string
  description: string
  icon: string
  category: string
  requirement: { type: string; count: number }
  points: number
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  earned?: boolean
  progress?: number
}

interface Challenge {
  id: string
  name: string
  description: string
  type: 'daily' | 'weekly' | 'monthly'
  target: number
  reward: number
  deadline: string
  category: string
  progress: number
  participants: number
  completed: number
}

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

interface GamificationData {
  leaderboard: LeaderboardEntry[]
  badges: BadgeData[]
  progress: UserProgress
  challenges: Challenge[]
}

export default function GamificationPage() {
  const [data, setData] = useState<GamificationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const { toast } = useToast()

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetchWithCurrentAuth('/gamification')
      const result = await response.json()
      setData(result)
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données de gamification',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleJoinChallenge = async (challengeId: string) => {
    toast({
      title: 'Défi rejoint',
      description: 'Bonne chance pour compléter ce défi!'
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

  const currentUser = data.progress.user
  const earnedBadges = data.badges.filter(b => b.earned)

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500" />
            Gamification
          </h1>
          <p className="text-muted-foreground">
            Progressez, gagnez des badges et concoursez avec vos collègues
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Quick stats bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <LevelBadge level={data.progress.level} size="lg" />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-1 -right-1"
                >
                  <Sparkles className="h-4 w-4 text-amber-500" />
                </motion.div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Niveau actuel</p>
                <p className="text-xl font-bold">{data.progress.level}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Points totaux</p>
                <p className="text-2xl font-bold text-purple-600">{data.progress.totalPoints.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Badges obtenus</p>
                <p className="text-2xl font-bold text-blue-600">{earnedBadges.length}/{data.badges.length}</p>
              </div>
              <Award className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Classement</p>
                <p className="text-2xl font-bold text-green-600">
                  #{data.leaderboard.find(e => e.id === currentUser.id)?.rank || '-'}
                </p>
              </div>
              <Crown className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="gap-2">
            <Trophy className="h-4 w-4" />
            Classement
          </TabsTrigger>
          <TabsTrigger value="badges" className="gap-2">
            <Award className="h-4 w-4" />
            Badges
          </TabsTrigger>
          <TabsTrigger value="challenges" className="gap-2">
            <Target className="h-4 w-4" />
            Défis
          </TabsTrigger>
        </TabsList>

        {/* Overview tab */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User progress */}
            <div className="lg:col-span-1">
              <UserProgress progress={data.progress} />
            </div>

            {/* Leaderboard preview + Badge progress */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    Top contributeurs
                  </CardTitle>
                  <CardDescription>Les 5 meilleurs cette semaine</CardDescription>
                </CardHeader>
                <CardContent>
                  <Leaderboard 
                    leaderboard={data.leaderboard} 
                    currentUserId={currentUser.id}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-purple-500" />
                    Progression des badges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BadgeProgress badges={data.badges} />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Active challenges */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-500" />
                Défis actifs
              </h2>
              <Button variant="outline" size="sm" onClick={() => setActiveTab('challenges')}>
                Voir tous
              </Button>
            </div>
            <ActiveChallengesSummary challenges={data.challenges} />
          </div>
        </TabsContent>

        {/* Leaderboard tab */}
        <TabsContent value="leaderboard" className="mt-6">
          <Leaderboard
            leaderboard={data.leaderboard}
            currentUserId={currentUser.id}
            onUserClick={(userId) => {
              console.log('User clicked:', userId)
            }}
          />
        </TabsContent>

        {/* Badges tab */}
        <TabsContent value="badges" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <BadgeGallery
                badges={data.badges}
                onBadgeClick={(badge) => {
                  console.log('Badge clicked:', badge)
                }}
              />
            </div>
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Statistiques</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total badges</span>
                      <Badge variant="outline">{data.badges.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Obtenus</span>
                      <Badge className="bg-green-100 text-green-700">{earnedBadges.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Restants</span>
                      <Badge variant="secondary">{data.badges.length - earnedBadges.length}</Badge>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Points des badges</p>
                    <div className="text-2xl font-bold text-primary">
                      {earnedBadges.reduce((acc, b) => acc + b.points, 0).toLocaleString()} pts
                    </div>
                  </div>

                  {/* Rarity breakdown */}
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-3">Par rareté</p>
                    <BadgeProgress badges={data.badges} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Challenges tab */}
        <TabsContent value="challenges" className="mt-6 space-y-6">
          <ActiveChallengesSummary challenges={data.challenges} />
          
          <div className="space-y-6">
            {/* Daily challenges */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-700">Quotidiens</Badge>
              </h3>
              <ChallengeList
                challenges={data.challenges.filter(c => c.type === 'daily')}
                onJoin={handleJoinChallenge}
              />
            </div>

            {/* Weekly challenges */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Badge className="bg-purple-100 text-purple-700">Hebdomadaires</Badge>
              </h3>
              <ChallengeList
                challenges={data.challenges.filter(c => c.type === 'weekly')}
                onJoin={handleJoinChallenge}
              />
            </div>

            {/* Monthly challenges */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Badge className="bg-amber-100 text-amber-700">Mensuels</Badge>
              </h3>
              <ChallengeList
                challenges={data.challenges.filter(c => c.type === 'monthly')}
                onJoin={handleJoinChallenge}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
