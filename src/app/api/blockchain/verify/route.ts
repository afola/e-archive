import { NextRequest, NextResponse } from 'next/server'
import { mockArchives } from '@/data/mock-data'
import crypto from 'crypto'

// Import the shared proofs from register route
// In production, this would query actual blockchain
const simulatedProofs: Map<string, { hash: string; documentId: string }> = new Map()

// Generate a hash for the document (same as register)
function generateDocumentHash(document: Record<string, unknown>): string {
  const content = JSON.stringify({
    id: document.id,
    reference: document.reference,
    title: document.title,
    type: document.type,
    clientName: document.clientName,
    createdAt: document.createdAt,
  })
  return crypto.createHash('sha256').update(content).digest('hex')
}

export interface VerificationResult {
  verified: boolean
  documentId: string
  documentReference: string
  hash: string
  storedHash?: string
  hashMatch?: boolean
  timestamp?: string
  verificationDate: string
  details: {
    documentIntegrity: boolean
    tamperEvidence: boolean
    authenticity: boolean
  }
  warnings?: string[]
}

// POST - Verify document authenticity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { documentId, providedHash } = body
    
    if (!documentId && !providedHash) {
      return NextResponse.json(
        { success: false, error: 'Document ID or hash is required' },
        { status: 400 }
      )
    }
    
    // Find the document
    let document = null
    if (documentId) {
      document = mockArchives.find(a => a.id === documentId)
    }
    
    if (!document && documentId) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      )
    }
    
    // Generate current hash
    const currentHash = document ? generateDocumentHash(document as Record<string, unknown>) : providedHash
    
    // Check if we have a stored proof (simulated blockchain lookup)
    // In production, this would query the actual blockchain
    const storedProof = simulatedProofs.get(documentId || providedHash)
    
    // For demo purposes, simulate verification
    // If no stored proof, we simulate that the document was registered at some point
    const simulatedStoredHash = storedProof?.hash || currentHash
    
    // Simulate tampering detection (random for demo)
    const isTampered = Math.random() < 0.1 // 10% chance of detecting "tampering" for demo
    
    const hashMatch = !isTampered && currentHash === simulatedStoredHash
    
    const result: VerificationResult = {
      verified: hashMatch,
      documentId: documentId || 'unknown',
      documentReference: document?.reference || 'unknown',
      hash: currentHash,
      storedHash: simulatedStoredHash,
      hashMatch,
      timestamp: storedProof ? new Date().toISOString() : undefined,
      verificationDate: new Date().toISOString(),
      details: {
        documentIntegrity: hashMatch,
        tamperEvidence: !isTampered,
        authenticity: hashMatch && !isTampered,
      },
      warnings: isTampered ? [
        'Potential document tampering detected',
        'Hash values do not match the original registration',
      ] : undefined,
    }
    
    // If verification successful, store the proof
    if (documentId && hashMatch) {
      simulatedProofs.set(documentId, {
        hash: currentHash,
        documentId,
      })
    }
    
    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Blockchain verify error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to verify document' },
      { status: 500 }
    )
  }
}

// GET - Check if document is verified
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const documentId = searchParams.get('documentId')
    
    if (!documentId) {
      return NextResponse.json(
        { success: false, error: 'Document ID is required' },
        { status: 400 }
      )
    }
    
    const storedProof = simulatedProofs.get(documentId)
    
    return NextResponse.json({
      success: true,
      data: {
        isVerified: !!storedProof,
        verifiedAt: storedProof ? new Date().toISOString() : null,
      }
    })
  } catch (error) {
    console.error('Blockchain check error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check verification status' },
      { status: 500 }
    )
  }
}
