/**
 * Point d'entrée du backend LinkedAI (Express, port 4000).
 * Seul service exposé au navigateur : il garde la clé OpenRouter, enregistre les posts (Prisma/SQLite)
 * et relaie les webhooks n8n autorisés. Voir README, section Architecture.
 */
import express  from 'express'
import cors     from 'cors'
import morgan   from 'morgan'
import dotenv   from 'dotenv'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

dotenv.config({ path: resolve(__dirname, '../.env') })
dotenv.config({ path: resolve(__dirname, '../../.env') })

import postRoutes    from './routes/posts.js'
import n8nRoutes     from './routes/n8n.js'
import { limiter }   from './lib/rateLimit.js'

const app  = express()
const PORT = process.env.PORT || 4000

// Origines autorisées à appeler l'API depuis un navigateur, séparées par des virgules.
const ORIGINES = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:3001')
  .split(',').map((o) => o.trim()).filter(Boolean)

// Derrière un tunnel (cloudflared, ngrok), l'IP réelle est dans X-Forwarded-For.
app.set('trust proxy', 1)

app.use(cors({ origin: ORIGINES }))
app.use(express.json())
app.use(morgan('dev'))

// Routes qui consomment de l'IA : limitées par IP pour protéger la clé OpenRouter.
const limiteIa = limiter({ windowMs: 60_000, max: 20 })
app.use('/api/posts/generate', limiteIa)
app.use('/api/n8n',            limiteIa)

app.use('/api/posts',   postRoutes)
app.use('/api/n8n',     n8nRoutes)

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', version: '0.1.0' }))

app.listen(PORT, () => {
  console.log(`\n🚀 Backend LinkedAI démarré sur http://localhost:${PORT}`)
  console.log(`   Origines autorisées : ${ORIGINES.join(', ')}`)
  if (!process.env.OPENROUTER_API_KEY) console.warn('   ⚠ OPENROUTER_API_KEY manquante : la génération de posts échouera.')
})
