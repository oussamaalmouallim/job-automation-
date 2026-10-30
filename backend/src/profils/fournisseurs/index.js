/**
 * Fournisseurs de profils, dans l'ordre où le backend les essaie (décision D-06).
 * Aujourd'hui : n8n seul. Le lot L1.4 ajoute le fournisseur payant en tête ; n8n devient alors le secours.
 */
import { n8n } from './n8n.js'
import { ErreurFournisseur } from './erreurs.js'

export const FOURNISSEURS = [n8n]

// Essaie chaque fournisseur jusqu'au premier qui répond.
// Renvoie { bruts, source, echecs } ; lève une ErreurFournisseur « tous » si aucun ne répond.
export async function rechercherAvecSecours(parametres, fournisseurs = FOURNISSEURS) {
  const echecs = []
  for (const fournisseur of fournisseurs) {
    try {
      const bruts = await fournisseur.rechercher(parametres)
      return { bruts, source: fournisseur.nom, echecs }
    } catch (err) {
      echecs.push({ fournisseur: fournisseur.nom, code: err.code || 'erreur', message: err.message })
    }
  }
  const erreur = new ErreurFournisseur('tous', 'indisponible', 'aucun fournisseur de profils n’a répondu')
  erreur.echecs = echecs
  throw erreur
}
