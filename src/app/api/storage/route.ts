import { NextRequest, NextResponse } from 'next/server'
import { mockStorageLocations, buildLocationTree, boxArchives, StorageLocation } from '@/data/storage-data'

// In-memory storage for modifications
let locations = [...mockStorageLocations]

// GET - Fetch location tree or specific location
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const locationId = searchParams.get('id')
  const type = searchParams.get('type')
  const parentId = searchParams.get('parentId')
  const includeArchives = searchParams.get('includeArchives') === 'true'

  try {
    // Get specific location by ID
    if (locationId) {
      const location = locations.find(l => l.id === locationId)
      if (!location) {
        return NextResponse.json({ error: 'Location not found' }, { status: 404 })
      }
      
      // Include archives if requested
      if (includeArchives && location.type === 'BOX') {
        const archives = boxArchives[location.id] || []
        return NextResponse.json({ ...location, archives })
      }
      
      return NextResponse.json(location)
    }

    // Get locations by type
    if (type) {
      const filtered = locations.filter(l => l.type === type)
      return NextResponse.json(filtered)
    }

    // Get children of a parent
    if (parentId) {
      const children = locations.filter(l => l.parentId === parentId)
      return NextResponse.json(children)
    }

    // Return full tree
    const tree = buildLocationTree(locations)
    
    // Calculate stats
    const stats = {
      totalSites: locations.filter(l => l.type === 'SITE').length,
      totalBuildings: locations.filter(l => l.type === 'BUILDING').length,
      totalRooms: locations.filter(l => l.type === 'ROOM').length,
      totalShelves: locations.filter(l => l.type === 'SHELF').length,
      totalBoxes: locations.filter(l => l.type === 'BOX').length,
      totalArchives: Object.values(boxArchives).flat().length,
      averageFillLevel: Math.round(
        locations.filter(l => l.type === 'BOX').reduce((sum, b) => sum + b.fillLevel, 0) / 
        locations.filter(l => l.type === 'BOX').length
      ),
      lowCapacity: locations.filter(l => l.type === 'BOX' && l.fillLevel >= 80).length,
      availableSpace: locations.filter(l => l.type === 'BOX' && l.fillLevel < 30).length,
    }

    return NextResponse.json({ tree, stats })
  } catch (error) {
    console.error('Storage API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new location
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, parentId, name, code, capacity, description, agencyId, agencyName } = body

    // Validate required fields
    if (!type || !name || !code) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check for duplicate code
    if (locations.some(l => l.code === code)) {
      return NextResponse.json({ error: 'Location code already exists' }, { status: 400 })
    }

    // Get parent location for hierarchy info
    const parent = parentId ? locations.find(l => l.id === parentId) : null

    const newLocation: StorageLocation = {
      id: `loc-${Date.now()}`,
      code,
      name,
      type,
      parentId: parentId || null,
      agencyId: agencyId || parent?.agencyId || 'AG001',
      agencyName: agencyName || parent?.agencyName || 'Siège Central Paris',
      site: parent?.site,
      building: parent?.building,
      room: parent?.room,
      shelf: parent?.shelf,
      description: description || '',
      capacity: capacity || 25,
      currentLoad: 0,
      fillLevel: 0,
      isActive: true,
      hasQrCode: type === 'BOX',
      qrCodeData: type === 'BOX' ? `QR-${code}-${Date.now()}` : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Update hierarchy based on type
    if (parent) {
      switch (type) {
        case 'BUILDING':
          newLocation.site = parent.name
          break
        case 'ROOM':
          newLocation.site = parent.site
          newLocation.building = parent.name
          break
        case 'SHELF':
          newLocation.site = parent.site
          newLocation.building = parent.building
          newLocation.room = parent.name
          break
        case 'BOX':
          newLocation.site = parent.site
          newLocation.building = parent.building
          newLocation.room = parent.room
          newLocation.shelf = parent.name
          break
      }
    }

    locations.push(newLocation)

    return NextResponse.json(newLocation, { status: 201 })
  } catch (error) {
    console.error('Storage POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update location
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Location ID required' }, { status: 400 })
    }

    const index = locations.findIndex(l => l.id === id)
    if (index === -1) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }

    // Update location
    locations[index] = {
      ...locations[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(locations[index])
  } catch (error) {
    console.error('Storage PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Remove location
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Location ID required' }, { status: 400 })
  }

  const location = locations.find(l => l.id === id)
  if (!location) {
    return NextResponse.json({ error: 'Location not found' }, { status: 404 })
  }

  // Check for children
  const hasChildren = locations.some(l => l.parentId === id)
  if (hasChildren) {
    return NextResponse.json({ 
      error: 'Cannot delete location with children. Remove children first.' 
    }, { status: 400 })
  }

  // Check for archives in box
  if (location.type === 'BOX' && boxArchives[id] && boxArchives[id].length > 0) {
    return NextResponse.json({ 
      error: 'Cannot delete box with archives. Remove archives first.' 
    }, { status: 400 })
  }

  locations = locations.filter(l => l.id !== id)

  return NextResponse.json({ success: true, message: 'Location deleted' })
}
