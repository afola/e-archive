'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Package,
  QrCode,
  MapPin,
  Building2,
  Building,
  DoorOpen,
  Archive,
  Calendar,
  FileText,
  Printer,
  Download,
  X,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { fetchWithCurrentAuth } from '@/lib/auth/auth-store'
import { cn, formatDate } from '@/lib/utils'
import { StorageLocation, ArchiveInBox, boxArchives } from '@/data/storage-data'
import { StatusBadge } from '@/components/archive/status-badge'
import { ConfidentialityBadge } from '@/components/archive/confidentiality-badge'

interface BoxDetailsProps {
  box: StorageLocation | null
  onClose?: () => void
  onViewArchive?: (archiveId: string) => void
}

interface QRCodeData {
  qrCode: string
  data: string
}

function DetailRow({ icon: Icon, label, value }: { icon: typeof Building2; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <Icon className="h-4 w-4 text-slate-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  )
}

function ArchiveRow({ archive, onClick }: { archive: ArchiveInBox; onClick?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center gap-3 min-w-0">
        <FileText className="h-4 w-4 text-slate-400 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{archive.reference}</p>
          <p className="text-xs text-muted-foreground truncate">{archive.title}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <StatusBadge status={archive.status as 'ACTIVE' | 'ON_LOAN' | 'IN_TRANSFER'} size="sm" />
        <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
      </div>
    </motion.div>
  )
}

// Custom hook for fetching QR code
function useQRCode(box: StorageLocation | null) {
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Use a ref to track the current fetch
  const fetchIdRef = useState(0)[0]
  
  useEffect(() => {
    const fetchId = fetchIdRef + 1
    
    // No box or no QR code
    if (!box || !box.hasQrCode) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQrCode(null)
      return
    }
    
    // Start fetch
    const controller = new AbortController()
    
    // Mark loading in next microtask
    Promise.resolve().then(() => {
      if (fetchId === fetchIdRef + 1) {
        setIsLoading(true)
      }
    })
    
    fetchWithCurrentAuth(
      `/storage/qrcode?locationId=${encodeURIComponent(box.id)}&code=${encodeURIComponent(box.code)}`,
      { signal: controller.signal }
    )
      .then(res => res.json())
      .then(data => {
        if (data.success && fetchId === fetchIdRef + 1) {
          setQrCode(data.qrCode)
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error(err)
        }
      })
      .finally(() => {
        if (fetchId === fetchIdRef + 1) {
          setIsLoading(false)
        }
      })
    
    return () => {
      controller.abort()
    }
  }, [box?.id, box?.hasQrCode, box, fetchIdRef])
  
  return { qrCode, isLoading }
}

export function BoxDetails({ box, onClose, onViewArchive }: BoxDetailsProps) {
  const { qrCode, isLoading: isLoadingQR } = useQRCode(box)
  
  // Derive archives from box prop - no useEffect needed
  const archives = box && box.type === 'BOX' ? (boxArchives[box.id] || []) : []

  const handlePrintLabel = async () => {
    if (!box || !qrCode) return

    // Create a new window for printing
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Étiquette - ${box.code}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            padding: 20px; 
            display: flex; 
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
          }
          .label {
            border: 2px solid #000;
            padding: 20px;
            width: 300px;
            text-align: center;
          }
          .code { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .location { font-size: 12px; color: #666; margin-bottom: 15px; }
          .qr-container { margin: 15px 0; }
          .qr-container img { width: 150px; height: 150px; }
          .info { font-size: 10px; color: #999; margin-top: 10px; }
          @media print {
            body { padding: 0; }
            .label { border: 1px solid #000; }
          }
        </style>
      </head>
      <body>
        <div class="label">
          <div class="code">${box.code}</div>
          <div class="location">
            ${box.site || ''} / ${box.building || ''} / ${box.room || ''} / ${box.shelf || ''}
          </div>
          <div class="qr-container">
            <img src="${qrCode}" alt="QR Code" />
          </div>
          <div class="info">
            Archives Banque - ${new Date().toLocaleDateString('fr-FR')}
          </div>
        </div>
        <script>
          setTimeout(() => window.print(), 500);
        </script>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  if (!box) {
    return (
      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center h-full p-8">
          <Package className="h-16 w-16 text-slate-200 dark:text-slate-700 mb-4" />
          <p className="text-muted-foreground text-center">
            Sélectionnez une boîte pour voir les détails
          </p>
        </CardContent>
      </Card>
    )
  }

  const fillLevel = box.fillLevel
  const isNearFull = fillLevel >= 80
  const isFull = fillLevel >= 90

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'p-2 rounded-lg',
              isFull ? 'bg-red-100 dark:bg-red-900/30' :
              isNearFull ? 'bg-orange-100 dark:bg-orange-900/30' :
              'bg-blue-100 dark:bg-blue-900/30'
            )}>
              <Package className={cn(
                'h-5 w-5',
                isFull ? 'text-red-600' :
                isNearFull ? 'text-orange-600' :
                'text-blue-600'
              )} />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg truncate">{box.code}</CardTitle>
              <p className="text-sm text-muted-foreground truncate">{box.name}</p>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <ScrollArea className="flex-1">
        <CardContent className="space-y-4 pt-0">
          {/* Fill level */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Taux de remplissage</span>
              <div className="flex items-center gap-2">
                {isFull && <AlertTriangle className="h-4 w-4 text-red-500" />}
                <span className={cn(
                  'text-sm font-bold',
                  isFull ? 'text-red-600' :
                  isNearFull ? 'text-orange-600' :
                  'text-green-600'
                )}>
                  {fillLevel}%
                </span>
              </div>
            </div>
            <Progress value={fillLevel} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{box.currentLoad} documents</span>
              <span>Capacité: {box.capacity}</span>
            </div>
          </div>

          <Separator />

          {/* Location details */}
          <div className="space-y-1">
            <h4 className="text-sm font-medium mb-3">Localisation</h4>
            <DetailRow icon={Building2} label="Site" value={box.site || '-'} />
            <DetailRow icon={Building} label="Bâtiment" value={box.building || '-'} />
            <DetailRow icon={DoorOpen} label="Salle" value={box.room || '-'} />
            <DetailRow icon={Archive} label="Rayon" value={box.shelf || '-'} />
          </div>

          <Separator />

          {/* QR Code section */}
          {box.hasQrCode && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">QR Code</h4>
              <div className="flex justify-center">
                {isLoadingQR ? (
                  <div className="w-32 h-32 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                ) : qrCode ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 bg-white rounded-lg border shadow-sm"
                  >
                    <img src={qrCode} alt="QR Code" className="w-32 h-32" />
                  </motion.div>
                ) : (
                  <div className="w-32 h-32 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                    <QrCode className="h-8 w-8 text-slate-300" />
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={handlePrintLabel}
                  disabled={!qrCode}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimer
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => {
                    if (qrCode) {
                      const link = document.createElement('a')
                      link.href = qrCode
                      link.download = `qr-${box.code}.svg`
                      link.click()
                    }
                  }}
                  disabled={!qrCode}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </Button>
              </div>
            </div>
          )}

          <Separator />

          {/* Archives list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Archives ({archives.length})</h4>
              {archives.length > 5 && (
                <Button variant="ghost" size="sm" className="h-7 text-xs">
                  Voir tout
                </Button>
              )}
            </div>
            
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {archives.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucune archive dans cette boîte
                </p>
              ) : (
                archives.slice(0, 10).map((archive) => (
                  <ArchiveRow
                    key={archive.id}
                    archive={archive}
                    onClick={() => onViewArchive?.(archive.id)}
                  />
                ))
              )}
            </div>
          </div>

          <Separator />

          {/* Metadata */}
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              <span>Créé le {formatDate(box.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>Mis à jour le {formatDate(box.updatedAt)}</span>
            </div>
          </div>
        </CardContent>
      </ScrollArea>
    </Card>
  )
}
