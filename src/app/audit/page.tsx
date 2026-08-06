'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  History,
  Download,
  Filter,
  User,
  Clock,
  Eye,
  Edit,
  Trash2,
  Download as DownloadIcon,
  FileText,
  Shield,
  AlertTriangle,
  Globe,
  Search,
  Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { mockAuditLogs, mockUsers } from '@/data/mock-data'
import { AuditLog } from '@/store/archive-store'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const actionConfig: Record<string, { label: string; icon: typeof Eye; color: string; bgColor: string }> = {
  VIEW: { label: 'Consultation', icon: Eye, color: 'text-gray-600', bgColor: 'bg-gray-100 dark:bg-gray-800' },
  CREATE: { label: 'Création', icon: FileText, color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-950' },
  UPDATE: { label: 'Modification', icon: Edit, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-950' },
  DELETE: { label: 'Suppression', icon: Trash2, color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-950' },
  DOWNLOAD: { label: 'Téléchargement', icon: DownloadIcon, color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-950' },
  APPROVE: { label: 'Approbation', icon: Shield, color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-950' },
  REJECT: { label: 'Rejet', icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-950' },
  PRINT: { label: 'Impression', icon: FileText, color: 'text-gray-600', bgColor: 'bg-gray-100 dark:bg-gray-800' },
}

export default function AuditPage() {
  const [selectedAction, setSelectedAction] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()

  const filteredLogs = useMemo(() => {
    return mockAuditLogs.filter(log => {
      if (selectedAction !== 'all' && log.action !== selectedAction) return false
      if (selectedUser !== 'all' && log.userId !== selectedUser) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (!log.userName.toLowerCase().includes(query) &&
            !log.archiveReference?.toLowerCase().includes(query) &&
            !log.details?.toLowerCase().includes(query)) {
          return false
        }
      }
      if (dateFrom && new Date(log.createdAt) < dateFrom) return false
      if (dateTo && new Date(log.createdAt) > dateTo) return false
      return true
    })
  }, [selectedAction, selectedUser, searchQuery, dateFrom, dateTo])

  const sensitiveCount = filteredLogs.filter(l => l.isSensitive).length

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit & Traçabilité</h1>
          <p className="text-muted-foreground">
            Journal complet des actions et événements système
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950">
                <History className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total actions</p>
                <p className="text-2xl font-bold">{filteredLogs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-950">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Actions sensibles</p>
                <p className="text-2xl font-bold">{sensitiveCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950">
                <DownloadIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Téléchargements</p>
                <p className="text-2xl font-bold">{filteredLogs.filter(l => l.action === 'DOWNLOAD').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950">
                <User className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Utilisateurs actifs</p>
                <p className="text-2xl font-bold">{new Set(filteredLogs.map(l => l.userId)).size}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par utilisateur, archive..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type d'action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les actions</SelectItem>
                <SelectItem value="VIEW">Consultation</SelectItem>
                <SelectItem value="CREATE">Création</SelectItem>
                <SelectItem value="UPDATE">Modification</SelectItem>
                <SelectItem value="DELETE">Suppression</SelectItem>
                <SelectItem value="DOWNLOAD">Téléchargement</SelectItem>
                <SelectItem value="APPROVE">Approbation</SelectItem>
                <SelectItem value="REJECT">Rejet</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Utilisateur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les utilisateurs</SelectItem>
                {mockUsers.map(user => (
                  <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  {dateFrom || dateTo ? 'Période définie' : 'Période'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-4 space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Du</p>
                    <CalendarComponent
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      locale={fr}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Au</p>
                    <CalendarComponent
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      locale={fr}
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {(selectedAction !== 'all' || selectedUser !== 'all' || searchQuery || dateFrom || dateTo) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedAction('all')
                  setSelectedUser('all')
                  setSearchQuery('')
                  setDateFrom(undefined)
                  setDateTo(undefined)
                }}
              >
                Réinitialiser
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Logs list */}
      <Card>
        <CardHeader>
          <CardTitle>Journal des actions</CardTitle>
          <CardDescription>
            {filteredLogs.length} entrée{filteredLogs.length > 1 ? 's' : ''} trouvée{filteredLogs.length > 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <div className="divide-y">
              {filteredLogs.map((log, index) => {
                const config = actionConfig[log.action] || actionConfig.VIEW
                const Icon = config.icon

                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn('p-2 rounded-lg', config.bgColor)}>
                        <Icon className={cn('h-5 w-5', config.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={cn('text-xs', config.color)}>
                            {config.label}
                          </Badge>
                          {log.isSensitive && (
                            <Badge variant="destructive" className="text-xs">
                              Sensible
                            </Badge>
                          )}
                          {log.archiveReference && (
                            <Badge variant="secondary" className="font-mono text-xs">
                              {log.archiveReference}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm">{log.details || `${config.label} sur ${log.entityType}`}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {log.userName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(log.createdAt, 'long')}
                          </span>
                          {log.ipAddress && (
                            <span className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {log.ipAddress}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Détails
                      </Button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
