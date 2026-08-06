'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  FileText,
  FileImage,
  FileSpreadsheet,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface UploadedFile {
  id: string
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error'
  error?: string
}

interface UploadZoneProps {
  onFilesUploaded: (files: UploadedFile[]) => void
  uploadedFiles: UploadedFile[]
  maxFiles?: number
  maxSize?: number // in MB
}

const ACCEPTED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/tiff',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]

const FILE_TYPE_ICONS: Record<string, typeof FileText> = {
  'application/pdf': FileText,
  'image/jpeg': FileImage,
  'image/png': FileImage,
  'image/tiff': FileImage,
  'application/msword': FileText,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': FileText,
  'application/vnd.ms-excel': FileSpreadsheet,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': FileSpreadsheet,
}

const FILE_TYPE_LABELS: Record<string, string> = {
  'application/pdf': 'PDF',
  'image/jpeg': 'JPEG',
  'image/png': 'PNG',
  'image/tiff': 'TIFF',
  'application/msword': 'Word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
  'application/vnd.ms-excel': 'Excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
}

export function UploadZone({
  onFilesUploaded,
  uploadedFiles,
  maxFiles = 10,
  maxSize = 50,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFiles = useCallback(
    (files: FileList | File[]): { valid: File[]; errors: string[] } => {
      const validFiles: File[] = []
      const newErrors: string[] = []
      const fileArray = Array.from(files)

      if (uploadedFiles.length + fileArray.length > maxFiles) {
        newErrors.push(`Maximum ${maxFiles} fichiers autorisés`)
        return { valid: [], errors: newErrors }
      }

      for (const file of fileArray) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          newErrors.push(`${file.name}: Type de fichier non supporté`)
          continue
        }

        if (file.size > maxSize * 1024 * 1024) {
          newErrors.push(`${file.name}: Fichier trop volumineux (max ${maxSize}MB)`)
          continue
        }

        validFiles.push(file)
      }

      return { valid: validFiles, errors: newErrors }
    },
    [uploadedFiles.length, maxFiles, maxSize]
  )

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const { valid, errors: validationErrors } = validateFiles(files)
      setErrors(validationErrors)

      if (valid.length > 0) {
        const newFiles: UploadedFile[] = valid.map((file) => ({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file,
          progress: 0,
          status: 'pending',
        }))
        onFilesUploaded([...uploadedFiles, ...newFiles])
      }
    },
    [validateFiles, onFilesUploaded, uploadedFiles]
  )

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(e.target.files)
      }
    },
    [handleFiles]
  )

  const removeFile = useCallback(
    (id: string) => {
      onFilesUploaded(uploadedFiles.filter((f) => f.id !== id))
    },
    [onFilesUploaded, uploadedFiles]
  )

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <motion.div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        whileHover={{ scale: 1.01 }}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 cursor-pointer',
          isDragging
            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
            : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600',
          uploadedFiles.length >= maxFiles && 'opacity-50 pointer-events-none'
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(',')}
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center text-center">
          <motion.div
            animate={{
              scale: isDragging ? 1.2 : 1,
              rotate: isDragging ? 10 : 0,
            }}
            transition={{ type: 'spring', stiffness: 300 }}
            className={cn(
              'w-16 h-16 rounded-full flex items-center justify-center mb-4',
              isDragging
                ? 'bg-emerald-100 dark:bg-emerald-900/30'
                : 'bg-slate-100 dark:bg-slate-800'
            )}
          >
            <Upload
              className={cn(
                'h-8 w-8',
                isDragging ? 'text-emerald-500' : 'text-slate-400'
              )}
            />
          </motion.div>

          <h3 className="text-lg font-semibold mb-2">
            {isDragging ? 'Déposez vos fichiers ici' : 'Glissez-déposez vos documents'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            ou cliquez pour sélectionner des fichiers
          </p>

          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="outline" className="text-xs">
              PDF
            </Badge>
            <Badge variant="outline" className="text-xs">
              JPEG
            </Badge>
            <Badge variant="outline" className="text-xs">
              PNG
            </Badge>
            <Badge variant="outline" className="text-xs">
              TIFF
            </Badge>
            <Badge variant="outline" className="text-xs">
              Word
            </Badge>
            <Badge variant="outline" className="text-xs">
              Excel
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground mt-3">
            Max {maxFiles} fichiers • {maxSize}MB par fichier
          </p>
        </div>

        {/* Drag overlay */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-emerald-50/80 dark:bg-emerald-950/40 rounded-xl pointer-events-none"
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Errors */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3"
          >
            {errors.map((error, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Fichiers sélectionnés ({uploadedFiles.length}/{maxFiles})
          </h4>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {uploadedFiles.map((uploadedFile) => {
                  const Icon = FILE_TYPE_ICONS[uploadedFile.file.type] || FileText
                  const typeLabel =
                    FILE_TYPE_LABELS[uploadedFile.file.type] || 'Document'

                  return (
                    <motion.div
                      key={uploadedFile.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center gap-3 p-3"
                    >
                      <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">
                            {uploadedFile.file.name}
                          </p>
                          <Badge variant="secondary" className="text-xs shrink-0">
                            {typeLabel}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(uploadedFile.file.size)}
                        </p>

                        {/* Progress bar */}
                        {uploadedFile.status === 'uploading' && (
                          <Progress value={uploadedFile.progress} className="mt-2 h-1" />
                        )}
                      </div>

                      {/* Status indicator */}
                      <div className="shrink-0">
                        {uploadedFile.status === 'pending' && (
                          <Badge variant="outline" className="text-xs">
                            En attente
                          </Badge>
                        )}
                        {uploadedFile.status === 'uploading' && (
                          <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                        )}
                        {uploadedFile.status === 'processing' && (
                          <Loader2 className="h-5 w-5 text-amber-500 animate-spin" />
                        )}
                        {uploadedFile.status === 'complete' && (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        )}
                        {uploadedFile.status === 'error' && (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>

                      {/* Remove button */}
                      {uploadedFile.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFile(uploadedFile.id)
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
