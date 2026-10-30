/** cloneme: P-09 — Mot de passe oublié : demande d'un lien par e-mail, même réponse que le compte existe ou non. */
import { useState } from 'react'
import { Mail } from 'lucide-react'
import { demanderReinitialisation } from '../services/auth'
import CadreAuth, { LienAuth } from '../components/auth/CadreAuth'
import { Field, Input } from '../components/ui/Field'
import Button from '../components/ui/Button'

export default function MotDePasseOublie() {
  const [email, setEmail] = useState('')
  const [envoye, setEnvoye] = useState(false)
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)

  const envoyer = async (e) => {
    e.preventDefault()
    if (!email.trim()) { setErreur('Indique ton e-mail.'); return }
    setErreur('')
    setChargement(true)
    try {
      await demanderReinitialisation({ email: email.trim() })
      setEnvoye(true)
    } catch (err) {
      setErreur(err.message)
    } finally {
      setChargement(false)
    }
  }

  return (
    <CadreAuth
      titre="Mot de passe oublié"
      sousTitre="Indique ton e-mail : si un compte existe, tu recevras un lien valable 1 heure."
      pied={<p><LienAuth to="/connexion">Retour à la connexion</LienAuth></p>}
    >
      {envoye ? (
        <div role="status" className="space-y-2 text-sm leading-relaxed text-texte-doux">
          <p className="font-medium text-texte">Demande envoyée.</p>
          <p>Si un compte existe pour {email.trim()}, un lien vient de partir. Pense à regarder les indésirables.</p>
          <p className="text-xs text-texte-pale">En développement, aucun e-mail ne part : le lien s’affiche dans le terminal du backend.</p>
        </div>
      ) : (
        <form onSubmit={envoyer} className="space-y-4" noValidate>
          <Field label="E-mail" htmlFor="email">
            <Input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          {erreur && <p role="alert" className="text-sm text-danger">{erreur}</p>}
          <Button type="submit" className="w-full" icone={Mail} chargement={chargement}>Envoyer le lien</Button>
        </form>
      )}
    </CadreAuth>
  )
}
