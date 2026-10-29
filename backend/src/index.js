/**
 * Point d'entrée du backend LinkedAI (Express, port 4000).
 * Seul service exposé au navigateur : il garde la clé OpenRouter, enregistre les posts (Prisma/SQLite)
 * et relaie les webhooks n8n autorisés. Voir README, section Architecture.
 * L'application elle-même est construite dans app.js ; ce fichier charge .env et ouvre le port.
 */
import dotenv   from 'dotenv'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

dotenv.config({ path: resolve(__dirname, '../.env') })
dotenv.config({ path: resolve(__dirname, '../../.env') })

// Import dynamique : app.js lit les variables d'environnement, il doit passer après dotenv.
const { creerApp, originesAutorisees } = await import('./app.js')

const app  = creerApp()
const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
  console.log(`\n🚀 Backend LinkedAI démarré sur http://localhost:${PORT}`)
  console.log(`   Origines autorisées : ${originesAutorisees().join(', ')}`)
  if (!process.env.OPENROUTER_API_KEY) console.warn('   ⚠ OPENROUTER_API_KEY manquante : la génération de posts échouera.')
})
