import { Archive, Movement, WorkflowRequest, AuditLog, Notification, User, KPIData } from '@/store/archive-store'

// ==================== USERS ====================
export const mockUsers: User[] = [
  { id: '0', email: 'admin@banque.fr', name: 'Administrateur Système', firstName: 'Admin', lastName: 'Système', role: 'ADMIN', roleName: 'Administrateur SI', agencyId: 'AG001', agencyName: 'Siège Central Paris', department: 'Direction des Systèmes d\'Information', permissions: ['all'], isActive: true },
  { id: '1', email: 'jean.dupont@banque.fr', name: 'Jean Dupont', firstName: 'Jean', lastName: 'Dupont', role: 'ADMIN', roleName: 'Administrateur SI', agencyId: 'AG001', agencyName: 'Siège Central Paris', department: 'Direction Générale', permissions: ['all'], isActive: true },
  { id: '2', email: 'marie.martin@banque.fr', name: 'Marie Martin', firstName: 'Marie', lastName: 'Martin', role: 'ARCHIVIST_CENTRAL', roleName: 'Archiviste Central', agencyId: 'AG001', agencyName: 'Siège Central Paris', department: 'Service Archives', permissions: ['read', 'write', 'approve', 'export'], isActive: true },
  { id: '3', email: 'pierre.bernard@banque.fr', name: 'Pierre Bernard', firstName: 'Pierre', lastName: 'Bernard', role: 'ARCHIVIST_AGENCY', roleName: 'Archiviste Agence', agencyId: 'AG002', agencyName: 'Agence Lyon Centre', department: 'Service Archives', permissions: ['read', 'write', 'borrow'], isActive: true },
  { id: '4', email: 'sophie.petit@banque.fr', name: 'Sophie Petit', firstName: 'Sophie', lastName: 'Petit', role: 'COMPLIANCE', roleName: 'Responsable Conformité', agencyId: 'AG001', agencyName: 'Siège Central Paris', department: 'Conformité', permissions: ['read', 'approve', 'audit'], isActive: true },
  { id: '5', email: 'luc.moreau@banque.fr', name: 'Luc Moreau', firstName: 'Luc', lastName: 'Moreau', role: 'AUDITOR', roleName: 'Auditeur Interne', agencyId: 'AG001', agencyName: 'Siège Central Paris', department: 'Audit Interne', permissions: ['read', 'audit', 'export'], isActive: true },
  { id: '6', email: 'claire.dubois@banque.fr', name: 'Claire Dubois', firstName: 'Claire', lastName: 'Dubois', role: 'USER', roleName: 'Utilisateur', agencyId: 'AG003', agencyName: 'Agence Marseille Vieux-Port', department: 'Service Clientèle', permissions: ['read', 'borrow'], isActive: true },
  { id: '7', email: 'thomas.leroy@banque.fr', name: 'Thomas Leroy', firstName: 'Thomas', lastName: 'Leroy', role: 'USER', roleName: 'Utilisateur', agencyId: 'AG002', agencyName: 'Agence Lyon Centre', department: 'Crédits', permissions: ['read', 'borrow'], isActive: true },
]

// ==================== AGENCIES ====================
export const mockAgencies = [
  { id: 'AG001', code: 'SIEGE', name: 'Siège Central Paris', city: 'Paris', region: 'Île-de-France' },
  { id: 'AG002', code: 'LYO-C', name: 'Agence Lyon Centre', city: 'Lyon', region: 'Auvergne-Rhône-Alpes' },
  { id: 'AG003', code: 'MAR-VP', name: 'Agence Marseille Vieux-Port', city: 'Marseille', region: 'PACA' },
  { id: 'AG004', code: 'BOR-C', name: 'Agence Bordeaux Centre', city: 'Bordeaux', region: 'Nouvelle-Aquitaine' },
  { id: 'AG005', code: 'NIC-C', name: 'Agence Nice Centre', city: 'Nice', region: 'PACA' },
  { id: 'AG006', code: 'STR-C', name: 'Agence Strasbourg Centre', city: 'Strasbourg', region: 'Grand Est' },
]

// ==================== ARCHIVE TYPES ====================
export const archiveTypes = [
  { id: 'TYPE001', code: 'KYC', name: 'Documents KYC', category: 'Conformité', retentionYears: 10, color: '#3b82f6' },
  { id: 'TYPE002', code: 'CREDIT', name: 'Dossiers de Crédit', category: 'Crédits', retentionYears: 10, color: '#10b981' },
  { id: 'TYPE003', code: 'CONTRACT', name: 'Contrats', category: 'Juridique', retentionYears: 10, color: '#8b5cf6' },
  { id: 'TYPE004', code: 'ACCOUNTING', name: 'Pièces Comptables', category: 'Comptabilité', retentionYears: 10, color: '#f59e0b' },
  { id: 'TYPE005', code: 'HR', name: 'Documents RH', category: 'Ressources Humaines', retentionYears: 5, color: '#ec4899' },
  { id: 'TYPE006', code: 'LEGAL', name: 'Documents Juridiques', category: 'Juridique', retentionYears: 15, color: '#ef4444' },
  { id: 'TYPE007', code: 'COMMITTEE', name: 'Procès-Verbaux Comités', category: 'Gouvernance', retentionYears: 20, color: '#6366f1' },
  { id: 'TYPE008', code: 'REGULATORY', name: 'Correspondances Réglementaires', category: 'Conformité', retentionYears: 10, color: '#14b8a6' },
  { id: 'TYPE009', code: 'TRANSACTION', name: 'Preuves de Transaction', category: 'Opérations', retentionYears: 7, color: '#f97316' },
  { id: 'TYPE010', code: 'LITIGATION', name: 'Contentieux', category: 'Juridique', retentionYears: 15, color: '#dc2626' },
]

// ==================== ARCHIVES ====================
const generateArchives = (): Archive[] => {
  const archives: Archive[] = []
  const statuses: Archive['status'][] = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'ACTIVE', 'ON_LOAN', 'IN_TRANSFER', 'EXPIRED', 'ARCHIVED']
  const confidentialityLevels: Archive['confidentiality'][] = ['PUBLIC', 'NORMAL', 'NORMAL', 'CONFIDENTIAL', 'CONFIDENTIAL', 'SECRET']
  
  const clientNames = [
    'Entreprise SARL Martin', 'SCI du Parc', 'SAS Dubois & Fils', 'EURL Leroy Construction',
    'SARL Petit Commerce', 'GAEC des Vignes', 'SAS Technologies Avancées', 'SCI Les Tilleuls',
    'SARL Boulangerie Modern', 'EURL Transport Express', 'SAS Informatique Plus', 'SCI Résidence Sud',
    'SARL Auto Services', 'GAEC Ferme du Soleil', 'SAS Consulting Pro', 'EURL Plomberie Rapide',
    'SARL Électricité Moderne', 'SCI Immeuble Central', 'SAS Logiciels Innov', 'EURL Menuiserie Art'
  ]
  
  const departments = ['Crédits', 'Service Clientèle', 'Conformité', 'Juridique', 'Comptabilité', 'RH', 'Opérations']
  
  const locations = ['SITE-PARIS/SALLE-A1/RAYON-R1/BOITE-B001', 'SITE-PARIS/SALLE-A2/RAYON-R3/BOITE-B015', 'SITE-LYON/SALLE-B1/RAYON-R1/BOITE-B003', 'SITE-MARSEILLE/SALLE-C1/RAYON-R2/BOITE-B008']
  
  const generateRef = (type: string, num: number) => `ARC-${type}-${String(num).padStart(6, '0')}`
  const generateAccount = () => `FR76 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(10000000000 + Math.random() * 90000000000)}`
  
  let index = 1
  const now = new Date()
  
  for (const type of archiveTypes) {
    const count = type.code === 'KYC' ? 12 : type.code === 'CREDIT' ? 10 : Math.floor(3 + Math.random() * 5)
    
    for (let i = 0; i < count; i++) {
      const agency = mockAgencies[Math.floor(Math.random() * mockAgencies.length)]
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      const confidentiality = confidentialityLevels[Math.floor(Math.random() * confidentialityLevels.length)]
      const clientName = clientNames[Math.floor(Math.random() * clientNames.length)]
      
      const archiveDate = new Date(now.getTime() - Math.random() * 5 * 365 * 24 * 60 * 60 * 1000)
      const retentionEndDate = new Date(archiveDate.getTime() + type.retentionYears * 365 * 24 * 60 * 60 * 1000)
      
      archives.push({
        id: `arch-${index}`,
        reference: generateRef(type.code, index),
        title: `${type.name} - ${clientName} - Dossier ${String(i + 1).padStart(3, '0')}`,
        description: `Dossier complet ${type.name.toLowerCase()} pour le client ${clientName}. Documents datés de ${archiveDate.getFullYear()}.`,
        type: type.code,
        typeName: type.name,
        category: type.category,
        subCategory: type.category === 'Crédits' ? ['Immobilier', 'Consommation', 'Professionnel'][Math.floor(Math.random() * 3)] : undefined,
        clientName,
        clientNumber: `CLI-${String(Math.floor(100000 + Math.random() * 900000))}`,
        accountNumber: type.code !== 'HR' ? generateAccount() : undefined,
        dossierNumber: `DOS-${type.code}-${String(index).padStart(5, '0')}`,
        agencyId: agency.id,
        agencyName: agency.name,
        department: departments[Math.floor(Math.random() * departments.length)],
        documentDate: archiveDate.toISOString().split('T')[0],
        archiveDate: archiveDate.toISOString().split('T')[0],
        retentionEndDate: retentionEndDate.toISOString().split('T')[0],
        status,
        confidentiality,
        version: 1,
        locationId: `loc-${index % 10}`,
        locationCode: locations[Math.floor(Math.random() * locations.length)],
        boxNumber: `BOITE-${String(Math.floor(1 + Math.random() * 100)).padStart(3, '0')}`,
        physicalNotes: Math.random() > 0.7 ? 'Boîte légèrement endommagée, documents intacts' : undefined,
        hasDigitalCopy: Math.random() > 0.3,
        filePath: Math.random() > 0.3 ? `/archives/${type.code}/${generateRef(type.code, index)}.pdf` : undefined,
        fileName: Math.random() > 0.3 ? `${generateRef(type.code, index)}.pdf` : undefined,
        fileSize: Math.floor(500000 + Math.random() * 5000000),
        keywords: [type.category, type.code, clientName.split(' ')[1]],
        tags: [type.code.toLowerCase(), 'important'],
        createdBy: mockUsers[Math.floor(Math.random() * mockUsers.length)].id,
        createdByName: mockUsers[Math.floor(Math.random() * mockUsers.length)].name,
        lastModifiedBy: mockUsers[Math.floor(Math.random() * mockUsers.length)].id,
        lastActionAt: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        lastActionType: ['CREATE', 'UPDATE', 'VIEW', 'DOWNLOAD'][Math.floor(Math.random() * 4)],
        createdAt: archiveDate.toISOString(),
        updatedAt: new Date(now.getTime() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString(),
      })
      index++
    }
  }
  
  return archives
}

export const mockArchives: Archive[] = generateArchives()

// ==================== MOVEMENTS ====================
export const mockMovements: Movement[] = [
  {
    id: 'mov-001',
    archiveId: 'arch-001',
    archiveReference: 'ARC-KYC-000001',
    archiveTitle: 'Documents KYC - Entreprise SARL Martin - Dossier 001',
    type: 'EXIT',
    fromLocation: 'SITE-PARIS/SALLE-A1/RAYON-R1/BOITE-B001',
    toLocation: 'Service Crédits - Bureau 204',
    fromAgency: 'Siège Central Paris',
    toAgency: 'Siège Central Paris',
    reason: 'Consultation pour instruction crédit',
    requestedBy: '7',
    requestedByName: 'Thomas Leroy',
    requestedAt: '2024-01-15T10:30:00Z',
    approvedBy: '2',
    approvedByName: 'Marie Martin',
    approvedAt: '2024-01-15T11:00:00Z',
    status: 'EXECUTED',
    receiptNumber: 'BON-S-2024-0001',
    expectedReturnDate: '2024-01-22',
  },
  {
    id: 'mov-002',
    archiveId: 'arch-002',
    archiveReference: 'ARC-CREDIT-000002',
    archiveTitle: 'Dossiers de Crédit - SCI du Parc - Dossier 001',
    type: 'TRANSFER',
    fromLocation: 'SITE-LYON/SALLE-B1/RAYON-R1/BOITE-B003',
    toLocation: 'SITE-PARIS/SALLE-A2/RAYON-R3/BOITE-B015',
    fromAgency: 'Agence Lyon Centre',
    toAgency: 'Siège Central Paris',
    reason: 'Centralisation des dossiers crédits importants',
    requestedBy: '3',
    requestedByName: 'Pierre Bernard',
    requestedAt: '2024-01-14T09:00:00Z',
    approvedBy: '2',
    approvedByName: 'Marie Martin',
    approvedAt: '2024-01-14T14:30:00Z',
    status: 'APPROVED',
    receiptNumber: 'BON-T-2024-0002',
  },
  {
    id: 'mov-003',
    archiveId: 'arch-003',
    archiveReference: 'ARC-CONTRACT-000003',
    archiveTitle: 'Contrats - SAS Dubois & Fils - Dossier 001',
    type: 'RETURN',
    fromLocation: 'Service Juridique',
    toLocation: 'SITE-PARIS/SALLE-A1/RAYON-R1/BOITE-B001',
    fromAgency: 'Siège Central Paris',
    toAgency: 'Siège Central Paris',
    reason: 'Restitution après consultation',
    requestedBy: '2',
    requestedByName: 'Marie Martin',
    requestedAt: '2024-01-16T16:00:00Z',
    status: 'PENDING',
    receiptNumber: 'BON-R-2024-0003',
  },
  {
    id: 'mov-004',
    archiveId: 'arch-004',
    archiveReference: 'ARC-KYC-000004',
    archiveTitle: 'Documents KYC - EURL Leroy Construction - Dossier 001',
    type: 'DESTRUCTION',
    fromLocation: 'SITE-PARIS/SALLE-A2/RAYON-R3/BOITE-B015',
    reason: 'Fin de durée de conservation - Déstruction autorisée',
    requestedBy: '4',
    requestedByName: 'Sophie Petit',
    requestedAt: '2024-01-10T08:00:00Z',
    approvedBy: '1',
    approvedByName: 'Jean Dupont',
    approvedAt: '2024-01-12T10:00:00Z',
    executedBy: '2',
    executedByName: 'Marie Martin',
    executedAt: '2024-01-13T09:00:00Z',
    status: 'EXECUTED',
    receiptNumber: 'BON-D-2024-0004',
  },
  {
    id: 'mov-005',
    archiveId: 'arch-005',
    archiveReference: 'ARC-LEGAL-000005',
    archiveTitle: 'Documents Juridiques - SARL Petit Commerce - Dossier 001',
    type: 'QUARANTINE',
    fromLocation: 'SITE-PARIS/SALLE-A1/RAYON-R1/BOITE-B001',
    toLocation: 'ZONE-QUARANTAINE-Q1',
    reason: 'Suspicion de contamination fongique',
    requestedBy: '2',
    requestedByName: 'Marie Martin',
    requestedAt: '2024-01-16T11:00:00Z',
    status: 'PENDING',
    receiptNumber: 'BON-Q-2024-0005',
  },
]

// ==================== WORKFLOWS ====================
export const mockWorkflows: WorkflowRequest[] = [
  {
    id: 'wf-001',
    archiveId: 'arch-010',
    archiveReference: 'ARC-CREDIT-000010',
    archiveTitle: 'Dossiers de Crédit - SAS Consulting Pro - Dossier 001',
    type: 'BORROW',
    title: 'Demande d\'emprunt pour instruction crédit',
    description: 'Besoin de consulter le dossier complet pour instruction d\'une nouvelle demande de crédit.',
    priority: 'HIGH',
    requesterId: '7',
    requesterName: 'Thomas Leroy',
    requestedAt: '2024-01-15T14:00:00Z',
    currentStep: 2,
    totalSteps: 3,
    status: 'IN_VALIDATION',
    approvedByN1: '3',
    approvedAtN1: '2024-01-15T15:30:00Z',
    commentN1: 'Demande justifiée, autorisation accordée.',
    dueDate: '2024-01-20',
  },
  {
    id: 'wf-002',
    archiveId: 'arch-015',
    archiveReference: 'ARC-KYC-000015',
    archiveTitle: 'Documents KYC - SCI Résidence Sud - Dossier 001',
    type: 'DESTRUCTION',
    title: 'Demande de destruction - Fin de conservation',
    description: 'La durée de conservation est atteinte. Demande de destruction autorisée.',
    priority: 'NORMAL',
    requesterId: '4',
    requesterName: 'Sophie Petit',
    requestedAt: '2024-01-10T09:00:00Z',
    currentStep: 3,
    totalSteps: 3,
    status: 'APPROVED',
    approvedByN1: '2',
    approvedAtN1: '2024-01-10T11:00:00Z',
    commentN1: 'Vérifié, durée atteinte.',
    approvedByCompliance: '4',
    approvedAtCompliance: '2024-01-11T10:00:00Z',
    commentCompliance: 'Conforme réglementation.',
    approvedByManager: '1',
    approvedAtManager: '2024-01-12T09:00:00Z',
    commentManager: 'Destruction autorisée.',
    dueDate: '2024-01-15',
  },
  {
    id: 'wf-003',
    type: 'CONSULTATION',
    title: 'Consultation documents contentieux',
    description: 'Consultation pour préparation dossier litige.',
    priority: 'URGENT',
    requesterId: '5',
    requesterName: 'Luc Moreau',
    requestedAt: '2024-01-16T08:00:00Z',
    currentStep: 1,
    totalSteps: 2,
    status: 'SUBMITTED',
    dueDate: '2024-01-17',
  },
  {
    id: 'wf-004',
    archiveId: 'arch-020',
    archiveReference: 'ARC-LEGAL-000020',
    archiveTitle: 'Documents Juridiques - EURL Menuiserie Art - Dossier 001',
    type: 'TRANSFER',
    title: 'Transfert vers archives historiques',
    description: 'Transfert du dossier vers les archives historiques après 10 ans.',
    priority: 'LOW',
    requesterId: '2',
    requesterName: 'Marie Martin',
    requestedAt: '2024-01-14T10:00:00Z',
    currentStep: 2,
    totalSteps: 3,
    status: 'IN_VALIDATION',
    approvedByN1: '1',
    approvedAtN1: '2024-01-14T14:00:00Z',
    dueDate: '2024-01-25',
  },
  {
    id: 'wf-005',
    archiveId: 'arch-025',
    archiveReference: 'ARC-CONTRACT-000025',
    archiveTitle: 'Contrats - SARL Électricité Moderne - Dossier 001',
    type: 'MODIFICATION',
    title: 'Mise à jour métadonnées',
    description: 'Correction de la localisation physique et ajout de mots-clés.',
    priority: 'NORMAL',
    requesterId: '3',
    requesterName: 'Pierre Bernard',
    requestedAt: '2024-01-12T11:00:00Z',
    currentStep: 3,
    totalSteps: 3,
    status: 'EXECUTED',
    approvedByN1: '2',
    approvedAtN1: '2024-01-12T14:00:00Z',
    approvedByCompliance: '4',
    approvedAtCompliance: '2024-01-12T16:00:00Z',
    executedBy: '2',
    executedByName: 'Marie Martin',
    executedAt: '2024-01-13T09:00:00Z',
    completedAt: '2024-01-13T09:00:00Z',
  },
]

// ==================== AUDIT LOGS ====================
export const mockAuditLogs: AuditLog[] = [
  { id: 'log-001', userId: '7', userName: 'Thomas Leroy', archiveId: 'arch-001', archiveReference: 'ARC-KYC-000001', action: 'VIEW', entityType: 'Archive', entityId: 'arch-001', details: 'Consultation fiche archive', ipAddress: '192.168.1.45', isSensitive: false, createdAt: '2024-01-16T14:30:00Z' },
  { id: 'log-002', userId: '2', userName: 'Marie Martin', archiveId: 'arch-002', archiveReference: 'ARC-CREDIT-000002', action: 'UPDATE', entityType: 'Archive', entityId: 'arch-002', details: 'Mise à jour localisation', ipAddress: '192.168.1.12', isSensitive: true, createdAt: '2024-01-16T11:45:00Z' },
  { id: 'log-003', userId: '6', userName: 'Claire Dubois', archiveId: 'arch-003', archiveReference: 'ARC-CONTRACT-000003', action: 'DOWNLOAD', entityType: 'Archive', entityId: 'arch-003', details: 'Téléchargement fichier PDF', ipAddress: '192.168.2.78', isSensitive: true, createdAt: '2024-01-16T10:15:00Z' },
  { id: 'log-004', userId: '4', userName: 'Sophie Petit', action: 'APPROVE', entityType: 'WorkflowRequest', entityId: 'wf-002', details: 'Approbation demande destruction', ipAddress: '192.168.1.30', isSensitive: true, createdAt: '2024-01-16T09:00:00Z' },
  { id: 'log-005', userId: '5', userName: 'Luc Moreau', archiveId: 'arch-004', archiveReference: 'ARC-LEGAL-000004', action: 'VIEW', entityType: 'Archive', entityId: 'arch-004', details: 'Consultation document confidentiel', ipAddress: '192.168.1.55', isSensitive: true, createdAt: '2024-01-15T16:20:00Z' },
  { id: 'log-006', userId: '1', userName: 'Jean Dupont', action: 'CREATE', entityType: 'Archive', entityId: 'arch-050', details: 'Création nouvelle archive', ipAddress: '192.168.1.1', isSensitive: false, createdAt: '2024-01-15T14:00:00Z' },
  { id: 'log-007', userId: '3', userName: 'Pierre Bernard', action: 'PRINT', entityType: 'Archive', entityId: 'arch-030', details: 'Impression bon de sortie', ipAddress: '192.168.2.15', isSensitive: false, createdAt: '2024-01-15T11:30:00Z' },
  { id: 'log-008', userId: '2', userName: 'Marie Martin', action: 'DELETE', entityType: 'ArchiveFile', entityId: 'file-015', details: 'Suppression fichier obsolète', ipAddress: '192.168.1.12', isSensitive: true, createdAt: '2024-01-14T17:00:00Z' },
  { id: 'log-009', userId: '6', userName: 'Claire Dubois', archiveId: 'arch-040', archiveReference: 'ARC-KYC-000040', action: 'VIEW', entityType: 'Archive', entityId: 'arch-040', details: 'Consultation dossier client', ipAddress: '192.168.2.78', isSensitive: false, createdAt: '2024-01-14T15:45:00Z' },
  { id: 'log-010', userId: '7', userName: 'Thomas Leroy', action: 'REJECT', entityType: 'WorkflowRequest', entityId: 'wf-006', details: 'Rejet demande emprunt', ipAddress: '192.168.1.45', isSensitive: false, createdAt: '2024-01-14T10:00:00Z' },
]

// ==================== NOTIFICATIONS ====================
export const mockNotifications: Notification[] = [
  { id: 'notif-001', type: 'WARNING', title: 'Archive arrivant à échéance', message: 'L\'archive ARC-KYC-000012 atteint sa fin de conservation dans 30 jours.', link: '/archives/arch-012', isRead: false, createdAt: '2024-01-16T08:00:00Z' },
  { id: 'notif-002', type: 'INFO', title: 'Demande approuvée', message: 'Votre demande d\'emprunt ARC-CREDIT-000010 a été approuvée.', link: '/workflows/wf-001', isRead: false, createdAt: '2024-01-15T16:00:00Z' },
  { id: 'notif-003', type: 'ALERT', title: 'Restitution en retard', message: 'L\'archive ARC-LEGAL-000015 empruntée n\'a pas été restituée à temps.', link: '/archives/arch-015', isRead: true, createdAt: '2024-01-14T09:00:00Z' },
  { id: 'notif-004', type: 'SUCCESS', title: 'Destruction exécutée', message: 'La destruction de l\'archive ARC-KYC-000004 a été effectuée avec succès.', link: '/movements/mov-004', isRead: true, createdAt: '2024-01-13T10:00:00Z' },
  { id: 'notif-005', type: 'WARNING', title: 'Nouvelle demande en attente', message: 'Une demande de consultation urgente attend votre validation.', link: '/workflows/wf-003', isRead: false, createdAt: '2024-01-16T08:05:00Z' },
]

// ==================== KPI DATA ====================
export const mockKPIData: KPIData = {
  totalArchives: mockArchives.length,
  activeArchives: mockArchives.filter(a => a.status === 'ACTIVE').length,
  onLoanArchives: mockArchives.filter(a => a.status === 'ON_LOAN').length,
  expiringArchives: mockArchives.filter(a => {
    const retentionEnd = new Date(a.retentionEndDate)
    const now = new Date()
    const diffDays = Math.floor((retentionEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays <= 90 && diffDays > 0
  }).length,
  pendingValidation: mockWorkflows.filter(w => w.status === 'IN_VALIDATION' || w.status === 'SUBMITTED').length,
  destroyedArchives: mockArchives.filter(a => a.status === 'DESTROYED').length,
  transferredArchives: mockArchives.filter(a => a.status === 'IN_TRANSFER').length,
  totalMovements: mockMovements.length,
  pendingRequests: mockWorkflows.filter(w => w.status === 'SUBMITTED' || w.status === 'IN_VALIDATION').length,
}

// ==================== CHART DATA ====================
export const archiveVolumeByType = archiveTypes.map(type => ({
  name: type.name,
  value: mockArchives.filter(a => a.type === type.code).length,
  color: type.color,
}))

export const monthlyMovements = [
  { month: 'Jan', entries: 45, exits: 32 },
  { month: 'Fév', entries: 52, exits: 28 },
  { month: 'Mar', entries: 48, exits: 35 },
  { month: 'Avr', entries: 61, exits: 42 },
  { month: 'Mai', entries: 55, exits: 38 },
  { month: 'Juin', entries: 67, exits: 45 },
  { month: 'Juil', entries: 58, exits: 40 },
  { month: 'Août', entries: 42, exits: 25 },
  { month: 'Sept', entries: 63, exits: 48 },
  { month: 'Oct', entries: 71, exits: 52 },
  { month: 'Nov', entries: 65, exits: 45 },
  { month: 'Déc', entries: 78, exits: 55 },
]

export const archivesByAgency = mockAgencies.map(agency => ({
  name: agency.name,
  value: mockArchives.filter(a => a.agencyId === agency.id).length,
}))

export const archivesByStatus = [
  { name: 'Actives', value: mockArchives.filter(a => a.status === 'ACTIVE').length, color: '#10b981' },
  { name: 'En prêt', value: mockArchives.filter(a => a.status === 'ON_LOAN').length, color: '#f59e0b' },
  { name: 'En transfert', value: mockArchives.filter(a => a.status === 'IN_TRANSFER').length, color: '#3b82f6' },
  { name: 'Expirées', value: mockArchives.filter(a => a.status === 'EXPIRED').length, color: '#ef4444' },
  { name: 'Archivées', value: mockArchives.filter(a => a.status === 'ARCHIVED').length, color: '#6b7280' },
]

export const topUsers = [
  { name: 'Marie Martin', actions: 145, department: 'Archives' },
  { name: 'Thomas Leroy', actions: 98, department: 'Crédits' },
  { name: 'Sophie Petit', actions: 87, department: 'Conformité' },
  { name: 'Claire Dubois', actions: 76, department: 'Clientèle' },
  { name: 'Luc Moreau', actions: 65, department: 'Audit' },
]

export const retentionAlerts = [
  { id: '1', archiveRef: 'ARC-KYC-000012', title: 'Documents KYC - Client XYZ', daysLeft: 15, action: 'DESTRUCTION' },
  { id: '2', archiveRef: 'ARC-LEGAL-000025', title: 'Documents Juridiques - Contentieux', daysLeft: 22, action: 'TRANSFER' },
  { id: '3', archiveRef: 'ARC-CREDIT-000030', title: 'Dossier Crédit - SCI Sud', daysLeft: 45, action: 'REVIEW' },
  { id: '4', archiveRef: 'ARC-CONTRACT-000018', title: 'Contrat - SARL Martin', daysLeft: 60, action: 'TRANSFER' },
  { id: '5', archiveRef: 'ARC-HR-000005', title: 'Dossier Personnel - Dupont J.', daysLeft: 75, action: 'DESTRUCTION' },
]
