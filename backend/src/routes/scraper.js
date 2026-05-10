import { Router } from 'express'
import axios from 'axios'

const router = Router()

// POST /api/scraper/launch
// Proxy vers le webhook n8n du scraper existant
router.post('/launch', async (req, res) => {
  try {
    const { query, location = 'maroc', maxPages = 2 } = req.body

    const webhookUrl = process.env.N8N_SCRAPER_WEBHOOK
    if (!webhookUrl) {
      return res.status(500).json({ error: 'N8N_SCRAPER_WEBHOOK non configuré' })
    }

    // Ton scraper utilise un chatTrigger — on envoie un message texte
    const n8nRes = await axios.post(webhookUrl, {
      message: `scrape linkedin ${query} ${location} maxPages:${maxPages}`,
    }, { timeout: 120_000 })

    return res.json({ success: true, data: n8nRes.data })
  } catch (err) {
    console.error('[Scraper] Erreur n8n:', err.message)
    return res.status(502).json({ error: 'Erreur lors de l\'appel au scraper n8n' })
  }
})

export default router
