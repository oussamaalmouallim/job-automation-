/** Limite d'appels par IP (lib/rateLimit.js). */
import { describe, it, expect } from 'vitest'
import express from 'express'
import request from 'supertest'
import { limiter } from '../src/lib/rateLimit.js'

const appLimitee = (options) => {
  const app = express()
  app.use(limiter(options))
  app.get('/', (_, res) => res.json({ ok: true }))
  return app
}

describe('limiter', () => {
  it('laisse passer 20 appels puis refuse le 21e avec 429 et Retry-After', async () => {
    const app = appLimitee({ windowMs: 60_000, max: 20 })

    for (let i = 0; i < 20; i++) {
      await request(app).get('/').expect(200)
    }

    const refus = await request(app).get('/').expect(429)
    expect(refus.body.error).toMatch(/Trop de requêtes/)
    expect(Number(refus.headers['retry-after'])).toBeGreaterThan(0)
    expect(Number(refus.headers['retry-after'])).toBeLessThanOrEqual(60)
  })

  it('repart à zéro une fois la fenêtre écoulée', async () => {
    const app = appLimitee({ windowMs: 50, max: 1 })

    await request(app).get('/').expect(200)
    await request(app).get('/').expect(429)
    await new Promise((r) => setTimeout(r, 80))
    await request(app).get('/').expect(200)
  })
})
