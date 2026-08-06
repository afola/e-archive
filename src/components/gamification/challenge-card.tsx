'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Target,
  Clock,
  Users,
  Zap,
  Trophy,
  ChevronRight,
  CheckCircle,
  Flame,
  Star
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'

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

interface ChallengeCardProps {
  challenge: Challenge
  onJoin?: (challengeId: string) => void
  onViewDetails?: (challenge: Challenge) => void
}

const TYPE_CONFIG = {
  daily: { 
    label: 'Quotidien', 
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300', 
    icon: Clock,
    borderColor: 'border-blue-200 dark:border-blue-800'
  },
  weekly: { 
    label: 'Hebdomadaire', 
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300', 
    icon: Flame,
    borderColor: 'border-purple-200 dark:border-purple-800'
  },
  monthly: { 
    label: 'Mensuel', 
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300', 
    icon: Star,
    borderColor: 'border-amber-200 dark:border-amber-800'
  }
}

const CATEGORY_ICONS: Record<string, typeof Target> = {
  archives: Target,
  workflow: CheckCircle,
  search: Zap,
  lifecycle: Flame,
  engagement: Star
}

export function ChallengeCard({ challenge, onJoin, onViewDetails }: ChallengeCardProps) {
  const [showDialog, setShowDialog] = useState(false)
  
  const typeConfig = TYPE_CONFIG[challenge.type]
  const TypeIcon = typeConfig.icon
  const CategoryIcon = CATEGORY_ICONS[challenge.category] || Target
  
  const progressPercent = (challenge.progress / challenge.target) * 100
  const isCompleted = challenge.progress >= challenge.target
  const daysLeft = Math.max(0, Math.ceil(
    (new Date(challenge.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  ))

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        onClick={() => setShowDialog(true)}
        className="cursor-pointer"
      >
        <Card className={cn(
          'overflow-hidden transition-all hover:shadow-lg',
          isCompleted && 'ring-2 ring-green-500',
          typeConfig.borderColor
        )}>
          {/* Header with type badge */}
          <div className={cn('h-1.5', typeConfig.color.split(' ')[0])} />
          
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className={cn('p-2 rounded-lg', typeConfig.color)}>
                  <TypeIcon className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base">{challenge.name}</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    {typeConfig.label}
                  </CardDescription>
                </div>
              </div>
              <Badge className={cn(
                'font-bold',
                isCompleted ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
              )}>
                <Zap className="h-3 w-3 mr-1" />
                +{challenge.reward}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {challenge.description}
            </p>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progression</span>
                <span className="font-medium">
                  {challenge.progress} / {challenge.target}
                </span>
              </div>
              <Progress 
                value={progressPercent} 
                className={cn('h-2', isCompleted && '[&>div]:bg-green-500')}
              />
            </div>

            {/* Footer stats */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {challenge.participants}
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  {challenge.completed}
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className={cn(daysLeft <= 1 && 'text-red-600 font-medium')}>
                  {daysLeft === 0 ? "Dernier jour" : `${daysLeft}j restant${daysLeft > 1 ? 's' : ''}`}
                </span>
              </div>
            </div>

            {isCompleted && (
              <div className="flex items-center justify-center gap-2 py-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">Défi complété!</span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Challenge detail dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className={cn('p-3 rounded-lg', typeConfig.color)}>
                <CategoryIcon className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle>{challenge.name}</DialogTitle>
                <DialogDescription>{typeConfig.label}</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-muted-foreground">{challenge.description}</p>

            {/* Progress section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Progression</span>
                <span className="text-primary font-bold">
                  {challenge.progress} / {challenge.target}
                </span>
              </div>
              <Progress value={progressPercent} className="h-3" />
              <p className="text-sm text-muted-foreground text-right">
                {Math.round(progressPercent)}% complété
              </p>
            </div>

            {/* Reward */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-600" />
                <span className="font-medium">Récompense</span>
              </div>
              <Badge className="bg-amber-100 text-amber-700 font-bold text-lg">
                <Zap className="h-4 w-4 mr-1" />
                +{challenge.reward} points
              </Badge>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <p className="font-bold">{challenge.participants}</p>
                <p className="text-xs text-muted-foreground">Participants</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <CheckCircle className="h-4 w-4 mx-auto mb-1 text-green-500" />
                <p className="font-bold">{challenge.completed}</p>
                <p className="text-xs text-muted-foreground">Complétés</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <p className="font-bold">{daysLeft}</p>
                <p className="text-xs text-muted-foreground">Jours restants</p>
              </div>
            </div>

            {/* Deadline */}
            <div className="text-sm text-muted-foreground">
              Date limite: <span className="font-medium">{formatDate(challenge.deadline, 'long')}</span>
            </div>
          </div>

          <DialogFooter>
            {!isCompleted && (
              <Button onClick={() => onJoin?.(challenge.id)}>
                Participer
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
            {isCompleted && (
              <Badge className="bg-green-100 text-green-700 py-2 px-4">
                <CheckCircle className="h-4 w-4 mr-2" />
                Défi complété!
              </Badge>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Challenge list component
export function ChallengeList({ 
  challenges,
  onJoin,
  filter 
}: { 
  challenges: Challenge[]
  onJoin?: (challengeId: string) => void
  filter?: 'daily' | 'weekly' | 'monthly' | 'all'
}) {
  const filteredChallenges = filter && filter !== 'all'
    ? challenges.filter(c => c.type === filter)
    : challenges

  if (filteredChallenges.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Target className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">Aucun défi disponible</p>
          <p className="text-sm">Revenez plus tard pour de nouveaux défis</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredChallenges.map((challenge, index) => (
        <motion.div
          key={challenge.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <ChallengeCard challenge={challenge} onJoin={onJoin} />
        </motion.div>
      ))}
    </div>
  )
}

// Active challenges summary
export function ActiveChallengesSummary({ challenges }: { challenges: Challenge[] }) {
  const active = challenges.filter(c => c.progress < c.target)
  const completed = challenges.filter(c => c.progress >= c.target)
  const totalReward = challenges.reduce((acc, c) => acc + c.reward, 0)

  return (
    <div className="grid grid-cols-3 gap-3">
      <Card>
        <CardContent className="p-4 text-center">
          <Flame className="h-5 w-5 mx-auto mb-2 text-orange-500" />
          <p className="text-2xl font-bold">{active.length}</p>
          <p className="text-xs text-muted-foreground">En cours</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <CheckCircle className="h-5 w-5 mx-auto mb-2 text-green-500" />
          <p className="text-2xl font-bold">{completed.length}</p>
          <p className="text-xs text-muted-foreground">Complétés</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <Zap className="h-5 w-5 mx-auto mb-2 text-amber-500" />
          <p className="text-2xl font-bold">{totalReward}</p>
          <p className="text-xs text-muted-foreground">Points total</p>
        </CardContent>
      </Card>
    </div>
  )
}
