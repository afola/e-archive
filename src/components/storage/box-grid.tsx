'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Package, QrCode, AlertTriangle, CheckCircle, Plus, Archive } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { StorageLocation } from '@/data/storage-data'

interface BoxGridProps {
  boxes: StorageLocation[]
  selectedBoxId: string | null
  onSelectBox: (box: StorageLocation) => void
  onAddBox?: () => void
}

function getFillLevelColor(fillLevel: number): string {
  if (fillLevel >= 90) return 'bg-red-500'
  if (fillLevel >= 80) return 'bg-orange-500'
  if (fillLevel >= 60) return 'bg-amber-500'
  if (fillLevel >= 40) return 'bg-yellow-500'
  return 'bg-green-500'
}

function getFillLevelBg(fillLevel: number): string {
  if (fillLevel >= 90) return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
  if (fillLevel >= 80) return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
  if (fillLevel >= 60) return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
  if (fillLevel >= 40) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
  return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
}

function getFillLevelText(fillLevel: number): string {
  if (fillLevel >= 90) return 'text-red-700 dark:text-red-400'
  if (fillLevel >= 80) return 'text-orange-700 dark:text-orange-400'
  if (fillLevel >= 60) return 'text-amber-700 dark:text-amber-400'
  if (fillLevel >= 40) return 'text-yellow-700 dark:text-yellow-400'
  return 'text-green-700 dark:text-green-400'
}

function BoxCard({
  box,
  isSelected,
  onClick,
}: {
  box: StorageLocation
  isSelected: boolean
  onClick: () => void
}) {
  const isNearFull = box.fillLevel >= 80
  const isFull = box.fillLevel >= 90

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={cn(
                'cursor-pointer transition-all duration-200 relative overflow-hidden',
                isSelected
                  ? 'ring-2 ring-blue-500 ring-offset-2'
                  : 'hover:shadow-md',
                getFillLevelBg(box.fillLevel),
                'border'
              )}
              onClick={onClick}
            >
              {/* Fill level indicator bar at top */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-700">
                <div
                  className={cn('h-full transition-all duration-300', getFillLevelColor(box.fillLevel))}
                  style={{ width: `${box.fillLevel}%` }}
                />
              </div>

              <CardContent className="p-3 pt-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'p-1.5 rounded-md',
                      isFull ? 'bg-red-100 dark:bg-red-900/40' : 
                      isNearFull ? 'bg-orange-100 dark:bg-orange-900/40' : 
                      'bg-slate-100 dark:bg-slate-800'
                    )}>
                      <Package className={cn(
                        'h-4 w-4',
                        isFull ? 'text-red-600' : 
                        isNearFull ? 'text-orange-600' : 
                        'text-slate-600 dark:text-slate-400'
                      )} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{box.code}</p>
                      <p className="text-xs text-muted-foreground truncate">{box.currentLoad}/{box.capacity} docs</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {isFull && (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                    {box.hasQrCode && (
                      <QrCode className="h-3.5 w-3.5 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Remplissage</span>
                    <span className={cn('text-xs font-medium', getFillLevelText(box.fillLevel))}>
                      {box.fillLevel}%
                    </span>
                  </div>
                  <Progress 
                    value={box.fillLevel} 
                    className="h-1.5"
                  />
                </div>

                {/* Status indicator */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      'text-[10px]',
                      box.isActive 
                        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400' 
                        : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                    )}
                  >
                    {box.isActive ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Actif
                      </>
                    ) : (
                      'Inactif'
                    )}
                  </Badge>
                  
                  {box.fillLevel >= 80 && (
                    <Badge variant="destructive" className="text-[10px]">
                      {box.fillLevel >= 90 ? 'Plein' : 'Presque plein'}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium truncate">{box.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {box.site} / {box.building} / {box.room} / {box.shelf}
            </p>
            <p className="text-xs">
              {box.currentLoad} documents sur {box.capacity} capacity
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function BoxGrid({
  boxes,
  selectedBoxId,
  onSelectBox,
  onAddBox,
}: BoxGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Sort boxes by fill level (highest first for attention)
  const sortedBoxes = [...boxes].sort((a, b) => b.fillLevel - a.fillLevel)

  // Group boxes by fill status
  const fullBoxes = sortedBoxes.filter(b => b.fillLevel >= 80)
  const normalBoxes = sortedBoxes.filter(b => b.fillLevel < 80 && b.fillLevel >= 40)
  const emptyBoxes = sortedBoxes.filter(b => b.fillLevel < 40)

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-muted-foreground">Plein ({fullBoxes.length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-muted-foreground">Moyen ({normalBoxes.length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-muted-foreground">Libre ({emptyBoxes.length})</span>
          </div>
        </div>
        
        {onAddBox && (
          <Button size="sm" onClick={onAddBox}>
            <Plus className="h-4 w-4 mr-1" />
            Ajouter boîte
          </Button>
        )}
      </div>

      {/* Grid of boxes */}
      {boxes.length === 0 ? (
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <Archive className="h-12 w-12 text-slate-300 mb-4" />
            <p className="text-muted-foreground">Aucune boîte dans cet emplacement</p>
            {onAddBox && (
              <Button variant="outline" size="sm" className="mt-4" onClick={onAddBox}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une boîte
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {sortedBoxes.map((box) => (
            <BoxCard
              key={box.id}
              box={box}
              isSelected={selectedBoxId === box.id}
              onClick={() => onSelectBox(box)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
