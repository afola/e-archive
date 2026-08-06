'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  Download,
  Calendar,
  FileText,
  Building2,
  Users,
  TrendingUp,
  ArrowRightLeft,
  Clock,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { mockArchives, mockMovements, archiveTypes, mockAgencies, monthlyMovements, archivesByStatus } from '@/data/mock-data'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

// Generate report data
const reportsByType = archiveTypes.map(type => ({
  name: type.name,
  count: mockArchives.filter(a => a.type === type.code).length,
}))

const reportsByAgency = mockAgencies.map(agency => ({
  name: agency.name.split(' ').slice(0, 2).join(' '),
  count: mockArchives.filter(a => a.agencyId === agency.id).length,
}))

const validationDelays = [
  { type: 'Emprunt', avgDays: 2.3, targetDays: 3 },
  { type: 'Destruction', avgDays: 5.1, targetDays: 7 },
  { type: 'Transfert', avgDays: 3.8, targetDays: 5 },
  { type: 'Consultation', avgDays: 1.2, targetDays: 2 },
]

const restitutionStats = [
  { label: 'Dans les délais', value: 85, color: '#10b981' },
  { label: 'Léger retard (<7j)', value: 10, color: '#f59e0b' },
  { label: 'Retard important', value: 5, color: '#ef4444' },
]

export default function ReportsPage() {
  const [period, setPeriod] = useState('month')

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Rapports & Statistiques</h1>
          <p className="text-muted-foreground">
            Analyses et indicateurs de performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="quarter">Ce trimestre</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter PDF
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Exporter Excel
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nouvelles archives</p>
                <p className="text-2xl font-bold">+127</p>
                <p className="text-xs text-emerald-600">+12% vs période préc.</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950">
                <ArrowRightLeft className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mouvements</p>
                <p className="text-2xl font-bold">342</p>
                <p className="text-xs text-emerald-600">+8% vs période préc.</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950">
                <Clock className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Délai moyen validation</p>
                <p className="text-2xl font-bold">2.4j</p>
                <p className="text-xs text-emerald-600">-15% vs période préc.</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Taux restitution</p>
                <p className="text-2xl font-bold">94%</p>
                <p className="text-xs text-emerald-600">+3% vs période préc.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volume by type */}
        <Card>
          <CardHeader>
            <CardTitle>Volumétrie par type d'archive</CardTitle>
            <CardDescription>Répartition des archives par catégorie</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportsByType}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Volume by agency */}
        <Card>
          <CardHeader>
            <CardTitle>Volumétrie par agence</CardTitle>
            <CardDescription>Répartition géographique des archives</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportsByAgency}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="count"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {reportsByAgency.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly evolution */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution mensuelle</CardTitle>
            <CardDescription>Mouvements d'archives sur l'année</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyMovements}>
                  <defs>
                    <linearGradient id="colorEntries" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="entries" name="Entrées" stroke="#3b82f6" fillOpacity={1} fill="url(#colorEntries)" />
                  <Area type="monotone" dataKey="exits" name="Sorties" stroke="#f59e0b" fillOpacity={1} fill="url(#colorExits)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Validation delays */}
        <Card>
          <CardHeader>
            <CardTitle>Délais de validation</CardTitle>
            <CardDescription>Temps moyen par type de demande</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={validationDelays} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" unit=" jours" />
                  <YAxis dataKey="type" type="category" className="text-xs" width={80} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avgDays" name="Délai moyen" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="targetDays" name="Objectif" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Restitution stats */}
        <Card>
          <CardHeader>
            <CardTitle>Taux de restitution dans les délais</CardTitle>
            <CardDescription>Conformité des retours d'emprunt</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {restitutionStats.map((stat) => (
                <div key={stat.label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{stat.label}</span>
                    <span className="font-bold">{stat.value}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.value}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: stat.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top agencies */}
        <Card>
          <CardHeader>
            <CardTitle>Top agences par volumétrie</CardTitle>
            <CardDescription>Classement des agences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportsByAgency
                .sort((a, b) => b.count - a.count)
                .slice(0, 5)
                .map((agency, index) => (
                  <motion.div
                    key={agency.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{agency.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{agency.count}</p>
                      <p className="text-xs text-muted-foreground">archives</p>
                    </div>
                  </motion.div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
