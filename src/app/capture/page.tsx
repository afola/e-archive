'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Scan,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowRight,
  Loader2,
  Trash2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { UploadZone, UploadedFile } from '@/components/capture/upload-zone'
import { OCRResults, OCRResult } from '@/components/capture/ocr-results'
import {
  ClassificationPanel,
  ClassificationResult,
} from '@/components/capture/classification-panel'
import { fetchWithCurrentAuth } from '@/lib/auth/auth-store'
import { cn } from '@/lib/utils'

interface ProcessingFile extends UploadedFile {
  ocrResult?: OCRResult
  classification?: ClassificationResult
}

export default function CapturePage() {
  const [files, setFiles] = useState<ProcessingFile[]>([])
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const selectedFile = files.find((f) => f.id === selectedFileId)

  const handleFilesUploaded = useCallback((newFiles: UploadedFile[]) => {
    setFiles(newFiles)
    if (newFiles.length > 0 && !selectedFileId) {
      setSelectedFileId(newFiles[0].id)
    }
  }, [selectedFileId])

  const processFiles = async () => {
    const pendingFiles = files.filter((f) => f.status === 'pending')
    if (pendingFiles.length === 0) {
      toast.info('Tous les fichiers ont déjà été traités')
      return
    }

    setIsProcessing(true)

    for (const file of pendingFiles) {
      // Update status to uploading
      setFiles((prev) =>
        prev.map((f) =>
          f.id === file.id ? { ...f, status: 'uploading', progress: 10 } : f
        )
      )

      try {
        // Create form data
        const formData = new FormData()
        formData.append('file', file.file)
        formData.append('fileId', file.id)

        // Simulate upload progress
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, progress: 30 } : f
          )
        )

        // Update status to processing
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: 'processing', progress: 50 } : f
          )
        )

        // Call API
        const response = await fetchWithCurrentAuth('/capture', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Failed to process file')
        }

        const result = await response.json()

        // Update with results
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? {
                  ...f,
                  status: 'complete',
                  progress: 100,
                  ocrResult: result.ocr,
                  classification: result.classification,
                }
              : f
          )
        )

        toast.success(`${file.file.name} traité avec succès`)
      } catch {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? { ...f, status: 'error', error: 'Erreur de traitement' }
              : f
          )
        )
        toast.error(`Erreur lors du traitement de ${file.file.name}`)
      }
    }

    setIsProcessing(false)
  }

  const handleConfirmClassification = async (
    fileId: string,
    classification: {
      type: string
      tags: string[]
      metadata: ClassificationResult['metadata']
    }
  ) => {
    // In a real app, this would save to the database
    console.log('Confirming classification:', fileId, classification)
    toast.success('Classification confirmée')
  }

  const handleReclassify = async (fileId: string) => {
    const file = files.find((f) => f.id === fileId)
    if (!file) return

    // Re-process the file
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId ? { ...f, status: 'processing', progress: 50 } : f
      )
    )

    try {
      const formData = new FormData()
      formData.append('file', file.file)
      formData.append('fileId', file.id)

      const response = await fetchWithCurrentAuth('/capture', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error()

      const result = await response.json()

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                status: 'complete',
                progress: 100,
                ocrResult: result.ocr,
                classification: result.classification,
              }
            : f
        )
      )

      toast.success('Document reclassifié')
    } catch {
      toast.error('Erreur lors de la reclassification')
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId ? { ...f, status: 'complete', progress: 100 } : f
        )
      )
    }
  }

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId))
    if (selectedFileId === fileId) {
      const remainingFiles = files.filter((f) => f.id !== fileId)
      setSelectedFileId(remainingFiles[0]?.id || null)
    }
    toast.success('Fichier supprimé')
  }

  const stats = {
    total: files.length,
    pending: files.filter((f) => f.status === 'pending').length,
    processing: files.filter((f) => f.status === 'processing').length,
    complete: files.filter((f) => f.status === 'complete').length,
    error: files.filter((f) => f.status === 'error').length,
  }

  return (
    <div className="flex h-full">
      {/* Left Panel - Upload & File List */}
      <div className="w-80 border-r bg-muted/30 flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-semibold flex items-center gap-2">
            <Scan className="h-5 w-5 text-emerald-500" />
            Capture & OCR
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Importez et analysez vos documents
          </p>
        </div>

        <ScrollArea className="flex-1 p-4">
          <UploadZone
            onFilesUploaded={handleFilesUploaded}
            uploadedFiles={files}
          />

          {/* Process Button */}
          {files.filter((f) => f.status === 'pending').length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              <Button
                className="w-full"
                onClick={processFiles}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4 mr-2" />
                )}
                {isProcessing
                  ? 'Traitement en cours...'
                  : `Traiter ${stats.pending} fichier(s)`}
              </Button>
            </motion.div>
          )}
        </ScrollArea>

        {/* Stats Footer */}
        {files.length > 0 && (
          <div className="p-4 border-t bg-background">
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <p className="text-lg font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div>
                <p className="text-lg font-bold text-slate-500">
                  {stats.pending}
                </p>
                <p className="text-xs text-muted-foreground">En attente</p>
              </div>
              <div>
                <p className="text-lg font-bold text-emerald-500">
                  {stats.complete}
                </p>
                <p className="text-xs text-muted-foreground">Terminés</p>
              </div>
              <div>
                <p className="text-lg font-bold text-red-500">{stats.error}</p>
                <p className="text-xs text-muted-foreground">Erreurs</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Center Panel - File List & OCR Results */}
      <div className="flex-1 flex flex-col">
        {/* File Tabs */}
        {files.length > 0 && (
          <div className="border-b bg-background">
            <ScrollArea className="w-full">
              <div className="flex p-2 gap-2">
                <AnimatePresence>
                  {files.map((file) => (
                    <motion.button
                      key={file.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      onClick={() => setSelectedFileId(file.id)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all shrink-0',
                        selectedFileId === file.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80'
                      )}
                    >
                      <FileText className="h-4 w-4" />
                      <span className="max-w-[120px] truncate">
                        {file.file.name}
                      </span>

                      {/* Status indicator */}
                      {file.status === 'pending' && (
                        <Badge variant="outline" className="text-xs ml-1">
                          En attente
                        </Badge>
                      )}
                      {file.status === 'uploading' && (
                        <Loader2 className="h-3 w-3 animate-spin ml-1" />
                      )}
                      {file.status === 'processing' && (
                        <Loader2 className="h-3 w-3 animate-spin ml-1 text-amber-500" />
                      )}
                      {file.status === 'complete' && (
                        <CheckCircle2 className="h-3 w-3 ml-1 text-emerald-500" />
                      )}
                      {file.status === 'error' && (
                        <AlertCircle className="h-3 w-3 ml-1 text-red-500" />
                      )}

                      {/* Remove button */}
                      {file.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 ml-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFile(file.id)
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </div>
        )}

        {/* OCR Results */}
        <ScrollArea className="flex-1 p-6">
          {selectedFile ? (
            <OCRResults
              result={selectedFile.ocrResult || null}
              onTextUpdate={(fileId, newText) => {
                setFiles((prev) =>
                  prev.map((f) =>
                    f.id === fileId && f.ocrResult
                      ? {
                          ...f,
                          ocrResult: { ...f.ocrResult, extractedText: newText },
                        }
                      : f
                  )
                )
              }}
              onEntityUpdate={(fileId, entityId, newValue) => {
                setFiles((prev) =>
                  prev.map((f) =>
                    f.id === fileId && f.ocrResult
                      ? {
                          ...f,
                          ocrResult: {
                            ...f.ocrResult,
                            entities: f.ocrResult.entities.map((e) =>
                              e.id === entityId ? { ...e, value: newValue } : e
                            ),
                          },
                        }
                      : f
                  )
                )
              }}
            />
          ) : (
            <Card className="h-full">
              <CardContent className="flex flex-col items-center justify-center h-64">
                <Scan className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <p className="text-lg font-medium text-muted-foreground">
                  Aucun fichier sélectionné
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Importez des documents pour commencer l&apos;analyse
                </p>
              </CardContent>
            </Card>
          )}
        </ScrollArea>
      </div>

      {/* Right Panel - Classification */}
      <div className="w-96 border-l bg-muted/30">
        <div className="p-4 border-b">
          <h2 className="font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            Classification
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Type de document et métadonnées
          </p>
        </div>

        <ScrollArea className="flex-1 p-4">
          {selectedFile ? (
            <ClassificationPanel
              result={selectedFile.classification || null}
              onConfirm={handleConfirmClassification}
              onReclassify={handleReclassify}
            />
          ) : (
            <Card className="h-full">
              <CardContent className="flex flex-col items-center justify-center h-64">
                <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground text-center">
                  La classification apparaîtra après le traitement OCR
                </p>
              </CardContent>
            </Card>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}
