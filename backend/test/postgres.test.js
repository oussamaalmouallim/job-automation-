/**
 * Intégration avec une vraie base PostgreSQL (lot L0.3).
 * Utilise le schéma « test » de la base de docker-compose.yml (ou DATABASE_URL_TEST en CI) :
 * les données de développement, dans le schéma « public », ne sont jamais touchées.
 * Prérequis en local : docker compose up -d db
 */
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { execSync } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { createRequire } from 'node:module'
import request from 'supertest'
import { gardeTest, UTILISATEUR_TEST } from './aides.js'

const URL_TEST = process.env.DATABASE_URL_TEST || 'postgresql://linkedai:linkedai@localhost:5433/linkedai?schema=test'
process.env.DATABASE_URL = URL_TEST

const { axiosPost } = vi.hoisted(() => ({ axiosPost: vi.fn() }))
vi.mock('axios', () => ({ default: { post: axiosPost } }))

const RACINE = resolve(import.meta.dirname, '..')
const prismaCli = (commande) => execSync(`npx prisma ${commande}`, { cwd: RACINE, env: { ...process.env, DATABASE_URL: URL_TEST }, stdio: 'pipe' }).toString()

let prisma, creerApp, reprendre

// Schéma réservé aux tests, lu dans l'URL. Jamais « public » : c'est là que vivent les données de développement.
const SCHEMA = new URL(URL_TEST).searchParams.get('schema')
if (!SCHEMA || SCHEMA === 'public') throw new Error('DATABASE_URL_TEST doit viser un schéma de test (…?schema=test)')

beforeAll(async () => {
  prisma = (await import('../src/lib/prisma.js')).prisma
  // Repart d'un schéma de test vide, puis applique les migrations : c'est le premier critère du lot.
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${SCHEMA}" CASCADE`)
  prismaCli('migrate deploy')
  creerApp = (await import('../src/app.js')).creerApp
  reprendre = (await import('../src/lib/repriseSqlite.js')).reprendre
}, 120_000)

afterAll(async () => {
  await prisma?.$disconnect()
})

describe('PostgreSQL', () => {
  it('la migration crée la table et ses index sur un schéma vide', async () => {
    const index = await prisma.$queryRaw`SELECT indexname FROM pg_indexes WHERE schemaname = ${SCHEMA} AND tablename = 'GeneratedPostLog' ORDER BY indexname`
    expect(index.map((i) => i.indexname)).toEqual([
      'GeneratedPostLog_createdAt_idx', 'GeneratedPostLog_pkey', 'GeneratedPostLog_userId_idx',
    ])
    expect(await prisma.generatedPostLog.count()).toBe(0)
  })

  it('POST /api/posts/generate enregistre le journal dans PostgreSQL, au nom du compte', async () => {
    // Le journal est relié au compte par une clé étrangère (lot L0.5) : le compte doit exister.
    await prisma.user.create({ data: { id: UTILISATEUR_TEST.id, name: UTILISATEUR_TEST.name, email: UTILISATEUR_TEST.email } })
    axiosPost.mockResolvedValue({ data: { choices: [{ message: { content: 'Post écrit en base' } }] } })
    const app = creerApp({ journal: false, garde: gardeTest })

    const res = await request(app).post('/api/posts/generate')
      .send({ type: 'Projet technique', description: 'Pipeline n8n', tech: 'n8n', tone: 'Humain' }).expect(200)

    const enBase = await prisma.generatedPostLog.findUnique({ where: { id: res.body.log.id } })
    expect(enBase).toMatchObject({ userId: UTILISATEUR_TEST.id, description: 'Pipeline n8n', technologies: 'n8n', tone: 'Humain', generatedContent: 'Post écrit en base' })
    expect(enBase.createdAt).toBeInstanceOf(Date)
  })

  it('reprend une base SQLite sans perte ni doublon, même relancée', async () => {
    const dossier = mkdtempSync(join(tmpdir(), 'linkedai-reprise-'))
    const chemin = join(dossier, 'dev.db')
    const { DatabaseSync } = createRequire(import.meta.url)('node:sqlite')
    const base = new DatabaseSync(chemin)
    base.exec(`CREATE TABLE "GeneratedPostLog" ("id" TEXT PRIMARY KEY, "userId" TEXT, "type" TEXT, "description" TEXT, "technologies" TEXT, "tone" TEXT, "model" TEXT, "generatedContent" TEXT, "rawResponse" TEXT, "createdAt" INTEGER, "updatedAt" INTEGER)`)
    const inserer = base.prepare('INSERT INTO "GeneratedPostLog" VALUES (?, NULL, ?, ?, NULL, NULL, ?, ?, NULL, ?, ?)')
    inserer.run('sqlite-1', 'Storytelling', 'Ancien 1', 'deepseek', 'Contenu 1', 1793125151025, 1793125151025)
    inserer.run('sqlite-2', 'Conseil Cloud/IA', 'Ancien 2', 'deepseek', 'Contenu 2', 1793129560798, 1793129560798)
    base.close()

    try {
      const avant = await prisma.generatedPostLog.count()
      const premier = await reprendre({ chemin, prisma })
      const second = await reprendre({ chemin, prisma })

      expect(premier).toMatchObject({ lues: 2, ajoutees: 2, manquantes: 0, apres: avant + 2 })
      expect(second).toMatchObject({ lues: 2, ajoutees: 0, manquantes: 0, apres: avant + 2 })
      const ligne = await prisma.generatedPostLog.findUnique({ where: { id: 'sqlite-1' } })
      expect(ligne.createdAt.getTime()).toBe(1793125151025)
      expect(ligne.generatedContent).toBe('Contenu 1')
    } finally {
      rmSync(dossier, { recursive: true, force: true })
    }
  })

  it('relancer les migrations sur une base remplie ne change pas les données', async () => {
    const avant = await prisma.generatedPostLog.count()
    expect(avant).toBeGreaterThan(0)
    expect(prismaCli('migrate deploy')).toMatch(/No pending migrations/)
    expect(await prisma.generatedPostLog.count()).toBe(avant)
  })
})
