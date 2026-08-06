'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileCheck,
  Plus,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Calendar,
  ArrowRight,
  MessageSquare,
  Send,
  X,
  FileText,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { WorkflowStepper, WorkflowStepperCompact } from '@/components/archive/workflow-stepper'
import { mockWorkflows, mockUsers, mockArchives, archiveTypes } from '@/data/mock-data'
import { WorkflowRequest, WorkflowStatus, WorkflowType } from '@/store/archive-store'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

const workflowTypeConfig = {
  BORROW: { label: 'Emprunt', color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-950' },
  CONSULTATION: { label: 'Consultation', color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-950' },
  DESTRUCTION: { label: 'Destruction', color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-950' },
  TRANSFER: { label: 'Transfert', color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-950' },
  MODIFICATION: { label: 'Modification', color: 'text-teal-600', bgColor: 'bg-teal-100 dark:bg-teal-950' },
}

const workflowStatusConfig: Record<WorkflowStatus, { label: string; icon: typeof Clock; color: string }> = {
  DRAFT: { label: 'Brouillon', icon: FileCheck, color: 'text-gray-600' },
  SUBMITTED: { label: 'Soumis', icon: ArrowRight, color: 'text-blue-600' },
  IN_VALIDATION: { label: 'En validation', icon: Clock, color: 'text-amber-600' },
  APPROVED: { label: 'Approuvé', icon: CheckCircle, color: 'text-emerald-600' },
  REJECTED: { label: 'Rejeté', icon: XCircle, color: 'text-red-600' },
  EXECUTED: { label: 'Exécuté', icon: CheckCircle, color: 'text-blue-600' },
  CLOSED: { label: 'Clôturé', icon: CheckCircle, color: 'text-gray-600' },
}

const priorityConfig = {
  LOW: { label: 'Basse', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
  NORMAL: { label: 'Normale', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400' },
  HIGH: { label: 'Haute', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' },
  UGENT: { label: 'Urgente', color: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' },
}

interface Comment {
  id: string
  userId: string
  userName: string
  content: string
  createdAt: string
}

export default function WorkflowsPage() {
  const { toast } = useToast()
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowRequest | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list')
  const [workflows, setWorkflows] = useState<WorkflowRequest[]>(mockWorkflows)
  const [comments, setComments] = useState<Comment[]>([])
  
  // Dialogs
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false)
  const [isExecuteDialogOpen, setIsExecuteDialogOpen] = useState(false)
  
  // Form states
  const [commentText, setCommentText] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [newWorkflow, setNewWorkflow] = useState({
    type: 'BORROW' as WorkflowType,
    title: '',
    description: '',
    priority: 'NORMAL' as 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT',
    archiveId: '',
    dueDate: '',
  })

  const filteredWorkflows = useMemo(() => {
    return workflows.filter(w => {
      if (selectedStatus !== 'all' && w.status !== selectedStatus) return false
      if (selectedType !== 'all' && w.type !== selectedType) return false
      return true
    })
  }, [selectedStatus, selectedType, workflows])

  const getTypeConfig = (type: string) => workflowTypeConfig[type as keyof typeof workflowTypeConfig] || workflowTypeConfig.BORROW
  const getStatusConfig = (status: WorkflowStatus) => workflowStatusConfig[status]
  const getPriorityConfig = (priority: string) => priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.NORMAL

  // Kanban columns
  const kanbanColumns: { status: WorkflowStatus; label: string; color: string }[] = [
    { status: 'SUBMITTED', label: 'Soumises', color: 'border-blue-200' },
    { status: 'IN_VALIDATION', label: 'En validation', color: 'border-amber-200' },
    { status: 'APPROVED', label: 'Approuvées', color: 'border-emerald-200' },
    { status: 'REJECTED', label: 'Rejetées', color: 'border-red-200' },
    { status: 'EXECUTED', label: 'Exécutées', color: 'border-gray-200' },
  ]

  // Actions
  const handleCreateWorkflow = useCallback(() => {
    if (!newWorkflow.title.trim()) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Le titre est requis' })
      return
    }

    const archive = mockArchives.find(a => a.id === newWorkflow.archiveId)
    const createdWorkflow: WorkflowRequest = {
      id: `wf-${Date.now()}`,
      type: newWorkflow.type,
      title: newWorkflow.title,
      description: newWorkflow.description,
      priority: newWorkflow.priority,
      archiveId: newWorkflow.archiveId || undefined,
      archiveReference: archive?.reference,
      archiveTitle: archive?.title,
      requesterId: '0',
      requesterName: 'Administrateur',
      requestedAt: new Date().toISOString(),
      currentStep: 0,
      totalSteps: 3,
      status: 'SUBMITTED',
      dueDate: newWorkflow.dueDate || undefined,
    }

    setWorkflows(prev => [createdWorkflow, ...prev])
    setIsCreateDialogOpen(false)
    setNewWorkflow({
      type: 'BORROW',
      title: '',
      description: '',
      priority: 'NORMAL',
      archiveId: '',
      dueDate: '',
    })
    toast({ title: 'Demande créée', description: 'La demande a été soumise avec succès' })
  }, [newWorkflow, toast])

  const handleApprove = useCallback(() => {
    if (!selectedWorkflow) return

    setWorkflows(prev => prev.map(w => {
      if (w.id !== selectedWorkflow.id) return w

      let updated = { ...w }
      const now = new Date().toISOString()
      const currentUser = 'Administrateur'

      if (w.currentStep === 1) {
        updated = { ...updated, approvedByN1: currentUser, approvedAtN1: now, currentStep: 2 }
      } else if (w.currentStep === 2) {
        updated = { ...updated, approvedByCompliance: currentUser, approvedAtCompliance: now, currentStep: 3 }
      } else if (w.currentStep === 3) {
        updated = { 
          ...updated, 
          approvedByManager: currentUser, 
          approvedAtManager: now, 
          status: 'APPROVED' as WorkflowStatus,
          currentStep: 4 
        }
      }

      return updated
    }))

    setIsApproveDialogOpen(false)
    toast({ title: 'Approuvé', description: 'La validation a été enregistrée' })
  }, [selectedWorkflow, toast])

  const handleReject = useCallback(() => {
    if (!selectedWorkflow || !rejectReason.trim()) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Le motif de rejet est requis' })
      return
    }

    setWorkflows(prev => prev.map(w => {
      if (w.id !== selectedWorkflow.id) return w
      return { ...w, status: 'REJECTED' as WorkflowStatus }
    }))

    setIsRejectDialogOpen(false)
    setRejectReason('')
    toast({ title: 'Rejeté', description: 'La demande a été rejetée' })
  }, [selectedWorkflow, rejectReason, toast])

  const handleExecute = useCallback(() => {
    if (!selectedWorkflow) return

    setWorkflows(prev => prev.map(w => {
      if (w.id !== selectedWorkflow.id) return w
      return { 
        ...w, 
        status: 'EXECUTED' as WorkflowStatus,
        executedBy: '0',
        executedByName: 'Administrateur',
        executedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      }
    }))

    setIsExecuteDialogOpen(false)
    toast({ title: 'Exécuté', description: 'La demande a été marquée comme exécutée' })
  }, [selectedWorkflow, toast])

  const handleAddComment = useCallback(() => {
    if (!commentText.trim() || !selectedWorkflow) return

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      userId: '0',
      userName: 'Administrateur',
      content: commentText,
      createdAt: new Date().toISOString(),
    }

    setComments(prev => [...prev, newComment])
    setCommentText('')
    setIsCommentDialogOpen(false)
    toast({ title: 'Commentaire ajouté' })
  }, [commentText, selectedWorkflow, toast])

  const handleStartValidation = useCallback((workflow: WorkflowRequest) => {
    setWorkflows(prev => prev.map(w => {
      if (w.id !== workflow.id) return w
      return { ...w, status: 'IN_VALIDATION' as WorkflowStatus, currentStep: 1 }
    }))
    toast({ title: 'Validation démarrée', description: 'Le circuit de validation a été initié' })
  }, [toast])

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workflows & Demandes</h1>
          <p className="text-muted-foreground">
            Gestion des demandes et circuit de validation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'list' | 'kanban')}>
            <TabsList className="h-8">
              <TabsTrigger value="list" className="text-xs px-3">Liste</TabsTrigger>
              <TabsTrigger value="kanban" className="text-xs px-3">Kanban</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle demande
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{workflows.filter(w => w.status === 'SUBMITTED').length}</div>
            <p className="text-sm text-muted-foreground">Soumises</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{workflows.filter(w => w.status === 'IN_VALIDATION').length}</div>
            <p className="text-sm text-muted-foreground">En validation</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{workflows.filter(w => w.status === 'APPROVED').length}</div>
            <p className="text-sm text-muted-foreground">Approuvées</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{workflows.filter(w => w.status === 'REJECTED').length}</div>
            <p className="text-sm text-muted-foreground">Rejetées</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-gray-500">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{workflows.filter(w => w.priority === 'URGENT').length}</div>
            <p className="text-sm text-muted-foreground">Urgentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Type de demande" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="BORROW">Emprunt</SelectItem>
            <SelectItem value="CONSULTATION">Consultation</SelectItem>
            <SelectItem value="DESTRUCTION">Destruction</SelectItem>
            <SelectItem value="TRANSFER">Transfert</SelectItem>
            <SelectItem value="MODIFICATION">Modification</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="DRAFT">Brouillon</SelectItem>
            <SelectItem value="SUBMITTED">Soumis</SelectItem>
            <SelectItem value="IN_VALIDATION">En validation</SelectItem>
            <SelectItem value="APPROVED">Approuvé</SelectItem>
            <SelectItem value="REJECTED">Rejeté</SelectItem>
            <SelectItem value="EXECUTED">Exécuté</SelectItem>
            <SelectItem value="CLOSED">Clôturé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List view */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Demandes</CardTitle>
                <CardDescription>{filteredWorkflows.length} demande{filteredWorkflows.length > 1 ? 's' : ''}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredWorkflows.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Aucune demande trouvée</p>
                    </div>
                  ) : (
                    filteredWorkflows.map((workflow, index) => {
                      const typeConf = getTypeConfig(workflow.type)
                      const statusConf = getStatusConfig(workflow.status)
                      const StatusIcon = statusConf.icon
                      const priorityConf = getPriorityConfig(workflow.priority)

                      return (
                        <motion.div
                          key={workflow.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          onClick={() => setSelectedWorkflow(workflow)}
                          className={cn(
                            'p-4 hover:bg-muted/50 cursor-pointer transition-colors',
                            selectedWorkflow?.id === workflow.id && 'bg-muted/50'
                          )}
                        >
                          <div className="flex items-start gap-4">
                            <div className={cn('p-2 rounded-lg', typeConf.bgColor)}>
                              <FileCheck className={cn('h-5 w-5', typeConf.color)} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className={cn('text-xs', typeConf.color)}>
                                  {typeConf.label}
                                </Badge>
                                <Badge variant="outline" className={cn('text-xs gap-1', statusConf.color)}>
                                  <StatusIcon className="h-3 w-3" />
                                  {statusConf.label}
                                </Badge>
                                <Badge className={cn('text-xs', priorityConf.color)}>
                                  {priorityConf.label}
                                </Badge>
                              </div>
                              <p className="font-medium text-sm">{workflow.title}</p>
                              {workflow.archiveReference && (
                                <p className="text-xs text-muted-foreground font-mono">
                                  {workflow.archiveReference}
                                </p>
                              )}
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {workflow.requesterName}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(workflow.requestedAt)}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <WorkflowStepperCompact
                                steps={[
                                  { id: '1', label: 'N+1', status: workflow.approvedByN1 ? 'completed' : workflow.status === 'IN_VALIDATION' && workflow.currentStep === 1 ? 'current' : 'pending' },
                                  { id: '2', label: 'Conformité', status: workflow.approvedByCompliance ? 'completed' : workflow.status === 'IN_VALIDATION' && workflow.currentStep === 2 ? 'current' : 'pending' },
                                  { id: '3', label: 'Manager', status: workflow.approvedByManager ? 'completed' : workflow.status === 'IN_VALIDATION' && workflow.currentStep === 3 ? 'current' : 'pending' },
                                ]}
                                currentStep={workflow.currentStep}
                              />
                            </div>
                          </div>
                        </motion.div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Workflow detail */}
          <div>
            {selectedWorkflow ? (
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="text-base">Détail de la demande</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Titre</p>
                    <p className="font-medium">{selectedWorkflow.title}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Type</p>
                      <Badge variant="outline" className={cn(getTypeConfig(selectedWorkflow.type).color)}>
                        {getTypeConfig(selectedWorkflow.type).label}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Priorité</p>
                      <Badge className={getPriorityConfig(selectedWorkflow.priority).color}>
                        {getPriorityConfig(selectedWorkflow.priority).label}
                      </Badge>
                    </div>
                  </div>

                  {selectedWorkflow.description && (
                    <div>
                      <p className="text-xs text-muted-foreground">Description</p>
                      <p className="text-sm">{selectedWorkflow.description}</p>
                    </div>
                  )}

                  {selectedWorkflow.dueDate && (
                    <div>
                      <p className="text-xs text-muted-foreground">Échéance</p>
                      <p className="text-sm font-medium">{formatDate(selectedWorkflow.dueDate)}</p>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-3">Circuit de validation</p>
                    <WorkflowStepper
                      steps={[
                        { id: '1', label: 'Validation N+1', status: selectedWorkflow.approvedByN1 ? 'completed' : selectedWorkflow.status === 'IN_VALIDATION' && selectedWorkflow.currentStep === 1 ? 'current' : 'pending', user: selectedWorkflow.approvedByN1 ? selectedWorkflow.requesterName : undefined, date: selectedWorkflow.approvedAtN1, comment: selectedWorkflow.commentN1 },
                        { id: '2', label: 'Validation Conformité', status: selectedWorkflow.approvedByCompliance ? 'completed' : selectedWorkflow.status === 'IN_VALIDATION' && selectedWorkflow.currentStep === 2 ? 'current' : 'pending', user: selectedWorkflow.approvedByCompliance || undefined, date: selectedWorkflow.approvedAtCompliance, comment: selectedWorkflow.commentCompliance },
                        { id: '3', label: 'Validation Manager', status: selectedWorkflow.approvedByManager ? 'completed' : selectedWorkflow.status === 'IN_VALIDATION' && selectedWorkflow.currentStep === 3 ? 'current' : 'pending', user: selectedWorkflow.approvedByManager || undefined, date: selectedWorkflow.approvedAtManager, comment: selectedWorkflow.commentManager },
                        { id: '4', label: 'Exécution', status: selectedWorkflow.status === 'EXECUTED' ? 'completed' : 'pending', user: selectedWorkflow.executedByName, date: selectedWorkflow.executedAt },
                      ]}
                      currentStep={selectedWorkflow.currentStep}
                    />
                  </div>

                  {/* Comments section */}
                  {comments.length > 0 && (
                    <div className="pt-4 border-t">
                      <p className="text-sm font-medium mb-2">Commentaires</p>
                      <div className="space-y-2">
                        {comments.map(comment => (
                          <div key={comment.id} className="p-2 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                              <span className="font-medium">{comment.userName}</span>
                              <span>{new Date(comment.createdAt).toLocaleString('fr-FR')}</span>
                            </div>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="space-y-2 pt-4">
                    {selectedWorkflow.status === 'SUBMITTED' && (
                      <Button className="w-full" onClick={() => handleStartValidation(selectedWorkflow)}>
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Démarrer la validation
                      </Button>
                    )}

                    {selectedWorkflow.status === 'IN_VALIDATION' && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => setIsCommentDialogOpen(true)}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Commenter
                        </Button>
                        <Button variant="destructive" size="sm" className="flex-1" onClick={() => setIsRejectDialogOpen(true)}>
                          <XCircle className="h-4 w-4 mr-2" />
                          Rejeter
                        </Button>
                        <Button size="sm" className="flex-1" onClick={() => setIsApproveDialogOpen(true)}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approuver
                        </Button>
                      </div>
                    )}

                    {selectedWorkflow.status === 'APPROVED' && (
                      <Button className="w-full" onClick={() => setIsExecuteDialogOpen(true)}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Marquer comme exécuté
                      </Button>
                    )}

                    {(selectedWorkflow.status === 'REJECTED' || selectedWorkflow.status === 'EXECUTED') && (
                      <div className="text-center text-sm text-muted-foreground py-2">
                        Cette demande est terminée
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="sticky top-6">
                <CardContent className="p-6 text-center text-muted-foreground">
                  <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Sélectionnez une demande pour voir les détails</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Kanban view */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {kanbanColumns.map((column) => (
            <Card key={column.status} className={cn('border-t-4', column.color)}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  {column.label}
                  <Badge variant="secondary" className="text-xs">
                    {workflows.filter(w => w.status === column.status).length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {workflows.filter(w => w.status === column.status).map((workflow) => {
                  const typeConf = getTypeConfig(workflow.type)
                  return (
                    <motion.div
                      key={workflow.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedWorkflow(workflow)}
                      className="p-3 bg-muted/50 rounded-lg cursor-pointer"
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <Badge variant="outline" className={cn('text-[10px] px-1', typeConf.color)}>
                          {typeConf.label}
                        </Badge>
                        {workflow.priority === 'URGENT' && (
                          <AlertCircle className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                      <p className="text-sm font-medium line-clamp-2">{workflow.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{workflow.requesterName}</p>
                    </motion.div>
                  )
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Workflow Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nouvelle demande</DialogTitle>
            <DialogDescription>
              Créer une nouvelle demande de workflow
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Type de demande</Label>
              <Select value={newWorkflow.type} onValueChange={(v) => setNewWorkflow(prev => ({ ...prev, type: v as WorkflowType }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BORROW">Emprunt</SelectItem>
                  <SelectItem value="CONSULTATION">Consultation</SelectItem>
                  <SelectItem value="DESTRUCTION">Destruction</SelectItem>
                  <SelectItem value="TRANSFER">Transfert</SelectItem>
                  <SelectItem value="MODIFICATION">Modification</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Titre *</Label>
              <Input
                placeholder="Titre de la demande"
                value={newWorkflow.title}
                onChange={(e) => setNewWorkflow(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Description de la demande..."
                value={newWorkflow.description}
                onChange={(e) => setNewWorkflow(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priorité</Label>
                <Select value={newWorkflow.priority} onValueChange={(v) => setNewWorkflow(prev => ({ ...prev, priority: v as 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Basse</SelectItem>
                    <SelectItem value="NORMAL">Normale</SelectItem>
                    <SelectItem value="HIGH">Haute</SelectItem>
                    <SelectItem value="URGENT">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Échéance</Label>
                <Input
                  type="date"
                  value={newWorkflow.dueDate}
                  onChange={(e) => setNewWorkflow(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Archive concernée (optionnel)</Label>
              <Select value={newWorkflow.archiveId} onValueChange={(v) => setNewWorkflow(prev => ({ ...prev, archiveId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une archive" />
                </SelectTrigger>
                <SelectContent>
                  {mockArchives.slice(0, 20).map(archive => (
                    <SelectItem key={archive.id} value={archive.id}>
                      {archive.reference} - {archive.title.substring(0, 30)}...
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleCreateWorkflow}>
              <Send className="h-4 w-4 mr-2" />
              Soumettre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <AlertDialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer l'approbation</AlertDialogTitle>
            <AlertDialogDescription>
              Voulez-vous approuver cette étape de validation ?
              {selectedWorkflow && (
                <div className="mt-2 text-sm">
                  Étape actuelle: {selectedWorkflow.currentStep === 1 ? 'N+1' : selectedWorkflow.currentStep === 2 ? 'Conformité' : 'Manager'}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Approuver
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter la demande</DialogTitle>
            <DialogDescription>
              Veuillez indiquer le motif du rejet
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Motif du rejet..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>Annuler</Button>
            <Button variant="destructive" onClick={handleReject}>
              <XCircle className="h-4 w-4 mr-2" />
              Rejeter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Comment Dialog */}
      <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un commentaire</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Votre commentaire..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCommentDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleAddComment}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Execute Dialog */}
      <AlertDialog open={isExecuteDialogOpen} onOpenChange={setIsExecuteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Marquer comme exécuté</AlertDialogTitle>
            <AlertDialogDescription>
              Confirmez-vous que cette demande a été exécutée ?
              {selectedWorkflow?.type === 'DESTRUCTION' && (
                <p className="mt-2 text-red-600 font-medium">
                  ⚠️ Attention: Cette action concerne une destruction d'archives
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleExecute}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirmer l'exécution
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
