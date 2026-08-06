import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types
export type ArchiveStatus = 'ACTIVE' | 'ON_LOAN' | 'IN_TRANSFER' | 'PENDING_DESTRUCTION' | 'DESTROYED' | 'ARCHIVED' | 'EXPIRED'
export type ConfidentialityLevel = 'PUBLIC' | 'NORMAL' | 'CONFIDENTIAL' | 'SECRET' | 'TOP_SECRET'
export type MovementType = 'ENTRY' | 'EXIT' | 'RETURN' | 'TRANSFER' | 'DESTRUCTION' | 'QUARANTINE'
export type WorkflowStatus = 'DRAFT' | 'SUBMITTED' | 'IN_VALIDATION' | 'APPROVED' | 'REJECTED' | 'EXECUTED' | 'CLOSED'
export type WorkflowType = 'BORROW' | 'CONSULTATION' | 'DESTRUCTION' | 'TRANSFER' | 'MODIFICATION'

export interface User {
  id: string
  email: string
  name: string
  firstName?: string
  lastName?: string
  avatar?: string
  phone?: string
  department?: string
  position?: string
  role: string
  roleName?: string
  agencyId: string
  agencyName: string
  permissions: string[]
  isActive?: boolean
}

export interface Archive {
  id: string
  reference: string
  title: string
  description?: string
  type: string
  typeName: string
  category?: string
  subCategory?: string
  clientName?: string
  clientNumber?: string
  accountNumber?: string
  dossierNumber?: string
  agencyId: string
  agencyName: string
  department?: string
  documentDate?: string
  archiveDate: string
  retentionEndDate: string
  destructionDate?: string
  status: ArchiveStatus
  confidentiality: ConfidentialityLevel
  version: number
  locationId?: string
  locationCode?: string
  boxNumber?: string
  physicalNotes?: string
  hasDigitalCopy: boolean
  filePath?: string
  fileName?: string
  fileSize?: number
  keywords?: string[]
  tags?: string[]
  createdBy?: string
  createdByName?: string
  lastModifiedBy?: string
  lastActionAt?: string
  lastActionType?: string
  createdAt: string
  updatedAt: string
}

export interface Movement {
  id: string
  archiveId: string
  archiveReference: string
  archiveTitle: string
  type: MovementType
  fromLocation?: string
  toLocation?: string
  fromAgency?: string
  toAgency?: string
  reason?: string
  notes?: string
  requestedBy: string
  requestedByName: string
  requestedAt: string
  approvedBy?: string
  approvedByName?: string
  approvedAt?: string
  executedBy?: string
  executedByName?: string
  executedAt?: string
  status: 'PENDING' | 'APPROVED' | 'EXECUTED' | 'CANCELLED'
  receiptNumber?: string
  expectedReturnDate?: string
  actualReturnDate?: string
}

export interface WorkflowRequest {
  id: string
  archiveId?: string
  archiveReference?: string
  archiveTitle?: string
  type: WorkflowType
  title: string
  description?: string
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  requesterId: string
  requesterName: string
  requestedAt: string
  currentStep: number
  totalSteps: number
  status: WorkflowStatus
  approvedByN1?: string
  approvedAtN1?: string
  commentN1?: string
  approvedByCompliance?: string
  approvedAtCompliance?: string
  commentCompliance?: string
  approvedByManager?: string
  approvedAtManager?: string
  commentManager?: string
  executedBy?: string
  executedByName?: string
  executedAt?: string
  executionNotes?: string
  dueDate?: string
  completedAt?: string
}

export interface AuditLog {
  id: string
  userId: string
  userName: string
  archiveId?: string
  archiveReference?: string
  action: string
  entityType: string
  entityId: string
  details?: string
  ipAddress?: string
  isSensitive: boolean
  createdAt: string
}

export interface Notification {
  id: string
  type: 'ALERT' | 'INFO' | 'WARNING' | 'SUCCESS'
  title: string
  message: string
  link?: string
  isRead: boolean
  createdAt: string
}

export interface KPIData {
  totalArchives: number
  activeArchives: number
  onLoanArchives: number
  expiringArchives: number
  pendingValidation: number
  destroyedArchives: number
  transferredArchives: number
  totalMovements: number
  pendingRequests: number
}

export interface ArchiveFilters {
  search?: string
  status?: ArchiveStatus[]
  type?: string[]
  agency?: string[]
  confidentiality?: ConfidentialityLevel[]
  dateFrom?: string
  dateTo?: string
  retentionFrom?: string
  retentionTo?: string
  department?: string[]
  hasDigitalCopy?: boolean
  clientName?: string
  accountNumber?: string
  reference?: string
}

interface ArchiveState {
  // Archives
  archives: Archive[]
  selectedArchive: Archive | null
  archiveFilters: ArchiveFilters
  archivePagination: {
    page: number
    pageSize: number
    total: number
  }
  
  // Movements
  movements: Movement[]
  selectedMovement: Movement | null
  
  // Workflows
  workflows: WorkflowRequest[]
  selectedWorkflow: WorkflowRequest | null
  
  // Audit
  auditLogs: AuditLog[]
  
  // Notifications
  notifications: Notification[]
  
  // User
  currentUser: User | null
  
  // KPIs
  kpiData: KPIData | null
  
  // UI State
  sidebarCollapsed: boolean
  theme: 'light' | 'dark' | 'system'
  activeModule: string
  
  // Actions
  setArchives: (archives: Archive[]) => void
  setSelectedArchive: (archive: Archive | null) => void
  setArchiveFilters: (filters: ArchiveFilters) => void
  resetArchiveFilters: () => void
  setArchivePagination: (pagination: { page: number; pageSize: number; total: number }) => void
  
  setMovements: (movements: Movement[]) => void
  setSelectedMovement: (movement: Movement | null) => void
  
  setWorkflows: (workflows: WorkflowRequest[]) => void
  setSelectedWorkflow: (workflow: WorkflowRequest | null) => void
  
  setAuditLogs: (logs: AuditLog[]) => void
  
  setNotifications: (notifications: Notification[]) => void
  markNotificationRead: (id: string) => void
  clearNotifications: () => void
  
  setCurrentUser: (user: User | null) => void
  
  setKpiData: (data: KPIData) => void
  
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setActiveModule: (module: string) => void
}

const defaultFilters: ArchiveFilters = {
  search: '',
  status: [],
  type: [],
  agency: [],
  confidentiality: [],
  dateFrom: '',
  dateTo: '',
  retentionFrom: '',
  retentionTo: '',
  department: [],
  hasDigitalCopy: undefined,
  clientName: '',
  accountNumber: '',
  reference: '',
}

export const useArchiveStore = create<ArchiveState>()(
  persist(
    (set) => ({
      // Initial state
      archives: [],
      selectedArchive: null,
      archiveFilters: defaultFilters,
      archivePagination: { page: 1, pageSize: 20, total: 0 },
      
      movements: [],
      selectedMovement: null,
      
      workflows: [],
      selectedWorkflow: null,
      
      auditLogs: [],
      
      notifications: [],
      
      currentUser: null,
      
      kpiData: null,
      
      sidebarCollapsed: false,
      theme: 'light',
      activeModule: 'dashboard',
      
      // Actions
      setArchives: (archives) => set({ archives }),
      setSelectedArchive: (archive) => set({ selectedArchive: archive }),
      setArchiveFilters: (filters) => set((state) => ({ 
        archiveFilters: { ...state.archiveFilters, ...filters } 
      })),
      resetArchiveFilters: () => set({ archiveFilters: defaultFilters }),
      setArchivePagination: (pagination) => set({ archivePagination: pagination }),
      
      setMovements: (movements) => set({ movements }),
      setSelectedMovement: (movement) => set({ selectedMovement: movement }),
      
      setWorkflows: (workflows) => set({ workflows }),
      setSelectedWorkflow: (workflow) => set({ selectedWorkflow: workflow }),
      
      setAuditLogs: (logs) => set({ auditLogs: logs }),
      
      setNotifications: (notifications) => set({ notifications }),
      markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        ),
      })),
      clearNotifications: () => set({ notifications: [] }),
      
      setCurrentUser: (user) => set({ currentUser: user }),
      
      setKpiData: (data) => set({ kpiData: data }),
      
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setTheme: (theme) => set({ theme }),
      setActiveModule: (module) => set({ activeModule: module }),
    }),
    {
      name: 'archive-storage',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
      }),
    }
  )
)
