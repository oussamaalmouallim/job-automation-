/**
 * Fournisseur de profils « brave » : index indépendant de Brave Search API (lot L1.4, décision D-01-bis).
 * Actif seulement si BRAVE_API_KEY est réglée dans backend/.env. Comparatif : docs/sources.md.
 * Attention : garder les résultats demande chez Brave une formule « avec droits de stockage ».
 * API : GET https://api.search.brave.com/res/v1/web/search?q=…&count=10&offset=<page> avec X-Subscription-Token.
 */
import axios from 'axios'
import { erreurHttp, parPages, requeteLinkedIn } from './pagination.js'

// Brave met en gras les mots trouvés (<strong>) : on garde le texte seul.
const sansBalises = (texte) => (texte == null ? null : String(texte).replace(/<[^>]*>/g, ''))

const versBrut = (r) => ({
  titre: sansBalises(r?.title),
  lien: r?.url ?? null,
  extrait: sansBalises(r?.description),
  image: r?.thumbnail?.src ?? null,
})

export const brave = {
  nom: 'brave',
  actif: () => Boolean(process.env.BRAVE_API_KEY),

  async rechercher({ requete, lieu, pages }) {
    const q = requeteLinkedIn({ requete, lieu })
    // Brave n'accepte que 10 pages (offset 0 à 9).
    return parPages('brave', Math.min(pages, 10), async (i) => {
      let reponse
      try {
        reponse = await axios.get('https://api.search.brave.com/res/v1/web/search', {
          params: { q, count: 10, offset: i },
          headers: { 'X-Subscription-Token': process.env.BRAVE_API_KEY, Accept: 'application/json' },
          timeout: 30_000,
        })
      } catch (err) {
        throw erreurHttp('brave', err)
      }
      const resultats = Array.isArray(reponse.data?.web?.results) ? reponse.data.web.results : []
      return { resultats: resultats.map(versBrut), encore: reponse.data?.query?.more_results_available }
    })
  },
}
