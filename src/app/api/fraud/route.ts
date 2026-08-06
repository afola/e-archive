import { NextRequest, NextResponse } from 'next/server'
import { mockArchives } from '@/data/mock-data'

// Types for fraud detection
export interface Anomaly {
  id: string
  archiveId: string
  archiveReference: string
  archiveTitle: string
  type: 'DUPLICATE' | 'MODIFIED' | 'SUSPICIOUS' | 'MISSING' | 'INCONSISTENT'
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  score: number
  description: string
  detectedAt: string
  status: 'NEW' | 'INVESTIGATING' | 'CONFIRMED_FRAUD' | 'FALSE_POSITIVE' | 'NEEDS_REVIEW'
  factors: string[]
  investigatedBy?: string
  investigatedAt?: string
  notes?: string
  resolution?: string
}

export interface FraudStatistics {
  totalAnomalies: number
  newAnomalies: number
  investigatingAnomalies: number
  confirmedFrauds: number
  falsePositives: number
  averageRiskScore: number
  riskDistribution: {
    low: number
    medium: number
    high: number
    critical: number
  }
  trendData: {
    date: string
    count: number
  }[]
}

// Mock anomalies data
const generateAnomalies = (): Anomaly[] => {
  const anomalies: Anomaly[] = []
  const types: Anomaly['type'][] = ['DUPLICATE', 'MODIFIED', 'SUSPICIOUS', 'MISSING', 'INCONSISTENT']
  const riskLevels: Anomaly['riskLevel'][] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
  const statuses: Anomaly['status'][] = ['NEW', 'INVESTIGATING', 'CONFIRMED_FRAUD', 'FALSE_POSITIVE', 'NEEDS_REVIEW']
  
  const descriptions: Record<Anomaly['type'], string[]> = {
    DUPLICATE: [
      'Document identifié comme potentiellement dupliqué d\'un autre dossier',
      'Signature identique détectée sur plusieurs documents distincts',
      'Contenu textuel similaire à 95% avec un autre document',
    ],
    MODIFIED: [
      'Métadonnées modifiées après l\'archivage initial',
      'Date de création incohérente avec le contenu',
      'Fichier modifié après la validation workflow',
    ],
    SUSPICIOUS: [
      'Accès inhabituel détecté depuis une nouvelle localisation',
      'Pattern de consultation anormal détecté',
      'Téléchargements multiples en dehors des heures ouvrées',
    ],
    MISSING: [
      'Document référencé non trouvé dans le stockage',
      'Fichier attaché manquant dans le système',
      'Page manquante dans un dossier paginé',
    ],
    INCONSISTENT: [
      'Données client incohérentes entre le dossier et le registre',
      'Numéro de compte ne correspond pas au client déclaré',
      'Dates de retention en conflit avec le type de document',
    ],
  }
  
  const factors: Record<Anomaly['type'], string[]> = {
    DUPLICATE: [
      'Hash du fichier similaire',
      'Métadonnées identiques',
      'Contenu OCR similaire',
      'Même client, dates différentes',
    ],
    MODIFIED: [
      'Timestamp modifié',
      'Taille du fichier changée',
      'Checksum différent',
      'Version non documentée',
    ],
    SUSPICIOUS: [
      'IP inhabituelle',
      'Heure d\'accès anormale',
      'Volume de téléchargement élevé',
      'Échecs d\'authentification précédents',
    ],
    MISSING: [
      'Référence orpheline',
      'Lien cassé détecté',
      'Index non synchronisé',
    ],
    INCONSISTENT: [
      'Données client divergentes',
      'Référence externe invalide',
      'Règle métier non respectée',
      'Incohérence temporelle',
    ],
  }
  
  const archives = mockArchives.slice(0, 30)
  const now = new Date()
  
  archives.forEach((archive, index) => {
    if (Math.random() > 0.6) {
      const type = types[Math.floor(Math.random() * types.length)]
      const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)]
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      
      const detectedAt = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      
      const anomaly: Anomaly = {
        id: `anomaly-${String(index + 1).padStart(4, '0')}`,
        archiveId: archive.id,
        archiveReference: archive.reference,
        archiveTitle: archive.title,
        type,
        riskLevel,
        score: Math.floor(
          riskLevel === 'LOW' ? 10 + Math.random() * 20 :
          riskLevel === 'MEDIUM' ? 30 + Math.random() * 40 :
          riskLevel === 'HIGH' ? 70 + Math.random() * 20 :
          90 + Math.random() * 10
        ),
        description: descriptions[type][Math.floor(Math.random() * descriptions[type].length)],
        detectedAt: detectedAt.toISOString(),
        status,
        factors: factors[type].slice(0, 2 + Math.floor(Math.random() * 2)),
      }
      
      if (status !== 'NEW') {
        anomaly.investigatedBy = ['Marie Martin', 'Sophie Petit', 'Luc Moreau'][Math.floor(Math.random() * 3)]
        anomaly.investigatedAt = new Date(detectedAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        
        if (status === 'CONFIRMED_FRAUD') {
          anomaly.resolution = 'Fraude confirmée, document signalé et bloqué'
        } else if (status === 'FALSE_POSITIVE') {
          anomaly.notes = 'Faux positif - vérification manuelle effectuée'
        } else if (status === 'NEEDS_REVIEW') {
          anomaly.notes = 'Nécessite une révision approfondie par un expert'
        }
      }
      
      anomalies.push(anomaly)
    }
  })
  
  return anomalies
}

let cachedAnomalies: Anomaly[] | null = null

function getAnomalies(): Anomaly[] {
  if (!cachedAnomalies) {
    cachedAnomalies = generateAnomalies()
  }
  return cachedAnomalies
}

// GET - List anomalies with filters
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const type = searchParams.get('type')
  const riskLevel = searchParams.get('riskLevel')
  const search = searchParams.get('search')
  const page = parseInt(searchParams.get('page') || '0')
  const size = parseInt(searchParams.get('size') || '20')
  
  let anomalies = getAnomalies()
  
  // Apply filters
  if (status) {
    anomalies = anomalies.filter(a => a.status === status)
  }
  if (type) {
    anomalies = anomalies.filter(a => a.type === type)
  }
  if (riskLevel) {
    anomalies = anomalies.filter(a => a.riskLevel === riskLevel)
  }
  if (search) {
    const searchLower = search.toLowerCase()
    anomalies = anomalies.filter(a =>
      a.archiveReference.toLowerCase().includes(searchLower) ||
      a.archiveTitle.toLowerCase().includes(searchLower) ||
      a.description.toLowerCase().includes(searchLower)
    )
  }
  
  // Sort by risk score descending, then by date
  anomalies.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
  })
  
  // Calculate statistics
  const allAnomalies = getAnomalies()
  const stats: FraudStatistics = {
    totalAnomalies: allAnomalies.length,
    newAnomalies: allAnomalies.filter(a => a.status === 'NEW').length,
    investigatingAnomalies: allAnomalies.filter(a => a.status === 'INVESTIGATING').length,
    confirmedFrauds: allAnomalies.filter(a => a.status === 'CONFIRMED_FRAUD').length,
    falsePositives: allAnomalies.filter(a => a.status === 'FALSE_POSITIVE').length,
    averageRiskScore: Math.round(allAnomalies.reduce((sum, a) => sum + a.score, 0) / allAnomalies.length),
    riskDistribution: {
      low: allAnomalies.filter(a => a.riskLevel === 'LOW').length,
      medium: allAnomalies.filter(a => a.riskLevel === 'MEDIUM').length,
      high: allAnomalies.filter(a => a.riskLevel === 'HIGH').length,
      critical: allAnomalies.filter(a => a.riskLevel === 'CRITICAL').length,
    },
    trendData: generateTrendData(),
  }
  
  // Pagination
  const total = anomalies.length
  const start = page * size
  const paginatedAnomalies = anomalies.slice(start, start + size)
  
  return NextResponse.json({
    content: paginatedAnomalies,
    totalElements: total,
    totalPages: Math.ceil(total / size),
    size,
    number: page,
    first: page === 0,
    last: start + size >= total,
    statistics: stats,
  })
}

// POST - Submit investigation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { anomalyId, status, notes, investigatedBy } = body
    
    if (!anomalyId || !status) {
      return NextResponse.json(
        { message: 'anomalyId et status sont requis' },
        { status: 400 }
      )
    }
    
    const anomalies = getAnomalies()
    const anomalyIndex = anomalies.findIndex(a => a.id === anomalyId)
    
    if (anomalyIndex === -1) {
      return NextResponse.json(
        { message: 'Anomalie non trouvée' },
        { status: 404 }
      )
    }
    
    // Update anomaly
    const updatedAnomaly = {
      ...anomalies[anomalyIndex],
      status,
      notes: notes || anomalies[anomalyIndex].notes,
      investigatedBy: investigatedBy || 'Utilisateur actuel',
      investigatedAt: new Date().toISOString(),
    }
    
    if (status === 'CONFIRMED_FRAUD') {
      updatedAnomaly.resolution = 'Fraude confirmée et document bloqué'
    } else if (status === 'FALSE_POSITIVE') {
      updatedAnomaly.resolution = 'Faux positif validé'
    } else if (status === 'NEEDS_REVIEW') {
      updatedAnomaly.resolution = 'En attente de révision supplémentaire'
    }
    
    // Update cache
    cachedAnomalies = [
      ...anomalies.slice(0, anomalyIndex),
      updatedAnomaly,
      ...anomalies.slice(anomalyIndex + 1),
    ]
    
    return NextResponse.json(updatedAnomaly)
  } catch {
    return NextResponse.json(
      { message: 'Erreur lors du traitement de l\'investigation' },
      { status: 500 }
    )
  }
}

function generateTrendData() {
  const data = []
  const now = new Date()
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    data.push({
      date: date.toISOString().split('T')[0],
      count: Math.floor(1 + Math.random() * 5),
    })
  }
  
  return data
}
