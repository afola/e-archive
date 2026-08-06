import { NextRequest, NextResponse } from 'next/server'
import { ensureMockApiEnabled } from '@/lib/mock-api-guard'
import ZAI from 'z-ai-web-dev-sdk'

// Types
interface ExtractedEntity {
  id: string
  type: 'iban' | 'amount' | 'date' | 'name' | 'reference' | 'account' | 'agency'
  value: string
  confidence: number
  position?: { start: number; end: number }
}

interface OCRResult {
  fileId: string
  fileName: string
  extractedText: string
  entities: ExtractedEntity[]
  overallConfidence: number
  processingTime: number
  language: string
  pageCount?: number
}

interface ClassificationSuggestion {
  type: string
  label: string
  confidence: number
}

interface ClassificationTag {
  id: string
  name: string
  category: string
}

interface ClassificationResult {
  fileId: string
  suggestions: ClassificationSuggestion[]
  tags: ClassificationTag[]
  metadata: {
    title?: string
    clientName?: string
    accountNumber?: string
    documentDate?: string
    reference?: string
    agency?: string
    confidentiality?: string
    retentionPeriod?: number
  }
  isValid: boolean
  validationErrors: string[]
}

// Helper to convert file to base64
async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  return buffer.toString('base64')
}

// Extract entities using regex patterns
function extractEntities(text: string): ExtractedEntity[] {
  const entities: ExtractedEntity[] = []

  // IBAN pattern (French format mainly)
  const ibanPattern = /FR\d{2}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}/gi
  let match
  while ((match = ibanPattern.exec(text)) !== null) {
    entities.push({
      id: `entity-${entities.length}`,
      type: 'iban',
      value: match[0].replace(/\s/g, ''),
      confidence: 0.95,
      position: { start: match.index, end: match.index + match[0].length },
    })
  }

  // General IBAN pattern (other countries)
  const generalIbanPattern = /[A-Z]{2}\d{2}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{1,4}/gi
  while ((match = generalIbanPattern.exec(text)) !== null) {
    if (!entities.some((e) => e.value === match![0].replace(/\s/g, ''))) {
      entities.push({
        id: `entity-${entities.length}`,
        type: 'iban',
        value: match[0].replace(/\s/g, ''),
        confidence: 0.92,
        position: { start: match.index, end: match.index + match[0].length },
      })
    }
  }

  // Amount patterns (€)
  const amountPattern = /(\d{1,3}(?:\s?\d{3})*(?:[,.]\d{2})?)\s*€/g
  while ((match = amountPattern.exec(text)) !== null) {
    entities.push({
      id: `entity-${entities.length}`,
      type: 'amount',
      value: match[0],
      confidence: 0.88,
      position: { start: match.index, end: match.index + match[0].length },
    })
  }

  // Date patterns
  const datePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g
  while ((match = datePattern.exec(text)) !== null) {
    entities.push({
      id: `entity-${entities.length}`,
      type: 'date',
      value: match[0],
      confidence: 0.85,
      position: { start: match.index, end: match.index + match[0].length },
    })
  }

  // Account number pattern
  const accountPattern = /(?:compte|n°\s*compte|numéro\s*compte)[:\s]*([A-Z0-9]{8,15})/gi
  while ((match = accountPattern.exec(text)) !== null) {
    entities.push({
      id: `entity-${entities.length}`,
      type: 'account',
      value: match[1],
      confidence: 0.82,
      position: { start: match.index, end: match.index + match[0].length },
    })
  }

  // Reference pattern
  const refPattern = /(?:réf|reference|ref)[:\s]*([A-Z0-9\-]{6,20})/gi
  while ((match = refPattern.exec(text)) !== null) {
    entities.push({
      id: `entity-${entities.length}`,
      type: 'reference',
      value: match[1],
      confidence: 0.80,
      position: { start: match.index, end: match.index + match[0].length },
    })
  }

  // Name pattern (Monsieur/Madame followed by name)
  const namePattern = /(?:Monsieur|Madame|M\.|Mme)\s+([A-Z][a-zéèêëàâäùûüôöîïç]+(?:\s+[A-Z][a-zéèêëàâäùûüôöîïç]+)?)/g
  while ((match = namePattern.exec(text)) !== null) {
    entities.push({
      id: `entity-${entities.length}`,
      type: 'name',
      value: match[1],
      confidence: 0.78,
      position: { start: match.index, end: match.index + match[0].length },
    })
  }

  return entities
}

// Generate classification based on text content
function generateClassification(text: string, entities: ExtractedEntity[]): ClassificationResult {
  const suggestions: ClassificationSuggestion[] = []
  const tags: ClassificationTag[] = []
  const validationErrors: string[] = []

  // Analyze content for document type
  const lowerText = text.toLowerCase()

  // Check for document types
  if (lowerText.includes('contrat') || lowerText.includes('convention')) {
    suggestions.push({ type: 'contract', label: 'Contrat', confidence: 0.85 })
  }
  if (lowerText.includes('facture') || lowerText.includes('montant dû') || lowerText.includes('total')) {
    suggestions.push({ type: 'invoice', label: 'Facture', confidence: 0.80 })
  }
  if (lowerText.includes('relevé') || lowerText.includes('solde') || lowerText.includes('crédit') || lowerText.includes('débit')) {
    suggestions.push({ type: 'statement', label: 'Relevé bancaire', confidence: 0.88 })
  }
  if (lowerText.includes('courrier') || lowerText.includes('lettre') || lowerText.includes('monsieur') || lowerText.includes('madame')) {
    suggestions.push({ type: 'correspondence', label: 'Correspondance', confidence: 0.75 })
  }
  if (lowerText.includes('carte d') || lowerText.includes("pièce d'identité") || lowerText.includes('cni') || lowerText.includes('passport')) {
    suggestions.push({ type: 'identity', label: "Pièce d'identité", confidence: 0.90 })
  }
  if (lowerText.includes('formulaire') || lowerText.includes('demande')) {
    suggestions.push({ type: 'form', label: 'Formulaire', confidence: 0.78 })
  }
  if (lowerText.includes('rapport') || lowerText.includes('analyse')) {
    suggestions.push({ type: 'report', label: 'Rapport', confidence: 0.80 })
  }
  if (lowerText.includes('juridique') || lowerText.includes('légal') || lowerText.includes('tribunal')) {
    suggestions.push({ type: 'legal', label: 'Document légal', confidence: 0.85 })
  }

  // Default if no match
  if (suggestions.length === 0) {
    suggestions.push({ type: 'other', label: 'Autre', confidence: 0.50 })
  }

  // Sort by confidence
  suggestions.sort((a, b) => b.confidence - a.confidence)

  // Generate tags based on content and entities
  if (entities.some((e) => e.type === 'amount')) {
    tags.push({ id: 'financial', name: 'Financier', category: 'domain' })
  }
  if (lowerText.includes('client')) {
    tags.push({ id: 'client', name: 'Client', category: 'entity' })
  }
  if (lowerText.includes('audit') || lowerText.includes('contrôle')) {
    tags.push({ id: 'audit', name: 'Audit', category: 'regulatory' })
  }
  if (lowerText.includes('conformité') || lowerText.includes('rgpd')) {
    tags.push({ id: 'compliance', name: 'Conformité', category: 'regulatory' })
  }

  // Extract metadata from entities
  const metadata: ClassificationResult['metadata'] = {}

  const ibanEntity = entities.find((e) => e.type === 'iban')
  if (ibanEntity) {
    metadata.accountNumber = ibanEntity.value
  }

  const dateEntity = entities.find((e) => e.type === 'date')
  if (dateEntity) {
    metadata.documentDate = dateEntity.value
  }

  const refEntity = entities.find((e) => e.type === 'reference')
  if (refEntity) {
    metadata.reference = refEntity.value
  }

  // Validation checks
  if (entities.length === 0) {
    validationErrors.push('Aucune entité détectée dans le document')
  }

  if (!metadata.documentDate) {
    validationErrors.push('Date du document non détectée')
  }

  if (entities.filter((e) => e.type === 'iban').length > 1) {
    validationErrors.push('Plusieurs IBAN détectés, veuillez vérifier')
  }

  return {
    fileId: '',
    suggestions,
    tags,
    metadata,
    isValid: validationErrors.length === 0,
    validationErrors,
  }
}

// Main OCR function for images using VLM
async function performOCRImage(file: File, fileId: string): Promise<OCRResult> {
  const startTime = Date.now()

  try {
    const zai = await ZAI.create()
    const base64 = await fileToBase64(file)
    const mimeType = file.type

    // Use VLM for document understanding with createVision
    const response = await zai.chat.completions.createVision({
      model: 'glm-4v-flash',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Tu es un expert en analyse de documents bancaires et administratifs. Extrais tout le texte visible du document de manière précise et structurée.

Tu dois:
1. Transcrire fidèlement tout le texte visible
2. Identifier et mettre en évidence les informations importantes (IBAN, montants, dates, noms, références, numéros de compte)
3. Indiquer la structure du document (titres, sections, tableaux)
4. Si le document contient des tableaux, les préserver dans un format lisible avec des colonnes alignées

Présente le texte extrait de manière structurée et lisible.`,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64}`,
              },
            },
          ],
        },
      ],
      thinking: { type: 'disabled' },
    })

    const extractedText = response.choices[0]?.message?.content || ''

    // Extract entities from the text
    const entities = extractEntities(extractedText)

    // Calculate overall confidence based on entities and text length
    let overallConfidence = 0.75
    if (extractedText.length > 100) overallConfidence += 0.1
    if (entities.length > 0) overallConfidence += 0.1
    if (entities.some((e) => e.confidence > 0.9)) overallConfidence += 0.05
    overallConfidence = Math.min(overallConfidence, 0.98)

    return {
      fileId,
      fileName: file.name,
      extractedText,
      entities,
      overallConfidence,
      processingTime: Date.now() - startTime,
      language: 'Français',
    }
  } catch (error) {
    console.error('OCR Image Error:', error)
    throw error
  }
}

// Main OCR function for PDFs - convert to images and use VLM
async function performOcrPDF(file: File, fileId: string): Promise<OCRResult> {
  const startTime = Date.now()

  try {
    console.log('Starting PDF processing...')
    
    // Convert PDF to base64
    const base64 = await fileToBase64(file)
    
    // Get page count from PDF using basic parsing
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const pdfString = buffer.toString('binary')
    const pageMatch = pdfString.match(/\/Type\s*\/Page[^s]/g)
    const pageCount = pageMatch ? pageMatch.length : 1
    
    console.log(`PDF has approximately ${pageCount} page(s)`)
    
    // Use VLM to analyze the PDF
    const zai = await ZAI.create()
    
    const response = await zai.chat.completions.createVision({
      model: 'glm-4v-flash',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Tu es un expert en analyse de documents bancaires et administratifs PDF.

Ce document PDF contient ${pageCount} page(s). Extrais tout le texte de manière précise et structurée.

Tu dois:
1. Transcrire fidèlement tout le texte visible dans chaque page
2. Identifier les informations importantes (IBAN, montants, dates, noms, références, numéros de compte)
3. Préserver la structure du document (titres, sections, tableaux)
4. Pour les tableaux, utiliser un format avec colonnes alignées

Extrais le contenu complet de ce document PDF. Présente-le page par page de manière structurée.`,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:application/pdf;base64,${base64}`,
              },
            },
          ],
        },
      ],
      thinking: { type: 'disabled' },
    })

    const extractedText = response.choices[0]?.message?.content || ''

    // Extract entities from the text
    const entities = extractEntities(extractedText)

    // Calculate overall confidence
    let overallConfidence = 0.80
    if (extractedText.length > 100) overallConfidence += 0.08
    if (entities.length > 0) overallConfidence += 0.08
    if (entities.some((e) => e.confidence > 0.9)) overallConfidence += 0.04
    overallConfidence = Math.min(overallConfidence, 0.96)

    return {
      fileId,
      fileName: file.name,
      extractedText,
      entities,
      overallConfidence,
      processingTime: Date.now() - startTime,
      language: 'Français',
      pageCount,
    }
  } catch (error) {
    console.error('OCR PDF Error:', error)
    throw error
  }
}

// POST handler for file upload and OCR
export async function POST(request: NextRequest) {
  const disabledResponse = ensureMockApiEnabled()
  if (disabledResponse) {
    return disabledResponse
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const fileId = formData.get('fileId') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!fileId) {
      return NextResponse.json({ error: 'No fileId provided' }, { status: 400 })
    }

    let ocrResult: OCRResult

    // Determine file type and process accordingly
    const isPDF = file.type === 'application/pdf'
    
    if (isPDF) {
      // Process PDF with VLM
      ocrResult = await performOcrPDF(file, fileId)
    } else if (file.type.startsWith('image/')) {
      // Process image with VLM
      ocrResult = await performOCRImage(file, fileId)
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload a PDF or image file.' },
        { status: 400 }
      )
    }

    // Generate classification
    const classification = generateClassification(ocrResult.extractedText, ocrResult.entities)
    classification.fileId = fileId

    return NextResponse.json({
      ocr: ocrResult,
      classification,
    })
  } catch (error) {
    console.error('Capture API Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to process document'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

// GET handler for processing status
export async function GET(request: NextRequest) {
  const disabledResponse = ensureMockApiEnabled()
  if (disabledResponse) {
    return disabledResponse
  }

  const { searchParams } = new URL(request.url)
  const fileId = searchParams.get('fileId')

  if (!fileId) {
    return NextResponse.json({ error: 'No fileId provided' }, { status: 400 })
  }

  return NextResponse.json({
    fileId,
    status: 'completed',
    progress: 100,
  })
}
