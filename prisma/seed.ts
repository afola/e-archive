import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { code: 'ADMIN' },
    update: {},
    create: {
      name: 'Administrateur',
      code: 'ADMIN',
      description: 'Administrateur système avec tous les droits',
      level: 100,
      permissions: JSON.stringify(['*']),
      isSystem: true,
    },
  })

  const managerRole = await prisma.role.upsert({
    where: { code: 'MANAGER' },
    update: {},
    create: {
      name: 'Gestionnaire',
      code: 'MANAGER',
      description: 'Gestionnaire des archives',
      level: 50,
      permissions: JSON.stringify([
        'archives:read', 'archives:write', 'archives:delete',
        'movements:read', 'movements:write',
        'workflows:read', 'workflows:approve',
        'reports:read',
      ]),
      isSystem: true,
    },
  })

  const userRole = await prisma.role.upsert({
    where: { code: 'USER' },
    update: {},
    create: {
      name: 'Utilisateur',
      code: 'USER',
      description: 'Utilisateur standard',
      level: 10,
      permissions: JSON.stringify([
        'archives:read',
        'movements:read',
        'workflows:read', 'workflows:create',
      ]),
      isSystem: true,
    },
  })

  console.log('✅ Roles created')

  // Create agencies
  const agencies = await Promise.all([
    prisma.agency.upsert({
      where: { code: 'HQ' },
      update: {},
      create: {
        code: 'HQ',
        name: 'Siège Social',
        address: '1 Place de la Bourse',
        city: 'Paris',
        region: 'Île-de-France',
        isActive: true,
      },
    }),
    prisma.agency.upsert({
      where: { code: 'LYON' },
      update: {},
      create: {
        code: 'LYON',
        name: 'Agence Lyon',
        address: '15 Rue de la République',
        city: 'Lyon',
        region: 'Auvergne-Rhône-Alpes',
        isActive: true,
      },
    }),
    prisma.agency.upsert({
      where: { code: 'MARSEILLE' },
      update: {},
      create: {
        code: 'MARSEILLE',
        name: 'Agence Marseille',
        address: '20 La Canebière',
        city: 'Marseille',
        region: 'Provence-Alpes-Côte d\'Azur',
        isActive: true,
      },
    }),
    prisma.agency.upsert({
      where: { code: 'BORDEAUX' },
      update: {},
      create: {
        code: 'BORDEAUX',
        name: 'Agence Bordeaux',
        address: '10 Cours de l\'Intendance',
        city: 'Bordeaux',
        region: 'Nouvelle-Aquitaine',
        isActive: true,
      },
    }),
  ])

  console.log('✅ Agencies created')

  // Create archive types
  const archiveTypes = await Promise.all([
    prisma.archiveType.upsert({
      where: { code: 'KYC' },
      update: {},
      create: {
        code: 'KYC',
        name: 'Documents KYC',
        description: 'Documents de connaissance client',
        retentionYears: 10,
        category: 'CONFORMITE',
        color: '#3b82f6',
        isActive: true,
      },
    }),
    prisma.archiveType.upsert({
      where: { code: 'CREDIT' },
      update: {},
      create: {
        code: 'CREDIT',
        name: 'Dossiers de Crédit',
        description: 'Dossiers complets de crédit',
        retentionYears: 10,
        category: 'CREDIT',
        color: '#10b981',
        isActive: true,
      },
    }),
    prisma.archiveType.upsert({
      where: { code: 'CONTRAT' },
      update: {},
      create: {
        code: 'CONTRAT',
        name: 'Contrats',
        description: 'Contrats commerciaux et juridiques',
        retentionYears: 10,
        category: 'JURIDIQUE',
        color: '#8b5cf6',
        isActive: true,
      },
    }),
    prisma.archiveType.upsert({
      where: { code: 'COMPTA' },
      update: {},
      create: {
        code: 'COMPTA',
        name: 'Pièces Comptables',
        description: 'Documents comptables et fiscaux',
        retentionYears: 10,
        category: 'COMPTABILITE',
        color: '#f59e0b',
        isActive: true,
      },
    }),
    prisma.archiveType.upsert({
      where: { code: 'RH' },
      update: {},
      create: {
        code: 'RH',
        name: 'Documents RH',
        description: 'Dossiers du personnel',
        retentionYears: 5,
        category: 'RH',
        color: '#ec4899',
        isActive: true,
      },
    }),
    prisma.archiveType.upsert({
      where: { code: 'JURIDIQUE' },
      update: {},
      create: {
        code: 'JURIDIQUE',
        name: 'Documents Juridiques',
        description: 'Statuts, PV, contentieux',
        retentionYears: 15,
        category: 'JURIDIQUE',
        color: '#6366f1',
        isActive: true,
      },
    }),
    prisma.archiveType.upsert({
      where: { code: 'COMITE' },
      update: {},
      create: {
        code: 'COMITE',
        name: 'PV Comités',
        description: 'Procès-verbaux des comités',
        retentionYears: 20,
        category: 'DIRECTION',
        color: '#14b8a6',
        isActive: true,
      },
    }),
  ])

  console.log('✅ Archive types created')

  // Create admin user
  const passwordHash = await bcrypt.hash('Admin@2025!', 12)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@archives-banque.fr' },
    update: {},
    create: {
      email: 'admin@archives-banque.fr',
      name: 'Administrateur',
      firstName: 'Admin',
      lastName: 'System',
      passwordHash,
      roleId: adminRole.id,
      agencyId: agencies[0].id,
      department: 'DSI',
      position: 'Administrateur Système',
      isActive: true,
    },
  })

  // Create demo users
  const managerPassword = await bcrypt.hash('Manager@2025!', 12)
  const userPassword = await bcrypt.hash('User@2025!', 12)

  await prisma.user.upsert({
    where: { email: 'marie.dubois@archives-banque.fr' },
    update: {},
    create: {
      email: 'marie.dubois@archives-banque.fr',
      name: 'Marie Dubois',
      firstName: 'Marie',
      lastName: 'Dubois',
      passwordHash: managerPassword,
      roleId: managerRole.id,
      agencyId: agencies[0].id,
      department: 'Archives',
      position: 'Responsable Archives',
      isActive: true,
    },
  })

  await prisma.user.upsert({
    where: { email: 'jean.martin@archives-banque.fr' },
    update: {},
    create: {
      email: 'jean.martin@archives-banque.fr',
      name: 'Jean Martin',
      firstName: 'Jean',
      lastName: 'Martin',
      passwordHash: userPassword,
      roleId: userRole.id,
      agencyId: agencies[1].id,
      department: 'Crédit',
      position: 'Chargé de clientèle',
      isActive: true,
    },
  })

  console.log('✅ Users created')
  
  console.log('\n📧 Comptes créés:')
  console.log('   Admin: admin@archives-banque.fr / Admin@2025!')
  console.log('   Manager: marie.dubois@archives-banque.fr / Manager@2025!')
  console.log('   User: jean.martin@archives-banque.fr / User@2025!')

  console.log('\n✅ Seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
