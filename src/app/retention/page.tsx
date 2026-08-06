'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Shield,
  AlertTriangle,
  Clock,
  CheckCircle,
  Trash2,
  ArrowRight,
  FileText,
  Calendar,
  Download,
  Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RetentionAlertCard } from '@/components/archive/retention-alert-card'
import { mockArchives, archiveTypes, retentionAlerts } from '@/data/mock-data'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

// Retention rules
const retentionRules = archiveTypes.map(type => ({
  id: type.id,
  archiveType: type.name,
  retentionYears: type.retentionYears,
  description: `Les documents de type ${type.name} doivent être conservés pendant ${type.retentionYears} ans`,
  alertDays: 90,
  autoDestroy: false,
}))

// Generate archives near expiration
const archivesNearExpiration = mockArchives
  .map(a => {
    const retentionEnd = new Date(a.retentionEndDate)
    const now = new Date()
    const daysLeft = Math.floor((retentionEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return { ...a, daysLeft }
  })
  .filter(a => a.daysLeft > 0 && a.daysLeft <= 180)
  .sort((a, b) => a.daysLeft - b.daysLeft)

// Generate expired archives
const expiredArchives = mockArchives
  .map(a => {
    const retentionEnd = new Date(a.retentionEndDate)
    const now = new Date()
    const daysLeft = Math.floor((retentionEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return { ...a, daysLeft }
  })
  .filter(a => a.daysLeft <= 0)

export default function RetentionPage() {
  const [selectedTab, setSelectedTab] = useState('alerts')

  const complianceStats = {
    totalArchives: mockArchives.length,
    inRetention: mockArchives.length - archivesNearExpiration.length - expiredArchives.length,
    nearExpiration: archivesNearExpiration.length,
    expired: expiredArchives.length,
    destroyedThisMonth: 5,
    transferredThisMonth: 3,
  }

  const complianceRate = Math.round(
    ((complianceStats.totalArchives - complianceStats.expired) / complianceStats.totalArchives) * 100
  )

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Conservation & Conformité</h1>
          <p className="text-muted-foreground">
            Gestion des durées de conservation et respect des réglementations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Rapport de conformité
          </Button>
          <Button size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Nouvelle règle
          </Button>
        </div>
      </div>

      {/* Compliance overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Taux de conformité</span>
              <Shield className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold">{complianceRate}%</div>
            <Progress value={complianceRate} className="h-2 mt-2" />
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">À échéance proche</p>
                <p className="text-2xl font-bold">{complianceStats.nearExpiration}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expirées</p>
                <p className="text-2xl font-bold">{complianceStats.expired}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Détruites ce mois</span>
                <span className="font-bold">{complianceStats.destroyedThisMonth}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Transférées ce mois</span>
                <span className="font-bold">{complianceStats.transferredThisMonth}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="alerts" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alertes
            {retentionAlerts.length > 0 && (
              <Badge variant="destructive" className="ml-1">{retentionAlerts.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="expired" className="gap-2">
            <Clock className="h-4 w-4" />
            Expirées
          </TabsTrigger>
          <TabsTrigger value="rules" className="gap-2">
            <FileText className="h-4 w-4" />
            Règles de conservation
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <Calendar className="h-4 w-4" />
            Historique
          </TabsTrigger>
        </TabsList>

        {/* Alerts tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Archives nécessitant une action</CardTitle>
              <CardDescription>
                Ces archives arrivent en fin de période de conservation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {retentionAlerts.map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={cn(
                      'border-l-4',
                      alert.daysLeft <= 7 ? 'border-l-red-500' :
                      alert.daysLeft <= 30 ? 'border-l-amber-500' :
                      'border-l-blue-500'
                    )}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="outline" className="font-mono text-xs">
                            {alert.archiveRef}
                          </Badge>
                          <Badge className={cn(
                            alert.daysLeft <= 7 ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' :
                            alert.daysLeft <= 30 ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' :
                            'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                          )}>
                            {alert.daysLeft} jour{alert.daysLeft > 1 ? 's' : ''} restant{alert.daysLeft > 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium mb-2 line-clamp-2">{alert.title}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {alert.action === 'DESTRUCTION' ? (
                              <><Trash2 className="h-3 w-3 mr-1" /> Destruction</>
                            ) : alert.action === 'TRANSFER' ? (
                              <><ArrowRight className="h-3 w-3 mr-1" /> Transfert</>
                            ) : (
                              <><FileText className="h-3 w-3 mr-1" /> Révision</>
                            )}
                          </Badge>
                          <Button variant="outline" size="sm" className="ml-auto">
                            Traiter
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expired tab */}
        <TabsContent value="expired" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Archives expirées</CardTitle>
              <CardDescription>
                Ces archives ont dépassé leur durée de conservation légale
              </CardDescription>
            </CardHeader>
            <CardContent>
              {expiredArchives.length > 0 ? (
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr className="border-b">
                        <th className="text-left p-3 text-xs font-medium text-muted-foreground">Référence</th>
                        <th className="text-left p-3 text-xs font-medium text-muted-foreground">Titre</th>
                        <th className="text-left p-3 text-xs font-medium text-muted-foreground">Type</th>
                        <th className="text-left p-3 text-xs font-medium text-muted-foreground">Fin conservation</th>
                        <th className="text-left p-3 text-xs font-medium text-muted-foreground">Jours dépassés</th>
                        <th className="text-right p-3 text-xs font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expiredArchives.slice(0, 10).map((archive) => (
                        <tr key={archive.id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="p-3 font-mono text-sm">{archive.reference}</td>
                          <td className="p-3 text-sm max-w-xs truncate">{archive.title}</td>
                          <td className="p-3"><Badge variant="outline" className="text-xs">{archive.typeName}</Badge></td>
                          <td className="p-3 text-sm">{formatDate(archive.retentionEndDate)}</td>
                          <td className="p-3">
                            <Badge variant="destructive" className="text-xs">
                              {Math.abs(archive.daysLeft)}j dépassés
                            </Badge>
                          </td>
                          <td className="p-3 text-right">
                            <Button variant="outline" size="sm">Demander destruction</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-emerald-500" />
                  <p>Aucune archive expirée</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rules tab */}
        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Règles de conservation</CardTitle>
              <CardDescription>
                Configuration des durées de conservation par type d'archive
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr className="border-b">
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Type d'archive</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Durée de conservation</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Alerte (jours avant)</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Auto-destruction</th>
                      <th className="text-right p-3 text-xs font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {retentionRules.map((rule) => (
                      <tr key={rule.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="p-3 font-medium">{rule.archiveType}</td>
                        <td className="p-3">
                          <Badge variant="outline">{rule.retentionYears} ans</Badge>
                        </td>
                        <td className="p-3 text-sm">{rule.alertDays} jours</td>
                        <td className="p-3">
                          {rule.autoDestroy ? (
                            <Badge className="bg-red-100 text-red-700">Activée</Badge>
                          ) : (
                            <Badge variant="secondary">Désactivée</Badge>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <Button variant="ghost" size="sm">Modifier</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique des destructions et transferts</CardTitle>
              <CardDescription>
                Liste des archives détruites ou transférées vers les archives historiques
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-lg border">
                    <div className={cn(
                      'p-2 rounded-lg',
                      i % 2 === 0 ? 'bg-red-100 dark:bg-red-950' : 'bg-blue-100 dark:bg-blue-950'
                    )}>
                      {i % 2 === 0 ? (
                        <Trash2 className="h-5 w-5 text-red-600" />
                      ) : (
                        <ArrowRight className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="font-mono text-xs">
                          ARC-KYC-{String(i + 1).padStart(6, '0')}
                        </Badge>
                        <Badge className={cn(
                          'text-xs',
                          i % 2 === 0 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        )}>
                          {i % 2 === 0 ? 'Destruction' : 'Transfert'}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium">Documents KYC - Client #{i + 1}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Exécuté par Marie Martin le {formatDate(new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(), 'long')}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Détails
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
