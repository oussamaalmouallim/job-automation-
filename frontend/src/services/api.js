import axios from 'axios'

// Scraper LinkedIn
export const triggerScraper = async ({ query, location = 'maroc', maxPages = 2 }) => {
  const res = await axios.post('/n8n/webhook/scraper', { query, location, maxPages })
  return res.data
}

export const getScraperResults = async () => []

// Generateur de posts
export async function generatePostWithOpenRouter({ type, description, tech, tone, model }) {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY

  if (!apiKey || apiKey === 'REMPLACE_PAR_TA_VRAIE_CLE') {
    throw new Error('Cle OpenRouter manquante: ajoute VITE_OPENROUTER_API_KEY dans frontend/.env puis redemarre Vite.')
  }

  const modelId = model === 'gemini'
    ? 'google/gemini-2.0-flash-exp:free'
    : model === 'grok'
      ? 'x-ai/grok-3-mini-beta'
      : 'deepseek/deepseek-chat'

  const prompt = `Tu es un expert LinkedIn copywriter. Rédige un post LinkedIn en français pour un ingénieur.

Type de post: ${type}
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

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://oussamaalmouallim.github.io',
      'X-Title': 'LinkedAI',
    },
    body: JSON.stringify({
      model: modelId,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
      temperature: 0.8,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data?.error?.message || 'Erreur OpenRouter')
  }

  const content = data?.choices?.[0]?.message?.content
  if (!content) {
    throw new Error('Réponse OpenRouter invalide')
  }

  return content
}

export const generatePost = async ({ type, description, tech, tone, model }) => {
  const post = await generatePostWithOpenRouter({ type, description, tech, tone, model })
  return { success: true, post }
}

export const getResources = async ({ post, tech, type }) => {
  const res = await axios.post('/n8n/webhook/resource-suggestions', { post, tech, type })
  return res.data
}

// Generateur de visuels IA
export const generateVisual = async ({ post, tech, type }) => {
  const res = await axios.post('/n8n/webhook/generate-visual', { post, tech, type })
  return res.data
}

// Lettre de motivation
export const adaptLetter = async ({ letterText, jobOffer, template, model }) => {
  const res = await axios.post('/n8n/webhook/adapt-letter', { letterText, jobOffer, template, model })
  return res.data
}

// Recherche offres
export const searchJobs = async ({ query, location, remote, stack }) => {
  const res = await axios.post('/n8n/webhook/search-jobs', { query, location, remote, stack })
  return res.data
}
