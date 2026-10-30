/**
 * cloneme: P-10 — Nouveau mot de passe : page ouverte depuis le lien de l'e-mail (?token=…).
 * Un lien expiré ou déjà utilisé arrive avec ?error=INVALID_TOKEN.
 */
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { KeyRound } from 'lucide-react'
import { reinitialiser } from '../services/auth'
import CadreAuth, { LienAuth } from '../components/auth/CadreAuth'
import { Field, Input } from '../components/ui/Field'
import Button from '../components/ui/Button'
import { LONGUEUR_MIN, erreurNouveauMotDePasse } from '../lib/compte'

export default function NouveauMotDePasse() {
  const [parametres] = useSearchParams()
  const jeton = parametres.get('token')
  const lienInvalide = !jeton || parametres.get('error')
  const navigate = useNavigate()
  const [form, setForm] = useState({ motDePasse: '', confirmation: '' })
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)

  const changer = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const envoyer = async (e) => {
    e.preventDefault()
    const probleme = erreurNouveauMotDePasse(form)
    if (probleme) { setErreur(probleme); return }
    setErreur('')
    setChargement(true)
    try {
      await reinitialiser({ jeton, motDePasse: form.motDePasse })
      toast.success('Mot de passe changé. Connecte-toi avec le nouveau.')
      navigate('/connexion', { replace: true })
    } catch (err) {
      setErreur(err.message)
    } finally {
      setChargement(false)
    }
  }

  return (
    <CadreAuth
      titre="Nouveau mot de passe"
      sousTitre={lienInvalide ? undefined : 'Choisis un nouveau mot de passe. Tes sessions ouvertes seront fermées.'}
      pied={<p><LienAuth to="/connexion">Retour à la connexion</LienAuth></p>}
    >
      {lienInvalide ? (
        <div role="alert" className="space-y-3 text-sm text-texte-doux">
          <p>Ce lien n’est plus valable : il a expiré ou a déjà servi.</p>
          <LienAuth to="/mot-de-passe-oublie">Demander un nouveau lien</LienAuth>
        </div>
      ) : (
        <form onSubmit={envoyer} className="space-y-4" noValidate>
          <Field label="Nouveau mot de passe" htmlFor="motDePasse" aide={`${LONGUEUR_MIN} caractères au moins.`}>
            <Input id="motDePasse" name="motDePasse" type="password" autoComplete="new-password" required value={form.motDePasse} onChange={changer} />
          </Field>
          <Field label="Confirmation" htmlFor="confirmation">
            <Input id="confirmation" name="confirmation" type="password" autoComplete="new-password" required value={form.confirmation} onChange={changer} />
          </Field>
          {erreur && <p role="alert" className="text-sm text-danger">{erreur}</p>}
          <Button type="submit" className="w-full" icone={KeyRound} chargement={chargement}>Changer le mot de passe</Button>
        </form>
      )}
    </CadreAuth>
  )
}
