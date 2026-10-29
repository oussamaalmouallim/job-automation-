/** Calculs du dashboard (lib/stats.js), à date fixe. */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { postsParJour, comparaisonSemaine, repartitionParType, dateRelative } from './stats'
import { TYPES_POST } from './posts'

// Mercredi 29 octobre 2026, 15 h, heure locale.
const MAINTENANT = new Date(2026, 9, 29, 15, 0, 0)
const ilYa = (jours, heures = 0) => new Date(MAINTENANT.getTime() - (jours * 24 + heures) * 3600 * 1000).toISOString()
const post = (createdAt, type = TYPES_POST[0]) => ({ createdAt, type })

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(MAINTENANT)
})
afterEach(() => vi.useRealTimers())

describe('postsParJour', () => {
  it('renvoie 7 jours, du plus ancien à aujourd’hui, à zéro sans post', () => {
    const jours = postsParJour([])
    expect(jours).toHaveLength(7)
    expect(jours.every((j) => j.total === 0)).toBe(true)
    expect(new Date(jours[6].cle).getDate()).toBe(29)
    expect(new Date(jours[0].cle).getDate()).toBe(23)
  })

  it('compte chaque post dans son jour et ignore ceux hors période', () => {
    const jours = postsParJour([post(ilYa(0)), post(ilYa(0, 2)), post(ilYa(1)), post(ilYa(7))])
    expect(jours[6].total).toBe(2)
    expect(jours[5].total).toBe(1)
    expect(jours.reduce((s, j) => s + j.total, 0)).toBe(3)
  })
})

describe('comparaisonSemaine', () => {
  it('compare les 7 derniers jours aux 7 jours d’avant', () => {
    const r = comparaisonSemaine([post(ilYa(1)), post(ilYa(6)), post(ilYa(8)), post(ilYa(20))])
    expect(r).toEqual({ cetteSemaine: 2, semainePrecedente: 1, ecart: 1 })
  })

  it('vaut zéro partout sans post', () => {
    expect(comparaisonSemaine([])).toEqual({ cetteSemaine: 0, semainePrecedente: 0, ecart: 0 })
  })
})

describe('repartitionParType', () => {
  it('donne un segment par type, plus « Autre » seulement s’il y en a', () => {
    const sans = repartitionParType([post(ilYa(1))])
    expect(sans.segments).toHaveLength(TYPES_POST.length)

    const avec = repartitionParType([post(ilYa(1)), post(ilYa(1), 'Type inconnu')])
    expect(avec.segments.at(-1)).toMatchObject({ cle: 'autre', valeur: 1, pourcentage: 50 })
  })

  it('ne garde que les 30 derniers jours en période « mois »', () => {
    const posts = [post(ilYa(2)), post(ilYa(40))]
    expect(repartitionParType(posts, 'mois').total).toBe(1)
    expect(repartitionParType(posts, 'tout').total).toBe(2)
  })

  it('ne divise pas par zéro sans post', () => {
    const r = repartitionParType([])
    expect(r.total).toBe(0)
    expect(r.segments.every((s) => s.pourcentage === 0)).toBe(true)
  })
})

describe('dateRelative', () => {
  it('écrit aujourd’hui, hier, puis la date', () => {
    expect(dateRelative(new Date(2026, 9, 29, 9, 5))).toBe("Aujourd'hui, 09:05")
    expect(dateRelative(new Date(2026, 9, 28, 23, 59))).toMatch(/^Hier, 23:59$/)
    expect(dateRelative(new Date(2026, 4, 12, 10, 0))).toBe('12 mai 2026')
  })
})
