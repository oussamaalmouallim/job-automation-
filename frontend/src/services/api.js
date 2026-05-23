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
  const res = await axios.post('/n8n/webhook/scraper', { query, location, maxPages })
  return res.data
}

export const getScraperResults = async () => []

// ─── GÉNÉRATEUR DE POSTS ──────────────────────────────────────────
export const generatePost = async ({ type, description, tech, tone, model }) => {
  const res = await axios.post('/n8n/webhook/generate-post', { type, description, tech, tone, model })
  return res.data
}

export const getResources = async ({ post, tech, type }) => {
  const res = await axios.post('/n8n/webhook/resource-suggestions', { post, tech, type })
  return res.data
}

// ─── GÉNÉRATEUR DE VISUELS IA ─────────────────────────────────────
export const generateVisual = async ({ post, tech, type }) => {
  const res = await axios.post('/n8n/webhook/generate-visual', { post, tech, type })
  return res.data
}

// ─── LETTRE DE MOTIVATION (Phase 2) ──────────────────────────────
export const adaptLetter = async ({ letterText, jobOffer, template, model }) => {
  const res = await axios.post('/n8n/webhook/adapt-letter', { letterText, jobOffer, template, model })
  return res.data
}

// ─── RECHERCHE OFFRES (Phase 3) ──────────────────────────────────
export const searchJobs = async ({ query, location, remote, stack }) => {
  const res = await axios.post('/n8n/webhook/search-jobs', { query, location, remote, stack })
  return res.data
}

export default api
