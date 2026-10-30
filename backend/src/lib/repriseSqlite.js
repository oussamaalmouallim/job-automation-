/**
 * Reprise des journaux de l'ancienne base SQLite (lot L0.3).
 * SQLite stockait les dates en millisecondes (entier) ; PostgreSQL attend des dates.
 * Utilisé par scripts/reprendre-sqlite.js ; testé dans test/repriseSqlite.test.js.
 */
import { createRequire } from 'node:module'

// node:sqlite par require : Vite (tests) ne sait pas résoudre cet import dynamique.
const require = createRequire(import.meta.url)

// Date SQLite (entier en ms, texte ISO ou « AAAA-MM-JJ HH:MM:SS ») → Date. Invalide → erreur.
export function versDate(valeur) {
  const date = typeof valeur === 'number' || /^\d+$/.test(String(valeur))
    ? new Date(Number(valeur))
    : new Date(String(valeur).replace(' ', 'T') + (/[zZ]|[+-]\d\d:?\d\d$/.test(String(valeur)) ? '' : 'Z'))
  if (Number.isNaN(date.getTime())) throw new Error(`Date illisible : ${valeur}`)
  return date
}

// Une ligne GeneratedPostLog de SQLite → les données attendues par Prisma (PostgreSQL), sans rien perdre.
export function convertirLigne(ligne) {
  return {
    id: ligne.id,
    userId: ligne.userId ?? null,
    type: ligne.type ?? null,
    description: ligne.description,
    technologies: ligne.technologies ?? null,
    tone: ligne.tone ?? null,
    model: ligne.model ?? null,
    generatedContent: ligne.generatedContent,
    rawResponse: ligne.rawResponse ?? null,
    createdAt: versDate(ligne.createdAt),
    updatedAt: versDate(ligne.updatedAt),
  }
}

// Lit toutes les lignes de l'ancienne base (module node:sqlite, Node 22.13 ou plus récent).
export async function lireSqlite(chemin) {
  const { DatabaseSync } = require('node:sqlite')
  const base = new DatabaseSync(chemin, { readOnly: true })
  try {
    return base.prepare('SELECT * FROM "GeneratedPostLog" ORDER BY "createdAt"').all()
  } finally {
    base.close()
  }
}

// Copie les lignes de la base SQLite `chemin` dans PostgreSQL, sans doublon (relançable).
// Renvoie les comptes, et `manquantes` : le nombre de lignes SQLite absentes de PostgreSQL après la copie (0 attendu).
export async function reprendre({ chemin, prisma }) {
  const lignes = (await lireSqlite(chemin)).map(convertirLigne)
  const avant = await prisma.generatedPostLog.count()
  const { count: ajoutees } = await prisma.generatedPostLog.createMany({ data: lignes, skipDuplicates: true })
  const apres = await prisma.generatedPostLog.count()
  const presentes = await prisma.generatedPostLog.count({ where: { id: { in: lignes.map((l) => l.id) } } })
  return { lues: lignes.length, avant, ajoutees, apres, manquantes: lignes.length - presentes }
}
