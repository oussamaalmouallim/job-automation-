/** Calculs du dashboard à partir des posts du store : activité par jour, comparaison de semaines, répartition par type. */
import { TYPES_POST, COULEURS_TYPES, COULEUR_AUTRE } from './posts'

const JOUR_MS = 24 * 60 * 60 * 1000

const debutDuJour = (date) => {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

// Nombre de posts créés chacun des `n` derniers jours, du plus ancien à aujourd'hui.
export function postsParJour(posts, n = 7) {
  const aujourdhui = debutDuJour(new Date())
  return Array.from({ length: n }, (_, i) => {
    const jour = new Date(aujourdhui.getTime() - (n - 1 - i) * JOUR_MS)
    const total = posts.filter((p) => debutDuJour(p.createdAt).getTime() === jour.getTime()).length
    return {
      cle: jour.toISOString(),
      libelle: jour.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', ''),
      total,
    }
  })
}

// Posts des 7 derniers jours comparés aux 7 jours d'avant.
export function comparaisonSemaine(posts) {
  const maintenant = Date.now()
  const age = (p) => maintenant - new Date(p.createdAt).getTime()
  const cetteSemaine = posts.filter((p) => age(p) < 7 * JOUR_MS).length
  const semainePrecedente = posts.filter((p) => age(p) >= 7 * JOUR_MS && age(p) < 14 * JOUR_MS).length
  return { cetteSemaine, semainePrecedente, ecart: cetteSemaine - semainePrecedente }
}

// Répartition des posts par type. periode : 'mois' (30 derniers jours) ou 'tout'.
export function repartitionParType(posts, periode = 'tout') {
  const liste = periode === 'mois'
    ? posts.filter((p) => Date.now() - new Date(p.createdAt).getTime() < 30 * JOUR_MS)
    : posts
  const total = liste.length
  const segments = TYPES_POST.map((type, i) => ({
    cle: type,
    libelle: type,
    valeur: liste.filter((p) => p.type === type).length,
    couleur: COULEURS_TYPES[i],
  }))
  const autres = liste.filter((p) => !TYPES_POST.includes(p.type)).length
  if (autres) segments.push({ cle: 'autre', libelle: 'Autre', valeur: autres, couleur: COULEUR_AUTRE })
  return { total, segments: segments.map((s) => ({ ...s, pourcentage: total ? Math.round((s.valeur / total) * 100) : 0 })) }
}

// Date courte et relative : « Aujourd'hui, 14:05 », « Hier, 09:12 », « 12 mai 2026 ».
export function dateRelative(date) {
  const d = new Date(date)
  const heure = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  const ecartJours = Math.round((debutDuJour(new Date()) - debutDuJour(d)) / JOUR_MS)
  if (ecartJours === 0) return `Aujourd'hui, ${heure}`
  if (ecartJours === 1) return `Hier, ${heure}`
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}
