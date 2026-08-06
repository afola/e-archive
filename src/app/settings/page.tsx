'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Settings as SettingsIcon,
  Building2,
  FileText,
  Shield,
  Bell,
  Database,
  Globe,
  Key,
  Mail,
  Save,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { archiveTypes, mockAgencies } from '@/data/mock-data'

const statusWorkflow = [
  { value: 'DRAFT', label: 'Brouillon' },
  { value: 'SUBMITTED', label: 'Soumis' },
  { value: 'IN_VALIDATION', label: 'En validation' },
  { value: 'APPROVED', label: 'Approuvé' },
  { value: 'REJECTED', label: 'Rejeté' },
  { value: 'EXECUTED', label: 'Exécuté' },
  { value: 'CLOSED', label: 'Clôturé' },
]

const confidentialityLevels = [
  { value: 'PUBLIC', label: 'Public', color: 'bg-gray-100' },
  { value: 'NORMAL', label: 'Normal', color: 'bg-blue-100' },
  { value: 'CONFIDENTIAL', label: 'Confidentiel', color: 'bg-amber-100' },
  { value: 'SECRET', label: 'Secret', color: 'bg-red-100' },
  { value: 'TOP_SECRET', label: 'Très Secret', color: 'bg-red-200' },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Paramètres</h1>
          <p className="text-muted-foreground">
            Configuration du système d'archives
          </p>
        </div>
        <Button size="sm">
          <Save className="h-4 w-4 mr-2" />
          Enregistrer
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 h-auto">
          <TabsTrigger value="general" className="gap-2 py-2">
            <SettingsIcon className="h-4 w-4" />
            Général
          </TabsTrigger>
          <TabsTrigger value="archives" className="gap-2 py-2">
            <FileText className="h-4 w-4" />
            Archives
          </TabsTrigger>
          <TabsTrigger value="workflow" className="gap-2 py-2">
            <Shield className="h-4 w-4" />
            Workflow
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2 py-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2 py-2">
            <Database className="h-4 w-4" />
            Système
          </TabsTrigger>
        </TabsList>

        {/* General settings */}
        <TabsContent value="general">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations de l'entité</CardTitle>
                <CardDescription>Paramètres généraux de la banque</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nom de l'entité</Label>
                  <Input defaultValue="Banque Nationale de France" />
                </div>
                <div className="space-y-2">
                  <Label>Code établissement</Label>
                  <Input defaultValue="BNF-001" />
                </div>
                <div className="space-y-2">
                  <Label>Adresse</Label>
                  <Textarea defaultValue="1 Place de l'Opéra, 75002 Paris" rows={2} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Téléphone</Label>
                    <Input defaultValue="+33 1 42 60 00 00" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input defaultValue="archives@bnf.fr" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Localisations</CardTitle>
                <CardDescription>Gestion des sites et emplacements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Site Paris Central</p>
                    <p className="text-xs text-muted-foreground">Site principal - 15 000 boîtes</p>
                  </div>
                  <Badge>Principal</Badge>
                </div>
                {mockAgencies.slice(1, 4).map((agency) => (
                  <div key={agency.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{agency.name}</p>
                      <p className="text-xs text-muted-foreground">{agency.city}</p>
                    </div>
                    <Button variant="ghost" size="sm">Modifier</Button>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  <Building2 className="h-4 w-4 mr-2" />
                  Ajouter un site
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Archives settings */}
        <TabsContent value="archives">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Types d'archives</CardTitle>
                <CardDescription>Configuration des types de documents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {archiveTypes.slice(0, 6).map((type) => (
                    <div key={type.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
                        <div>
                          <p className="font-medium text-sm">{type.name}</p>
                          <p className="text-xs text-muted-foreground">Conservation: {type.retentionYears} ans</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">Modifier</Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Ajouter un type
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Niveaux de confidentialité</CardTitle>
                <CardDescription>Classification des documents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {confidentialityLevels.map((level) => (
                  <div key={level.value} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={cn('w-3 h-3 rounded-full', level.color)} />
                      <span className="font-medium text-sm">{level.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch defaultChecked />
                      <Button variant="ghost" size="sm">Config</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Workflow settings */}
        <TabsContent value="workflow">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Statuts de workflow</CardTitle>
                <CardDescription>Cycle de vie des demandes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {statusWorkflow.map((status, index) => (
                    <motion.div
                      key={status.value}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-3 border rounded-lg"
                    >
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium text-sm">{status.label}</span>
                      <Badge variant="outline" className="ml-auto font-mono text-xs">{status.value}</Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Matrice de validation</CardTitle>
                <CardDescription>Niveaux d'approbation requis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">Emprunt</span>
                    <div className="flex gap-1">
                      <Badge variant="outline">N+1</Badge>
                      <Badge variant="outline">Archiviste</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">Destruction</span>
                    <div className="flex gap-1">
                      <Badge variant="outline">N+1</Badge>
                      <Badge variant="outline">Conformité</Badge>
                      <Badge variant="outline">Manager</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">Transfert</span>
                    <div className="flex gap-1">
                      <Badge variant="outline">N+1</Badge>
                      <Badge variant="outline">Archiviste</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">Consultation confidentielle</span>
                    <div className="flex gap-1">
                      <Badge variant="outline">N+1</Badge>
                      <Badge variant="outline">Conformité</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications settings */}
        <TabsContent value="notifications">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Alertes automatiques</CardTitle>
                <CardDescription>Notifications système</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Fin de conservation proche', description: '90, 60, 30 jours avant échéance', enabled: true },
                  { label: 'Demande en attente', description: 'Notification quotidienne aux valideurs', enabled: true },
                  { label: 'Retard de restitution', description: 'Archive non restituée après échéance', enabled: true },
                  { label: 'Actions sensibles', description: 'Téléchargement de documents confidentiels', enabled: true },
                  { label: 'Nouveaux utilisateurs', description: 'Notification aux administrateurs', enabled: false },
                ].map((alert, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{alert.label}</p>
                      <p className="text-xs text-muted-foreground">{alert.description}</p>
                    </div>
                    <Switch defaultChecked={alert.enabled} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configuration email</CardTitle>
                <CardDescription>Paramètres du serveur SMTP</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Serveur SMTP</Label>
                  <Input defaultValue="smtp.banque.fr" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Port</Label>
                    <Input defaultValue="587" />
                  </div>
                  <div className="space-y-2">
                    <Label>Chiffrement</Label>
                    <Select defaultValue="tls">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tls">TLS</SelectItem>
                        <SelectItem value="ssl">SSL</SelectItem>
                        <SelectItem value="none">Aucun</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Expéditeur</Label>
                  <Input defaultValue="archives@banque.fr" />
                </div>
                <Button variant="outline" className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Tester la configuration
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System settings */}
        <TabsContent value="system">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations système</CardTitle>
                <CardDescription>Version et état du système</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Version</p>
                    <p className="font-bold">1.0.0</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Environnement</p>
                    <p className="font-bold">Production</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Base de données</p>
                    <p className="font-bold">PostgreSQL 15</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Stockage</p>
                    <p className="font-bold">2.4 TB / 5 TB</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Vérifier les mises à jour
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Journal système</CardTitle>
                <CardDescription>Logs et événements récents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs font-mono">
                  <div className="p-2 bg-muted rounded flex items-start gap-2">
                    <Badge variant="outline" className="text-xs">INFO</Badge>
                    <span>2024-01-16 10:30 - Sauvegarde automatique terminée</span>
                  </div>
                  <div className="p-2 bg-muted rounded flex items-start gap-2">
                    <Badge className="bg-amber-100 text-amber-700 text-xs">WARN</Badge>
                    <span>2024-01-16 10:15 - Espace disque à 48%</span>
                  </div>
                  <div className="p-2 bg-muted rounded flex items-start gap-2">
                    <Badge variant="outline" className="text-xs">INFO</Badge>
                    <span>2024-01-16 09:00 - Service démarré</span>
                  </div>
                  <div className="p-2 bg-muted rounded flex items-start gap-2">
                    <Badge className="bg-red-100 text-red-700 text-xs">ERROR</Badge>
                    <span>2024-01-15 23:45 - Échec connexion SMTP</span>
                  </div>
                </div>
                <Button variant="ghost" className="w-full mt-4">
                  Voir tous les logs
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function cn(...args: (string | boolean | undefined)[]) {
  return args.filter(Boolean).join(' ')
}
