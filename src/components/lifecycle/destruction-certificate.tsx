'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  Download,
  Printer,
  Shield,
  CheckCircle,
  Calendar,
  User,
  Building2,
  Hash,
  Clock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'

interface ArchiveItem {
  id: string
  reference: string
  title: string
  type: string
  typeName: string
  retentionEndDate: string
  daysLeft?: number
  status: string
  agencyName: string
  boxNumber?: string
  locationCode?: string
}

interface DestructionCertificate {
  id: string
  requestId: string
  archiveIds: string[]
  archives: ArchiveItem[]
  destructionDate: string
  method: 'SHRED' | 'INCINERATE' | 'DIGITAL_DELETE' | 'PULP'
  witness: string
  witnessName: string
  operator: string
  operatorName: string
  approvedBy: string
  approvedByName: string
  notes?: string
  createdAt: string
}

interface DestructionCertificateProps {
  certificate: DestructionCertificate | null
  onDownload?: () => void
  onPrint?: () => void
}

const METHOD_LABELS = {
  SHRED: 'Broyage industriel',
  INCINERATE: 'Incinération',
  PULP: 'Pulpage',
  DIGITAL_DELETE: 'Suppression numérique sécurisée'
}

export function DestructionCertificate({ certificate, onDownload, onPrint }: DestructionCertificateProps) {
  const [showPreview, setShowPreview] = useState(true)

  if (!certificate) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <FileText className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">Aucun certificat sélectionné</p>
          <p className="text-sm">Sélectionnez une destruction pour voir le certificat</p>
        </CardContent>
      </Card>
    )
  }

  const handleDownload = () => {
    // Generate PDF content
    const content = generateCertificateText(certificate)
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `certificat-destruction-${certificate.id}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    onDownload?.()
  }

  const handlePrint = () => {
    window.print()
    onPrint?.()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      id="destruction-certificate"
    >
      <Card className="print:shadow-none">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              <CardTitle>Certificat de Destruction</CardTitle>
            </div>
            <div className="flex items-center gap-2 print:hidden">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimer
              </Button>
              <Button size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Certificate header */}
          <div className="text-center mb-6 pb-6 border-b">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-950 mb-4">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold">CERTIFICAT DE DESTRUCTION</h2>
            <p className="text-muted-foreground mt-1">
              Référence: <span className="font-mono">{certificate.id}</span>
            </p>
            <Badge className="mt-2 bg-green-100 text-green-700">
              <CheckCircle className="h-3 w-3 mr-1" />
              Destruction validée
            </Badge>
          </div>

          {/* Certificate details */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Date de destruction</p>
                  <p className="font-medium">{formatDate(certificate.destructionDate, 'long')}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Méthode</p>
                  <p className="font-medium">{METHOD_LABELS[certificate.method]}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Opérateur</p>
                  <p className="font-medium">{certificate.operatorName}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Témoin</p>
                  <p className="font-medium">{certificate.witnessName}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Approbation */}
          <div className="p-4 rounded-lg bg-muted/50 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-950">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approuvé par</p>
                <p className="font-medium">{certificate.approvedByName}</p>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Archives list */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Archives détruites ({certificate.archives.length})
            </h4>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {certificate.archives.map((archive, index) => (
                  <motion.div
                    key={archive.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 text-red-600" />
                      </div>
                      <div>
                        <p className="font-mono text-sm">{archive.reference}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                          {archive.title}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        {archive.typeName}
                      </Badge>
                      {archive.boxNumber && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Boîte: {archive.boxNumber}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <Separator className="my-6" />

          {/* Notes */}
          {certificate.notes && (
            <div className="mb-6">
              <h4 className="font-medium mb-2">Notes</h4>
              <p className="text-sm text-muted-foreground">{certificate.notes}</p>
            </div>
          )}

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t">
            <div className="text-center">
              <div className="h-16 border-b border-dashed mb-2" />
              <p className="text-sm font-medium">Opérateur</p>
              <p className="text-xs text-muted-foreground">{certificate.operatorName}</p>
            </div>
            <div className="text-center">
              <div className="h-16 border-b border-dashed mb-2" />
              <p className="text-sm font-medium">Témoin</p>
              <p className="text-xs text-muted-foreground">{certificate.witnessName}</p>
            </div>
            <div className="text-center">
              <div className="h-16 border-b border-dashed mb-2" />
              <p className="text-sm font-medium">Approbateur</p>
              <p className="text-xs text-muted-foreground">{certificate.approvedByName}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t text-center text-xs text-muted-foreground">
            <p>Ce certificat atteste que les documents listés ont été détruits conformément aux procédures en vigueur.</p>
            <p className="mt-1">Document généré le {formatDate(certificate.createdAt, 'long')}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Certificate list component
export function CertificateList({ 
  certificates,
  onSelect 
}: { 
  certificates: DestructionCertificate[]
  onSelect: (certificate: DestructionCertificate) => void
}) {
  if (certificates.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <FileText className="h-8 w-8 mb-2 opacity-50" />
          <p>Aucun certificat disponible</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {certificates.map((cert) => (
        <motion.div
          key={cert.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          onClick={() => onSelect(cert)}
          className="cursor-pointer"
        >
          <Card className="hover:border-primary/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-100 dark:bg-red-950">
                    <Shield className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium">Certificat #{cert.id.slice(-6)}</p>
                    <p className="text-sm text-muted-foreground">
                      {cert.archives.length} archive(s) détruite(s)
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-xs">
                    {METHOD_LABELS[cert.method]}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(cert.destructionDate)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

// Helper function to generate certificate text
function generateCertificateText(certificate: DestructionCertificate): string {
  return `
CERTIFICAT DE DESTRUCTION
========================

Référence: ${certificate.id}
Date: ${formatDate(certificate.destructionDate, 'long')}

Méthode de destruction: ${METHOD_LABELS[certificate.method]}

ARCHIVES DÉTRUITES:
${certificate.archives.map(a => `- ${a.reference}: ${a.title}`).join('\n')}

Personnel impliqué:
- Opérateur: ${certificate.operatorName}
- Témoin: ${certificate.witnessName}
- Approbateur: ${certificate.approvedByName}

Notes: ${certificate.notes || 'Aucune note'}

Ce certificat atteste que les documents listés ont été détruits conformément aux procédures en vigueur.

Document généré le ${formatDate(certificate.createdAt, 'long')}
`.trim()
}
