'use client'

import { motion } from 'framer-motion'
import { 
  Activity, 
  User, 
  FileText, 
  ArrowRightLeft, 
  Download,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface Activity {
  id: string
  type: 'create' | 'update' | 'view' | 'download' | 'move' | 'borrow' | 'return' | 'approve' | 'reject' | 'alert'
  title: string
  description?: string
  user: string
  timestamp: string
  archiveRef?: string
}

interface ActivityFeedProps {
  activities: Activity[]
  maxItems?: number
  className?: string
}

const activityConfig: Record<string, { icon: typeof Activity; color: string; bgColor: string }> = {
  create: { icon: FileText, color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-950' },
  update: { icon: Edit, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-950' },
  view: { icon: Eye, color: 'text-gray-600', bgColor: 'bg-gray-100 dark:bg-gray-800' },
  download: { icon: Download, color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-950' },
  move: { icon: ArrowRightLeft, color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-950' },
  borrow: { icon: FileText, color: 'text-teal-600', bgColor: 'bg-teal-100 dark:bg-teal-950' },
  return: { icon: ArrowRightLeft, color: 'text-indigo-600', bgColor: 'bg-indigo-100 dark:bg-indigo-950' },
  approve: { icon: CheckCircle, color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-950' },
  reject: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-950' },
  alert: { icon: AlertTriangle, color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-950' },
}

export function ActivityFeed({ activities, maxItems = 10, className }: ActivityFeedProps) {
  const displayActivities = activities.slice(0, maxItems)

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Activité récente
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="p-4 space-y-3">
            {displayActivities.map((activity, index) => {
              const config = activityConfig[activity.type] || activityConfig.view
              const Icon = config.icon

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className={cn('p-1.5 rounded-full', config.bgColor)}>
                    <Icon className={cn('h-3.5 w-3.5', config.color)} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{activity.title}</p>
                    {activity.archiveRef && (
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">
                        {activity.archiveRef}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        {activity.user}
                      </div>
                      <span className="text-xs text-muted-foreground">•</span>
                      <time className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.timestamp), { 
                          addSuffix: true, 
                          locale: fr 
                        })}
                      </time>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

// Generate mock activities
export function generateMockActivities(): Activity[] {
  const now = new Date()
  
  return [
    { id: '1', type: 'download', title: 'Document téléchargé', user: 'Thomas Leroy', timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString(), archiveRef: 'ARC-CREDIT-000042' },
    { id: '2', type: 'approve', title: 'Demande approuvée', description: 'Emprunt approuvé', user: 'Marie Martin', timestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString(), archiveRef: 'ARC-KYC-000015' },
    { id: '3', type: 'view', title: 'Archive consultée', user: 'Sophie Petit', timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(), archiveRef: 'ARC-LEGAL-000028' },
    { id: '4', type: 'create', title: 'Nouvelle archive créée', user: 'Pierre Bernard', timestamp: new Date(now.getTime() - 45 * 60 * 1000).toISOString(), archiveRef: 'ARC-CONTRACT-000055' },
    { id: '5', type: 'alert', title: 'Alerte de conservation', description: 'Archive arrivant à échéance', user: 'Système', timestamp: new Date(now.getTime() - 60 * 60 * 1000).toISOString(), archiveRef: 'ARC-HR-000012' },
    { id: '6', type: 'move', title: 'Archive transférée', description: 'Transfert Lyon → Paris', user: 'Marie Martin', timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), archiveRef: 'ARC-CREDIT-000038' },
    { id: '7', type: 'return', title: 'Archive restituée', user: 'Claire Dubois', timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(), archiveRef: 'ARC-KYC-000022' },
    { id: '8', type: 'update', title: 'Métadonnées mises à jour', user: 'Luc Moreau', timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(), archiveRef: 'ARC-LEGAL-000019' },
    { id: '9', type: 'borrow', title: 'Emprunt demandé', user: 'Thomas Leroy', timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(), archiveRef: 'ARC-CREDIT-000041' },
    { id: '10', type: 'reject', title: 'Demande rejetée', description: 'Destruction non autorisée', user: 'Sophie Petit', timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(), archiveRef: 'ARC-KYC-000033' },
    { id: '11', type: 'view', title: 'Archive consultée', user: 'Jean Dupont', timestamp: new Date(now.getTime() - 7 * 60 * 60 * 1000).toISOString(), archiveRef: 'ARC-COMMITTEE-000005' },
    { id: '12', type: 'download', title: 'Document téléchargé', user: 'Claire Dubois', timestamp: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(), archiveRef: 'ARC-TRANSACTION-000089' },
  ]
}
