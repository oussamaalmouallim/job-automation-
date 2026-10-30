/** cloneme: P-08 — Inscription : nom, e-mail, mot de passe (10 caractères au moins), puis dashboard. */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import useSessionStore from '../store/useSessionStore'
import CadreAuth, { LienAuth } from '../components/auth/CadreAuth'
import { Field, Input } from '../components/ui/Field'
import Button from '../components/ui/Button'
import { LONGUEUR_MIN, erreurInscription } from '../lib/compte'

export default function Inscription() {
  const sInscrire = useSessionStore((s) => s.sInscrire)
  const navigate = useNavigate()
  const [form, setForm] = useState({ nom: '', email: '', motDePasse: '' })
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)

  const changer = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const envoyer = async (e) => {
    e.preventDefault()
    const probleme = erreurInscription(form)
    if (probleme) { setErreur(probleme); return }
    setErreur('')
    setChargement(true)
    try {
      await sInscrire({ ...form, nom: form.nom.trim(), email: form.email.trim() })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setErreur(err.message)
    } finally {
      setChargement(false)
    }
  }

  return (
    <CadreAuth
      titre="Créer un compte"
      sousTitre="Tes posts, profils et réglages seront rattachés à ce compte."
      pied={<p>Déjà un compte ? <LienAuth to="/connexion">Se connecter</LienAuth></p>}
    >
      <form onSubmit={envoyer} className="space-y-4" noValidate>
        <Field label="Nom" htmlFor="nom">
          <Input id="nom" name="nom" autoComplete="name" required value={form.nom} onChange={changer} />
        </Field>
        <Field label="E-mail" htmlFor="email">
          <Input id="email" name="email" type="email" autoComplete="email" required value={form.email} onChange={changer} />
        </Field>
        <Field label="Mot de passe" htmlFor="motDePasse" aide={`${LONGUEUR_MIN} caractères au moins.`}>
          <Input id="motDePasse" name="motDePasse" type="password" autoComplete="new-password" required minLength={LONGUEUR_MIN} value={form.motDePasse} onChange={changer} />
        </Field>
        {erreur && <p role="alert" className="text-sm text-danger">{erreur}</p>}
        <Button type="submit" className="w-full" icone={UserPlus} chargement={chargement}>Créer mon compte</Button>
      </form>
    </CadreAuth>
  )
}
