'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Archive,
  FileCheck,
  AlertTriangle,
  Clock,
  TrendingUp,
  ArrowRightLeft,
  Users,
  Building2,
  MoreVertical,
  RefreshCw,
  Download,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { KPICard } from '@/components/archive/kpi-card'
import { StatusBadge } from '@/components/archive/status-badge'
import { RetentionAlertCard, RetentionAlertSummary } from '@/components/archive/retention-alert-card'
import { ActivityFeed, generateMockActivities } from '@/components/archive/activity-feed'
import {
  mockKPIData,
  archiveVolumeByType,
  monthlyMovements,
  archivesByAgency,
  archivesByStatus,
  topUsers,
  retentionAlerts,
  mockWorkflows,
} from '@/data/mock-data'
import { formatBytes } from '@/lib/utils'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#dc2626']

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState('month')
  const activities = generateMockActivities()

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble des archives et activités
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <KPICard
          title="Total Archives"
          value={mockKPIData.totalArchives}
          icon={Archive}
          trend={{ value: 12, isPositive: true }}
          color="blue"
        />
        <KPICard
          title="Archives Actives"
          value={mockKPIData.activeArchives}
          icon={FileCheck}
          subtitle={`${Math.round((mockKPIData.activeArchives / mockKPIData.totalArchives) * 100)}% du total`}
          color="green"
        />
        <KPICard
          title="En Prêt"
          value={mockKPIData.onLoanArchives}
          icon={ArrowRightLeft}
          color="amber"
        />
        <KPICard
          title="Échéances Proches"
          value={mockKPIData.expiringArchives}
          icon={AlertTriangle}
          subtitle="Dans les 90 jours"
          color="red"
        />
        <KPICard
          title="Demandes en attente"
          value={mockKPIData.pendingValidation}
          icon={Clock}
          color="purple"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Movements Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Évolution des mouvements</CardTitle>
                <CardDescription>Entrées et sorties mensuelles</CardDescription>
              </div>
              <Tabs value={timeRange} onValueChange={setTimeRange}>
                <TabsList className="h-8">
                  <TabsTrigger value="week" className="text-xs px-3">Semaine</TabsTrigger>
                  <TabsTrigger value="month" className="text-xs px-3">Mois</TabsTrigger>
                  <TabsTrigger value="year" className="text-xs px-3">Année</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
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
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="entries"
                    name="Entrées"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorEntries)"
                  />
                  <Area
                    type="monotone"
                    dataKey="exits"
                    name="Sorties"
                    stroke="#f59e0b"
                    fillOpacity={1}
                    fill="url(#colorExits)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Archives by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition par statut</CardTitle>
            <CardDescription>État actuel des archives</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={archivesByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {archivesByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {archivesByStatus.map((item, index) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Archives by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Volumétrie par type</CardTitle>
            <CardDescription>Répartition des archives</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={archiveVolumeByType} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="name" type="category" width={100} className="text-xs" tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {archiveVolumeByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Retention Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Alertes de conservation
                  <Badge variant="destructive" className="ml-2">
                    {retentionAlerts.length}
                  </Badge>
                </CardTitle>
                <CardDescription>Archives nécessitant une action</CardDescription>
              </div>
            </div>
            <RetentionAlertSummary alerts={retentionAlerts} />
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[300px]">
              <div className="p-4 pt-0">
                <RetentionAlertCard alerts={retentionAlerts} />
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <ActivityFeed activities={activities} maxItems={12} />
      </div>

      {/* Third Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Archives by Agency */}
        <Card>
          <CardHeader>
            <CardTitle>Archives par agence</CardTitle>
            <CardDescription>Répartition géographique</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {archivesByAgency.map((agency, index) => {
                const percentage = (agency.value / mockKPIData.totalArchives) * 100
                return (
                  <div key={agency.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{agency.name}</span>
                      <span className="text-muted-foreground">{agency.value} archives</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Users */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Top utilisateurs</CardTitle>
                <CardDescription>Plus grande activité ce mois</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topUsers.map((user, index) => (
                <motion.div
                  key={user.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{user.actions}</p>
                    <p className="text-xs text-muted-foreground">actions</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Requests */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Demandes en attente</CardTitle>
              <CardDescription>Workflows nécessitant votre attention</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              Voir tout
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Référence</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Type</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Demandeur</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Priorité</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Statut</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Échéance</th>
                  <th className="text-right p-3 text-xs font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockWorkflows.slice(0, 5).map((workflow) => (
                  <tr key={workflow.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="p-3">
                      <span className="font-mono text-sm">{workflow.archiveReference || 'N/A'}</span>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className="text-xs">{workflow.type}</Badge>
                    </td>
                    <td className="p-3 text-sm">{workflow.requesterName}</td>
                    <td className="p-3">
                      <Badge 
                        variant={
                          workflow.priority === 'URGENT' ? 'destructive' : 
                          workflow.priority === 'HIGH' ? 'default' : 
                          'secondary'
                        }
                        className="text-xs"
                      >
                        {workflow.priority}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <StatusBadge status={workflow.status as any} size="sm" />
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {workflow.dueDate ? new Date(workflow.dueDate).toLocaleDateString('fr-FR') : '-'}
                    </td>
                    <td className="p-3 text-right">
                      <Button variant="ghost" size="sm">
                        Traiter
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
