/**
 * TS-ISOLATION, première version (lot L0.5) : deux vrais comptes A et B, vraie base PostgreSQL,
 * OpenRouter simulé. B ne doit jamais voir ni obtenir les journaux de A, quoi qu'il envoie.
 * Schéma « test_isolation » : distinct des autres fichiers de test, qui tournent en parallèle.
 */
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { execSync } from 'node:child_process'
import { resolve } from 'node:path'
import request from 'supertest'

const SCHEMA = 'test_isolation'
const url = new URL(process.env.DATABASE_URL_TEST || 'postgresql://linkedai:linkedai@localhost:5433/linkedai?schema=test')
url.searchParams.set('schema', SCHEMA)
process.env.DATABASE_URL = url.toString()

const { axiosPost } = vi.hoisted(() => ({ axiosPost: vi.fn() }))
vi.mock('axios', () => ({ default: { post: axiosPost } }))

const ORIGINE = 'http://localhost:3000'
let prisma, app, A, B

// Un navigateur connecté : inscription, cookie gardé, en-tête Origin comme le front.
async function compte(nom) {
  const agent = request.agent(app)
  const email = `${nom.toLowerCase()}-${Date.now()}@exemple.test`
  const res = await agent.post('/api/auth/sign-up/email').set('Origin', ORIGINE)
    .send({ name: nom, email, password: 'mot-de-passe-solide-1' }).expect(200)
  return {
    id: res.body.user.id,
    get: (chemin) => agent.get(chemin).set('Origin', ORIGINE),
    post: (chemin, corps) => agent.post(chemin).set('Origin', ORIGINE).send(corps),
  }
}

const genererPour = async (qui, description, corpsEnPlus = {}) => {
  axiosPost.mockResolvedValueOnce({ data: { choices: [{ message: { content: `Post : ${description}` } }] } })
  return qui.post('/api/posts/generate', { description, ...corpsEnPlus }).expect(200)
}

beforeAll(async () => {
  prisma = (await import('../src/lib/prisma.js')).prisma
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${SCHEMA}" CASCADE`)
  execSync('npx prisma migrate deploy', { cwd: resolve(import.meta.dirname, '..'), env: { ...process.env }, stdio: 'pipe' })
  const { creerApp } = await import('../src/app.js')
  app = creerApp({ journal: false, limiteConnexion: false })

  A = await compte('Amina')
  B = await compte('Bilal')
  await genererPour(A, 'Projet de A n°1')
  await genererPour(A, 'Projet de A n°2')
  await genererPour(B, 'Projet de B')
}, 120_000)

afterAll(async () => { await prisma?.$disconnect() })

describe('TS-ISOLATION — journaux des posts', () => {
  it('chaque journal porte le compte qui l’a généré', async () => {
    const parCompte = await prisma.generatedPostLog.groupBy({ by: ['userId'], _count: true })
    expect(Object.fromEntries(parCompte.map((g) => [g.userId, g._count]))).toEqual({ [A.id]: 2, [B.id]: 1 })
  })

  it('A ne voit que ses journaux, B que le sien', async () => {
    const deA = (await A.get('/api/posts/logs').expect(200)).body.logs
    const deB = (await B.get('/api/posts/logs').expect(200)).body.logs
    expect(deA.map((l) => l.description).sort()).toEqual(['Projet de A n°1', 'Projet de A n°2'])
    expect(deB.map((l) => l.description)).toEqual(['Projet de B'])
    expect(deA.every((l) => l.userId === A.id)).toBe(true)
  })

  it('B ne peut pas lire les journaux de A en mettant son identifiant dans l’URL', async () => {
    const res = await B.get(`/api/posts/logs?userId=${A.id}`).expect(200)
    expect(res.body.logs.map((l) => l.description)).toEqual(['Projet de B'])
  })

  it('B ne peut pas écrire au nom de A en mettant son identifiant dans le corps', async () => {
    const res = await genererPour(B, 'Tentative au nom de A', { userId: A.id })
    expect(res.body.log.userId).toBe(B.id)
    const deA = (await A.get('/api/posts/logs')).body.logs
    expect(deA.map((l) => l.description)).not.toContain('Tentative au nom de A')
  })

  it('un journal sans propriétaire (d’avant les comptes) ne s’affiche pour personne', async () => {
    await prisma.generatedPostLog.create({ data: { description: 'Ancien journal', generatedContent: 'Ancien' } })
    for (const qui of [A, B]) {
      const descriptions = (await qui.get('/api/posts/logs')).body.logs.map((l) => l.description)
      expect(descriptions).not.toContain('Ancien journal')
    }
  })

  it('supprimer un compte supprime ses journaux, et seulement les siens', async () => {
    const C = await compte('Chaima')
    await genererPour(C, 'Projet de C')
    const avant = await prisma.generatedPostLog.count()
    await prisma.user.delete({ where: { id: C.id } })
    expect(await prisma.generatedPostLog.count({ where: { userId: C.id } })).toBe(0)
    expect(await prisma.generatedPostLog.count()).toBe(avant - 1)
  })

  it('sans session, aucun journal n’est accessible', async () => {
    await request(app).get(`/api/posts/logs?userId=${A.id}`).expect(401)
  })
})

describe('limite d’appels par compte', () => {
  it('le quota d’un compte ne consomme pas celui d’un autre', { timeout: 30_000 }, async () => {
    const appLimitee = (await import('../src/app.js')).creerApp({ journal: false, limiteConnexion: false })
    const connecte = async (nom) => {
      const agent = request.agent(appLimitee)
      const res = await agent.post('/api/auth/sign-up/email').set('Origin', ORIGINE)
        .send({ name: nom, email: `${nom}-${Date.now()}-${Math.random().toString(36).slice(2)}@exemple.test`, password: 'mot-de-passe-solide-1' })
      expect(res.status, `inscription de ${nom} : ${JSON.stringify(res.body)}`).toBe(200)
      return agent
    }
    const D = await connecte('dina')
    const E = await connecte('elias')
    axiosPost.mockResolvedValue({ data: { choices: [{ message: { content: 'Post' } }] } })

    const statutsD = []
    for (let i = 0; i < 21; i++) statutsD.push((await D.post('/api/posts/generate').set('Origin', ORIGINE).send({ description: 'x' })).status)
    expect(statutsD, 'statuts des 21 appels de D').toEqual([...Array(20).fill(200), 429])

    await E.post('/api/posts/generate').set('Origin', ORIGINE).send({ description: 'x' }).expect(200)
  })
})
