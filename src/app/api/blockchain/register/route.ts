import { NextRequest, NextResponse } from 'next/server'
import { mockArchives } from '@/data/mock-data'
import crypto from 'crypto'

// Simulated blockchain proof storage (in production, this would be on actual blockchain)
const blockchainProofs: Map<string, BlockchainProof> = new Map()

export interface BlockchainProof {
  documentId: string
  documentReference: string
  documentTitle: string
  hash: string
  transactionId: string
  blockNumber: number
  timestamp: string
  network: string
  verified: boolean
}

// Generate a hash for the document
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

// Simulate blockchain transaction
function simulateBlockchainTransaction(hash: string): { transactionId: string; blockNumber: number } {
  // Generate fake transaction ID
  const transactionId = '0x' + crypto.createHash('sha256').update(hash + Date.now()).digest('hex').substring(0, 64)
  
  // Generate fake block number (simulated current block)
  const blockNumber = 18500000 + Math.floor(Math.random() * 10000)
  
  return { transactionId, blockNumber }
}

// POST - Register document on blockchain (simulated)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { documentId, documentType = 'archive' } = body
    
    if (!documentId) {
      return NextResponse.json(
        { success: false, error: 'Document ID is required' },
        { status: 400 }
      )
    }
    
    // Find the document
    let document = null
    if (documentType === 'archive') {
      document = mockArchives.find(a => a.id === documentId)
    }
    
    if (!document) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      )
    }
    
    // Check if already registered
    const existingProof = blockchainProofs.get(documentId)
    if (existingProof) {
      return NextResponse.json({
        success: true,
        data: {
          proof: existingProof,
          message: 'Document already registered on blockchain'
        }
      })
    }
    
    // Generate hash
    const hash = generateDocumentHash(document as Record<string, unknown>)
    
    // Simulate blockchain transaction
    const { transactionId, blockNumber } = simulateBlockchainTransaction(hash)
    
    // Create proof
    const proof: BlockchainProof = {
      documentId: document.id,
      documentReference: document.reference,
      documentTitle: document.title,
      hash,
      transactionId,
      blockNumber,
      timestamp: new Date().toISOString(),
      network: 'Ethereum Mainnet (Simulated)',
      verified: true,
    }
    
    // Store proof
    blockchainProofs.set(documentId, proof)
    
    return NextResponse.json({
      success: true,
      data: {
        proof,
        message: 'Document successfully registered on blockchain'
      }
    })
  } catch (error) {
    console.error('Blockchain register error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to register document on blockchain' },
      { status: 500 }
    )
  }
}

// GET - Get existing proof for a document
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
    
    const proof = blockchainProofs.get(documentId)
    
    if (!proof) {
      return NextResponse.json({
        success: true,
        data: {
          proof: null,
          registered: false
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      data: {
        proof,
        registered: true
      }
    })
  } catch (error) {
    console.error('Blockchain get proof error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get blockchain proof' },
      { status: 500 }
    )
  }
}
