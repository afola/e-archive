'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActivityData {
  date: string
  count: number
  details?: {
    created: number
    viewed: number
    downloaded: number
    moved: number
  }
}

interface ActivityHeatmapProps {
  data: ActivityData[]
  className?: string
}

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
]

const DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

const COLORS = [
  'bg-gray-100 dark:bg-gray-800',
  'bg-emerald-100 dark:bg-emerald-900',
  'bg-emerald-200 dark:bg-emerald-800',
  'bg-emerald-300 dark:bg-emerald-700',
  'bg-emerald-400 dark:bg-emerald-600',
  'bg-emerald-500 dark:bg-emerald-500',
]

function getColorIndex(count: number, maxCount: number): number {
  if (count === 0) return 0
  if (maxCount === 0) return 0
  const normalized = count / maxCount
  if (normalized < 0.1) return 1
  if (normalized < 0.25) return 2
  if (normalized < 0.5) return 3
  if (normalized < 0.75) return 4
  return 5
}

function getWeeksInYear(year: number): Date[][] {
  const weeks: Date[][] = []
  const startDate = new Date(year, 0, 1)
  const endDate = new Date(year, 11, 31)

  // Find the first Sunday of the year or the last Sunday of previous year
  const firstDay = startDate.getDay()
  let current = new Date(startDate)
  if (firstDay !== 0) {
    current.setDate(current.getDate() - firstDay)
  }

  while (current <= endDate || weeks[weeks.length - 1]?.[6] <= endDate) {
    const week: Date[] = []
    for (let i = 0; i < 7; i++) {
      week.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    weeks.push(week)
  }

  return weeks
}

function getWeeksInMonth(year: number, month: number): Date[][] {
  const weeks: Date[][] = []
  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 0)

  // Find the first Sunday of the month or last Sunday of previous month
  let current = new Date(startDate)
  const firstDay = current.getDay()
  if (firstDay !== 0) {
    current.setDate(current.getDate() - firstDay)
  }

  while (current <= endDate || (weeks.length > 0 && weeks[weeks.length - 1][6] > endDate)) {
    const week: Date[] = []
    for (let i = 0; i < 7; i++) {
      week.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    weeks.push(week)
    if (week[6] > endDate && week.every(d => d.getMonth() !== month)) break
  }

  return weeks
}

interface DayTooltipProps {
  date: Date
  count: number
  details?: ActivityData['details']
  position: { x: number; y: number }
}

function DayTooltip({ date, count, details, position }: DayTooltipProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed z-50 bg-background border border-border rounded-lg shadow-lg p-3 pointer-events-none"
      style={{
        left: position.x + 10,
        top: position.y - 10,
        transform: 'translateY(-100%)',
      }}
    >
      <p className="font-medium text-sm">
        {date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      </p>
      <p className="text-lg font-bold mt-1">{count} activités</p>
      {details && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs">
          <span className="text-muted-foreground">Créations:</span>
          <span className="font-medium">{details.created}</span>
          <span className="text-muted-foreground">Consultations:</span>
          <span className="font-medium">{details.viewed}</span>
          <span className="text-muted-foreground">Téléchargements:</span>
          <span className="font-medium">{details.downloaded}</span>
          <span className="text-muted-foreground">Mouvements:</span>
          <span className="font-medium">{details.moved}</span>
        </div>
      )}
    </motion.div>
  )
}

export function ActivityHeatmap({ data, className }: ActivityHeatmapProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [tooltip, setTooltip] = useState<DayTooltipProps | null>(null)

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  const weeks = useMemo(() => getWeeksInMonth(currentYear, currentMonth), [currentYear, currentMonth])

  const dataMap = useMemo(() => {
    const map = new Map<string, ActivityData>()
    data.forEach(d => map.set(d.date, d))
    return map
  }, [data])

  const maxCount = useMemo(() => {
    return Math.max(...data.map(d => d.count), 1)
  }, [data])

  const totalActivities = useMemo(() => {
    const monthData = data.filter(d => {
      const date = new Date(d.date)
      return date.getFullYear() === currentYear && date.getMonth() === currentMonth
    })
    return monthData.reduce((sum, d) => sum + d.count, 0)
  }, [data, currentYear, currentMonth])

  const activeDays = useMemo(() => {
    const monthData = data.filter(d => {
      const date = new Date(d.date)
      return date.getFullYear() === currentYear && date.getMonth() === currentMonth
    })
    return monthData.filter(d => d.count > 0).length
  }, [data, currentYear, currentMonth])

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const handleDayHover = (date: Date, event: React.MouseEvent<HTMLDivElement>) => {
    const dateStr = date.toISOString().split('T')[0]
    const dayData = dataMap.get(dateStr)

    if (dayData && dayData.count > 0) {
      setTooltip({
        date,
        count: dayData.count,
        details: dayData.details,
        position: { x: event.clientX, y: event.clientY },
      })
    }
  }

  const handleDayLeave = () => {
    setTooltip(null)
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Activité des archives</CardTitle>
            <CardDescription>
              {totalActivities.toLocaleString('fr-FR')} activités sur {activeDays} jours actifs
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Badge variant="outline" className="min-w-[140px] justify-center">
              {MONTHS[currentMonth]} {currentYear}
            </Badge>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Days header */}
        <div className="flex gap-1 mb-2 pl-8">
          {DAYS.map((day, i) => (
            <div
              key={day}
              className="flex-1 text-center text-xs text-muted-foreground"
            >
              {i % 2 === 1 ? day.slice(0, 2) : ''}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="space-y-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex gap-1">
              {/* Week number */}
              <div className="w-6 text-xs text-muted-foreground flex items-center justify-center">
                {weekIndex + 1}
              </div>
              {/* Days */}
              {week.map((day, dayIndex) => {
                const dateStr = day.toISOString().split('T')[0]
                const dayData = dataMap.get(dateStr)
                const count = dayData?.count || 0
                const isCurrentMonth = day.getMonth() === currentMonth
                const colorIndex = isCurrentMonth ? getColorIndex(count, maxCount) : 0

                return (
                  <div
                    key={dayIndex}
                    className={cn(
                      'flex-1 aspect-square rounded-sm transition-colors cursor-pointer',
                      COLORS[colorIndex],
                      !isCurrentMonth && 'opacity-30',
                      count > 0 && 'hover:ring-2 hover:ring-emerald-400'
                    )}
                    onMouseEnter={(e) => handleDayHover(day, e)}
                    onMouseLeave={handleDayLeave}
                  />
                )
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-muted-foreground">Moins</span>
          <div className="flex gap-1">
            {COLORS.map((color, i) => (
              <div
                key={i}
                className={cn('w-4 h-4 rounded-sm', color)}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">Plus</span>
        </div>

        {/* Tooltip */}
        <AnimatePresence>
          {tooltip && (
            <DayTooltip
              date={tooltip.date}
              count={tooltip.count}
              details={tooltip.details}
              position={tooltip.position}
            />
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
