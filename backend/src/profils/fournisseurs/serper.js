/**
 * Fournisseur de profils « serper » : résultats Google via Serper.dev (lot L1.4, décision D-01-bis).
 * Actif seulement si SERPER_API_KEY est réglée dans backend/.env. Comparatif : docs/sources.md.
 * API : POST https://google.serper.dev/search { q, page, num } avec l'en-tête X-API-KEY.
 */
import axios from 'axios'
import { erreurHttp, parPages, requeteLinkedIn } from './pagination.js'

const versBrut = (r) => ({
  titre: r?.title ?? null,
  lien: r?.link ?? null,
  extrait: r?.snippet ?? null,
  image: r?.imageUrl ?? null,
})

export const serper = {
  nom: 'serper',
  actif: () => Boolean(process.env.SERPER_API_KEY),

  async rechercher({ requete, lieu, pages }) {
    const q = requeteLinkedIn({ requete, lieu })
    return parPages('serper', pages, async (i) => {
      let reponse
      try {
        reponse = await axios.post('https://google.serper.dev/search', { q, page: i + 1, num: 10 }, {
          headers: { 'X-API-KEY': process.env.SERPER_API_KEY, 'Content-Type': 'application/json' },
          timeout: 30_000,
        })
      } catch (err) {
        throw erreurHttp('serper', err)
      }
      const organiques = Array.isArray(reponse.data?.organic) ? reponse.data.organic : []
      return { resultats: organiques.map(versBrut) }
    })
  },
}
