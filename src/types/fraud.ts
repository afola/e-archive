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
