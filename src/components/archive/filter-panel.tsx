'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronDown, 
  Filter, 
  X, 
  Calendar, 
  Building2, 
  Shield, 
  FileText,
  Search,
  RotateCcw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { ArchiveFilters, ArchiveStatus, ConfidentialityLevel } from '@/store/archive-store'
import { archiveTypes, mockAgencies } from '@/data/mock-data'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface AdvancedFilterPanelProps {
  filters: ArchiveFilters
  onFiltersChange: (filters: ArchiveFilters) => void
  onReset: () => void
  className?: string
}

const statusOptions: { value: ArchiveStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ON_LOAN', label: 'En prêt' },
  { value: 'IN_TRANSFER', label: 'En transfert' },
  { value: 'PENDING_DESTRUCTION', label: 'Destruction en attente' },
  { value: 'DESTROYED', label: 'Détruite' },
  { value: 'ARCHIVED', label: 'Archivée' },
  { value: 'EXPIRED', label: 'Expirée' },
]

const confidentialityOptions: { value: ConfidentialityLevel; label: string }[] = [
  { value: 'PUBLIC', label: 'Public' },
  { value: 'NORMAL', label: 'Normal' },
  { value: 'CONFIDENTIAL', label: 'Confidentiel' },
  { value: 'SECRET', label: 'Secret' },
  { value: 'TOP_SECRET', label: 'Très Secret' },
]

export function AdvancedFilterPanel({ 
  filters, 
  onFiltersChange, 
  onReset,
  className 
}: AdvancedFilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [dateFromOpen, setDateFromOpen] = useState(false)
  const [dateToOpen, setDateToOpen] = useState(false)

  const activeFilterCount = Object.values(filters).filter(v => 
    v && (Array.isArray(v) ? v.length > 0 : v !== '')
  ).length

  const updateFilter = (key: keyof ArchiveFilters, value: unknown) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const removeFilter = (key: keyof ArchiveFilters) => {
    const newFilters = { ...filters }
    if (key === 'hasDigitalCopy') {
      newFilters[key] = undefined
    } else if (Array.isArray(newFilters[key])) {
      newFilters[key] = []
    } else {
      newFilters[key] = ''
    }
    onFiltersChange(newFilters)
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Quick Search */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par référence, client, compte..."
            value={filters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(isExpanded && 'bg-accent')}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtres
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2 px-1.5 py-0 text-xs">
              {activeFilterCount}
            </Badge>
          )}
          <ChevronDown className={cn(
            'h-4 w-4 ml-2 transition-transform',
            isExpanded && 'rotate-180'
          )} />
        </Button>

        {activeFilterCount > 0 && (
          <Button variant="ghost" onClick={onReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Status Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <FileText className="h-3 w-3" />
                    Statut
                  </label>
                  <Select
                    value={filters.status?.[0] || ''}
                    onValueChange={(v) => updateFilter('status', v ? [v as ArchiveStatus] : [])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les statuts" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Type Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <FileText className="h-3 w-3" />
                    Type d'archive
                  </label>
                  <Select
                    value={filters.type?.[0] || ''}
                    onValueChange={(v) => updateFilter('type', v ? [v] : [])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les types" />
                    </SelectTrigger>
                    <SelectContent>
                      {archiveTypes.map((type) => (
                        <SelectItem key={type.id} value={type.code}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Agency Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Building2 className="h-3 w-3" />
                    Agence
                  </label>
                  <Select
                    value={filters.agency?.[0] || ''}
                    onValueChange={(v) => updateFilter('agency', v ? [v] : [])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les agences" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockAgencies.map((agency) => (
                        <SelectItem key={agency.id} value={agency.id}>
                          {agency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Confidentiality Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Shield className="h-3 w-3" />
                    Confidentialité
                  </label>
                  <Select
                    value={filters.confidentiality?.[0] || ''}
                    onValueChange={(v) => updateFilter('confidentiality', v ? [v as ConfidentialityLevel] : [])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les niveaux" />
                    </SelectTrigger>
                    <SelectContent>
                      {confidentialityOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date From */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    Date document (du)
                  </label>
                  <Popover open={dateFromOpen} onOpenChange={setDateFromOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        {filters.dateFrom ? (
                          format(new Date(filters.dateFrom), 'dd/MM/yyyy', { locale: fr })
                        ) : (
                          <span className="text-muted-foreground">Sélectionner</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={filters.dateFrom ? new Date(filters.dateFrom) : undefined}
                        onSelect={(date) => {
                          updateFilter('dateFrom', date?.toISOString().split('T')[0] || '')
                          setDateFromOpen(false)
                        }}
                        locale={fr}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Date To */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    Date document (au)
                  </label>
                  <Popover open={dateToOpen} onOpenChange={setDateToOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        {filters.dateTo ? (
                          format(new Date(filters.dateTo), 'dd/MM/yyyy', { locale: fr })
                        ) : (
                          <span className="text-muted-foreground">Sélectionner</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={filters.dateTo ? new Date(filters.dateTo) : undefined}
                        onSelect={(date) => {
                          updateFilter('dateTo', date?.toISOString().split('T')[0] || '')
                          setDateToOpen(false)
                        }}
                        locale={fr}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Client Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Nom client
                  </label>
                  <Input
                    placeholder="Rechercher..."
                    value={filters.clientName || ''}
                    onChange={(e) => updateFilter('clientName', e.target.value)}
                  />
                </div>

                {/* Account Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    N° Compte
                  </label>
                  <Input
                    placeholder="Rechercher..."
                    value={filters.accountNumber || ''}
                    onChange={(e) => updateFilter('accountNumber', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Recherche: {filters.search}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => removeFilter('search')}
              />
            </Badge>
          )}
          {filters.status && filters.status.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              Statut: {statusOptions.find(s => s.value === filters.status?.[0])?.label}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => removeFilter('status')}
              />
            </Badge>
          )}
          {filters.type && filters.type.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              Type: {archiveTypes.find(t => t.code === filters.type?.[0])?.name}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => removeFilter('type')}
              />
            </Badge>
          )}
          {filters.agency && filters.agency.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              Agence: {mockAgencies.find(a => a.id === filters.agency?.[0])?.name}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => removeFilter('agency')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
