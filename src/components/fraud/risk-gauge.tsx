'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, Shield, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface RiskGaugeProps {
  score: number
  title?: string
  showLegend?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizeConfig = {
  sm: { width: 200, height: 120, strokeWidth: 12 },
  md: { width: 280, height: 160, strokeWidth: 16 },
  lg: { width: 360, height: 200, strokeWidth: 20 },
}

export function RiskGauge({ 
  score, 
  title = 'Score de Risque Global',
  showLegend = true,
  size = 'md'
}: RiskGaugeProps) {
  const { width, height, strokeWidth } = sizeConfig[size]
  const radius = (Math.min(width, height * 2) - strokeWidth) / 2
  const centerX = width / 2
  const centerY = height - strokeWidth / 2
  
  // Calculate the angle for the score (0-180 degrees for semicircle)
  const angle = (score / 100) * 180
  const endAngle = 180 - angle // Start from left (180°) to right (0°)
  
  // Convert angle to radians
  const endAngleRad = (endAngle * Math.PI) / 180
  const endX = centerX + radius * Math.cos(endAngleRad)
  const endY = centerY - radius * Math.sin(endAngleRad)
  
  // Determine color based on score
  const getColor = (value: number) => {
    if (value < 30) return { primary: '#10b981', secondary: '#10b98133', label: 'Faible' }
    if (value < 70) return { primary: '#f59e0b', secondary: '#f59e0b33', label: 'Modéré' }
    return { primary: '#ef4444', secondary: '#ef444433', label: 'Élevé' }
  }
  
  const colorInfo = getColor(score)
  
  // Generate tick marks
  const ticks = []
  for (let i = 0; i <= 10; i++) {
    const tickAngle = (180 - (i * 18)) * Math.PI / 180
    const innerRadius = radius - strokeWidth / 2 - 8
    const outerRadius = radius - strokeWidth / 2 - 2
    const x1 = centerX + innerRadius * Math.cos(tickAngle)
    const y1 = centerY - innerRadius * Math.sin(tickAngle)
    const x2 = centerX + outerRadius * Math.cos(tickAngle)
    const y2 = centerY - outerRadius * Math.sin(tickAngle)
    ticks.push({ x1, y1, x2, y2, value: i * 10 })
  }
  
  // Background arc path
  const backgroundArc = `M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`
  
  // Score arc path
  const scoreArc = `M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5 text-muted-foreground" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="relative" style={{ width, height }}>
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            {/* Gradient definition */}
            <defs>
              <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={colorInfo.primary} />
                <stop offset="100%" stopColor={colorInfo.primary} stopOpacity="0.6" />
              </linearGradient>
            </defs>
            
            {/* Background arc */}
            <path
              d={backgroundArc}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              className="text-muted/20"
            />
            
            {/* Gradient reference arc (thin) */}
            <path
              d={backgroundArc}
              fill="none"
              stroke="url(#riskGradient)"
              strokeWidth={4}
              strokeLinecap="round"
              style={{ marginTop: '10px' }}
            />
            
            {/* Ticks */}
            {ticks.map((tick, i) => (
              <line
                key={i}
                x1={tick.x1}
                y1={tick.y1}
                x2={tick.x2}
                y2={tick.y2}
                stroke="currentColor"
                strokeWidth={i % 5 === 0 ? 2 : 1}
                className="text-muted-foreground/30"
              />
            ))}
            
            {/* Score arc */}
            <motion.path
              d={scoreArc}
              fill="none"
              stroke={colorInfo.primary}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
            
            {/* Needle base */}
            <circle
              cx={centerX}
              cy={centerY}
              r={strokeWidth / 2 + 4}
              fill={colorInfo.primary}
              className="drop-shadow-md"
            />
            
            {/* Needle */}
            <motion.line
              x1={centerX}
              y1={centerY}
              x2={endX}
              y2={endY}
              stroke={colorInfo.primary}
              strokeWidth={3}
              strokeLinecap="round"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            />
            
            {/* Needle tip */}
            <motion.circle
              cx={endX}
              cy={endY}
              r={6}
              fill={colorInfo.primary}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
              className="drop-shadow-lg"
            />
          </svg>
          
          {/* Score display */}
          <motion.div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-baseline justify-center gap-1">
              <span 
                className="text-4xl font-bold"
                style={{ color: colorInfo.primary }}
              >
                {score}
              </span>
              <span className="text-muted-foreground text-lg">/100</span>
            </div>
            <div 
              className="text-sm font-medium mt-1"
              style={{ color: colorInfo.primary }}
            >
              Risque {colorInfo.label}
            </div>
          </motion.div>
        </div>
        
        {/* Legend */}
        {showLegend && (
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs text-muted-foreground">Faible (&lt;30)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-xs text-muted-foreground">Modéré (30-70)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-xs text-muted-foreground">Élevé (&gt;70)</span>
            </div>
          </div>
        )}
        
        {/* Warning indicator for high risk */}
        {score > 70 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mt-4 p-2 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800"
          >
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-700 dark:text-red-400 font-medium">
              Attention: Risque élevé détecté
            </span>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}

// Mini version for inline display
export function RiskGaugeMini({ score, className }: { score: number; className?: string }) {
  const getColor = (value: number) => {
    if (value < 30) return '#10b981'
    if (value < 70) return '#f59e0b'
    return '#ef4444'
  }
  
  const color = getColor(score)
  const circumference = 2 * Math.PI * 18 // radius = 18
  const strokeDashoffset = circumference - (score / 100) * circumference
  
  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width="44" height="44" viewBox="0 0 44 44">
        <circle
          cx="22"
          cy="22"
          r="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-muted/20"
        />
        <motion.circle
          cx="22"
          cy="22"
          r="18"
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
        />
      </svg>
      <span 
        className="absolute text-xs font-bold"
        style={{ color }}
      >
        {score}
      </span>
    </div>
  )
}
