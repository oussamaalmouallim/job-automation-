import { Router } from 'express'
import axios from 'axios'

const router = Router()

// POST /api/posts/generate
router.post('/generate', async (req, res) => {
  try {
    const { type, description, tech, tone, model } = req.body

    const webhookUrl = process.env.N8N_POST_WEBHOOK
    if (!webhookUrl) {
      return res.status(500).json({ error: 'N8N_POST_WEBHOOK non configuré' })
    }

    const n8nRes = await axios.post(webhookUrl, { type, description, tech, tone, model }, {
      timeout: 60_000
    })

    return res.json({ success: true, post: n8nRes.data })
  } catch (err) {
    console.error('[Posts] Erreur n8n:', err.message)
    return res.status(502).json({ error: 'Erreur lors de la génération du post' })
  }
})

export default router
