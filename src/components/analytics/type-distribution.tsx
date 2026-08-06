'use client'

import { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TypeDistributionData {
  name: string
  code: string
  value: number
  percentage: number
  color: string
}

interface TypeDistributionProps {
  data: TypeDistributionData[]
  className?: string
}

interface ActiveShapeProps {
  cx: number
  cy: number
  innerRadius: number
  outerRadius: number
  startAngle: number
  endAngle: number
  fill: string
  payload: TypeDistributionData
  percent: number
}

const renderActiveShape = (props: ActiveShapeProps) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
  } = props

  return (
    <g>
      <text x={cx} y={cy - 10} textAnchor="middle" fill="currentColor" className="text-sm font-medium">
        {payload.name}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="currentColor" className="text-lg font-bold">
        {payload.value.toLocaleString('fr-FR')}
      </text>
      <text x={cx} y={cy + 30} textAnchor="middle" fill="currentColor" className="text-xs text-muted-foreground">
        {`${(percent * 100).toFixed(1)}%`}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 12}
        outerRadius={outerRadius + 16}
        fill={fill}
      />
    </g>
  )
}

// Custom tooltip component - defined outside to avoid recreation on each render
function TypeTooltip({ active, payload, onItemClick }: { active?: boolean; payload?: { payload: TypeDistributionData }[]; onItemClick: (code: string) => void }) {
  if (!active || !payload || !payload[0]) return null

  const item = payload[0].payload
  return (
    <div className="bg-background border border-border rounded-lg shadow-lg p-3">
      <div className="flex items-center gap-2 mb-1">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: item.color }}
        />
        <span className="font-medium text-sm">{item.name}</span>
      </div>
      <div className="text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{item.value.toLocaleString('fr-FR')}</span> archives
      </div>
      <div className="text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{item.percentage.toFixed(1)}%</span> du total
      </div>
      <Button
        variant="link"
        size="sm"
        className="h-auto p-0 mt-1 text-xs"
        onClick={() => onItemClick(item.code)}
      >
        Voir les archives →
      </Button>
    </div>
  )
}

export function TypeDistribution({ data, className }: TypeDistributionProps) {
  const router = useRouter()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const total = data.reduce((sum, item) => sum + item.value, 0)

  const handleItemClick = (code: string) => {
    router.push(`/archives?type=${code}`)
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle>Répartition par type</CardTitle>
        <CardDescription>Distribution des {total.toLocaleString('fr-FR')} archives</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                activeIndex={activeIndex ?? undefined}
                activeShape={activeIndex !== null ? renderActiveShape : undefined}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                onClick={(_, index) => handleItemClick(data[index].code)}
                className="cursor-pointer"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<TypeTooltip onItemClick={handleItemClick} />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          {data.map((item, index) => (
            <button
              key={item.code}
              onClick={() => handleItemClick(item.code)}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              className={cn(
                'flex items-center gap-2 p-2 rounded-lg text-left text-sm',
                'hover:bg-muted/50 transition-colors cursor-pointer'
              )}
            >
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.value.toLocaleString('fr-FR')} ({item.percentage.toFixed(1)}%)
                </p>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
