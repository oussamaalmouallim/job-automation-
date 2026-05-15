import { Router } from 'express'
import axios from 'axios'
import { prisma } from '../lib/prisma.js'

const router = Router()

const extractGeneratedContent = (data) => {
  if (typeof data === 'string') return data

  return data?.post
    || data?.text
    || data?.content
    || data?.choices?.[0]?.message?.content
    || JSON.stringify(data)
}

// POST /api/posts/generate
router.post('/generate', async (req, res) => {
  try {
    const { type, description, tech, technologies, tone, model, userId } = req.body

    if (!description?.trim()) {
      return res.status(400).json({ error: 'La description est obligatoire' })
    }

    const webhookUrl = process.env.N8N_POST_WEBHOOK || process.env.VITE_N8N_POST_WEBHOOK
    if (!webhookUrl) {
      return res.status(500).json({ error: 'N8N_POST_WEBHOOK non configuré' })
    }

    const userTechnologies = technologies || tech || ''

    const n8nRes = await axios.post(webhookUrl, { type, description, tech: userTechnologies, tone, model }, {
      timeout: 60_000
    })

    const generatedContent = extractGeneratedContent(n8nRes.data)

    const log = await prisma.generatedPostLog.create({
      data: {
        userId: userId || null,
        type: type || null,
        description,
        technologies: userTechnologies || null,
        tone: tone || null,
        model: model || null,
        generatedContent,
        rawResponse: typeof n8nRes.data === 'string' ? n8nRes.data : JSON.stringify(n8nRes.data)
      }
    })

    return res.json({ success: true, post: generatedContent, log })
  } catch (err) {
    console.error('[Posts] Erreur n8n:', err.message)
    return res.status(502).json({ error: 'Erreur lors de la génération du post' })
  }
})

// GET /api/posts/logs
router.get('/logs', async (req, res) => {
  try {
    const { userId } = req.query

    const logs = await prisma.generatedPostLog.findMany({
      where: userId ? { userId: String(userId) } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    return res.json({ success: true, logs })
  } catch (err) {
    console.error('[Posts] Erreur Prisma:', err.message)
    return res.status(500).json({ error: 'Erreur lors de la lecture des logs' })
  }
})

export default router
