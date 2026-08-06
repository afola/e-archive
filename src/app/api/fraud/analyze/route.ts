import { NextRequest, NextResponse } from 'next/server'
import { mockArchives } from '@/data/mock-data'

interface AnalysisResult {
  archiveId: string
  reference: string
  title: string
  riskScore: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  factors: {
    name: string
    impact: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'
    score: number
    description: string
  }[]
  recommendations: string[]
  analyzedAt: string
}

// Analyze a document for fraud risk
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { archiveId, reference } = body
    
    if (!archiveId && !reference) {
      return NextResponse.json(
        { message: 'archiveId ou reference est requis' },
        { status: 400 }
      )
    }
    
    // Find the archive
    const archive = mockArchives.find(a => 
      a.id === archiveId || a.reference === reference
    )
    
    if (!archive) {
      return NextResponse.json(
        { message: 'Archive non trouvée' },
        { status: 404 }
      )
    }
    
    // Simulate AI-based analysis
    const analysisResult = analyzeDocument(archive)
    
    return NextResponse.json(analysisResult)
  } catch {
    return NextResponse.json(
      { message: 'Erreur lors de l\'analyse du document' },
      { status: 500 }
    )
  }
}

function analyzeDocument(archive: typeof mockArchives[0]): AnalysisResult {
  // Simulate risk analysis based on various factors
  const factors: AnalysisResult['factors'] = []
  let totalScore = 0
  
  // Factor 1: Document age
  const archiveDate = new Date(archive.archiveDate)
  const ageInDays = Math.floor((Date.now() - archiveDate.getTime()) / (1000 * 60 * 60 * 24))
  const ageScore = ageInDays > 365 ? 15 : ageInDays > 180 ? 10 : 5
  factors.push({
    name: 'Ancienneté du document',
    impact: ageScore > 10 ? 'NEGATIVE' : 'NEUTRAL',
    score: ageScore,
    description: ageInDays > 365 
      ? `Document ancien (${Math.floor(ageInDays / 365)} an(s)) - Risque de fraude temporelle accru`
      : `Document récent - Risque faible`,
  })
  totalScore += ageScore
  
  // Factor 2: Confidentiality level
  const confidentialityScore = archive.confidentiality === 'SECRET' ? 20 
    : archive.confidentiality === 'CONFIDENTIAL' ? 15 
    : archive.confidentiality === 'NORMAL' ? 5 
    : 0
  factors.push({
    name: 'Niveau de confidentialité',
    impact: confidentialityScore > 10 ? 'NEGATIVE' : 'NEUTRAL',
    score: confidentialityScore,
    description: archive.confidentiality === 'SECRET' 
      ? 'Document secret - Cible potentielle de fraude'
      : archive.confidentiality === 'CONFIDENTIAL' 
      ? 'Document confidentiel - Attention requise'
      : 'Accès standard - Risque normal',
  })
  totalScore += confidentialityScore
  
  // Factor 3: Status
  const statusScore = archive.status === 'EXPIRED' ? 15 
    : archive.status === 'ON_LOAN' ? 10 
    : archive.status === 'IN_TRANSFER' ? 8 
    : 3
  factors.push({
    name: 'Statut actuel',
    impact: statusScore > 10 ? 'NEGATIVE' : 'NEUTRAL',
    score: statusScore,
    description: archive.status === 'EXPIRED' 
      ? 'Document expiré - Risque de manipulation accrue'
      : archive.status === 'ON_LOAN' 
      ? 'Document en prêt - Circuit de contrôle allégé'
      : 'Statut normal',
  })
  totalScore += statusScore
  
  // Factor 4: Digital copy existence
  const digitalScore = archive.hasDigitalCopy ? 8 : 15
  factors.push({
    name: 'Copie numérique',
    impact: archive.hasDigitalCopy ? 'POSITIVE' : 'NEGATIVE',
    score: digitalScore,
    description: archive.hasDigitalCopy 
      ? 'Copie numérique disponible - Comparaison possible'
      : 'Pas de copie numérique - Vulnérabilité accrue',
  })
  totalScore += digitalScore
  
  // Factor 5: Version history
  const versionScore = archive.version > 1 ? 12 : 3
  factors.push({
    name: 'Historique des versions',
    impact: archive.version > 1 ? 'NEUTRAL' : 'POSITIVE',
    score: versionScore,
    description: archive.version > 1 
      ? `${archive.version} versions - Vérifier les modifications`
      : 'Version originale - Intégrité préservée',
  })
  totalScore += versionScore
  
  // Factor 6: Last action type
  const actionScore = archive.lastActionType === 'UPDATE' ? 15 
    : archive.lastActionType === 'DOWNLOAD' ? 10 
    : archive.lastActionType === 'VIEW' ? 5 
    : 2
  factors.push({
    name: 'Dernière action',
    impact: actionScore > 10 ? 'NEGATIVE' : 'NEUTRAL',
    score: actionScore,
    description: archive.lastActionType === 'UPDATE' 
      ? 'Modification récente - Vérifier les changements'
      : archive.lastActionType === 'DOWNLOAD' 
      ? 'Téléchargement récent - Traces disponibles'
      : 'Consultation normale',
  })
  totalScore += actionScore
  
  // Add some randomness for demo
  totalScore = Math.min(100, Math.max(0, totalScore + Math.floor(Math.random() * 20 - 10)))
  
  // Determine risk level
  const riskLevel: AnalysisResult['riskLevel'] = totalScore < 30 
    ? 'LOW' 
    : totalScore < 50 
    ? 'MEDIUM' 
    : totalScore < 75 
    ? 'HIGH' 
    : 'CRITICAL'
  
  // Generate recommendations
  const recommendations: string[] = []
  
  if (riskLevel === 'CRITICAL') {
    recommendations.push('Investigation immédiate recommandée')
    recommendations.push('Bloquer l\'accès au document en attendant l\'analyse')
  }
  if (riskLevel === 'HIGH') {
    recommendations.push('Planifier une vérification détaillée')
    recommendations.push('Comparer avec les versions antérieures si disponibles')
  }
  if (archive.confidentiality === 'SECRET' || archive.confidentiality === 'CONFIDENTIAL') {
    recommendations.push('Vérifier les logs d\'accès récents')
  }
  if (!archive.hasDigitalCopy) {
    recommendations.push('Numériser le document pour créer une référence')
  }
  if (archive.version > 1) {
    recommendations.push('Comparer les versions pour détecter les modifications')
  }
  if (archive.status === 'EXPIRED') {
    recommendations.push('Vérifier la légitimité des accès récents')
  }
  if (recommendations.length === 0) {
    recommendations.push('Document à risque faible - Surveillance normale')
    recommendations.push('Pas d\'action immédiate requise')
  }
  
  return {
    archiveId: archive.id,
    reference: archive.reference,
    title: archive.title,
    riskScore: totalScore,
    riskLevel,
    factors,
    recommendations,
    analyzedAt: new Date().toISOString(),
  }
}

// GET - Get analysis history or recent analyses
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const archiveId = searchParams.get('archiveId')
  
  if (archiveId) {
    // Return analysis for specific archive
    const archive = mockArchives.find(a => a.id === archiveId)
    if (!archive) {
      return NextResponse.json(
        { message: 'Archive non trouvée' },
        { status: 404 }
      )
    }
    
    const analysisResult = analyzeDocument(archive)
    return NextResponse.json(analysisResult)
  }
  
  // Return summary of recent analyses
  const recentAnalyses = mockArchives.slice(0, 10).map(archive => {
    const score = Math.floor(Math.random() * 100)
    return {
      archiveId: archive.id,
      reference: archive.reference,
      title: archive.title,
      riskScore: score,
      riskLevel: score < 30 ? 'LOW' : score < 50 ? 'MEDIUM' : score < 75 ? 'HIGH' : 'CRITICAL',
      analyzedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    }
  })
  
  return NextResponse.json({
    recentAnalyses,
    totalAnalyzed: recentAnalyses.length,
  })
}
