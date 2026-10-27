import axios from 'axios'

// Scraper LinkedIn
export const triggerScraper = async ({ query, location = 'maroc', maxPages = 2 }) => {
  const res = await axios.post(`${API_BASE}/n8n/scraper`, { query, location, maxPages })
  return res.data
}

export const getScraperResults = async () => []

// Adresse du backend. En local : le proxy Vite ('/api'). En démo : VITE_API_URL, l'adresse publique du backend.
export const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')

// Generateur de posts : la clé OpenRouter reste sur le backend, le navigateur ne la voit jamais.
export async function generatePost({ type, description, tech, tone }) {
  try {
    const res = await axios.post(`${API_BASE}/posts/generate`, { type, description, tech, tone }, { timeout: 90000 })
    return res.data.post
  } catch (err) {
    if (err.response?.data?.error) throw new Error(err.response.data.error)
    if (!err.response) throw new Error('Backend injoignable : lance-le avec npm run dev (voir README).')
    throw err
  }
}

export const getResources = async ({ post, tech, type }) => {
  const res = await axios.post(`${API_BASE}/n8n/resource-suggestions`, { post, tech, type })
  return res.data
}

// Generateur de visuels IA
export const generateVisual = async ({ post, tech, type }) => {
  const res = await axios.post(`${API_BASE}/n8n/generate-visual`, { post, tech, type })
  return res.data
}

// Lettre de motivation
export const adaptLetter = async ({ letterText, jobOffer, template, model }) => {
  const res = await axios.post(`${API_BASE}/n8n/adapt-letter`, { letterText, jobOffer, template, model })
  return res.data
}

// Recherche offres
export const searchJobs = async ({ query, location, remote, stack }) => {
  const res = await axios.post(`${API_BASE}/n8n/search-jobs`, { query, location, remote, stack })
  return res.data
}
