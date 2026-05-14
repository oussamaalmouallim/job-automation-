import axios from 'axios'

const N8N_BASE = import.meta.env.VITE_N8N_BASE_URL || ''

const api = axios.create({ baseURL: N8N_BASE, timeout: 60000 })

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('[API Error]', err.message)
    return Promise.reject(err)
  }
)

// ─── SCRAPER LinkedIn ─────────────────────────────────────────────
export const triggerScraper = async ({ query, location = 'maroc', maxPages = 2 }) => {
  const res = await axios.post('/n8n/webhook/scraper', {
    query,
    location,
    maxPages,
  })
  return res.data
}

export const getScraperResults = async () => []

// ─── GÉNÉRATEUR DE POSTS (Phase 1) ───────────────────────────────
export const generatePost = async ({ type, description, tech, tone, model }) => {
  const res = await axios.post(import.meta.env.VITE_N8N_POST_WEBHOOK, { type, description, tech, tone, model })
  return res.data
}

// ─── LETTRE DE MOTIVATION (Phase 2) ──────────────────────────────
export const adaptLetter = async ({ letterText, jobOffer, template, model }) => {
  const res = await axios.post(import.meta.env.VITE_N8N_LETTER_WEBHOOK, { letterText, jobOffer, template, model })
  return res.data
}

// ─── RECHERCHE OFFRES (Phase 3) ──────────────────────────────────
export const searchJobs = async ({ query, location, remote, stack }) => {
  const res = await axios.post(import.meta.env.VITE_N8N_JOBS_WEBHOOK, { query, location, remote, stack })
  return res.data
}

export default api