/**
 * Tous les appels réseau du front, tous vers le backend (jamais vers OpenRouter ni n8n en direct).
 * Exception : la page Scraper peut viser un autre webhook si l'utilisateur le règle (voir Scraper.jsx).
 */
import axios from 'axios'

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
