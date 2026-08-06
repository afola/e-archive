'use client'

import { Badge } from '@/components/ui/badge'
import { Shield, Eye, EyeOff, Lock, AlertTriangle } from 'lucide-react'
import { ConfidentialityLevel } from '@/store/archive-store'
import { cn } from '@/lib/utils'

interface ConfidentialityBadgeProps {
  level: ConfidentialityLevel | string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
}

const config: Record<string, { label: string; color: string; bgColor: string; icon: typeof Shield }> = {
  PUBLIC: { 
    label: 'Public', 
    color: 'text-gray-700 dark:text-gray-400', 
    bgColor: 'bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700',
    icon: Eye 
  },
  NORMAL: { 
    label: 'Normal', 
    color: 'text-blue-700 dark:text-blue-400', 
    bgColor: 'bg-blue-50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800',
    icon: Eye 
  },
  CONFIDENTIAL: { 
    label: 'Confidentiel', 
    color: 'text-amber-700 dark:text-amber-400', 
    bgColor: 'bg-amber-50 dark:bg-amber-900/50 border-amber-200 dark:border-amber-800',
    icon: EyeOff 
  },
  SECRET: { 
    label: 'Secret', 
    color: 'text-red-700 dark:text-red-400', 
    bgColor: 'bg-red-50 dark:bg-red-900/50 border-red-200 dark:border-red-800',
    icon: Lock 
  },
  TOP_SECRET: { 
    label: 'Très Secret', 
    color: 'text-red-900 dark:text-red-300', 
    bgColor: 'bg-red-100 dark:bg-red-950/50 border-red-300 dark:border-red-700',
    icon: AlertTriangle 
  },
}

const sizeStyles = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
  lg: 'text-sm px-3 py-1.5',
}

export function ConfidentialityBadge({ 
  level, 
  size = 'md', 
  showIcon = true,
  className 
}: ConfidentialityBadgeProps) {
  const levelConfig = config[level] || config.NORMAL
  const Icon = levelConfig.icon

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'font-medium border gap-1',
        levelConfig.bgColor,
        levelConfig.color,
        sizeStyles[size],
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {levelConfig.label}
    </Badge>
  )
}
