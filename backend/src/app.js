/**
 * Application Express de LinkedAI, sans démarrage du serveur.
 * Séparée de index.js pour que les tests l'importent (Supertest) sans ouvrir de port.
 * À appeler après le chargement de .env : CORS_ORIGINS est lu ici.
 */
import express  from 'express'
import cors     from 'cors'
import morgan   from 'morgan'

import postRoutes    from './routes/posts.js'
import n8nRoutes     from './routes/n8n.js'
import profilRoutes  from './profils/routes.js'
import { limiter }   from './lib/rateLimit.js'

export const VERSION = '0.1.0'

// Origines autorisées à appeler l'API depuis un navigateur, séparées par des virgules.
export const originesAutorisees = () =>
  (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:3001')
    .split(',').map((o) => o.trim()).filter(Boolean)

export function creerApp({ journal = true } = {}) {
  const app = express()

  // Derrière un tunnel (cloudflared, ngrok), l'IP réelle est dans X-Forwarded-For.
  app.set('trust proxy', 1)

  app.use(cors({ origin: originesAutorisees() }))
  app.use(express.json())
  if (journal) app.use(morgan('dev'))

  // Routes qui consomment de l'IA ou un quota de recherche : limitées par IP pour protéger les clés.
  const limiteIa = limiter({ windowMs: 60_000, max: 20 })
  app.use('/api/posts/generate', limiteIa)
  app.use('/api/n8n',            limiteIa)
  app.use('/api/profils/rechercher', limiteIa)

  app.use('/api/posts',   postRoutes)
  app.use('/api/n8n',     n8nRoutes)
  app.use('/api/profils', profilRoutes)

  // Health check
  app.get('/api/health', (_, res) => res.json({ status: 'ok', version: VERSION }))

  return app
}
