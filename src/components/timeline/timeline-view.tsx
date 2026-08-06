'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format, startOfDay, endOfDay, eachDayOfInterval, subDays, addDays, isToday, isSameDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  GripVertical,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { TimelineEventType, eventConfig } from './timeline-event'

interface TimelineViewProps {
  events: TimelineEventType[]
  onEventClick?: (event: TimelineEventType) => void
  selectedEventId?: string
  className?: string
}

export function TimelineView({ events, onEventClick, selectedEventId, className }: TimelineViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1) // 0.5 to 2
  const [scrollPosition, setScrollPosition] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, scrollLeft: 0 })

  // Calculate date range from events
  const eventDates = events.map(e => new Date(e.timestamp))
  const minDate = eventDates.length > 0 
    ? startOfDay(new Date(Math.min(...eventDates.map(d => d.getTime()))))
    : startOfDay(subDays(new Date(), 30))
  const maxDate = eventDates.length > 0
    ? endOfDay(new Date(Math.max(...eventDates.map(d => d.getTime()))))
    : endOfDay(new Date())

  // Add padding days
  const startDate = subDays(minDate, 7)
  const endDate = addDays(maxDate, 7)

  // Generate days
  const days = eachDayOfInterval({ start: startDate, end: endDate })

  // Group events by day
  const eventsByDay = new Map<string, TimelineEventType[]>()
  events.forEach(event => {
    const dayKey = format(new Date(event.timestamp), 'yyyy-MM-dd')
    const existing = eventsByDay.get(dayKey) || []
    existing.push(event)
    eventsByDay.set(dayKey, existing)
  })

  // Calculate day width based on zoom
  const dayWidth = Math.max(60, 80 * zoom)
  const totalWidth = days.length * dayWidth

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    setIsDragging(true)
    setDragStart({
      x: e.clientX,
      scrollLeft: containerRef.current.scrollLeft,
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return
    e.preventDefault()
    const x = e.clientX
    const walk = (x - dragStart.x) * 1.5
    containerRef.current.scrollLeft = dragStart.scrollLeft - walk
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Scroll to today on mount
  useEffect(() => {
    if (containerRef.current) {
      const todayIndex = days.findIndex(d => isToday(d))
      if (todayIndex >= 0) {
        containerRef.current.scrollLeft = todayIndex * dayWidth - containerRef.current.clientWidth / 2
      }
    }
  }, [])

  // Navigate to date
  const navigateToDate = (date: Date) => {
    if (!containerRef.current) return
    const index = days.findIndex(d => isSameDay(d, date))
    if (index >= 0) {
      containerRef.current.scrollTo({
        left: index * dayWidth - containerRef.current.clientWidth / 2,
        behavior: 'smooth',
      })
    }
  }

  // Navigate left/right
  const navigateLeft = () => {
    if (!containerRef.current) return
    containerRef.current.scrollBy({ left: -300, behavior: 'smooth' })
  }

  const navigateRight = () => {
    if (!containerRef.current) return
    containerRef.current.scrollBy({ left: 300, behavior: 'smooth' })
  }

  // Zoom handlers
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 2))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5))

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Timeline
            <Badge variant="secondary" className="ml-2">
              {events.length} événement{events.length !== 1 ? 's' : ''}
            </Badge>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* Navigation */}
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={navigateLeft}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateToDate(new Date())}
                className="gap-1"
              >
                <Clock className="h-3.5 w-3.5" />
                Aujourd&apos;hui
              </Button>
              <Button variant="ghost" size="icon" onClick={navigateRight}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6 mx-2" />

            {/* Zoom controls */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleZoomOut} disabled={zoom <= 0.5}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Slider
                value={[zoom]}
                min={0.5}
                max={2}
                step={0.25}
                onValueChange={([value]) => setZoom(value)}
                className="w-20"
              />
              <Button variant="ghost" size="icon" onClick={handleZoomIn} disabled={zoom >= 2}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div
          ref={containerRef}
          className={cn(
            'relative overflow-x-auto overflow-y-hidden',
            'cursor-grab active:cursor-grabbing',
            'select-none'
          )}
          style={{ height: '300px' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div style={{ width: totalWidth, minWidth: '100%', position: 'relative', height: '100%' }}>
            {/* Timeline line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border" />

            {/* Today indicator */}
            {days.map((day, index) => {
              if (!isToday(day)) return null
              return (
                <div
                  key="today"
                  className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-20"
                  style={{ left: index * dayWidth + dayWidth / 2 }}
                >
                  <div className="absolute -top-0 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded whitespace-nowrap">
                    Aujourd&apos;hui
                  </div>
                </div>
              )
            })}

            {/* Days */}
            {days.map((day, index) => {
              const dayKey = format(day, 'yyyy-MM-dd')
              const dayEvents = eventsByDay.get(dayKey) || []
              const isCurrentDay = isToday(day)
              const isWeekend = [0, 6].includes(day.getDay())

              return (
                <div
                  key={dayKey}
                  className={cn(
                    'absolute top-0 bottom-0',
                    isWeekend && 'bg-muted/30',
                    isCurrentDay && 'bg-blue-500/5'
                  )}
                  style={{ left: index * dayWidth, width: dayWidth }}
                >
                  {/* Date header */}
                  <div className={cn(
                    'absolute top-2 left-0 right-0 text-center',
                    isCurrentDay && 'font-bold text-blue-600'
                  )}>
                    <div className="text-xs text-muted-foreground">
                      {format(day, 'EEE', { locale: fr })}
                    </div>
                    <div className={cn(
                      'text-sm',
                      isCurrentDay && 'text-blue-600'
                    )}>
                      {format(day, 'd')}
                    </div>
                  </div>

                  {/* Events */}
                  <div className="absolute top-16 bottom-4 left-0 right-0 flex flex-col items-center gap-2 overflow-hidden">
                    {dayEvents.slice(0, 5).map((event, eventIndex) => {
                      const config = eventConfig[event.type] || eventConfig.document_viewed
                      const Icon = config.icon
                      const isSelected = event.id === selectedEventId

                      return (
                        <motion.div
                          key={event.id}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: eventIndex * 0.05 }}
                          className="relative group"
                        >
                          <button
                            onClick={() => onEventClick?.(event)}
                            className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                              'hover:scale-125 hover:shadow-lg',
                              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                              config.bgColor,
                              isSelected && 'ring-2 ring-primary ring-offset-2'
                            )}
                          >
                            <Icon className={cn('h-4 w-4', config.color)} />
                          </button>

                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                            <Card className="w-48 shadow-lg pointer-events-auto">
                              <CardContent className="p-2">
                                <Badge variant="outline" className={cn('text-xs mb-1', config.color)}>
                                  {config.label}
                                </Badge>
                                <p className="text-xs font-medium truncate">{event.entityTitle}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {event.actor.name}
                                </p>
                              </CardContent>
                            </Card>
                          </div>
                        </motion.div>
                      )
                    })}
                    {dayEvents.length > 5 && (
                      <Badge variant="secondary" className="text-xs">
                        +{dayEvents.length - 5}
                      </Badge>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Timeline info bar */}
        <div className="border-t px-4 py-2 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4" />
            <span>Glisser pour naviguer</span>
          </div>
          <div>
            {format(startDate, 'd MMM yyyy', { locale: fr })} - {format(endDate, 'd MMM yyyy', { locale: fr })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Vertical timeline variant
export function TimelineViewVertical({ events, onEventClick, selectedEventId, className }: TimelineViewProps) {
  return (
    <ScrollArea className={cn('h-[600px]', className)}>
      <div className="relative space-y-0 p-4">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

        {events.map((event, index) => {
          const config = eventConfig[event.type] || eventConfig.document_viewed
          const Icon = config.icon
          const isSelected = event.id === selectedEventId

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02 }}
              className={cn(
                'relative flex gap-4 pb-6',
                isSelected && 'bg-primary/5 -mx-2 px-2 rounded-lg'
              )}
            >
              {/* Icon */}
              <button
                onClick={() => onEventClick?.(event)}
                className={cn(
                  'relative z-10 flex items-center justify-center w-12 h-12 rounded-full shrink-0',
                  'hover:scale-110 transition-transform',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                  config.bgColor
                )}
              >
                <Icon className={cn('h-5 w-5', config.color)} />
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Badge variant="outline" className={cn('mb-1', config.color)}>
                      {config.label}
                    </Badge>
                    <p className="font-medium">{event.description}</p>
                    <p className="text-sm text-muted-foreground truncate">{event.entityTitle}</p>
                  </div>
                  <time className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(event.timestamp), 'dd/MM/yyyy HH:mm', { locale: fr })}
                  </time>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground">Par {event.actor.name}</span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </ScrollArea>
  )
}
