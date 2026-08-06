'use client'

import { motion } from 'framer-motion'
import { 
  FileText, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  FileImage,
  FileArchive,
  Eye
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatBytes } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface DocumentFile {
  id: string
  name: string
  type: string
  size: number
  uploadedAt: string
  uploadedBy: string
}

interface DocumentPreviewProps {
  files: DocumentFile[]
  selectedFile?: DocumentFile
  onSelectFile?: (file: DocumentFile) => void
  onDownload?: (file: DocumentFile) => void
  className?: string
}

function getFileIcon(type: string) {
  if (type.includes('pdf')) return FileText
  if (type.includes('image')) return FileImage
  if (type.includes('zip') || type.includes('rar')) return FileArchive
  return FileText
}

function getFileColor(type: string) {
  if (type.includes('pdf')) return 'text-red-600 bg-red-100 dark:bg-red-950'
  if (type.includes('image')) return 'text-purple-600 bg-purple-100 dark:bg-purple-950'
  if (type.includes('zip') || type.includes('rar')) return 'text-amber-600 bg-amber-100 dark:bg-amber-950'
  return 'text-blue-600 bg-blue-100 dark:bg-blue-950'
}

export function DocumentPreview({ 
  files, 
  selectedFile, 
  onSelectFile, 
  onDownload,
  className 
}: DocumentPreviewProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Documents associés
          <Badge variant="secondary" className="ml-auto">
            {files.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex h-[400px]">
          {/* File list */}
          <ScrollArea className="w-1/3 border-r">
            <div className="p-2 space-y-1">
              {files.map((file, index) => {
                const Icon = getFileIcon(file.type)
                const colorClass = getFileColor(file.type)
                const isSelected = selectedFile?.id === file.id

                return (
                  <motion.button
                    key={file.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => onSelectFile?.(file)}
                    className={cn(
                      'w-full text-left p-2 rounded-lg transition-colors',
                      'hover:bg-muted/50',
                      isSelected && 'bg-primary/10 border border-primary/20'
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <div className={cn('p-1.5 rounded', colorClass)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatBytes(file.size)}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </ScrollArea>

          {/* Preview area */}
          <div className="flex-1 flex flex-col">
            {selectedFile ? (
              <>
                {/* Toolbar */}
                <div className="flex items-center justify-between p-2 border-b bg-muted/30">
                  <span className="text-sm font-medium truncate px-2">
                    {selectedFile.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                      <RotateCw className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-7 w-7 p-0"
                      onClick={() => onDownload?.(selectedFile)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Preview content */}
                <div className="flex-1 flex items-center justify-center bg-muted/20 p-8">
                  <div className="text-center">
                    <div className={cn('w-20 h-20 rounded-lg mx-auto mb-4 flex items-center justify-center', getFileColor(selectedFile.type))}>
                      {getFileIcon(selectedFile.type) && (
                        <Eye className="h-10 w-10" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Aperçu non disponible
                    </p>
                    <Button onClick={() => onDownload?.(selectedFile)}>
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger le fichier
                    </Button>
                  </div>
                </div>

                {/* File info */}
                <div className="p-3 border-t bg-muted/30 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Taille: {formatBytes(selectedFile.size)}</span>
                    <span>Ajouté par {selectedFile.uploadedBy}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Sélectionnez un fichier</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
