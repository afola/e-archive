import { NextRequest, NextResponse } from 'next/server'

// Simple QR Code generator using a basic matrix approach
// For production, consider using a library like 'qrcode'

function generateQRMatrix(data: string): boolean[][] {
  const size = Math.max(21, Math.ceil(Math.sqrt(data.length * 8)) + 10)
  const matrix: boolean[][] = Array(size).fill(null).map(() => Array(size).fill(false))
  
  // Add finder patterns (top-left, top-right, bottom-left)
  const addFinderPattern = (row: number, col: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBlack = r === 0 || r === 6 || c === 0 || c === 6 || 
                        (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        if (row + r < size && col + c < size) {
          matrix[row + r][col + c] = isBlack
        }
      }
    }
  }
  
  addFinderPattern(0, 0)
  addFinderPattern(0, size - 7)
  addFinderPattern(size - 7, 0)
  
  // Add timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0
    matrix[i][6] = i % 2 === 0
  }
  
  // Encode data
  let bitIndex = 0
  const dataBytes = new TextEncoder().encode(data)
  const bits: boolean[] = []
  
  for (const byte of dataBytes) {
    for (let i = 7; i >= 0; i--) {
      bits.push((byte >> i) & 1 === 1)
    }
  }
  
  // Fill data area with encoded bits (simplified)
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col-- // Skip timing pattern
    
    for (let row = 0; row < size; row++) {
      for (let c = 0; c < 2; c++) {
        const currentCol = col - c
        if (row < 9 && currentCol < 9) continue // Skip finder pattern area
        if (row >= size - 9 && currentCol < 9) continue
        if (row < 9 && currentCol >= size - 9) continue
        
        if (bitIndex < bits.length) {
          matrix[row][currentCol] = bits[bitIndex]
          bitIndex++
        }
      }
    }
  }
  
  return matrix
}

function matrixToSVG(matrix: boolean[][], size: number = 200): string {
  const moduleSize = size / matrix.length
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">`
  svg += `<rect width="${size}" height="${size}" fill="white"/>`
  
  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      if (matrix[row][col]) {
        const x = col * moduleSize
        const y = row * moduleSize
        svg += `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" fill="black"/>`
      }
    }
  }
  
  svg += '</svg>'
  return svg
}

function svgToBase64(svg: string): string {
  const base64 = Buffer.from(svg).toString('base64')
  return `data:image/svg+xml;base64,${base64}`
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const locationId = searchParams.get('locationId')
  const code = searchParams.get('code')
  const size = parseInt(searchParams.get('size') || '200', 10)

  if (!locationId && !code) {
    return NextResponse.json({ error: 'Location ID or code required' }, { status: 400 })
  }

  try {
    // Generate QR code data
    const qrData = code || `BOX-${locationId}`
    
    // Generate matrix
    const matrix = generateQRMatrix(qrData)
    
    // Convert to SVG then base64
    const svg = matrixToSVG(matrix, size)
    const base64 = svgToBase64(svg)

    return NextResponse.json({
      success: true,
      qrCode: base64,
      data: qrData,
      format: 'svg',
      size,
    })
  } catch (error) {
    console.error('QR Code generation error:', error)
    return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { locationId, code, boxInfo, size = 200 } = body

    if (!locationId && !code) {
      return NextResponse.json({ error: 'Location ID or code required' }, { status: 400 })
    }

    // Generate QR code data with optional box info
    let qrData = code || `BOX-${locationId}`
    
    // Add box info to QR data if provided
    if (boxInfo) {
      qrData = JSON.stringify({
        type: 'STORAGE_BOX',
        id: locationId,
        code: code,
        location: boxInfo.location,
        site: boxInfo.site,
        building: boxInfo.building,
        room: boxInfo.room,
        shelf: boxInfo.shelf,
      })
    }

    // Generate matrix
    const matrix = generateQRMatrix(qrData)
    
    // Convert to SVG then base64
    const svg = matrixToSVG(matrix, size)
    const base64 = svgToBase64(svg)

    return NextResponse.json({
      success: true,
      qrCode: base64,
      data: qrData,
      format: 'svg',
      size,
    })
  } catch (error) {
    console.error('QR Code generation error:', error)
    return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 })
  }
}
