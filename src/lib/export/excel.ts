import * as XLSX from 'xlsx'
import { Archive, WorkflowRequest, Movement, User } from '@/store/archive-store'
import { formatDate } from '@/lib/utils'
import { archiveTypes, mockAgencies } from '@/data/mock-data'

// Export archives to Excel
export function exportArchivesToExcel(archives: Archive[], filename = 'archives'): void {
  const workbook = XLSX.utils.book_new()
  
  // Main data sheet
  const data = archives.map(archive => ({
    'Référence': archive.reference,
    'Titre': archive.title,
    'Description': archive.description || '',
    'Type': archive.typeName,
    'Catégorie': archive.category || '',
    'Client': archive.clientName || '',
    'N° Client': archive.clientNumber || '',
    'N° Compte': archive.accountNumber || '',
    'N° Dossier': archive.dossierNumber || '',
    'Agence': archive.agencyName,
    'Département': archive.department || '',
    'Date archivage': formatDate(archive.archiveDate),
    'Date document': archive.documentDate ? formatDate(archive.documentDate) : '',
    'Fin conservation': formatDate(archive.retentionEndDate),
    'Statut': archive.status,
    'Confidentialité': archive.confidentiality,
    'Version': archive.version,
    'Format': archive.hasDigitalCopy ? 'Numérique' : 'Physique',
    'Localisation': archive.locationCode || '',
    'Boîte': archive.boxNumber || '',
    'Mots-clés': archive.keywords?.join(', ') || '',
    'Créé par': archive.createdByName || '',
    'Date création': formatDate(archive.createdAt),
    'Dernière modification': formatDate(archive.updatedAt),
  }))
  
  const sheet = XLSX.utils.json_to_sheet(data)
  
  // Set column widths
  const colWidths = [
    { wch: 20 }, // Référence
    { wch: 40 }, // Titre
    { wch: 50 }, // Description
    { wch: 15 }, // Type
    { wch: 15 }, // Catégorie
    { wch: 25 }, // Client
    { wch: 15 }, // N° Client
    { wch: 25 }, // N° Compte
    { wch: 20 }, // N° Dossier
    { wch: 25 }, // Agence
    { wch: 20 }, // Département
    { wch: 12 }, // Date archivage
    { wch: 12 }, // Date document
    { wch: 12 }, // Fin conservation
    { wch: 12 }, // Statut
    { wch: 12 }, // Confidentialité
    { wch: 8 },  // Version
    { wch: 10 }, // Format
    { wch: 30 }, // Localisation
    { wch: 15 }, // Boîte
    { wch: 30 }, // Mots-clés
    { wch: 20 }, // Créé par
    { wch: 12 }, // Date création
    { wch: 12 }, // Dernière modification
  ]
  sheet['!cols'] = colWidths
  
  XLSX.utils.book_append_sheet(workbook, sheet, 'Archives')
  
  // Summary sheet
  const summaryData = [
    ['Statistiques des Archives'],
    [''],
    ['Total archives', archives.length],
    ['Archives actives', archives.filter(a => a.status === 'ACTIVE').length],
    ['En prêt', archives.filter(a => a.status === 'ON_LOAN').length],
    ['En transfert', archives.filter(a => a.status === 'IN_TRANSFER').length],
    ['Expirées', archives.filter(a => a.status === 'EXPIRED').length],
    [''],
    ['Par type'],
    ...archiveTypes.map(type => [
      type.name, 
      archives.filter(a => a.type === type.code).length
    ]),
    [''],
    ['Par agence'],
    ...mockAgencies.map(agency => [
      agency.name,
      archives.filter(a => a.agencyId === agency.id).length
    ]),
  ]
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
  summarySheet['!cols'] = [{ wch: 30 }, { wch: 15 }]
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Résumé')
  
  // Write file
  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`)
}

// Export workflows to Excel
export function exportWorkflowsToExcel(workflows: WorkflowRequest[], filename = 'workflows'): void {
  const workbook = XLSX.utils.book_new()
  
  const data = workflows.map(workflow => ({
    'ID': workflow.id,
    'Titre': workflow.title,
    'Description': workflow.description || '',
    'Type': workflow.type,
    'Priorité': workflow.priority,
    'Statut': workflow.status,
    'Demandeur': workflow.requesterName,
    'Date demande': formatDate(workflow.requestedAt),
    'Archive': workflow.archiveReference || '',
    'Échéance': workflow.dueDate ? formatDate(workflow.dueDate) : '',
    'Étape actuelle': `${workflow.currentStep}/${workflow.totalSteps}`,
    'Approuvé N+1': workflow.approvedByN1 ? 'Oui' : 'Non',
    'Date N+1': workflow.approvedAtN1 ? formatDate(workflow.approvedAtN1) : '',
    'Approuvé Conformité': workflow.approvedByCompliance ? 'Oui' : 'Non',
    'Date Conformité': workflow.approvedAtCompliance ? formatDate(workflow.approvedAtCompliance) : '',
    'Approuvé Manager': workflow.approvedByManager ? 'Oui' : 'Non',
    'Date Manager': workflow.approvedAtManager ? formatDate(workflow.approvedAtManager) : '',
    'Exécuté par': workflow.executedByName || '',
    'Date exécution': workflow.executedAt ? formatDate(workflow.executedAt) : '',
  }))
  
  const sheet = XLSX.utils.json_to_sheet(data)
  sheet['!cols'] = [
    { wch: 15 }, { wch: 40 }, { wch: 40 }, { wch: 12 }, { wch: 10 },
    { wch: 12 }, { wch: 20 }, { wch: 12 }, { wch: 20 }, { wch: 12 },
    { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
    { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 20 }, { wch: 12 },
  ]
  
  XLSX.utils.book_append_sheet(workbook, sheet, 'Workflows')
  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`)
}

// Export movements to Excel
export function exportMovementsToExcel(movements: Movement[], filename = 'mouvements'): void {
  const workbook = XLSX.utils.book_new()
  
  const data = movements.map(movement => ({
    'ID': movement.id,
    'N° Bon': movement.receiptNumber || '',
    'Type': movement.type,
    'Archive': movement.archiveReference,
    'Titre archive': movement.archiveTitle,
    'Emplacement source': movement.fromLocation || '',
    'Emplacement dest.': movement.toLocation || '',
    'Agence source': movement.fromAgency || '',
    'Agence dest.': movement.toAgency || '',
    'Demandeur': movement.requestedByName,
    'Date demande': formatDate(movement.requestedAt),
    'Approuvé par': movement.approvedByName || '',
    'Date approbation': movement.approvedAt ? formatDate(movement.approvedAt) : '',
    'Statut': movement.status,
    'Motif': movement.reason || '',
    'Retour prévu': movement.expectedReturnDate ? formatDate(movement.expectedReturnDate) : '',
    'Retour effectif': movement.actualReturnDate ? formatDate(movement.actualReturnDate) : '',
  }))
  
  const sheet = XLSX.utils.json_to_sheet(data)
  sheet['!cols'] = [
    { wch: 12 }, { wch: 18 }, { wch: 12 }, { wch: 20 }, { wch: 35 },
    { wch: 25 }, { wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 20 },
    { wch: 12 }, { wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 30 },
    { wch: 12 }, { wch: 12 },
  ]
  
  XLSX.utils.book_append_sheet(workbook, sheet, 'Mouvements')
  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`)
}

// Export users to Excel
export function exportUsersToExcel(users: User[], filename = 'utilisateurs'): void {
  const workbook = XLSX.utils.book_new()
  
  const data = users.map(user => ({
    'ID': user.id,
    'Email': user.email,
    'Nom': user.name,
    'Prénom': user.firstName || '',
    'Nom': user.lastName || '',
    'Rôle': user.roleName || user.role,
    'Agence': user.agencyName || '',
    'Département': user.department || '',
    'Statut': user.isActive ? 'Actif' : 'Inactif',
    'Permissions': user.permissions?.join(', ') || '',
  }))
  
  const sheet = XLSX.utils.json_to_sheet(data)
  sheet['!cols'] = [
    { wch: 10 }, { wch: 25 }, { wch: 25 }, { wch: 15 }, { wch: 15 },
    { wch: 20 }, { wch: 25 }, { wch: 20 }, { wch: 10 }, { wch: 30 },
  ]
  
  XLSX.utils.book_append_sheet(workbook, sheet, 'Utilisateurs')
  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`)
}

// Generic export function
export function exportToExcel<T>(
  data: T[],
  columns: { key: keyof T; header: string }[],
  filename: string
): void {
  const workbook = XLSX.utils.book_new()
  
  const sheetData = data.map(item => {
    const row: Record<string, unknown> = {}
    columns.forEach(col => {
      row[col.header] = item[col.key]
    })
    return row
  })
  
  const sheet = XLSX.utils.json_to_sheet(sheetData)
  sheet['!cols'] = columns.map(() => ({ wch: 20 }))
  
  XLSX.utils.book_append_sheet(workbook, sheet, 'Données')
  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`)
}
