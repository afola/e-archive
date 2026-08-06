import { NextResponse } from 'next/server'
import { mockUsers } from '@/data/mock-data'

// Badge definitions
const BADGES = [
  {
    id: 'first-archive',
    name: 'Premier Pas',
    description: 'Créer votre première archive',
    icon: '🎯',
    category: 'archives',
    requirement: { type: 'archives_created', count: 1 },
    points: 50,
    rarity: 'common'
  },
  {
    id: 'archive-10',
    name: 'Archiviste Novice',
    description: 'Créer 10 archives',
    icon: '📁',
    category: 'archives',
    requirement: { type: 'archives_created', count: 10 },
    points: 100,
    rarity: 'common'
  },
  {
    id: 'archive-50',
    name: 'Archiviste Confirmé',
    description: 'Créer 50 archives',
    icon: '📚',
    category: 'archives',
    requirement: { type: 'archives_created', count: 50 },
    points: 250,
    rarity: 'rare'
  },
  {
    id: 'archive-100',
    name: 'Maître Archiviste',
    description: 'Créer 100 archives',
    icon: '🏆',
    category: 'archives',
    requirement: { type: 'archives_created', count: 100 },
    points: 500,
    rarity: 'epic'
  },
  {
    id: 'search-10',
    name: 'Chercheur',
    description: 'Effectuer 10 recherches',
    icon: '🔍',
    category: 'search',
    requirement: { type: 'searches', count: 10 },
    points: 75,
    rarity: 'common'
  },
  {
    id: 'search-100',
    name: 'Inspecteur',
    description: 'Effectuer 100 recherches',
    icon: '🔎',
    category: 'search',
    requirement: { type: 'searches', count: 100 },
    points: 300,
    rarity: 'rare'
  },
  {
    id: 'workflow-5',
    name: 'Collaborateur',
    description: 'Approuver 5 workflows',
    icon: '✅',
    category: 'workflow',
    requirement: { type: 'workflows_approved', count: 5 },
    points: 100,
    rarity: 'common'
  },
  {
    id: 'workflow-25',
    name: 'Décideur',
    description: 'Approuver 25 workflows',
    icon: '⚖️',
    category: 'workflow',
    requirement: { type: 'workflows_approved', count: 25 },
    points: 350,
    rarity: 'rare'
  },
  {
    id: 'destruction-1',
    name: 'Nettoyeur',
    description: 'Exécuter une destruction',
    icon: '🗑️',
    category: 'lifecycle',
    requirement: { type: 'destructions', count: 1 },
    points: 100,
    rarity: 'uncommon'
  },
  {
    id: 'destruction-10',
    name: 'Purgeur Expert',
    description: 'Exécuter 10 destructions',
    icon: '🔥',
    category: 'lifecycle',
    requirement: { type: 'destructions', count: 10 },
    points: 400,
    rarity: 'epic'
  },
  {
    id: 'consecutive-7',
    name: 'Assidu',
    description: 'Se connecter 7 jours consécutifs',
    icon: '📅',
    category: 'engagement',
    requirement: { type: 'consecutive_days', count: 7 },
    points: 150,
    rarity: 'uncommon'
  },
  {
    id: 'consecutive-30',
    name: 'Dévoué',
    description: 'Se connecter 30 jours consécutifs',
    icon: '💎',
    category: 'engagement',
    requirement: { type: 'consecutive_days', count: 30 },
    points: 500,
    rarity: 'epic'
  },
  {
    id: 'speed-demon',
    name: 'Éclair',
    description: 'Traiter 5 workflows en moins d\'une heure',
    icon: '⚡',
    category: 'workflow',
    requirement: { type: 'speed_workflow', count: 5 },
    points: 300,
    rarity: 'rare'
  },
  {
    id: 'first-export',
    name: 'Exportateur',
    description: 'Exporter votre premier rapport',
    icon: '📊',
    category: 'reports',
    requirement: { type: 'exports', count: 1 },
    points: 50,
    rarity: 'common'
  },
  {
    id: 'export-20',
    name: 'Rapporteur Pro',
    description: 'Exporter 20 rapports',
    icon: '📈',
    category: 'reports',
    requirement: { type: 'exports', count: 20 },
    points: 250,
    rarity: 'rare'
  },
  {
    id: 'legendary',
    name: 'Légende',
    description: 'Obtenir tous les badges d\'une catégorie',
    icon: '👑',
    category: 'special',
    requirement: { type: 'all_category_badges', count: 1 },
    points: 1000,
    rarity: 'legendary'
  }
]

// Challenge definitions
const CHALLENGES = [
  {
    id: 'weekly-archives',
    name: 'Marathon Archives',
    description: 'Créer 15 archives cette semaine',
    type: 'weekly',
    target: 15,
    reward: 200,
    deadline: getEndOfWeek(),
    category: 'archives'
  },
  {
    id: 'weekly-approvals',
    name: 'Validateur de la Semaine',
    description: 'Approuver 10 workflows cette semaine',
    type: 'weekly',
    target: 10,
    reward: 150,
    deadline: getEndOfWeek(),
    category: 'workflow'
  },
  {
    id: 'monthly-search',
    name: 'Explorateur du Mois',
    description: 'Effectuer 50 recherches ce mois',
    type: 'monthly',
    target: 50,
    reward: 300,
    deadline: getEndOfMonth(),
    category: 'search'
  },
  {
    id: 'monthly-destruction',
    name: 'Grand Nettoyage',
    description: 'Exécuter 5 destructions ce mois',
    type: 'monthly',
    target: 5,
    reward: 400,
    deadline: getEndOfMonth(),
    category: 'lifecycle'
  },
  {
    id: 'daily-login',
    name: 'Présence Quotidienne',
    description: 'Se connecter tous les jours cette semaine',
    type: 'daily',
    target: 7,
    reward: 100,
    deadline: getEndOfWeek(),
    category: 'engagement'
  }
]

function getEndOfWeek(): string {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const diff = 7 - dayOfWeek
  const endOfWeek = new Date(now.getTime() + diff * 24 * 60 * 60 * 1000)
  return endOfWeek.toISOString()
}

function getEndOfMonth(): string {
  const now = new Date()
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return endOfMonth.toISOString()
}

// Generate leaderboard data
function generateLeaderboard() {
  return mockUsers.map((user, index) => ({
    id: user.id,
    name: user.name,
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`,
    department: user.department || 'Non spécifié',
    agency: user.agencyName,
    points: Math.floor(Math.random() * 5000) + 500,
    level: Math.floor(Math.random() * 20) + 1,
    badges: Math.floor(Math.random() * 8) + 1,
    weeklyPoints: Math.floor(Math.random() * 500),
    monthlyPoints: Math.floor(Math.random() * 1500),
    rank: index + 1
  })).sort((a, b) => b.points - a.points)
    .map((user, index) => ({ ...user, rank: index + 1 }))
}

// Generate user progress data
function generateUserProgress(userId: string) {
  const user = mockUsers.find(u => u.id === userId) || mockUsers[0]
  
  const xp = Math.floor(Math.random() * 8000) + 2000
  const level = Math.floor(xp / 1000) + 1
  const xpForCurrentLevel = level * 1000
  const xpForNextLevel = (level + 1) * 1000
  const xpProgress = xp - xpForCurrentLevel
  const xpNeeded = xpForNextLevel - xpForCurrentLevel

  const earnedBadges = BADGES.slice(0, Math.floor(Math.random() * 6) + 3).map(b => b.id)
  
  const stats = {
    archivesCreated: Math.floor(Math.random() * 50) + 5,
    searches: Math.floor(Math.random() * 100) + 20,
    workflowsApproved: Math.floor(Math.random() * 30) + 5,
    destructions: Math.floor(Math.random() * 10),
    exports: Math.floor(Math.random() * 20) + 2,
    consecutiveDays: Math.floor(Math.random() * 15) + 1
  }

  return {
    user: {
      id: user.id,
      name: user.name,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`,
      department: user.department,
      agency: user.agencyName
    },
    xp,
    level,
    xpProgress,
    xpNeeded,
    totalPoints: xp,
    earnedBadges,
    totalBadges: BADGES.length,
    stats,
    recentActivity: [
      { type: 'archive_created', points: 25, description: 'Archive créée', timestamp: new Date(Date.now() - 3600000).toISOString() },
      { type: 'search', points: 5, description: 'Recherche effectuée', timestamp: new Date(Date.now() - 7200000).toISOString() },
      { type: 'workflow_approved', points: 50, description: 'Workflow approuvé', timestamp: new Date(Date.now() - 86400000).toISOString() },
      { type: 'badge_earned', points: 100, description: 'Badge obtenu: Archiviste Novice', timestamp: new Date(Date.now() - 172800000).toISOString() }
    ]
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const userId = searchParams.get('userId') || '2' // Default to first non-admin user

  if (type === 'leaderboard') {
    const period = searchParams.get('period') || 'all'
    let leaderboard = generateLeaderboard()
    
    if (period === 'weekly') {
      leaderboard = leaderboard.sort((a, b) => b.weeklyPoints - a.weeklyPoints)
        .map((user, index) => ({ ...user, rank: index + 1, points: user.weeklyPoints }))
    } else if (period === 'monthly') {
      leaderboard = leaderboard.sort((a, b) => b.monthlyPoints - a.monthlyPoints)
        .map((user, index) => ({ ...user, rank: index + 1, points: user.monthlyPoints }))
    }

    return NextResponse.json({ leaderboard })
  }

  if (type === 'badges') {
    const userProgress = generateUserProgress(userId)
    const badgesWithStatus = BADGES.map(badge => ({
      ...badge,
      earned: userProgress.earnedBadges.includes(badge.id),
      progress: Math.floor(Math.random() * 100)
    }))

    return NextResponse.json({ badges: badgesWithStatus })
  }

  if (type === 'progress') {
    const progress = generateUserProgress(userId)
    return NextResponse.json({ progress })
  }

  if (type === 'challenges') {
    const challengesWithProgress = CHALLENGES.map(challenge => ({
      ...challenge,
      progress: Math.floor(Math.random() * challenge.target),
      participants: Math.floor(Math.random() * 50) + 10,
      completed: Math.floor(Math.random() * 20)
    }))

    return NextResponse.json({ challenges: challengesWithProgress })
  }

  // Return all data
  const leaderboard = generateLeaderboard()
  const progress = generateUserProgress(userId)
  const badgesWithStatus = BADGES.map(badge => ({
    ...badge,
    earned: progress.earnedBadges.includes(badge.id),
    progress: Math.floor(Math.random() * 100)
  }))
  const challengesWithProgress = CHALLENGES.map(challenge => ({
    ...challenge,
    progress: Math.floor(Math.random() * challenge.target),
    participants: Math.floor(Math.random() * 50) + 10,
    completed: Math.floor(Math.random() * 20)
  }))

  return NextResponse.json({
    leaderboard,
    badges: badgesWithStatus,
    progress,
    challenges: challengesWithProgress
  })
}
