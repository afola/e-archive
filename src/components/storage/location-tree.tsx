'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  Building,
  DoorOpen,
  Archive,
  Package,
  ChevronRight,
  ChevronDown,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  QrCode,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { StorageLocation } from '@/data/storage-data'

interface LocationTreeProps {
  locations: StorageLocation[]
  selectedLocation: StorageLocation | null
  onSelectLocation: (location: StorageLocation) => void
  onAddLocation?: (parentId: string, type: StorageLocation['type']) => void
  onEditLocation?: (location: StorageLocation) => void
  onDeleteLocation?: (location: StorageLocation) => void
}

const typeConfig: Record<StorageLocation['type'], { icon: typeof Building2; color: string; label: string }> = {
  SITE: { icon: Building2, color: 'text-blue-600', label: 'Site' },
  BUILDING: { icon: Building, color: 'text-purple-600', label: 'Bâtiment' },
  ROOM: { icon: DoorOpen, color: 'text-orange-600', label: 'Salle' },
  SHELF: { icon: Archive, color: 'text-emerald-600', label: 'Rayon' },
  BOX: { icon: Package, color: 'text-amber-600', label: 'Boîte' },
}

function TreeNode({
  location,
  level,
  selectedId,
  expandedIds,
  onSelect,
  onToggle,
  onAdd,
  onEdit,
  onDelete,
}: {
  location: StorageLocation
  level: number
  selectedId: string | null
  expandedIds: Set<string>
  onSelect: (location: StorageLocation) => void
  onToggle: (id: string) => void
  onAdd?: (parentId: string, type: StorageLocation['type']) => void
  onEdit?: (location: StorageLocation) => void
  onDelete?: (location: StorageLocation) => void
}) {
  const hasChildren = location.children && location.children.length > 0
  const isExpanded = expandedIds.has(location.id)
  const isSelected = selectedId === location.id
  const config = typeConfig[location.type]
  const Icon = config.icon

  const getNextType = (currentType: StorageLocation['type']): StorageLocation['type'] | null => {
    const types: StorageLocation['type'][] = ['SITE', 'BUILDING', 'ROOM', 'SHELF', 'BOX']
    const index = types.indexOf(currentType)
    return index < types.length - 1 ? types[index + 1] : null
  }

  const nextType = getNextType(location.type)

  return (
    <div className="select-none">
      <div
        className={cn(
          'flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer transition-colors group',
          isSelected ? 'bg-blue-100 dark:bg-blue-900/30' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => onSelect(location)}
      >
        {/* Expand/Collapse button */}
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggle(location.id)
            }}
            className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-slate-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-500" />
            )}
          </button>
        ) : (
          <span className="w-5" />
        )}

        {/* Icon */}
        <Icon className={cn('h-4 w-4 shrink-0', config.color)} />

        {/* Name */}
        <span className="flex-1 text-sm truncate">{location.name}</span>

        {/* Fill level badge for boxes */}
        {location.type === 'BOX' && (
          <Badge
            variant="outline"
            className={cn(
              'text-[10px] px-1.5 py-0 h-4',
              location.fillLevel >= 80
                ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400'
                : location.fillLevel >= 50
                  ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400'
                  : 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400'
            )}
          >
            {location.fillLevel}%
          </Badge>
        )}

        {/* QR indicator */}
        {location.hasQrCode && (
          <QrCode className="h-3.5 w-3.5 text-slate-400" />
        )}

        {/* Actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {nextType && onAdd && (
              <DropdownMenuItem onClick={() => onAdd(location.id, nextType)}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter {typeConfig[nextType].label.toLowerCase()}
              </DropdownMenuItem>
            )}
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(location)}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {onDelete && (
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => onDelete(location)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Children */}
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {location.children!.map((child) => (
              <TreeNode
                key={child.id}
                location={child}
                level={level + 1}
                selectedId={selectedId}
                expandedIds={expandedIds}
                onSelect={onSelect}
                onToggle={onToggle}
                onAdd={onAdd}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function LocationTree({
  locations,
  selectedLocation,
  onSelectLocation,
  onAddLocation,
  onEditLocation,
  onDeleteLocation,
}: LocationTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['site-001', 'bld-001', 'room-001']))

  const handleToggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const expandAll = () => {
    const allIds = new Set<string>()
    const collectIds = (items: StorageLocation[]) => {
      items.forEach((item) => {
        if (item.children && item.children.length > 0) {
          allIds.add(item.id)
          collectIds(item.children)
        }
      })
    }
    collectIds(locations)
    setExpandedIds(allIds)
  }

  const collapseAll = () => {
    setExpandedIds(new Set())
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <h3 className="text-sm font-medium">Emplacements</h3>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={expandAll}>
            Tout ouvrir
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={collapseAll}>
            Tout fermer
          </Button>
        </div>
      </div>

      {/* Tree */}
      <ScrollArea className="flex-1">
        <div className="py-2">
          {locations.map((location) => (
            <TreeNode
              key={location.id}
              location={location}
              level={0}
              selectedId={selectedLocation?.id || null}
              expandedIds={expandedIds}
              onSelect={onSelectLocation}
              onToggle={handleToggle}
              onAdd={onAddLocation}
              onEdit={onEditLocation}
              onDelete={onDeleteLocation}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
