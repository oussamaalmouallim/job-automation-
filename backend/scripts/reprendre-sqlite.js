/**
 * Copie les journaux de l'ancienne base SQLite dans PostgreSQL (lot L0.3). Lancer : npm run db:reprise
 * Chemin de la base SQLite en argument (défaut : prisma/dev.db). Relançable sans créer de doublon.
 * Vérifie à la fin que chaque ligne SQLite est bien présente dans PostgreSQL.
 */
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'
import dotenv from 'dotenv'

const ici = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(ici, '../.env') })

const { prisma } = await import('../src/lib/prisma.js')
const { reprendre } = await import('../src/lib/repriseSqlite.js')

const chemin = resolve(ici, '..', process.argv[2] || 'prisma/dev.db')
if (!existsSync(chemin)) {
  console.log(`Aucune base SQLite à reprendre (${chemin}).`)
  process.exit(0)
}

const r = await reprendre({ chemin, prisma })
await prisma.$disconnect()

console.table({ 'lignes SQLite': r.lues, 'PostgreSQL avant': r.avant, 'ajoutées': r.ajoutees, 'PostgreSQL après': r.apres })
if (r.manquantes > 0) {
  console.error(`✗ ${r.manquantes} ligne(s) SQLite absente(s) de PostgreSQL.`)
  process.exit(1)
}
console.log(`✓ Les ${r.lues} journaux SQLite sont dans PostgreSQL.`)
