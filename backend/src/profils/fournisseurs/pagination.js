/**
 * Outils communs aux fournisseurs payants (Serper, Brave) : requête de profils LinkedIn,
 * lecture des erreurs HTTP, et boucle page par page qui s'arrête dès qu'une page revient vide.
 */
import { ErreurFournisseur } from './erreurs.js'

// « ingenieur cloud » + « maroc » → « ingenieur cloud maroc site:linkedin.com/in »
export const requeteLinkedIn = ({ requete, lieu }) =>
  `${requete} ${lieu || ''} site:linkedin.com/in`.replace(/\s+/g, ' ').trim()

// Erreur HTTP d'un fournisseur → code court : cle (refusée), quota (dépassé), statut (autre).
export function erreurHttp(fournisseur, err) {
  const statut = err.response?.status
  if (!statut) return new ErreurFournisseur(fournisseur, 'injoignable', err.message)
  if (statut === 401 || statut === 403) return new ErreurFournisseur(fournisseur, 'cle', `clé refusée (${statut})`)
  if (statut === 429 || statut === 402) return new ErreurFournisseur(fournisseur, 'quota', `quota ou crédit épuisé (${statut})`)
  return new ErreurFournisseur(fournisseur, 'statut', `réponse ${statut}`)
}

// Appelle lirePage(0), lirePage(1)… jusqu'à `pages` pages ou une page vide.
// Note le nombre de pages réellement appelées, pour suivre le budget du fournisseur.
export async function parPages(fournisseur, pages, lirePage) {
  const tous = []
  let appelees = 0
  for (let i = 0; i < pages; i++) {
    const { resultats, encore } = await lirePage(i)
    appelees += 1
    tous.push(...resultats)
    if (!resultats.length || encore === false) break
  }
  console.info(`[Profils] ${fournisseur} : ${appelees} page(s) appelée(s), ${tous.length} résultat(s)`)
  return tous
}
