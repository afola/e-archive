'use client'

import { Badge } from '@/components/ui/badge'
import { ArchiveStatus } from '@/store/archive-store'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: ArchiveStatus | string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  ACTIVE: { 
    label: 'Active', 
    color: 'text-emerald-700 dark:text-emerald-400', 
    bgColor: 'bg-emerald-100 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800' 
  },
  ON_LOAN: { 
    label: 'En prêt', 
    color: 'text-amber-700 dark:text-amber-400', 
    bgColor: 'bg-amber-100 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800' 
  },
  IN_TRANSFER: { 
    label: 'En transfert', 
    color: 'text-blue-700 dark:text-blue-400', 
    bgColor: 'bg-blue-100 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800' 
  },
  PENDING_DESTRUCTION: { 
    label: 'Destruction en attente', 
    color: 'text-red-700 dark:text-red-400', 
    bgColor: 'bg-red-100 dark:bg-red-950/50 border-red-200 dark:border-red-800' 
  },
  DESTROYED: { 
    label: 'Détruite', 
    color: 'text-gray-700 dark:text-gray-400', 
    bgColor: 'bg-gray-100 dark:bg-gray-950/50 border-gray-200 dark:border-gray-800' 
  },
  ARCHIVED: { 
    label: 'Archivée', 
    color: 'text-purple-700 dark:text-purple-400', 
    bgColor: 'bg-purple-100 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800' 
  },
  EXPIRED: { 
    label: 'Expirée', 
    color: 'text-red-700 dark:text-red-400', 
    bgColor: 'bg-red-100 dark:bg-red-950/50 border-red-200 dark:border-red-800' 
  },
}

const sizeStyles = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
  lg: 'text-sm px-3 py-1.5',
}

export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.ACTIVE

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'font-medium border',
        config.bgColor,
        config.color,
        sizeStyles[size],
        className
      )}
    >
      {config.label}
    </Badge>
  )
}
