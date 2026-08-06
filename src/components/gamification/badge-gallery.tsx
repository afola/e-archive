'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Award, Lock, CheckCircle, Clock, Star, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

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

interface BadgeGalleryProps {
  badges: BadgeData[]
  onBadgeClick?: (badge: BadgeData) => void
}

const RARITY_CONFIG = {
  common: { 
    label: 'Commun', 
    color: 'text-gray-600', 
    bg: 'bg-gray-100 dark:bg-gray-800', 
    border: 'border-gray-300',
    glow: ''
  },
  uncommon: { 
    label: 'Peu commun', 
    color: 'text-green-600', 
    bg: 'bg-green-100 dark:bg-green-950', 
    border: 'border-green-400',
    glow: 'shadow-green-200 dark:shadow-green-800'
  },
  rare: { 
    label: 'Rare', 
    color: 'text-blue-600', 
    bg: 'bg-blue-100 dark:bg-blue-950', 
    border: 'border-blue-400',
    glow: 'shadow-blue-200 dark:shadow-blue-800'
  },
  epic: { 
    label: 'Épique', 
    color: 'text-purple-600', 
    bg: 'bg-purple-100 dark:bg-purple-950', 
    border: 'border-purple-400',
    glow: 'shadow-purple-200 dark:shadow-purple-800'
  },
  legendary: { 
    label: 'Légendaire', 
    color: 'text-amber-600', 
    bg: 'bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-950 dark:to-yellow-950', 
    border: 'border-amber-400',
    glow: 'shadow-amber-200 dark:shadow-amber-800'
  }
}

const CATEGORY_LABELS: Record<string, string> = {
  archives: 'Archives',
  search: 'Recherche',
  workflow: 'Workflows',
  lifecycle: 'Cycle de vie',
  engagement: 'Engagement',
  reports: 'Rapports',
  special: 'Spécial'
}

export function BadgeGallery({ badges, onBadgeClick }: BadgeGalleryProps) {
  const [selectedBadge, setSelectedBadge] = useState<BadgeData | null>(null)
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [showOnlyEarned, setShowOnlyEarned] = useState(false)

  const categories = [...new Set(badges.map(b => b.category))]
  
  const filteredBadges = badges.filter(badge => {
    if (filterCategory && badge.category !== filterCategory) return false
    if (showOnlyEarned && !badge.earned) return false
    return true
  })

  const earnedCount = badges.filter(b => b.earned).length
  const totalPoints = badges.filter(b => b.earned).reduce((acc, b) => acc + b.points, 0)

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              Galerie des Badges
            </CardTitle>
            <CardDescription>
              {earnedCount} / {badges.length} badges obtenus • {totalPoints} points
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant={showOnlyEarned ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setShowOnlyEarned(!showOnlyEarned)}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Obtenus
            </Badge>
          </div>
        </div>
        
        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge
            variant={!filterCategory ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilterCategory(null)}
          >
            Tous
          </Badge>
          {categories.map(category => (
            <Badge
              key={category}
              variant={filterCategory === category ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFilterCategory(category)}
            >
              {CATEGORY_LABELS[category] || category}
            </Badge>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-96">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {filteredBadges.map((badge, index) => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                index={index}
                onClick={() => {
                  setSelectedBadge(badge)
                  onBadgeClick?.(badge)
                }}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>

      {/* Badge detail dialog */}
      <Dialog open={!!selectedBadge} onOpenChange={() => setSelectedBadge(null)}>
        <DialogContent className="sm:max-w-md">
          <AnimatePresence mode="wait">
            {selectedBadge && (
              <motion.div
                key={selectedBadge.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <DialogHeader>
                  <div className="flex items-center justify-center mb-4">
                    <BadgeIcon badge={selectedBadge} size="lg" />
                  </div>
                  <DialogTitle className="text-center">{selectedBadge.name}</DialogTitle>
                  <DialogDescription className="text-center">
                    {selectedBadge.description}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Catégorie</span>
                    <Badge variant="outline">{CATEGORY_LABELS[selectedBadge.category]}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Rareté</span>
                    <Badge className={RARITY_CONFIG[selectedBadge.rarity].bg}>
                      {RARITY_CONFIG[selectedBadge.rarity].label}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Points</span>
                    <span className="font-bold text-primary">{selectedBadge.points} pts</span>
                  </div>
                  
                  {!selectedBadge.earned && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progression</span>
                        <span className="font-medium">{selectedBadge.progress || 0}%</span>
                      </div>
                      <Progress value={selectedBadge.progress || 0} className="h-2" />
                    </div>
                  )}
                  
                  <div className={cn(
                    'p-4 rounded-lg text-center',
                    selectedBadge.earned ? 'bg-green-50 dark:bg-green-950/20' : 'bg-muted'
                  )}>
                    {selectedBadge.earned ? (
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Badge obtenu!</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Lock className="h-5 w-5" />
                        <span className="font-medium">Non obtenu</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function BadgeCard({ badge, index, onClick }: { badge: BadgeData; index: number; onClick: () => void }) {
  const config = RARITY_CONFIG[badge.rarity]
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.02 }}
      whileHover={{ scale: 1.05, y: -5 }}
      onClick={onClick}
      className={cn(
        'relative flex flex-col items-center p-3 rounded-xl border-2 cursor-pointer transition-all',
        badge.earned ? config.border : 'border-gray-200 dark:border-gray-800',
        badge.earned ? config.bg : 'bg-gray-50 dark:bg-gray-900',
        badge.earned && `shadow-lg ${config.glow}`
      )}
    >
      {badge.earned && badge.rarity === 'legendary' && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-1 -right-1"
        >
          <Sparkles className="h-4 w-4 text-amber-500" />
        </motion.div>
      )}
      
      <BadgeIcon badge={badge} />
      
      <p className={cn(
        'text-xs font-medium text-center mt-2 line-clamp-2',
        badge.earned ? 'text-foreground' : 'text-muted-foreground'
      )}>
        {badge.name}
      </p>
      
      {!badge.earned && (
        <div className="absolute inset-0 bg-black/5 rounded-xl flex items-center justify-center">
          <Lock className="h-5 w-5 text-gray-400" />
        </div>
      )}
    </motion.div>
  )
}

function BadgeIcon({ badge, size = 'md' }: { badge: BadgeData; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xl',
    md: 'h-12 w-12 text-2xl',
    lg: 'h-20 w-20 text-5xl'
  }
  
  return (
    <div className={cn(
      'rounded-full flex items-center justify-center',
      sizeClasses[size],
      badge.earned ? RARITY_CONFIG[badge.rarity].bg : 'bg-gray-200 dark:bg-gray-800'
    )}>
      {badge.earned ? (
        <span>{badge.icon}</span>
      ) : (
        <Lock className="h-4 w-4 text-gray-400" />
      )}
    </div>
  )
}

// Badge progress summary
export function BadgeProgress({ badges }: { badges: BadgeData[] }) {
  const earned = badges.filter(b => b.earned)
  const byRarity = Object.keys(RARITY_CONFIG).map(rarity => ({
    rarity: rarity as keyof typeof RARITY_CONFIG,
    earned: earned.filter(b => b.rarity === rarity).length,
    total: badges.filter(b => b.rarity === rarity).length
  }))

  return (
    <div className="space-y-3">
      {byRarity.map(({ rarity, earned, total }) => (
        <div key={rarity} className="flex items-center gap-3">
          <Badge className={cn('w-24 justify-center', RARITY_CONFIG[rarity].bg)}>
            {RARITY_CONFIG[rarity].label}
          </Badge>
          <Progress value={(earned / total) * 100} className="flex-1 h-2" />
          <span className="text-sm text-muted-foreground w-16 text-right">
            {earned}/{total}
          </span>
        </div>
      ))}
    </div>
  )
}
