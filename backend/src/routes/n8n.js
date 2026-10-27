import { Router } from 'express'
import axios from 'axios'

const router = Router()

// Seuls ces webhooks sont joignables depuis l'extérieur : le reste de n8n reste privé.
const WEBHOOKS_AUTORISES = new Set(['resource-suggestions', 'generate-visual', 'scraper'])

// POST /api/n8n/:name -> n8n /webhook/:name
// Un seul point d'entrée public (ce backend) suffit pour la démo : n8n n'a pas besoin de tunnel.
router.post('/:name', async (req, res) => {
  const { name } = req.params
  if (!WEBHOOKS_AUTORISES.has(name)) {
    return res.status(404).json({ error: 'Webhook inconnu' })
  }

  const base = (process.env.N8N_BASE_URL || 'http://localhost:5678').replace(/\/$/, '')

  try {
    const n8nRes = await axios.post(`${base}/webhook/${name}`, req.body, {
      timeout: 120_000,
      responseType: 'text',
      transformResponse: [(data) => data],
      validateStatus: () => true, // on renvoie tel quel le statut et le corps de n8n
    })
    return res
      .status(n8nRes.status)
      .type(n8nRes.headers['content-type'] || 'application/json')
      .send(n8nRes.data)
  } catch (err) {
    console.error(`[n8n] ${name}:`, err.message)
    return res.status(502).json({ error: 'n8n est injoignable' })
  }
})

export default router
