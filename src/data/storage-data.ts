// Storage Location Types and Mock Data

export interface StorageLocation {
  id: string
  code: string
  name: string
  type: 'SITE' | 'BUILDING' | 'ROOM' | 'SHELF' | 'BOX'
  parentId: string | null
  agencyId: string
  agencyName: string
  site?: string
  building?: string
  room?: string
  shelf?: string
  description?: string
  capacity?: number
  currentLoad: number
  fillLevel: number // percentage 0-100
  isActive: boolean
  hasQrCode: boolean
  qrCodeData?: string
  createdAt: string
  updatedAt: string
  children?: StorageLocation[]
  archives?: ArchiveInBox[]
}

export interface ArchiveInBox {
  id: string
  reference: string
  title: string
  type: string
  typeName: string
  status: string
  confidentiality: string
  clientName?: string
  archiveDate: string
  retentionEndDate: string
}

// Generate storage location tree
const generateStorageLocations = (): StorageLocation[] => {
  const locations: StorageLocation[] = []
  
  // Sites
  const sites = [
    { id: 'site-001', code: 'SITE-PARIS', name: 'Site Paris - Archives Centrales', agencyId: 'AG001', agencyName: 'Siège Central Paris' },
    { id: 'site-002', code: 'SITE-LYON', name: 'Site Lyon - Archives Régionales', agencyId: 'AG002', agencyName: 'Agence Lyon Centre' },
    { id: 'site-003', code: 'SITE-MARSEILLE', name: 'Site Marseille - Archives PACA', agencyId: 'AG003', agencyName: 'Agence Marseille Vieux-Port' },
  ]
  
  // Buildings per site
  const buildings = [
    { id: 'bld-001', code: 'BAT-A', name: 'Bâtiment A', parentId: 'site-001' },
    { id: 'bld-002', code: 'BAT-B', name: 'Bâtiment B', parentId: 'site-001' },
    { id: 'bld-003', code: 'BAT-A', name: 'Bâtiment Principal', parentId: 'site-002' },
    { id: 'bld-004', code: 'BAT-A', name: 'Bâtiment Archives', parentId: 'site-003' },
  ]
  
  // Rooms per building
  const rooms = [
    // Paris Building A
    { id: 'room-001', code: 'SALLE-A1', name: 'Salle A1 - Archives Courantes', parentId: 'bld-001', capacity: 500 },
    { id: 'room-002', code: 'SALLE-A2', name: 'Salle A2 - Archives Historiques', parentId: 'bld-001', capacity: 300 },
    { id: 'room-003', code: 'SALLE-A3', name: 'Salle A3 - Réserve', parentId: 'bld-001', capacity: 200 },
    // Paris Building B
    { id: 'room-004', code: 'SALLE-B1', name: 'Salle B1 - Documents Confidentiels', parentId: 'bld-002', capacity: 150 },
    { id: 'room-005', code: 'SALLE-B2', name: 'Salle B2 - Archives Juridiques', parentId: 'bld-002', capacity: 250 },
    // Lyon
    { id: 'room-006', code: 'SALLE-L1', name: 'Salle L1 - Archives Régionales', parentId: 'bld-003', capacity: 400 },
    { id: 'room-007', code: 'SALLE-L2', name: 'Salle L2 - Réserve Lyon', parentId: 'bld-003', capacity: 200 },
    // Marseille
    { id: 'room-008', code: 'SALLE-M1', name: 'Salle M1 - Archives PACA', parentId: 'bld-004', capacity: 350 },
  ]
  
  // Shelves per room
  const shelves = [
    // Room A1 shelves
    { id: 'shelf-001', code: 'RAYON-R1', name: 'Rayon R1', parentId: 'room-001', capacity: 50 },
    { id: 'shelf-002', code: 'RAYON-R2', name: 'Rayon R2', parentId: 'room-001', capacity: 50 },
    { id: 'shelf-003', code: 'RAYON-R3', name: 'Rayon R3', parentId: 'room-001', capacity: 50 },
    { id: 'shelf-004', code: 'RAYON-R4', name: 'Rayon R4', parentId: 'room-001', capacity: 50 },
    // Room A2 shelves
    { id: 'shelf-005', code: 'RAYON-R1', name: 'Rayon R1', parentId: 'room-002', capacity: 40 },
    { id: 'shelf-006', code: 'RAYON-R2', name: 'Rayon R2', parentId: 'room-002', capacity: 40 },
    // Room B1 shelves
    { id: 'shelf-007', code: 'RAYON-R1', name: 'Rayon R1', parentId: 'room-004', capacity: 30 },
    { id: 'shelf-008', code: 'RAYON-R2', name: 'Rayon R2', parentId: 'room-004', capacity: 30 },
    // Lyon shelves
    { id: 'shelf-009', code: 'RAYON-R1', name: 'Rayon R1', parentId: 'room-006', capacity: 60 },
    { id: 'shelf-010', code: 'RAYON-R2', name: 'Rayon R2', parentId: 'room-006', capacity: 60 },
    // Marseille shelves
    { id: 'shelf-011', code: 'RAYON-R1', name: 'Rayon R1', parentId: 'room-008', capacity: 50 },
    { id: 'shelf-012', code: 'RAYON-R2', name: 'Rayon R2', parentId: 'room-008', capacity: 50 },
  ]
  
  // Boxes per shelf
  let boxIndex = 1
  for (const shelf of shelves) {
    const numBoxes = 8 + Math.floor(Math.random() * 8) // 8-15 boxes per shelf
    for (let i = 1; i <= numBoxes; i++) {
      const currentLoad = Math.floor(Math.random() * 25)
      const capacity = 25
      locations.push({
        id: `box-${String(boxIndex).padStart(3, '0')}`,
        code: `BOITE-${String(i).padStart(3, '0')}`,
        name: `Boîte ${String(i).padStart(3, '0')}`,
        type: 'BOX',
        parentId: shelf.id,
        agencyId: 'AG001',
        agencyName: 'Siège Central Paris',
        site: 'Site Paris',
        building: 'Bâtiment A',
        room: 'Salle A1',
        shelf: `Rayon R${Math.ceil(i / 8)}`,
        description: `Boîte de stockage standard`,
        capacity,
        currentLoad,
        fillLevel: Math.round((currentLoad / capacity) * 100),
        isActive: true,
        hasQrCode: true,
        qrCodeData: `QR-BOX-${String(boxIndex).padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      boxIndex++
    }
  }
  
  // Add sites
  sites.forEach(site => {
    locations.push({
      id: site.id,
      code: site.code,
      name: site.name,
      type: 'SITE',
      parentId: null,
      agencyId: site.agencyId,
      agencyName: site.agencyName,
      site: site.name,
      description: `Site d'archivage principal`,
      currentLoad: 0,
      fillLevel: 0,
      isActive: true,
      hasQrCode: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  })
  
  // Add buildings
  buildings.forEach(bld => {
    const site = sites.find(s => s.id === bld.parentId)
    locations.push({
      id: bld.id,
      code: bld.code,
      name: bld.name,
      type: 'BUILDING',
      parentId: bld.parentId,
      agencyId: site?.agencyId || 'AG001',
      agencyName: site?.agencyName || 'Siège Central Paris',
      site: site?.name,
      building: bld.name,
      description: `Bâtiment d'archivage`,
      currentLoad: 0,
      fillLevel: 0,
      isActive: true,
      hasQrCode: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  })
  
  // Add rooms
  rooms.forEach(room => {
    const bld = buildings.find(b => b.id === room.parentId)
    const site = sites.find(s => s.id === bld?.parentId)
    locations.push({
      id: room.id,
      code: room.code,
      name: room.name,
      type: 'ROOM',
      parentId: room.parentId,
      agencyId: site?.agencyId || 'AG001',
      agencyName: site?.agencyName || 'Siège Central Paris',
      site: site?.name,
      building: bld?.name,
      room: room.name,
      description: `Salle d'archivage`,
      capacity: room.capacity,
      currentLoad: Math.floor(Math.random() * room.capacity * 0.8),
      fillLevel: Math.floor(Math.random() * 80) + 10,
      isActive: true,
      hasQrCode: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  })
  
  // Add shelves
  shelves.forEach(shelf => {
    const room = rooms.find(r => r.id === shelf.parentId)
    const bld = buildings.find(b => b.id === room?.parentId)
    const site = sites.find(s => s.id === bld?.parentId)
    const boxesInShelf = locations.filter(l => l.parentId === shelf.id && l.type === 'BOX')
    const shelfLoad = boxesInShelf.reduce((sum, box) => sum + (box.currentLoad || 0), 0)
    const shelfCapacity = shelf.capacity || 50
    
    locations.push({
      id: shelf.id,
      code: shelf.code,
      name: shelf.name,
      type: 'SHELF',
      parentId: shelf.parentId,
      agencyId: site?.agencyId || 'AG001',
      agencyName: site?.agencyName || 'Siège Central Paris',
      site: site?.name,
      building: bld?.name,
      room: room?.name,
      shelf: shelf.name,
      description: `Rayon de stockage`,
      capacity: shelfCapacity,
      currentLoad: shelfLoad,
      fillLevel: Math.round((shelfLoad / shelfCapacity) * 100),
      isActive: true,
      hasQrCode: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  })
  
  return locations
}

export const mockStorageLocations: StorageLocation[] = generateStorageLocations()

// Helper to build tree structure
export function buildLocationTree(locations: StorageLocation[]): StorageLocation[] {
  const locationMap = new Map<string, StorageLocation>()
  
  // First pass: create map
  locations.forEach(loc => {
    locationMap.set(loc.id, { ...loc, children: [] })
  })
  
  // Second pass: build tree
  const roots: StorageLocation[] = []
  locations.forEach(loc => {
    const node = locationMap.get(loc.id)!
    if (loc.parentId && locationMap.has(loc.parentId)) {
      const parent = locationMap.get(loc.parentId)!
      if (!parent.children) parent.children = []
      parent.children.push(node)
    } else if (loc.type === 'SITE') {
      roots.push(node)
    }
  })
  
  return roots
}

// Get boxes with archives
export function getBoxesWithArchives(shelfId: string): StorageLocation[] {
  return mockStorageLocations.filter(loc => loc.parentId === shelfId && loc.type === 'BOX')
}

// Sample archives for boxes
export const boxArchives: Record<string, ArchiveInBox[]> = {}
mockStorageLocations.filter(l => l.type === 'BOX').forEach(box => {
  const numArchives = Math.floor(Math.random() * 15) + 5
  boxArchives[box.id] = Array.from({ length: numArchives }, (_, i) => ({
    id: `arch-${box.id}-${i}`,
    reference: `ARC-${['KYC', 'CREDIT', 'CONTRACT', 'LEGAL'][Math.floor(Math.random() * 4)]}-${String(Math.floor(Math.random() * 100000)).padStart(6, '0')}`,
    title: `Document ${i + 1} - ${['Client ABC', 'Dossier XYZ', 'Contrat 123'][Math.floor(Math.random() * 3)]}`,
    type: ['KYC', 'CREDIT', 'CONTRACT', 'LEGAL'][Math.floor(Math.random() * 4)],
    typeName: ['Documents KYC', 'Dossiers de Crédit', 'Contrats', 'Documents Juridiques'][Math.floor(Math.random() * 4)],
    status: ['ACTIVE', 'ON_LOAN', 'IN_TRANSFER'][Math.floor(Math.random() * 3)],
    confidentiality: ['NORMAL', 'CONFIDENTIAL', 'SECRET'][Math.floor(Math.random() * 3)],
    clientName: ['Entreprise SARL Martin', 'SCI du Parc', 'SAS Dubois & Fils'][Math.floor(Math.random() * 3)],
    archiveDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    retentionEndDate: new Date(Date.now() + Math.random() * 10 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  }))
})
