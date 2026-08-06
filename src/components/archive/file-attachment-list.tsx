'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, 
  File, 
  Download, 
  Eye, 
  Trash2, 
  ExternalLink,
  FileImage,
  FileSpreadsheet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface AttachedFile {
  name: string
  url: string
  size?: number
  type?: string
  uploadedAt?: string
}

interface FileAttachmentListProps {
  files: AttachedFile[]
  onDownload?: (file: AttachedFile) => void
  onPreview?: (file: AttachedFile) => void
  onDelete?: (file: AttachedFile) => void
  readonly?: boolean
  className?: string
}

// Format file size
function formatFileSize(bytes?: number): string {
  if (!bytes) return '-'
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Get file icon based on type
function getFileIcon(type?: string) {
  if (!type) return <File className="h-8 w-8 text-gray-500" />
  if (type.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />
  if (type.includes('image')) return <FileImage className="h-8 w-8 text-blue-500" />
  if (type.includes('word') || type.includes('document')) return <FileText className="h-8 w-8 text-blue-600" />
  if (type.includes('excel') || type.includes('sheet')) return <FileSpreadsheet className="h-8 w-8 text-green-600" />
  return <File className="h-8 w-8 text-gray-500" />
}

// Get file type label
function getFileTypeLabel(type?: string): string {
  if (!type) return 'Fichier'
  if (type.includes('pdf')) return 'PDF'
  if (type.includes('jpeg') || type.includes('jpg')) return 'JPEG'
  if (type.includes('png')) return 'PNG'
  if (type.includes('tiff')) return 'TIFF'
  if (type.includes('word') || type.includes('document')) return 'Word'
  if (type.includes('excel') || type.includes('sheet')) return 'Excel'
  return 'Fichier'
}

export function FileAttachmentList({ 
  files, 
  onDownload, 
  onPreview, 
  onDelete,
  readonly = false,
  className 
}: FileAttachmentListProps) {
  
  const handlePreview = (file: AttachedFile) => {
    if (onPreview) {
      onPreview(file)
    } else {
      // Default behavior: open in new tab
      window.open(file.url, '_blank')
    }
  }

  const handleDownload = (file: AttachedFile) => {
    if (onDownload) {
      onDownload(file)
    } else {
      // Default behavior: create download link
      const link = document.createElement('a')
      link.href = file.url
      link.download = file.name
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  if (files.length === 0) {
    return (
      <Card className={cn("border-dashed", className)}>
        <CardContent className="py-8 text-center">
          <File className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Aucun document joint
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      {files.map((file, index) => (
        <motion.div
          key={`${file.name}-${index}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {/* File Icon */}
                <div className="flex-shrink-0">
                  {getFileIcon(file.type)}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate" title={file.name}>
                    {file.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span className="px-1.5 py-0.5 bg-muted rounded text-xs">
                      {getFileTypeLabel(file.type)}
                    </span>
                    <span>{formatFileSize(file.size)}</span>
                    {file.uploadedAt && (
                      <>
                        <span>•</span>
                        <span>{file.uploadedAt}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePreview(file)}
                    title="Aperçu"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(file)}
                    title="Télécharger"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {!readonly && onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(file)}
                      title="Supprimer"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

// Compact version for inline display
export function FileAttachmentCompact({ files, onPreview }: { 
  files: AttachedFile[]
  onPreview?: (file: AttachedFile) => void 
}) {
  if (files.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {files.map((file, index) => (
        <button
          key={`${file.name}-${index}`}
          onClick={() => onPreview ? onPreview(file) : window.open(file.url, '_blank')}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-xs font-medium transition-colors"
        >
          {getFileIcon(file.type)}
          <span className="max-w-[150px] truncate">{file.name}</span>
          <ExternalLink className="h-3 w-3 opacity-50" />
        </button>
      ))}
    </div>
  )
}
