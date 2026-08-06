import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { ensureMockApiEnabled } from '@/lib/mock-api-guard'

// Maximum file size: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024

// Allowed file types
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/tiff',
]

export async function POST(request: NextRequest) {
  const disabledResponse = ensureMockApiEnabled()
  if (disabledResponse) {
    return disabledResponse
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const archiveId = formData.get('archiveId') as string | null
    
    if (!file) {
      return NextResponse.json({ message: 'Aucun fichier fourni' }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        message: `Le fichier est trop volumineux. Maximum: ${MAX_FILE_SIZE / 1024 / 1024}MB` 
      }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        message: 'Type de fichier non autorisé. Types acceptés: PDF, Word, Excel, JPEG, PNG, TIFF' 
      }, { status: 400 })
    }

    // Create unique filename
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const fileName = `${timestamp}_${originalName}`
    
    // Determine subfolder
    const subfolder = archiveId || 'temp'
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'archives', subfolder)
    
    // Create directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Write file
    const filePath = path.join(uploadDir, fileName)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Return file info
    const publicUrl = `/uploads/archives/${subfolder}/${fileName}`
    
    return NextResponse.json({
      success: true,
      file: {
        name: file.name,
        fileName,
        size: file.size,
        type: file.type,
        url: publicUrl,
        path: filePath,
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      message: 'Erreur lors du téléchargement du fichier' 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const disabledResponse = ensureMockApiEnabled()
  if (disabledResponse) {
    return disabledResponse
  }

  try {
    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get('path')
    
    if (!filePath) {
      return NextResponse.json({ message: 'Chemin de fichier non fourni' }, { status: 400 })
    }

    // Security: ensure path is within uploads directory
    const normalizedPath = path.normalize(filePath)
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    
    if (!normalizedPath.startsWith(uploadsDir)) {
      return NextResponse.json({ message: 'Chemin non autorisé' }, { status: 403 })
    }

    // Delete file
    const { unlink } = await import('fs/promises')
    await unlink(normalizedPath)

    return NextResponse.json({ success: true, message: 'Fichier supprimé' })
  } catch {
    return NextResponse.json({ message: 'Erreur lors de la suppression' }, { status: 500 })
  }
}
