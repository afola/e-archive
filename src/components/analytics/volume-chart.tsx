'use client'

import { useState } from 'react'
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface VolumeDataPoint {
  period: string
  actual?: number
  predicted?: number
  lower?: number
  upper?: number
}

interface VolumeChartProps {
  data: VolumeDataPoint[]
  predictions?: VolumeDataPoint[]
  archiveTypes?: { code: string; name: string; color: string }[]
  className?: string
}

const COLORS = {
  actual: '#3b82f6',
  predicted: '#8b5cf6',
  predictionArea: 'rgba(139, 92, 246, 0.1)',
  confidence: 'rgba(139, 92, 246, 0.3)',
}

// Custom tooltip component - defined outside to avoid recreation on each render
function VolumeTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload) return null

  return (
    <div className="bg-background border border-border rounded-lg shadow-lg p-3">
      <p className="font-medium text-sm mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-xs">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium">{entry.value.toLocaleString('fr-FR')}</span>
        </div>
      ))}
    </div>
  )
}

export function VolumeChart({ data, predictions = [], archiveTypes = [], className }: VolumeChartProps) {
  const [viewMode, setViewMode] = useState<'bar' | 'line'>('line')
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('month')
  const [selectedType, setSelectedType] = useState<string>('all')

  const combinedData = [...data, ...predictions]

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Volumétrie des archives</CardTitle>
            <CardDescription>Évolution et prévisions sur la période</CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={groupBy} onValueChange={(v) => setGroupBy(v as typeof groupBy)}>
              <SelectTrigger className="w-[120px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Par jour</SelectItem>
                <SelectItem value="week">Par semaine</SelectItem>
                <SelectItem value="month">Par mois</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[150px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {archiveTypes.map((type) => (
                  <SelectItem key={type.code} value={type.code}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)}>
              <TabsList className="h-8">
                <TabsTrigger value="line" className="text-xs px-3">Ligne</TabsTrigger>
                <TabsTrigger value="bar" className="text-xs px-3">Barres</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === 'line' ? (
              <LineChart data={combinedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="predictionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.predictionArea} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.predictionArea} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="period"
                  className="text-xs"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<VolumeTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="actual"
                  name="Réel"
                  stroke={COLORS.actual}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  name="Prévision"
                  stroke={COLORS.predicted}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 3, strokeDasharray: '' }}
                />
                {predictions.length > 0 && (
                  <ReferenceLine
                    x={data[data.length - 1]?.period}
                    stroke="#6b7280"
                    strokeDasharray="3 3"
                    label={{ value: "Aujourd'hui", position: 'top', fontSize: 10 }}
                  />
                )}
              </LineChart>
            ) : (
              <BarChart data={combinedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="period"
                  className="text-xs"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<VolumeTooltip />} />
                <Legend />
                <Bar
                  dataKey="actual"
                  name="Réel"
                  fill={COLORS.actual}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="predicted"
                  name="Prévision"
                  fill={COLORS.predicted}
                  radius={[4, 4, 0, 0]}
                  opacity={0.6}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Prediction confidence legend */}
        {predictions.length > 0 && (
          <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-blue-500" />
              <span>Données réelles</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-purple-500 border-dashed border-b-2 border-purple-500" style={{ borderStyle: 'dashed' }} />
              <span>Prévisions (IC 95%)</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
