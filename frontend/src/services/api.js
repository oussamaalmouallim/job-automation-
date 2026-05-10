import axios from 'axios'

const N8N_BASE = import.meta.env.VITE_N8N_BASE_URL || ''

// ─── Instance axios ───────────────────────────────────────────────
const api = axios.create({ baseURL: N8N_BASE, timeout: 60000 })

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('[API Error]', err.message)
    return Promise.reject(err)
  }
)

// ─── SCRAPER LinkedIn ─────────────────────────────────────────────
// Ton scraper existant utilise un chatTrigger n8n.
// Deux modes de connexion :
//
// MODE A (actuel) — chatTrigger : envoie un message texte
//   POST /webhook/{webhookId}/chat  avec { message: "..." }
//
// MODE B (recommandé) — ajouter un nœud "Webhook" dans ton flow n8n
//   pour recevoir { query, location, maxPages } et retourner le JSON
//
// → Change VITE_N8N_SCRAPER_WEBHOOK dans .env selon ton mode

export const triggerScraper = async ({ query, location = 'maroc', maxPages = 2 }) => {
  const webhookUrl = import.meta.env.VITE_N8N_SCRAPER_WEBHOOK

  // MODE A — chatTrigger (ton setup actuel)
  // n8n reçoit un message et lance le workflow
  const res = await axios.post(webhookUrl, {
    message: `scrape linkedin ${query} ${location} maxPages:${maxPages}`,
    // Si ton webhook n8n attend un body différent, adapte ici
  })
  return res.data
}

// Récupère les profils depuis Google Sheets (résultats du scraper)
// Alternative : ajouter un nœud "Respond to Webhook" dans n8n pour retourner le JSON directement
export const getScraperResults = async () => {
  // Placeholder : à connecter à Supabase (Phase 4) ou à un endpoint n8n de lecture
  // Pour l'instant les résultats vont dans Google Sheets
  return []
}

// ─── GÉNÉRATEUR DE POSTS (Phase 1) ───────────────────────────────
export const generatePost = async ({ type, description, tech, tone, model }) => {
  const webhookUrl = import.meta.env.VITE_N8N_POST_WEBHOOK
  const res = await axios.post(webhookUrl, { type, description, tech, tone, model })
  return res.data
}

// ─── LETTRE DE MOTIVATION (Phase 2) ──────────────────────────────
export const adaptLetter = async ({ letterText, jobOffer, template, model }) => {
  const webhookUrl = import.meta.env.VITE_N8N_LETTER_WEBHOOK
  const res = await axios.post(webhookUrl, { letterText, jobOffer, template, model })
  return res.data
}

// ─── RECHERCHE OFFRES (Phase 3) ───────────────────────────────────
export const searchJobs = async ({ query, location, remote, stack }) => {
  const webhookUrl = import.meta.env.VITE_N8N_JOBS_WEBHOOK
  const res = await axios.post(webhookUrl, { query, location, remote, stack })
  return res.data
}

export default api
