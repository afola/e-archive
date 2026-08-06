'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  FileText,
  Edit,
  Eye,
  Download,
  Trash2,
  GitBranch,
  CheckCircle,
  XCircle,
  ArrowRightLeft,
  Package,
  Filter,
  X,
  RotateCcw,
  Calendar,
  User,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export interface TimelineFilters {
  eventTypes: string[]
  startDate?: string
  endDate?: string
  actor?: string
}

interface TimelineFiltersProps {
  filters: TimelineFilters
  onFiltersChange: (filters: TimelineFilters) => void
  onReset: () => void
}

const eventTypes = [
  { id: 'document_created', label: 'Documents créés', icon: FileText, color: 'text-emerald-600' },
  { id: 'document_modified', label: 'Modifications', icon: Edit, color: 'text-blue-600' },
  { id: 'document_viewed', label: 'Consultations', icon: Eye, color: 'text-gray-600' },
  { id: 'document_downloaded', label: 'Téléchargements', icon: Download, color: 'text-purple-600' },
  { id: 'document_deleted', label: 'Suppressions', icon: Trash2, color: 'text-red-600' },
  { id: 'workflow_started', label: 'Workflows initiés', icon: GitBranch, color: 'text-amber-600' },
  { id: 'workflow_approved', label: 'Approbations', icon: CheckCircle, color: 'text-emerald-600' },
  { id: 'workflow_rejected', label: 'Rejets', icon: XCircle, color: 'text-red-600' },
  { id: 'movement_created', label: 'Mouvements créés', icon: ArrowRightLeft, color: 'text-teal-600' },
  { id: 'movement_executed', label: 'Mouvements exécutés', icon: Package, color: 'text-indigo-600' },
]

export function TimelineFiltersPanel({ filters, onFiltersChange, onReset }: TimelineFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleEventTypeChange = (typeId: string, checked: boolean) => {
    const newTypes = checked
      ? [...filters.eventTypes, typeId]
      : filters.eventTypes.filter(t => t !== typeId)
    onFiltersChange({ ...filters, eventTypes: newTypes })
  }

  const handleDateChange = (field: 'startDate' | 'endDate', date: Date | undefined) => {
    onFiltersChange({
      ...filters,
      [field]: date ? format(date, 'yyyy-MM-dd') : undefined,
    })
  }

  const activeFiltersCount = 
    filters.eventTypes.length + 
    (filters.startDate ? 1 : 0) + 
    (filters.endDate ? 1 : 0) + 
    (filters.actor ? 1 : 0)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtres
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} actif{activeFiltersCount > 1 ? 's' : ''}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Réduire' : 'Étendre'}
            </Button>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="text-muted-foreground"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Réinitialiser
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Event Types */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Types d&apos;événements</Label>
          <div className={cn(
            'grid gap-2',
            isExpanded ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-3'
          )}>
            {eventTypes.map((type) => {
              const Icon = type.icon
              const isSelected = filters.eventTypes.includes(type.id)
              
              return (
                <div
                  key={type.id}
                  className={cn(
                    'flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all',
                    isSelected 
                      ? 'bg-primary/5 border-primary/30' 
                      : 'hover:bg-muted border-transparent'
                  )}
                  onClick={() => handleEventTypeChange(type.id, !isSelected)}
                >
                  <Checkbox
                    id={type.id}
                    checked={isSelected}
                    onCheckedChange={(checked) => handleEventTypeChange(type.id, checked as boolean)}
                    className="data-[state=checked]:bg-primary"
                  />
                  <Icon className={cn('h-4 w-4', type.color)} />
                  <Label htmlFor={type.id} className="text-sm cursor-pointer truncate">
                    {type.label}
                  </Label>
                </div>
              )
            })}
          </div>
        </div>

        {isExpanded && (
          <>
            <Separator />
            
            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Date de début</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !filters.startDate && 'text-muted-foreground'
                      )}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      {filters.startDate 
                        ? format(new Date(filters.startDate), 'dd MMMM yyyy', { locale: fr })
                        : 'Sélectionner...'
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={filters.startDate ? new Date(filters.startDate) : undefined}
                      onSelect={(date) => handleDateChange('startDate', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-2 block">Date de fin</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !filters.endDate && 'text-muted-foreground'
                      )}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      {filters.endDate 
                        ? format(new Date(filters.endDate), 'dd MMMM yyyy', { locale: fr })
                        : 'Sélectionner...'
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={filters.endDate ? new Date(filters.endDate) : undefined}
                      onSelect={(date) => handleDateChange('endDate', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Actor Filter */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Acteur</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nom de l'acteur..."
                  value={filters.actor || ''}
                  onChange={(e) => onFiltersChange({ ...filters, actor: e.target.value || undefined })}
                  className="pl-10"
                />
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export function TimelineFiltersBar({ filters, onFiltersChange, onReset }: TimelineFiltersProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Quick filters */}
      <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
        {eventTypes.slice(0, 4).map((type) => {
          const Icon = type.icon
          const isSelected = filters.eventTypes.includes(type.id)
          return (
            <Button
              key={type.id}
              variant={isSelected ? 'default' : 'ghost'}
              size="sm"
              className="h-8 gap-1"
              onClick={() => {
                const newTypes = isSelected
                  ? filters.eventTypes.filter(t => t !== type.id)
                  : [...filters.eventTypes, type.id]
                onFiltersChange({ ...filters, eventTypes: newTypes })
              }}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{type.label.split(' ')[0]}</span>
            </Button>
          )
        })}
      </div>

      {/* Active filters badges */}
      {filters.eventTypes.length > 4 && (
        <Badge variant="outline">
          +{filters.eventTypes.length - 4} autres
        </Badge>
      )}
      
      {filters.startDate && (
        <Badge variant="secondary" className="gap-1">
          Depuis {format(new Date(filters.startDate), 'dd/MM/yy')}
          <X 
            className="h-3 w-3 cursor-pointer" 
            onClick={() => onFiltersChange({ ...filters, startDate: undefined })}
          />
        </Badge>
      )}
      
      {filters.actor && (
        <Badge variant="secondary" className="gap-1">
          {filters.actor}
          <X 
            className="h-3 w-3 cursor-pointer" 
            onClick={() => onFiltersChange({ ...filters, actor: undefined })}
          />
        </Badge>
      )}

      {activeFiltersCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-8 text-muted-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1" />
          Réinitialiser
        </Button>
      )}
    </div>
  )
}
