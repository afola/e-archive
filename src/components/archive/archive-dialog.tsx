'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Loader2, Upload, X, FileText, File, Trash2, Eye } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { archiveTypes, mockAgencies } from '@/data/mock-data'
import { useToast } from '@/hooks/use-toast'
import { Archive } from '@/store/archive-store'
import { resolveBackendApiUrl } from '@/lib/backend-api'
import { useApiClient } from '@/lib/auth/auth-store'

interface UploadedFile {
  name: string
  fileName: string
  size: number
  type: string
  url: string
  isNew?: boolean
}

interface ArchiveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  archive?: Archive | null
  onSave: (data: Partial<Archive>) => Promise<void>
}

const defaultFormData = {
  reference: '',
  title: '',
  description: '',
  type: '',
  clientName: '',
  clientNumber: '',
  accountNumber: '',
  agencyId: '',
  department: '',
  confidentiality: 'NORMAL',
  documentDate: undefined as Date | undefined,
  keywords: '',
}

// Format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Get file icon based on type
function getFileIcon(type: string) {
  if (type.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />
  if (type.includes('image')) return <File className="h-5 w-5 text-blue-500" />
  if (type.includes('word') || type.includes('document')) return <FileText className="h-5 w-5 text-blue-600" />
  if (type.includes('excel') || type.includes('sheet')) return <FileText className="h-5 w-5 text-green-600" />
  return <File className="h-5 w-5 text-gray-500" />
}

function normalizeFileUrl(url: string): string {
  if (!url || /^https?:\/\//i.test(url)) {
    return url
  }

  if (url.startsWith('/files/') || url.startsWith('/api/files/')) {
    return resolveBackendApiUrl(url)
  }

  return url
}

export function ArchiveDialog({ open, onOpenChange, archive, onSave }: ArchiveDialogProps) {
  const [formData, setFormData] = useState(defaultFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { fetchWithAuth } = useApiClient()

  const isEditing = !!archive

  // Populate form when editing
  useEffect(() => {
    if (archive) {
      setFormData({
        reference: archive.reference || '',
        title: archive.title || '',
        description: archive.description || '',
        type: archive.type || '',
        clientName: archive.clientName || '',
        clientNumber: archive.clientNumber || '',
        accountNumber: archive.accountNumber || '',
        agencyId: archive.agencyId || '',
        department: archive.department || '',
        confidentiality: archive.confidentiality || 'NORMAL',
        documentDate: archive.documentDate ? new Date(archive.documentDate) : undefined,
        keywords: archive.keywords?.join(', ') || '',
      })
      
      // Set existing files
      if (archive.filePath && archive.fileName) {
        setUploadedFiles([{
          name: archive.fileName,
          fileName: archive.fileName,
          size: archive.fileSize || 0,
          type: 'application/pdf',
          url: normalizeFileUrl(archive.filePath),
          isNew: false,
        }])
      } else {
        setUploadedFiles([])
      }
    } else {
      // Generate reference for new archive
      const timestamp = Date.now().toString().slice(-6)
      setFormData({
        ...defaultFormData,
        reference: `ARC-NEW-${timestamp}`,
      })
      setUploadedFiles([])
    }
    setErrors({})
  }, [archive, open])

  // Handle file upload
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setIsUploading(true)

    try {
      for (const file of Array.from(files)) {
        // Validate file type
        const allowedTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'image/jpeg',
          'image/png',
          'image/tiff',
        ]

        if (!allowedTypes.includes(file.type)) {
          toast({
            variant: 'destructive',
            title: 'Type de fichier non autorisé',
            description: `${file.name} n'est pas un type de fichier autorisé.`,
          })
          continue
        }

        // Validate file size (50MB max)
        if (file.size > 50 * 1024 * 1024) {
          toast({
            variant: 'destructive',
            title: 'Fichier trop volumineux',
            description: `${file.name} dépasse la limite de 50MB.`,
          })
          continue
        }

        // Upload file
        const uploadFormData = new FormData()
        uploadFormData.append('file', file)
        uploadFormData.append('archiveId', archive?.id || 'temp')

        const response = await fetchWithAuth('/files/upload', {
          method: 'POST',
          body: uploadFormData,
        })

        if (response.ok) {
          const result = await response.json()
          const fileUrl = normalizeFileUrl(result.file.url)
          setUploadedFiles(prev => [...prev, {
            name: result.file.name || file.name,
            fileName: result.file.fileName,
            size: file.size,
            type: file.type,
            url: fileUrl,
            isNew: true,
          }])
        } else {
          const error = await response.json().catch(() => ({}))
          toast({
            variant: 'destructive',
            title: 'Erreur de téléchargement',
            description: error.message || 'Impossible de télécharger le fichier.',
          })
        }
      }
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'Une erreur est survenue lors du téléchargement.'
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: message,
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleFileUpload(e.dataTransfer.files)
  }

  // Remove file
  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  // View file
  const handleViewFile = (url: string) => {
    window.open(normalizeFileUrl(url), '_blank')
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis'
    }
    if (!formData.type) {
      newErrors.type = 'Le type est requis'
    }
    if (!formData.agencyId) {
      newErrors.agencyId = 'L\'agence est requise'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const selectedType = archiveTypes.find(t => t.code === formData.type)
      
      // Get primary file info
      const primaryFile = uploadedFiles[0]
      
      const archiveData: Partial<Archive> = {
        reference: formData.reference,
        title: formData.title,
        description: formData.description || undefined,
        type: formData.type,
        typeName: selectedType?.name || '',
        category: selectedType?.category,
        clientName: formData.clientName || undefined,
        clientNumber: formData.clientNumber || undefined,
        accountNumber: formData.accountNumber || undefined,
        agencyId: formData.agencyId,
        agencyName: mockAgencies.find(a => a.id === formData.agencyId)?.name || '',
        department: formData.department || undefined,
        confidentiality: formData.confidentiality as Archive['confidentiality'],
        documentDate: formData.documentDate?.toISOString().split('T')[0],
        keywords: formData.keywords ? formData.keywords.split(',').map(k => k.trim()).filter(Boolean) : [],
        status: 'ACTIVE',
        version: 1,
        hasDigitalCopy: uploadedFiles.length > 0,
        filePath: primaryFile?.url,
        fileName: primaryFile?.name,
        fileSize: primaryFile?.size,
        archiveDate: new Date().toISOString().split('T')[0],
        retentionEndDate: new Date(Date.now() + (selectedType?.retentionYears || 10) * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await onSave(archiveData)
      
      toast({
        title: isEditing ? 'Archive modifiée' : 'Archive créée',
        description: isEditing 
          ? `L'archive "${formData.title}" a été modifiée avec succès.`
          : `L'archive "${formData.title}" a été créée avec succès.`,
      })

      onOpenChange(false)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'enregistrement.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Modifier l\'archive' : 'Nouvelle archive'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Modifiez les informations de l\'archive ci-dessous.'
              : 'Remplissez les informations pour créer une nouvelle archive.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Reference */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reference">Référence *</Label>
              <Input
                id="reference"
                value={formData.reference}
                onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                placeholder="ARC-TYPE-000001"
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type d'archive *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {archiveTypes.map((type) => (
                    <SelectItem key={type.id} value={type.code}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: type.color }}
                        />
                        {type.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && <p className="text-xs text-red-500">{errors.type}</p>}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Titre de l'archive"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description de l'archive..."
              rows={3}
            />
          </div>

          {/* Document Upload Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Documents joints</h4>
            
            {/* Drag and drop zone */}
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-6 transition-colors",
                dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                "hover:border-primary/50"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center text-center">
                <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Glissez-déposez vos fichiers ici ou
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Téléchargement...
                    </>
                  ) : (
                    'Parcourir les fichiers'
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  PDF, Word, Excel, JPEG, PNG, TIFF (max. 50MB)
                </p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.tiff,.tif"
              multiple
              onChange={(e) => handleFileUpload(e.target.files)}
            />

            {/* Uploaded files list */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Fichiers téléchargés</Label>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <motion.div
                      key={`${file.fileName}-${index}`}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        {getFileIcon(file.type)}
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                            {file.isNew && <span className="ml-2 text-green-600">(nouveau)</span>}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewFile(file.url)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Client Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Informations client</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Nom du client</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                  placeholder="Nom du client"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientNumber">Numéro client</Label>
                <Input
                  id="clientNumber"
                  value={formData.clientNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientNumber: e.target.value }))}
                  placeholder="CLI-000000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Numéro de compte</Label>
                <Input
                  id="accountNumber"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                  placeholder="FR76 xxxx xxxx"
                />
              </div>
            </div>
          </div>

          {/* Agency and Department */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="agencyId">Agence *</Label>
              <Select
                value={formData.agencyId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, agencyId: value }))}
              >
                <SelectTrigger className={errors.agencyId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Sélectionner une agence" />
                </SelectTrigger>
                <SelectContent>
                  {mockAgencies.map((agency) => (
                    <SelectItem key={agency.id} value={agency.id}>
                      {agency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.agencyId && <p className="text-xs text-red-500">{errors.agencyId}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Département</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                placeholder="Service / Département"
              />
            </div>
          </div>

          {/* Confidentiality and Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="confidentiality">Niveau de confidentialité</Label>
              <Select
                value={formData.confidentiality}
                onValueChange={(value) => setFormData(prev => ({ ...prev, confidentiality: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLIC">Public</SelectItem>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="CONFIDENTIAL">Confidentiel</SelectItem>
                  <SelectItem value="SECRET">Secret</SelectItem>
                  <SelectItem value="TOP_SECRET">Très Secret</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date du document</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.documentDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.documentDate ? formatDate(formData.documentDate.toISOString()) : "Sélectionner une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.documentDate}
                    onSelect={(date) => setFormData(prev => ({ ...prev, documentDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Keywords */}
          <div className="space-y-2">
            <Label htmlFor="keywords">Mots-clés</Label>
            <Input
              id="keywords"
              value={formData.keywords}
              onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
              placeholder="Séparer par des virgules: contrat, crédit, immobilier"
            />
            <p className="text-xs text-muted-foreground">
              Séparez les mots-clés par des virgules
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
