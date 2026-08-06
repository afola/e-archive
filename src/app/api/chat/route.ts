import { NextRequest } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import { mockArchives, mockWorkflows, mockKPIData, archiveTypes, mockAgencies } from '@/data/mock-data'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatAction {
  type: string
  label: string
  data?: Record<string, unknown>
}

const SYSTEM_PROMPT = `Tu es un assistant IA spécialisé dans la gestion des archives bancaires pour le système "Archives Bancaires". Tu aides les utilisateurs à:

1. **Rechercher des documents** - Aider à trouver des archives par référence, client, type, etc.
2. **Comprendre les types de documents** - Expliquer les différents types (KYC, Crédit, Contrats, Comptabilité, RH, Juridique, etc.)
3. **Gérer le cycle de vie** - Expliquer les durées de conservation, les procédures de destruction, transfert
4. **Statistiques et rapports** - Fournir des informations sur les KPIs et métriques
5. **Workflows** - Guider dans les processus d'approbation, emprunt, transfert
6. **Classification** - Aider à classifier et catégoriser les documents

**Informations sur le système:**
- Total des archives: ${mockKPIData.totalArchives}
- Archives actives: ${mockKPIData.activeArchives}
- En prêt: ${mockKPIData.onLoanArchives}
- Échéances proches (90 jours): ${mockKPIData.expiringArchives}
- Demandes en attente: ${mockKPIData.pendingValidation}

**Types de documents disponibles:**
${archiveTypes.map(t => `- ${t.code}: ${t.name} (${t.category}) - Conservation: ${t.retentionYears} ans`).join('\n')}

**Agences:**
${mockAgencies.map(a => `- ${a.code}: ${a.name} (${a.city})`).join('\n')}

**Règles importantes:**
- Réponds toujours en français
- Sois professionnel et précis
- Si tu ne connais pas la réponse, dis-le honnêtement
- Propose des actions concrètes quand c'est pertinent
- Utilise un ton professionnel mais amical
- Donne des références précises quand tu mentionnes des documents
- Formate tes réponses de manière claire avec des listes quand approprié`

function createSSEData(data: object): string {
  return `data: ${JSON.stringify(data)}\n\n`
}

async function handleSearchAction(query: string): Promise<{ content: string; links?: Array<{ text: string; href: string; type: string }> }> {
  const searchLower = query.toLowerCase()
  const results = mockArchives.filter(a =>
    a.reference.toLowerCase().includes(searchLower) ||
    a.title.toLowerCase().includes(searchLower) ||
    a.clientName?.toLowerCase().includes(searchLower) ||
    a.accountNumber?.toLowerCase().includes(searchLower)
  ).slice(0, 5)

  if (results.length === 0) {
    return { content: `Aucun résultat trouvé pour "${query}". Essayez avec d'autres termes de recherche.` }
  }

  const links = results.map(a => ({
    text: `${a.reference} - ${a.title}`,
    href: `/archives?id=${a.id}`,
    type: 'archive'
  }))

  const content = `J'ai trouvé ${results.length} résultat(s) pour "${query}":\n\n${results.map((a, i) => 
    `${i + 1}. **${a.reference}** - ${a.title}\n   - Type: ${a.typeName}\n   - Statut: ${a.status}\n   - Client: ${a.clientName || 'N/A'}`
  ).join('\n\n')}`

  return { content, links }
}

async function getStats(): Promise<string> {
  const today = new Date()
  const stats = {
    totalArchives: mockKPIData.totalArchives,
    activeArchives: mockKPIData.activeArchives,
    onLoan: mockKPIData.onLoanArchives,
    expiring: mockKPIData.expiringArchives,
    pendingRequests: mockKPIData.pendingValidation,
    movements: mockKPIData.totalMovements,
    activeRate: ((mockKPIData.activeArchives / mockKPIData.totalArchives) * 100).toFixed(1),
    byType: archiveTypes.slice(0, 5).map(t => ({
      name: t.name,
      count: mockArchives.filter(a => a.type === t.code).length
    }))
  }

  return `📊 **Statistiques du jour** (${today.toLocaleDateString('fr-FR')})

**Vue d'ensemble:**
- Total des archives: **${stats.totalArchives}**
- Archives actives: **${stats.activeArchives}** (${stats.activeRate}%)
- En prêt: **${stats.onLoan}**
- Échéances proches (90 jours): **${stats.expiring}**
- Demandes en attente: **${stats.pendingRequests}**
- Mouvements ce mois: **${stats.movements}**

**Top 5 types de documents:**
${stats.byType.map((t, i) => `${i + 1}. ${t.name}: ${t.count} documents`).join('\n')}

💡 *Astuce: Utilisez le tableau de bord pour plus de détails.*`
}

async function getRecentDocuments(): Promise<{ content: string; links?: Array<{ text: string; href: string; type: string }> }> {
  const recent = [...mockArchives]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  const links = recent.map(a => ({
    text: `${a.reference} - ${a.title}`,
    href: `/archives?id=${a.id}`,
    type: 'archive' as const
  }))

  const content = `📄 **Documents récemment modifiés**

${recent.map((a, i) => 
  `${i + 1}. **${a.reference}**\n   - ${a.title}\n   - Modifié le: ${new Date(a.updatedAt).toLocaleDateString('fr-FR')}\n   - Par: ${a.lastActionType || 'N/A'}`
).join('\n\n')}`

  return { content, links }
}

async function getDeadlines(): Promise<{ content: string; links?: Array<{ text: string; href: string; type: string }> }> {
  const now = new Date()
  const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  
  const upcomingDeadlines = mockArchives.filter(a => {
    const retentionEnd = new Date(a.retentionEndDate)
    return retentionEnd >= now && retentionEnd <= weekLater
  }).slice(0, 5)

  const pendingWorkflows = mockWorkflows.filter(w => 
    w.status === 'SUBMITTED' || w.status === 'IN_VALIDATION'
  ).filter(w => w.dueDate && new Date(w.dueDate) <= weekLater)

  const links = [...upcomingDeadlines.map(a => ({
    text: `${a.reference} - Fin de conservation`,
    href: `/archives?id=${a.id}`,
    type: 'archive' as const
  })), ...pendingWorkflows.map(w => ({
    text: `${w.title || w.type} - Workflow en attente`,
    href: `/workflows?id=${w.id}`,
    type: 'workflow' as const
  }))].slice(0, 5)

  const content = `⏰ **Échéances cette semaine** (jusqu'au ${weekLater.toLocaleDateString('fr-FR')})

**Archives en fin de conservation:**
${upcomingDeadlines.length > 0 
  ? upcomingDeadlines.map((a, i) => 
      `${i + 1}. **${a.reference}** - ${new Date(a.retentionEndDate).toLocaleDateString('fr-FR')}\n   - ${a.title}`
    ).join('\n\n')
  : 'Aucune archive en fin de conservation cette semaine.'
}

**Workflows en attente:**
${pendingWorkflows.length > 0
  ? pendingWorkflows.map((w, i) =>
      `${i + 1}. **${w.type}** - ${w.requesterName}\n   - Priorité: ${w.priority}\n   - Échéance: ${w.dueDate ? new Date(w.dueDate).toLocaleDateString('fr-FR') : 'N/A'}`
    ).join('\n\n')
  : 'Aucun workflow urgent.'
}

⚠️ *Pensez à traiter ces demandes en temps voulu.*`

  return { content, links }
}

async function getClassificationHelp(): Promise<string> {
  return `📁 **Guide de classification des documents**

Le système utilise les catégories suivantes:

**1. Documents KYC (Conformité)** - 10 ans
   - Pièces d'identité, justificatifs de domicile
   - Formulaires de connaissance client
   - Évaluations de risques

**2. Dossiers de Crédit** - 10 ans
   - Demandes de crédit
   - Contrats de prêt
   - Garanties et sûretés

**3. Contrats (Juridique)** - 10 ans
   - Contrats commerciaux
   - Accords de partenariat
   - Avenants

**4. Pièces Comptables** - 10 ans
   - Factures
   - Bilans
   - Journaux comptables

**5. Documents RH** - 5 ans
   - Dossiers du personnel
   - Contrats de travail
   - Formations

**6. Documents Juridiques** - 15 ans
   - Statuts
   - Procès-verbaux
   - Contentieux

**7. Procès-Verbaux Comités** - 20 ans
   - Comités de direction
   - Comités des risques
   - Comités d'audit

**Comment classer un document:**
1. Identifier le type principal
2. Vérifier la durée de conservation
3. Ajouter les métadonnées (client, compte, etc.)
4. Attribuer le niveau de confidentialité
5. Enregistrer dans le système

💡 *Pour créer une nouvelle archive, utilisez le bouton "Nouvelle archive" dans la page Archives.*`
}

async function buildFallbackResponse(message: string): Promise<{ content: string; links?: Array<{ text: string; href: string; type: string }> }> {
  const normalizedMessage = message.toLowerCase().trim()

  if (!normalizedMessage) {
    return {
      content: 'Je peux vous aider à rechercher des archives, consulter les statistiques, suivre les échéances et guider la classification des documents.'
    }
  }

  if (normalizedMessage.includes('bonjour') || normalizedMessage.includes('salut') || normalizedMessage.includes('bonsoir')) {
    return {
      content: `Bonjour. Je peux vous aider sur:\n\n- la recherche de documents\n- les statistiques du jour\n- les échéances de conservation\n- la classification des documents\n- les workflows d'archives\n\nEssayez par exemple: "statistiques", "documents récents" ou "aide classification".`
    }
  }

  if (normalizedMessage.includes('stat')) {
    return { content: await getStats() }
  }

  if (normalizedMessage.includes('récent') || normalizedMessage.includes('recent') || normalizedMessage.includes('dernier')) {
    return await getRecentDocuments()
  }

  if (normalizedMessage.includes('échéance') || normalizedMessage.includes('echeance') || normalizedMessage.includes('deadline')) {
    return await getDeadlines()
  }

  if (normalizedMessage.includes('classif') || normalizedMessage.includes('catégor') || normalizedMessage.includes('categor') || normalizedMessage.includes('aide')) {
    return { content: await getClassificationHelp() }
  }

  const searchTerms = ['recherche', 'chercher', 'trouve', 'document', 'archive', 'référence', 'reference', 'client', 'compte']
  if (searchTerms.some(term => normalizedMessage.includes(term))) {
    const cleanedQuery = message
      .replace(/^(recherche|chercher|trouve|document|archive|référence|reference)\s*:?\s*/i, '')
      .trim()

    if (cleanedQuery) {
      return await handleSearchAction(cleanedQuery)
    }
  }

  return {
    content: `Je ne peux pas interroger le moteur IA externe pour le moment, mais je peux toujours vous aider avec des réponses locales.\n\nEssayez l'une de ces demandes:\n- "statistiques du jour"\n- "documents récents"\n- "échéances"\n- "aide classification"\n- "recherche ARC-..." ou "recherche client ..."`
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, history = [], actions } = body as { message: string; history: ChatMessage[]; actions?: ChatAction[] }

    // Create streaming response
    const encoder = new TextEncoder()
    const stream = new TransformStream()
    const writer = stream.writable.getWriter()

    // Start streaming in background
    ;(async () => {
      try {
        // Check for quick actions first
        if (actions && actions.length > 0) {
          const action = actions[0]
          let actionResult: { content: string; links?: Array<{ text: string; href: string; type: string }> } | null = null

          switch (action.type) {
            case 'search':
              actionResult = await handleSearchAction(action.data?.query as string || message)
              break
            case 'stats':
              actionResult = { content: await getStats() }
              break
            case 'recent':
              actionResult = await getRecentDocuments()
              break
            case 'deadlines':
              actionResult = await getDeadlines()
              break
            case 'classification':
            case 'help':
              actionResult = { content: await getClassificationHelp() }
              break
          }

          if (actionResult) {
            // Stream the action result
            await writer.write(encoder.encode(createSSEData({ content: actionResult.content })))
            if (actionResult.links) {
              await writer.write(encoder.encode(createSSEData({ links: actionResult.links })))
            }
            await writer.close()
            return
          }
        }

        // Use ZAI for general conversation
        const zai = await ZAI.create()
        
        const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
          { role: 'system', content: SYSTEM_PROMPT },
          ...history.map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content
          })),
          { role: 'user', content: message }
        ]

        const completion = await zai.chat.completions.create({
          messages,
          temperature: 0.7,
          max_tokens: 1000
        })

        const responseContent = completion.choices[0]?.message?.content || 'Désolé, je n\'ai pas pu générer une réponse.'
        
        // Send the complete response
        await writer.write(encoder.encode(createSSEData({ content: responseContent })))
        
        // Check if the message contains archive references and add links
        const archiveRefs = responseContent.match(/ARC-[A-Z]+-\d+/g)
        if (archiveRefs) {
          const uniqueRefs = [...new Set(archiveRefs)].slice(0, 3)
          const links = uniqueRefs.map(ref => {
            const archive = mockArchives.find(a => a.reference === ref)
            if (archive) {
              return {
                text: `${ref} - ${archive.title}`,
                href: `/archives?id=${archive.id}`,
                type: 'archive'
              }
            }
            return null
          }).filter(Boolean) as Array<{ text: string; href: string; type: string }>
          
          if (links.length > 0) {
            await writer.write(encoder.encode(createSSEData({ links })))
          }
        }

        await writer.close()
      } catch (error) {
        console.error('Streaming error:', error)
        const fallback = await buildFallbackResponse(message)
        await writer.write(encoder.encode(createSSEData({
          content: fallback.content
        })))
        if (fallback.links) {
          await writer.write(encoder.encode(createSSEData({
            links: fallback.links
          })))
        }
        await writer.close()
      }
    })()

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
