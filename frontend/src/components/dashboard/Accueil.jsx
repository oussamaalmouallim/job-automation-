/** cloneme: C-13 — Accueil : surtitre espacé, prénom en grand, sous-titre (comme « GOOD MORNING / Darren »). */
import { PROFIL } from '@/lib/profil'

const salutation = () => (new Date().getHours() < 18 ? 'Bonjour' : 'Bonsoir')

export default function Accueil() {
  return (
    <div>
      <p className="surtitre">{salutation()}</p>
      <h1 className="mt-2 text-[34px] font-bold leading-none tracking-tight text-texte sm:text-hero">
        {PROFIL.prenom} <span aria-hidden="true">👋</span>
      </h1>
      <p className="mt-3 max-w-sm text-sm text-texte-doux">Ta présence LinkedIn et ta recherche d'emploi, automatisées.</p>
    </div>
  )
}
