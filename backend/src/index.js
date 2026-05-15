import express  from 'express'
import cors     from 'cors'
import morgan   from 'morgan'
import dotenv   from 'dotenv'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

dotenv.config({ path: resolve(__dirname, '../.env') })
dotenv.config({ path: resolve(__dirname, '../../.env') })

import scraperRoutes from './routes/scraper.js'
import postRoutes    from './routes/posts.js'
// Routes — ajoutées progressivement selon les phases

const app  = express()
const PORT = process.env.PORT || 4000

app.use(cors({ origin: 'http://localhost:3000' }))
app.use(express.json())
app.use(morgan('dev'))

// Routes
app.use('/api/scraper', scraperRoutes)
app.use('/api/posts',   postRoutes)

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', version: '0.1.0' }))

app.listen(PORT, () => {
  console.log(`\n🚀 Backend LinkedAI démarré sur http://localhost:${PORT}`)
})
