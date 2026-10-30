/**
 * Routes des profils (lot L1.2).
 * POST /api/profils/rechercher { requete, lieu?, pages? } → { profils, rejetes, source }
 * Les profils sont normalisés (profils/normaliser.js). Rien n'est encore enregistré en base : le front
 * les garde dans le navigateur jusqu'au lot L1.1.
 */
import { Router } from 'express'
import { z } from 'zod'
import { rechercherAvecSecours } from './fournisseurs/index.js'
import { normaliserLot } from './normaliser.js'

const router = Router()

const SchemaRecherche = z.object({
  requete: z.string({ required_error: 'La requête est obligatoire', invalid_type_error: 'La requête doit être un texte' }).trim().min(1, 'La requête est obligatoire').max(120, 'La requête est trop longue (120 caractères maximum)'),
  lieu:    z.string({ invalid_type_error: 'Le lieu doit être un texte' }).trim().max(60, 'Le lieu est trop long (60 caractères maximum)').optional().default(''),
  pages:   z.coerce.number().int().min(1, 'Entre 1 et 10 pages').max(10, 'Entre 1 et 10 pages').optional().default(1),
})

router.post('/rechercher', async (req, res) => {
  const parametres = SchemaRecherche.safeParse(req.body ?? {})
  if (!parametres.success) {
    return res.status(400).json({ error: parametres.error.issues[0].message })
  }

  try {
    const { bruts, source } = await rechercherAvecSecours(parametres.data)
    const { profils, rejetes } = normaliserLot(bruts, source)
    return res.json({ profils, rejetes, source })
  } catch (err) {
    console.error('[Profils] Recherche impossible :', JSON.stringify(err.echecs ?? err.message))
    return res.status(502).json({ error: 'La recherche de profils a échoué : aucun fournisseur n’a répondu.' })
  }
})

export default router
