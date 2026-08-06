'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, AlertTriangle, Clock, CheckCircle, Archive } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'

interface ArchiveItem {
  id: string
  reference: string
  title: string
  type: string
  typeName: string
  retentionEndDate: string
  daysLeft?: number
  status: string
  agencyName: string
}

interface RetentionCalendarProps {
  archives: ArchiveItem[]
  onDateClick?: (date: Date, archives: ArchiveItem[]) => void
  onArchiveClick?: (archive: ArchiveItem) => void
}

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
]

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export function RetentionCalendar({ archives, onDateClick, onArchiveClick }: RetentionCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month')

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  // Group archives by expiration date
  const archivesByDate = useMemo(() => {
    const grouped: Record<string, ArchiveItem[]> = {}
    archives.forEach(archive => {
      const dateKey = archive.retentionEndDate
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(archive)
    })
    return grouped
  }, [archives])

  // Get calendar days for the month view
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const daysInMonth = lastDay.getDate()
    
    // Get the first day of the week (0 = Sunday, 1 = Monday, etc.)
    let startDay = firstDay.getDay()
    startDay = startDay === 0 ? 6 : startDay - 1 // Convert to Monday-based
    
    const days: (Date | null)[] = []
    
    // Add empty cells for days before the first day
    for (let i = 0; i < startDay; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(currentYear, currentMonth, i))
    }
    
    return days
  }, [currentYear, currentMonth])

  // Get archives expiring on a specific date
  const getArchivesForDate = (date: Date): ArchiveItem[] => {
    const dateKey = date.toISOString().split('T')[0]
    return archivesByDate[dateKey] || []
  }

  // Get expiration status for a date
  const getDateStatus = (date: Date): 'red' | 'orange' | 'green' | 'none' => {
    const archives = getArchivesForDate(date)
    if (archives.length === 0) return 'none'
    
    const now = new Date()
    const diffDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays <= 30) return 'red'
    if (diffDays <= 90) return 'orange'
    return 'green'
  }

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  const handleDayClick = (date: Date) => {
    setSelectedDate(date)
    const archivesForDate = getArchivesForDate(date)
    onDateClick?.(date, archivesForDate)
  }

  const selectedDateArchives = selectedDate ? getArchivesForDate(selectedDate) : []

  // Year view summary
  const yearSummary = useMemo(() => {
    const summary: Record<number, { red: number; orange: number; green: number }> = {}
    for (let i = 0; i < 12; i++) {
      summary[i] = { red: 0, orange: 0, green: 0 }
    }
    
    archives.forEach(archive => {
      const date = new Date(archive.retentionEndDate)
      if (date.getFullYear() === currentYear) {
        const month = date.getMonth()
        const now = new Date()
        const diffDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        
        if (diffDays <= 30) summary[month].red++
        else if (diffDays <= 90) summary[month].orange++
        else summary[month].green++
      }
    })
    
    return summary
  }, [archives, currentYear])

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Calendrier des Échéances</CardTitle>
            <CardDescription>Visualisation des dates de fin de conservation</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'month' ? 'year' : 'month')}
            >
              {viewMode === 'month' ? 'Vue annuelle' : 'Vue mensuelle'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          {/* Calendar */}
          <div className="flex-1">
            {/* Navigation */}
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="icon" onClick={handlePreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-lg font-semibold">
                {MONTHS[currentMonth]} {currentYear}
              </h3>
              <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {viewMode === 'month' ? (
              <>
                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {WEEKDAYS.map(day => (
                    <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((date, index) => {
                    if (!date) {
                      return <div key={`empty-${index}`} className="h-12" />
                    }

                    const status = getDateStatus(date)
                    const archivesOnDate = getArchivesForDate(date)
                    const isToday = date.toDateString() === new Date().toDateString()
                    const isSelected = selectedDate?.toDateString() === date.toDateString()

                    return (
                      <motion.button
                        key={date.toISOString()}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDayClick(date)}
                        className={cn(
                          'h-12 rounded-lg flex flex-col items-center justify-center relative transition-colors',
                          isToday && 'ring-2 ring-primary ring-offset-2',
                          isSelected && 'bg-primary/10',
                          status === 'red' && 'bg-red-100 dark:bg-red-950 hover:bg-red-200 dark:hover:bg-red-900',
                          status === 'orange' && 'bg-orange-100 dark:bg-orange-950 hover:bg-orange-200 dark:hover:bg-orange-900',
                          status === 'green' && 'bg-green-100 dark:bg-green-950 hover:bg-green-200 dark:hover:bg-green-900',
                          status === 'none' && 'hover:bg-muted'
                        )}
                      >
                        <span className={cn(
                          'text-sm font-medium',
                          status === 'red' && 'text-red-700 dark:text-red-300',
                          status === 'orange' && 'text-orange-700 dark:text-orange-300',
                          status === 'green' && 'text-green-700 dark:text-green-300'
                        )}>
                          {date.getDate()}
                        </span>
                        {archivesOnDate.length > 0 && (
                          <span className={cn(
                            'absolute bottom-1 text-[10px] font-bold',
                            status === 'red' && 'text-red-600',
                            status === 'orange' && 'text-orange-600',
                            status === 'green' && 'text-green-600'
                          )}>
                            {archivesOnDate.length}
                          </span>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </>
            ) : (
              /* Year view */
              <div className="grid grid-cols-3 gap-3">
                {MONTHS.map((month, index) => {
                  const summary = yearSummary[index]
                  const total = summary.red + summary.orange + summary.green
                  
                  return (
                    <motion.button
                      key={month}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => {
                        setCurrentDate(new Date(currentYear, index, 1))
                        setViewMode('month')
                      }}
                      className={cn(
                        'p-3 rounded-lg border text-left transition-colors',
                        total > 0 ? 'bg-muted/50 hover:bg-muted' : 'hover:bg-muted/30'
                      )}
                    >
                      <div className="font-medium text-sm mb-2">{month}</div>
                      <div className="flex gap-1">
                        {summary.red > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {summary.red} critique
                          </Badge>
                        )}
                        {summary.orange > 0 && (
                          <Badge className="bg-orange-100 text-orange-700 text-xs">
                            {summary.orange}
                          </Badge>
                        )}
                        {summary.green > 0 && (
                          <Badge className="bg-green-100 text-green-700 text-xs">
                            {summary.green}
                          </Badge>
                        )}
                        {total === 0 && (
                          <span className="text-xs text-muted-foreground">Aucune échéance</span>
                        )}
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            )}

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-500" />
                <span className="text-xs text-muted-foreground">Ce mois</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-orange-500" />
                <span className="text-xs text-muted-foreground">3 mois</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500" />
                <span className="text-xs text-muted-foreground">6+ mois</span>
              </div>
            </div>
          </div>

          {/* Selected date details */}
          <div className="w-80 border-l pl-4">
            <h4 className="font-medium mb-3">
              {selectedDate ? (
                <>Archives du {formatDate(selectedDate.toISOString(), 'long')}</>
              ) : (
                'Sélectionnez une date'
              )}
            </h4>
            
            <AnimatePresence mode="wait">
              {selectedDate && selectedDateArchives.length > 0 ? (
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {selectedDateArchives.map((archive, index) => {
                      const daysLeft = archive.daysLeft ?? Math.floor(
                        (new Date(archive.retentionEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                      )
                      
                      return (
                        <motion.div
                          key={archive.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => onArchiveClick?.(archive)}
                          className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <Badge variant="outline" className="font-mono text-xs mb-1">
                                {archive.reference}
                              </Badge>
                              <p className="text-sm font-medium truncate">{archive.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {archive.agencyName}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <Badge className={cn(
                                'text-xs',
                                daysLeft <= 0 ? 'bg-red-100 text-red-700' :
                                daysLeft <= 30 ? 'bg-red-100 text-red-700' :
                                daysLeft <= 90 ? 'bg-orange-100 text-orange-700' :
                                'bg-green-100 text-green-700'
                              )}>
                                {daysLeft <= 0 ? 'Expiré' : `${daysLeft}j`}
                              </Badge>
                              {archive.daysLeft !== undefined && archive.daysLeft <= 30 && (
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </ScrollArea>
              ) : selectedDate ? (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                  <CheckCircle className="h-8 w-8 mb-2 text-green-500" />
                  <p className="text-sm">Aucune archive n'expire à cette date</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                  <Clock className="h-8 w-8 mb-2" />
                  <p className="text-sm">Cliquez sur une date pour voir les détails</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Summary stats component
export function RetentionCalendarStats({ archives }: { archives: ArchiveItem[] }) {
  const now = new Date()
  
  const stats = useMemo(() => {
    const thisMonth = archives.filter(a => {
      const diff = Math.floor((new Date(a.retentionEndDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return diff > 0 && diff <= 30
    }).length
    
    const in3Months = archives.filter(a => {
      const diff = Math.floor((new Date(a.retentionEndDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return diff > 30 && diff <= 90
    }).length
    
    const in6Months = archives.filter(a => {
      const diff = Math.floor((new Date(a.retentionEndDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return diff > 90 && diff <= 180
    }).length
    
    const expired = archives.filter(a => {
      const diff = Math.floor((new Date(a.retentionEndDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return diff <= 0
    }).length
    
    return { thisMonth, in3Months, in6Months, expired }
  }, [archives])

  return (
    <div className="grid grid-cols-4 gap-3">
      <Card className="border-l-4 border-l-red-500">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-muted-foreground">Ce mois</span>
          </div>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.thisMonth}</p>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-orange-500">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-muted-foreground">3 mois</span>
          </div>
          <p className="text-2xl font-bold text-orange-600 mt-1">{stats.in3Months}</p>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-green-500">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Archive className="h-4 w-4 text-green-500" />
            <span className="text-sm text-muted-foreground">6 mois</span>
          </div>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.in6Months}</p>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-gray-500">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Archive className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-muted-foreground">Expirées</span>
          </div>
          <p className="text-2xl font-bold text-gray-600 mt-1">{stats.expired}</p>
        </CardContent>
      </Card>
    </div>
  )
}
