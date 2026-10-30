/** Conversion des journaux SQLite vers PostgreSQL (lib/repriseSqlite.js), sans base PostgreSQL. */
import { describe, it, expect } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { createRequire } from 'node:module'
import { versDate, convertirLigne, lireSqlite } from '../src/lib/repriseSqlite.js'

describe('versDate', () => {
  it.each([
    [1793125151025, '2026-10-27T18:19:11.025Z'],
    ['1793125151025', '2026-10-27T18:19:11.025Z'],
    ['2026-10-26 16:59:11', '2026-10-26T16:59:11.000Z'],
    ['2026-10-26T16:59:11.025Z', '2026-10-26T16:59:11.025Z'],
    ['2026-10-26T17:59:11+01:00', '2026-10-26T16:59:11.000Z'],
  ])('%j → %s', (entree, attendu) => {
    expect(versDate(entree).toISOString()).toBe(attendu)
  })

  it('refuse une date illisible', () => {
    expect(() => versDate('pas une date')).toThrow(/Date illisible/)
  })
})

describe('convertirLigne', () => {
  it('garde chaque champ et convertit les dates', () => {
    const ligne = {
      id: 'c1', userId: null, type: 'Storytelling', description: 'Desc', technologies: 'n8n', tone: 'Humain',
      model: 'deepseek/deepseek-chat', generatedContent: 'Post', rawResponse: '{"a":1}',
      createdAt: 1793125151025, updatedAt: 1793125151025,
    }
    expect(convertirLigne(ligne)).toEqual({ ...ligne, createdAt: new Date(1793125151025), updatedAt: new Date(1793125151025) })
  })

  it('remplace les champs absents par null', () => {
    const r = convertirLigne({ id: 'c2', description: 'D', generatedContent: 'P', createdAt: 0, updatedAt: 0 })
    expect(r).toMatchObject({ userId: null, type: null, technologies: null, tone: null, model: null, rawResponse: null })
  })
})

describe('lireSqlite', () => {
  it('lit les journaux d’une base SQLite, du plus ancien au plus récent', async () => {
    const dossier = mkdtempSync(join(tmpdir(), 'linkedai-sqlite-'))
    const chemin = join(dossier, 'dev.db')
    const { DatabaseSync } = createRequire(import.meta.url)('node:sqlite')
    const base = new DatabaseSync(chemin)
    base.exec(`CREATE TABLE "GeneratedPostLog" ("id" TEXT PRIMARY KEY, "description" TEXT, "generatedContent" TEXT, "createdAt" INTEGER, "updatedAt" INTEGER)`)
    base.prepare('INSERT INTO "GeneratedPostLog" VALUES (?, ?, ?, ?, ?)').run('b', 'D2', 'P2', 2000, 2000)
    base.prepare('INSERT INTO "GeneratedPostLog" VALUES (?, ?, ?, ?, ?)').run('a', 'D1', 'P1', 1000, 1000)
    base.close()

    try {
      const lignes = await lireSqlite(chemin)
      expect(lignes.map((l) => l.id)).toEqual(['a', 'b'])
    } finally {
      rmSync(dossier, { recursive: true, force: true })
    }
  })
})
