import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Archive, WorkflowRequest, Movement } from '@/store/archive-store'
import { formatDate } from '@/lib/utils'

// Colors
const COLORS = {
  primary: [41, 98, 255],
  secondary: [100, 116, 139],
  text: [30, 41, 59],
  success: [34, 197, 94],
  warning: [245, 158, 11],
  danger: [239, 68, 68],
}

// Generate archive fiche PDF
export function generateArchivePDF(archive: Archive): jsPDF {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  
  // Header
  doc.setFillColor(...COLORS.primary)
  doc.rect(0, 0, pageWidth, 40, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('FICHE D\'ARCHIVE', 14, 20)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Systeme de Gestion des Archives Bancaires', 14, 30)
  
  // Reference badge
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(pageWidth - 70, 10, 56, 20, 3, 3, 'F')
  doc.setTextColor(...COLORS.primary)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(archive.reference, pageWidth - 65, 23)
  
  // Main content
  let y = 55
  
  doc.setTextColor(...COLORS.text)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(archive.title, 14, y)
  y += 15
  
  // Status badge
  const statusColors: Record<string, number[]> = {
    'ACTIVE': COLORS.success,
    'ON_LOAN': COLORS.warning,
    'IN_TRANSFER': COLORS.primary,
    'EXPIRED': COLORS.danger,
    'DESTROYED': COLORS.secondary,
  }
  
  doc.setFillColor(...(statusColors[archive.status] || COLORS.secondary))
  doc.roundedRect(14, y - 5, 25, 8, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text(archive.status, 17, y)
  
  doc.setFillColor(100, 116, 139)
  doc.roundedRect(44, y - 5, 30, 8, 2, 2, 'F')
  doc.text(archive.confidentiality, 47, y)
  
  y += 15
  
  // Info table
  doc.setTextColor(...COLORS.text)
  
  const infoData = [
    ['Type', archive.typeName],
    ['Categorie', archive.category || '-'],
    ['Client', archive.clientName || '-'],
    ['N Client', archive.clientNumber || '-'],
    ['N Compte', archive.accountNumber || '-'],
    ['Agence', archive.agencyName],
    ['Departement', archive.department || '-'],
    ['Date d\'archivage', formatDate(archive.archiveDate)],
    ['Fin de conservation', formatDate(archive.retentionEndDate)],
    ['Version', `v${archive.version}`],
    ['Format', archive.hasDigitalCopy ? 'Numerique' : 'Physique'],
  ]
  
  autoTable(doc, {
    startY: y,
    head: [],
    body: infoData,
    theme: 'plain',
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50, textColor: COLORS.secondary },
      1: { cellWidth: 'auto' },
    },
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    margin: { left: 14, right: 14 },
  })
  
  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10
  
  // Description
  if (archive.description) {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Description', 14, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    const splitDesc = doc.splitTextToSize(archive.description, pageWidth - 28)
    doc.text(splitDesc, 14, y)
    y += splitDesc.length * 5 + 5
  }
  
  // Physical location
  if (archive.locationCode) {
    y += 5
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Localisation physique', 14, y)
    y += 6
    doc.setFont('courier', 'normal')
    doc.setFontSize(9)
    doc.text(archive.locationCode, 14, y)
  }
  
  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20
  doc.setDrawColor(200)
  doc.line(14, footerY - 5, pageWidth - 14, footerY - 5)
  
  doc.setFontSize(8)
  doc.setTextColor(...COLORS.secondary)
  doc.text(`Genere le ${new Date().toLocaleDateString('fr-FR')} a ${new Date().toLocaleTimeString('fr-FR')}`, 14, footerY)
  doc.text('Archives Bancaires - Document confidentiel', pageWidth - 14, footerY, { align: 'right' })
  
  return doc
}

// Generate archives list PDF
export function generateArchivesListPDF(archives: Archive[]): jsPDF {
  const doc = new jsPDF('landscape')
  const pageWidth = doc.internal.pageSize.getWidth()
  
  // Header
  doc.setFillColor(...COLORS.primary)
  doc.rect(0, 0, pageWidth, 25, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('LISTE DES ARCHIVES', 14, 15)
  
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Genere le ${new Date().toLocaleDateString('fr-FR')} - ${archives.length} archives`, pageWidth - 14, 15, { align: 'right' })
  
  // Table
  const tableData = archives.map(archive => [
    archive.reference,
    archive.title.substring(0, 40) + (archive.title.length > 40 ? '...' : ''),
    archive.typeName,
    archive.clientName || '-',
    archive.agencyName,
    formatDate(archive.archiveDate),
    formatDate(archive.retentionEndDate),
    archive.status,
    archive.confidentiality,
  ])
  
  autoTable(doc, {
    startY: 35,
    head: [['Reference', 'Titre', 'Type', 'Client', 'Agence', 'Date archive', 'Fin conservation', 'Statut', 'Confidentialite']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: COLORS.primary,
      fontSize: 8,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 7,
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 50 },
      2: { cellWidth: 25 },
      3: { cellWidth: 30 },
      4: { cellWidth: 30 },
      5: { cellWidth: 22 },
      6: { cellWidth: 22 },
      7: { cellWidth: 18 },
      8: { cellWidth: 20 },
    },
    margin: { left: 10, right: 10 },
  })
  
  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(...COLORS.secondary)
    doc.text(`Page ${i}/${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' })
  }
  
  return doc
}

// Generate workflow PDF
export function generateWorkflowPDF(workflow: WorkflowRequest): jsPDF {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  
  // Header
  doc.setFillColor(...COLORS.primary)
  doc.rect(0, 0, pageWidth, 35, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('DEMANDE DE WORKFLOW', 14, 18)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`ID: ${workflow.id}`, 14, 28)
  
  let y = 50
  
  // Title
  doc.setTextColor(...COLORS.text)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(workflow.title, 14, y)
  y += 12
  
  const infoData = [
    ['Type', workflow.type],
    ['Priorite', workflow.priority],
    ['Statut', workflow.status],
    ['Demandeur', workflow.requesterName],
    ['Date de demande', formatDate(workflow.requestedAt)],
    ['Echeance', workflow.dueDate ? formatDate(workflow.dueDate) : '-'],
  ]
  
  autoTable(doc, {
    startY: y,
    head: [],
    body: infoData,
    theme: 'plain',
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50, textColor: COLORS.secondary },
      1: { cellWidth: 'auto' },
    },
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    margin: { left: 14, right: 14 },
  })
  
  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15
  doc.setDrawColor(200)
  doc.line(14, footerY - 5, pageWidth - 14, footerY - 5)
  
  doc.setFontSize(8)
  doc.setTextColor(...COLORS.secondary)
  doc.text(`Genere le ${new Date().toLocaleDateString('fr-FR')}`, 14, footerY)
  
  return doc
}

// Generate movement receipt PDF
export function generateMovementReceiptPDF(movement: Movement): jsPDF {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const centerX = pageWidth / 2
  
  // Header
  doc.setFillColor(...COLORS.primary)
  doc.rect(0, 0, pageWidth, 30, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('BON DE MOUVEMENT', centerX, 12, { align: 'center' })
  doc.setFontSize(16)
  doc.text(movement.receiptNumber || `MOV-${movement.id}`, centerX, 24, { align: 'center' })
  
  let y = 45
  
  // Movement type
  const typeLabels: Record<string, string> = {
    'ENTRY': 'Entree',
    'EXIT': 'Sortie',
    'RETURN': 'Retour',
    'TRANSFER': 'Transfert',
    'DESTRUCTION': 'Destruction',
    'QUARANTINE': 'Quarantaine',
  }
  
  doc.setTextColor(...COLORS.text)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(typeLabels[movement.type] || movement.type, centerX, y, { align: 'center' })
  y += 20
  
  // Archive info
  doc.setFillColor(245, 247, 250)
  doc.rect(14, y - 5, pageWidth - 28, 25, 'F')
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Archive concernee:', 20, y + 5)
  doc.setFont('helvetica', 'normal')
  doc.text(movement.archiveReference, 20, y + 12)
  doc.setFontSize(9)
  doc.text(movement.archiveTitle, 20, y + 18)
  y += 35
  
  // Details table
  const infoData = [
    ['Demandeur', movement.requestedByName],
    ['Date de demande', formatDate(movement.requestedAt)],
    ['De', movement.fromLocation || '-'],
    ['Vers', movement.toLocation || '-'],
    ['Agence source', movement.fromAgency || '-'],
    ['Agence destination', movement.toAgency || '-'],
    ['Motif', movement.reason || '-'],
    ['Statut', movement.status],
  ]
  
  autoTable(doc, {
    startY: y,
    head: [],
    body: infoData,
    theme: 'plain',
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50, textColor: COLORS.secondary },
      1: { cellWidth: 'auto' },
    },
    styles: {
      fontSize: 10,
      cellPadding: 4,
    },
    margin: { left: 14, right: 14 },
  })
  
  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15
  doc.setDrawColor(200)
  doc.line(14, footerY - 5, pageWidth - 14, footerY - 5)
  
  doc.setFontSize(8)
  doc.setTextColor(...COLORS.secondary)
  doc.text(`Genere le ${new Date().toLocaleDateString('fr-FR')}`, 14, footerY)
  doc.text('Ce document doit etre conserve pour tracabilite', centerX, footerY, { align: 'center' })
  
  return doc
}
