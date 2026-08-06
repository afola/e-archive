'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface KPICardProps {
  title: string
  value: number | string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  subtitle?: string
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'teal'
  className?: string
}

const colorStyles = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    icon: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
  },
  green: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    icon: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    icon: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    icon: 'text-red-600 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    icon: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
  },
  teal: {
    bg: 'bg-teal-50 dark:bg-teal-950/30',
    icon: 'text-teal-600 dark:text-teal-400',
    border: 'border-teal-200 dark:border-teal-800',
  },
}

export function KPICard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  subtitle, 
  color = 'blue',
  className 
}: KPICardProps) {
  const styles = colorStyles[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn(
        'relative overflow-hidden border shadow-sm hover:shadow-md transition-shadow',
        styles.border,
        className
      )}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold tracking-tight">{value}</p>
              {trend && (
                <div className={cn(
                  'flex items-center text-xs font-medium',
                  trend.isPositive ? 'text-emerald-600' : 'text-red-600'
                )}>
                  <span>{trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
                  <span className="text-muted-foreground ml-1">vs. mois préc.</span>
                </div>
              )}
              {subtitle && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
            </div>
            <div className={cn('p-2.5 rounded-lg', styles.bg)}>
              <Icon className={cn('h-5 w-5', styles.icon)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
