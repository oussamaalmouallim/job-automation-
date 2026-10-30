/** cloneme: P-07 — Connexion : e-mail et mot de passe, puis retour à la page demandée. */
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import useSessionStore from '../store/useSessionStore'
import CadreAuth, { LienAuth } from '../components/auth/CadreAuth'
import { Field, Input } from '../components/ui/Field'
import Button from '../components/ui/Button'

export default function Connexion() {
  const seConnecter = useSessionStore((s) => s.seConnecter)
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', motDePasse: '' })
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)

  const changer = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const envoyer = async (e) => {
    e.preventDefault()
    setErreur('')
    setChargement(true)
    try {
      await seConnecter(form)
      navigate(location.state?.depuis || '/dashboard', { replace: true })
    } catch (err) {
      setErreur(err.message)
    } finally {
      setChargement(false)
    }
  }

  return (
    <CadreAuth
      titre="Connexion"
      sousTitre="Retrouve tes posts, tes profils et tes réglages."
      pied={<>
        <p>Pas encore de compte ? <LienAuth to="/inscription">Créer un compte</LienAuth></p>
        <p><LienAuth to="/mot-de-passe-oublie">Mot de passe oublié ?</LienAuth></p>
      </>}
    >
      <form onSubmit={envoyer} className="space-y-4" noValidate>
        <Field label="E-mail" htmlFor="email">
          <Input id="email" name="email" type="email" autoComplete="email" required value={form.email} onChange={changer} />
        </Field>
        <Field label="Mot de passe" htmlFor="motDePasse">
          <Input id="motDePasse" name="motDePasse" type="password" autoComplete="current-password" required value={form.motDePasse} onChange={changer} />
        </Field>
        {erreur && <p role="alert" className="text-sm text-danger">{erreur}</p>}
        <Button type="submit" className="w-full" icone={LogIn} chargement={chargement}>Se connecter</Button>
      </form>
    </CadreAuth>
  )
}
