/**
 * Comptes, sessions et garde des routes (lot L0.4), avec Better Auth et une vraie base PostgreSQL.
 * Schéma « test_auth », distinct de celui de test/postgres.test.js : les deux fichiers tournent en parallèle.
 * Prérequis en local : docker compose up -d db
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import { resolve } from 'node:path'
import request from 'supertest'

const SCHEMA = 'test_auth'
const url = new URL(process.env.DATABASE_URL_TEST || 'postgresql://linkedai:linkedai@localhost:5433/linkedai?schema=test')
url.searchParams.set('schema', SCHEMA)
process.env.DATABASE_URL = url.toString()

const ORIGINE = 'http://localhost:3000'
const MOT_DE_PASSE = 'mot-de-passe-solide-1'
let prisma, creerApp, emailsEnvoyes, viderEmails, app

beforeAll(async () => {
  prisma = (await import('../src/lib/prisma.js')).prisma
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${SCHEMA}" CASCADE`)
  execSync('npx prisma migrate deploy', { cwd: resolve(import.meta.dirname, '..'), env: { ...process.env }, stdio: 'pipe' })
  creerApp = (await import('../src/app.js')).creerApp
  ;({ emailsEnvoyes, viderEmails } = await import('../src/auth/emails.js'))
  app = creerApp({ journal: false, limiteConnexion: false })
}, 120_000)

afterAll(async () => { await prisma?.$disconnect() })
beforeEach(() => viderEmails())

let compteur = 0
const nouvelEmail = () => `personne${Date.now()}-${compteur++}@exemple.test`

// Un navigateur : garde les cookies et envoie l'en-tête Origin, comme le front.
const navigateur = (application = app) => {
  const agent = request.agent(application)
  const avecOrigine = (req) => req.set('Origin', ORIGINE)
  return {
    post: (chemin, corps) => avecOrigine(agent.post(chemin)).send(corps),
    get: (chemin) => avecOrigine(agent.get(chemin)),
  }
}

const inscrire = async (nav, email = nouvelEmail(), motDePasse = MOT_DE_PASSE) => {
  const res = await nav.post('/api/auth/sign-up/email', { name: 'Amina Test', email, password: motDePasse })
  return { res, email }
}

describe('inscription', () => {
  it('crée le compte, hache le mot de passe et ouvre une session par cookie httpOnly', async () => {
    const nav = navigateur()
    const { res, email } = await inscrire(nav)

    expect(res.status).toBe(200)
    expect(res.body.user).toMatchObject({ email, name: 'Amina Test' })
    const cookie = res.headers['set-cookie'].find((c) => c.includes('session_token'))
    expect(cookie).toMatch(/HttpOnly/i)
    expect(cookie).toMatch(/SameSite=Lax/i)
    expect(cookie).not.toMatch(/Secure/i) // Secure seulement en production

    const compte = await prisma.account.findFirst({ where: { user: { email } } })
    expect(compte.password).toBeTruthy()
    expect(compte.password).not.toContain(MOT_DE_PASSE)

    const session = await nav.get('/api/auth/get-session')
    expect(session.body.user.email).toBe(email)
  })

  it('refuse un e-mail déjà utilisé', async () => {
    const email = nouvelEmail()
    await inscrire(navigateur(), email)
    const { res } = await inscrire(navigateur(), email)
    expect(res.status).toBeGreaterThanOrEqual(400)
    expect(res.status).toBeLessThan(500)
    expect(await prisma.user.count({ where: { email } })).toBe(1)
  })

  it.each([['trop court', 'court1'], ['vide', '']])('refuse un mot de passe %s', async (_, motDePasse) => {
    const { res, email } = await inscrire(navigateur(), nouvelEmail(), motDePasse)
    expect(res.status).toBe(400)
    expect(await prisma.user.count({ where: { email } })).toBe(0)
  })
})

describe('connexion et déconnexion', () => {
  it('même réponse pour un e-mail inconnu et un mauvais mot de passe', async () => {
    const { email } = await inscrire(navigateur())
    const mauvais = await navigateur().post('/api/auth/sign-in/email', { email, password: 'pas-le-bon-mot-de-passe' })
    const inconnu = await navigateur().post('/api/auth/sign-in/email', { email: nouvelEmail(), password: 'pas-le-bon-mot-de-passe' })
    expect(mauvais.status).toBe(401)
    expect(inconnu.status).toBe(401)
    expect(mauvais.body).toEqual(inconnu.body)
  })

  it('connexion, accès à l’API, déconnexion : le cookie ne vaut plus rien ensuite', async () => {
    const { email } = await inscrire(navigateur())
    const nav = navigateur()
    const connexion = await nav.post('/api/auth/sign-in/email', { email, password: MOT_DE_PASSE })
    expect(connexion.status).toBe(200)

    await nav.get('/api/posts/logs').expect(200)

    await nav.post('/api/auth/sign-out', {}).expect(200)
    expect((await nav.get('/api/auth/get-session')).body).toBeNull()
    await nav.get('/api/posts/logs').expect(401)
  })
})

describe('garde des routes', () => {
  it.each([
    ['get', '/api/posts/logs'],
    ['post', '/api/posts/generate'],
    ['post', '/api/profils/rechercher'],
    ['post', '/api/n8n/resource-suggestions'],
  ])('%s %s sans session → 401', async (methode, chemin) => {
    const res = await request(app)[methode](chemin).send({})
    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Connexion requise.')
  })

  it('un cookie inventé → 401', async () => {
    await request(app).get('/api/posts/logs').set('Cookie', 'better-auth.session_token=invente.signature').expect(401)
  })

  it('/api/health reste public', async () => {
    await request(app).get('/api/health').expect(200)
  })
})

describe('mot de passe oublié', () => {
  const lienDuDernierEmail = () => emailsEnvoyes().at(-1)?.texte.match(/https?:\/\/\S+/)?.[0]
  const jetonDuLien = (lien) => new URL(lien).pathname.split('/').at(-1)

  it('envoie un lien à usage unique, change le mot de passe et ferme les sessions ouvertes', async () => {
    const { email } = await inscrire(navigateur())
    const ouverte = navigateur()
    await ouverte.post('/api/auth/sign-in/email', { email, password: MOT_DE_PASSE }).expect(200)

    await navigateur().post('/api/auth/request-password-reset', { email, redirectTo: `${ORIGINE}/job-automation-/reinitialiser` }).expect(200)
    const lien = lienDuDernierEmail()
    expect(emailsEnvoyes().at(-1).a).toBe(email)
    expect(lien).toContain('/api/auth/reset-password/')
    const token = jetonDuLien(lien)

    const nouveau = 'nouveau-mot-de-passe-2'
    await navigateur().post('/api/auth/reset-password', { token, newPassword: nouveau }).expect(200)
    // Le même lien ne sert qu'une fois.
    expect((await navigateur().post('/api/auth/reset-password', { token, newPassword: 'encore-un-autre-3' })).status).toBe(400)

    expect((await navigateur().post('/api/auth/sign-in/email', { email, password: MOT_DE_PASSE })).status).toBe(401)
    expect((await navigateur().post('/api/auth/sign-in/email', { email, password: nouveau })).status).toBe(200)
    await ouverte.get('/api/posts/logs').expect(401)
  })

  it('refuse un lien expiré', async () => {
    const { email } = await inscrire(navigateur())
    await navigateur().post('/api/auth/request-password-reset', { email, redirectTo: `${ORIGINE}/job-automation-/reinitialiser` }).expect(200)
    const token = jetonDuLien(lienDuDernierEmail())
    await prisma.verification.updateMany({ where: { identifier: { contains: token } }, data: { expiresAt: new Date(Date.now() - 1000) } })

    expect((await navigateur().post('/api/auth/reset-password', { token, newPassword: 'nouveau-mot-de-passe-2' })).status).toBe(400)
  })

  it('ne dit pas si l’e-mail existe, et n’envoie rien pour un e-mail inconnu', async () => {
    const res = await navigateur().post('/api/auth/request-password-reset', { email: nouvelEmail(), redirectTo: `${ORIGINE}/job-automation-/reinitialiser` })
    expect(res.status).toBe(200)
    expect(emailsEnvoyes()).toHaveLength(0)
  })
})

describe('sécurité', () => {
  it('limite les tentatives de connexion : la 6e en une minute est refusée (429)', async () => {
    const appLimitee = creerApp({ journal: false, limiteConnexion: true })
    const statuts = []
    for (let i = 0; i < 6; i++) {
      const res = await request(appLimitee).post('/api/auth/sign-in/email')
        .set('Origin', ORIGINE).set('X-Forwarded-For', '203.0.113.7')
        .send({ email: 'inconnu@exemple.test', password: 'pas-le-bon-mot-de-passe' })
      statuts.push(res.status)
    }
    expect(statuts.slice(0, 5)).toEqual([401, 401, 401, 401, 401])
    expect(statuts[5]).toBe(429)
  })

  it('CORS : cookies acceptés depuis une origine autorisée, pas depuis une autre', async () => {
    const autorisee = await request(app).options('/api/posts/logs').set('Origin', ORIGINE).set('Access-Control-Request-Method', 'GET')
    expect(autorisee.headers['access-control-allow-origin']).toBe(ORIGINE)
    expect(autorisee.headers['access-control-allow-credentials']).toBe('true')

    const autre = await request(app).options('/api/posts/logs').set('Origin', 'https://site-pirate.test').set('Access-Control-Request-Method', 'GET')
    expect(autre.headers['access-control-allow-origin']).toBeUndefined()
  })

  it('refuse une inscription venue d’une origine non autorisée', async () => {
    const res = await request(app).post('/api/auth/sign-up/email').set('Origin', 'https://site-pirate.test')
      .send({ name: 'X', email: nouvelEmail(), password: MOT_DE_PASSE })
    expect(res.status).toBe(403)
  })
})
