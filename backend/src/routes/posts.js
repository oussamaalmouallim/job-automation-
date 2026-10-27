import { Router } from 'express'
import axios from 'axios'
import { prisma } from '../lib/prisma.js'

const router = Router()

const MODELE = 'deepseek/deepseek-chat'
const LONGUEUR_MAX = 2000

const construirePrompt = ({ type, description, tech, tone }) => `Tu es un expert LinkedIn copywriter. Rédige un post LinkedIn en français pour un ingénieur.

Type de post: ${type || 'Projet technique'}
Description: ${description}
Technologies: ${tech || 'non spécifié'}
Ton souhaité: ${tone || 'Professionnel'}

Règles:
- Accroche forte dès la première ligne
- Contenu concret et utile
- Terminer par une question engageante
- 5 à 8 hashtags pertinents à la fin
- Entre 150 et 250 mots
- Ton humain et authentique

Réponds uniquement avec le texte du post, sans commentaire.`

// POST /api/posts/generate
// La clé OpenRouter reste ici, côté serveur : le navigateur ne la voit jamais.
router.post('/generate', async (req, res) => {
  const { type, description, tech, technologies, tone, userId } = req.body ?? {}

  if (!description?.trim()) {
    return res.status(400).json({ error: 'La description est obligatoire' })
  }
  if (description.length > LONGUEUR_MAX) {
    return res.status(400).json({ error: `La description est trop longue (${LONGUEUR_MAX} caractères maximum)` })
  }

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENROUTER_API_KEY non configurée sur le serveur' })
  }

  const userTechnologies = String(technologies || tech || '').slice(0, 300)

  try {
    const openRouterRes = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: MODELE,
        messages: [{ role: 'user', content: construirePrompt({ type, description, tech: userTechnologies, tone }) }],
        max_tokens: 1000,
        temperature: 0.8,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
          'X-Title': 'LinkedAI',
        },
        timeout: 60_000,
      }
    )

    const generatedContent = openRouterRes.data?.choices?.[0]?.message?.content
    if (!generatedContent) {
      return res.status(502).json({ error: 'Réponse OpenRouter invalide' })
    }

    const log = await prisma.generatedPostLog.create({
      data: {
        userId: userId || null,
        type: type || null,
        description,
        technologies: userTechnologies || null,
        tone: tone || null,
        model: MODELE,
        generatedContent,
        rawResponse: JSON.stringify(openRouterRes.data),
      },
    })

    return res.json({ success: true, post: generatedContent, log })
  } catch (err) {
    const message = err.response?.data?.error?.message || err.message
    console.error('[Posts] Erreur OpenRouter:', message)
    return res.status(502).json({ error: `Erreur OpenRouter : ${message}` })
  }
})

// GET /api/posts/logs
router.get('/logs', async (req, res) => {
  try {
    const { userId } = req.query

    const logs = await prisma.generatedPostLog.findMany({
      where: userId ? { userId: String(userId) } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return res.json({ success: true, logs })
  } catch (err) {
    console.error('[Posts] Erreur Prisma:', err.message)
    return res.status(500).json({ error: 'Erreur lors de la lecture des logs' })
  }
})

export default router
