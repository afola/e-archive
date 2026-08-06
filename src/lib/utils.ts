import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export function formatDate(date: string | Date, format: 'short' | 'long' | 'relative' = 'short'): string {
  const d = new Date(date)
  
  switch (format) {
    case 'short':
      return d.toLocaleDateString('fr-FR')
    case 'long':
      return d.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    case 'relative':
      const now = new Date()
      const diff = now.getTime() - d.getTime()
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      
      if (days === 0) return "Aujourd'hui"
      if (days === 1) return 'Hier'
      if (days < 7) return `Il y a ${days} jours`
      if (days < 30) return `Il y a ${Math.floor(days / 7)} semaines`
      if (days < 365) return `Il y a ${Math.floor(days / 30)} mois`
      return `Il y a ${Math.floor(days / 365)} ans`
    default:
      return d.toLocaleDateString('fr-FR')
  }
}

export function generateReference(prefix: string, sequence: number): string {
  return `${prefix}-${String(sequence).padStart(6, '0')}`
}

export function calculateRetentionStatus(endDate: string): {
  daysLeft: number
  status: 'ok' | 'warning' | 'critical' | 'expired'
  color: string
} {
  const now = new Date()
  const end = new Date(endDate)
  const diffDays = Math.floor((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays <= 0) {
    return { daysLeft: 0, status: 'expired', color: 'text-red-600' }
  }
  if (diffDays <= 7) {
    return { daysLeft: diffDays, status: 'critical', color: 'text-red-600' }
  }
  if (diffDays <= 30) {
    return { daysLeft: diffDays, status: 'warning', color: 'text-amber-600' }
  }
  return { daysLeft: diffDays, status: 'ok', color: 'text-emerald-600' }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
