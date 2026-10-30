/** cloneme: C-03 — Barre du haut : recherche globale, notifications, avatar. */
import { Link } from 'react-router-dom'
import RechercheGlobale from './RechercheGlobale'
import Notifications from './Notifications'
import { useIdentite } from '@/store/useSessionStore'

export default function Topbar() {
  const moi = useIdentite()
  return (
    <header className="sticky top-0 z-30 flex h-topbar shrink-0 items-center gap-3 bg-app px-4 sm:px-6">
      <Link to="/dashboard" className="text-lg font-bold tracking-tight text-texte md:hidden">
        LinkedAI<span className="text-accent">.</span>
      </Link>
      <RechercheGlobale />
      <div className="ml-auto flex items-center gap-2">
        <Notifications />
        <Link
          to="/settings"
          aria-label="Profil et paramètres"
          className="flex h-10 w-10 items-center justify-center rounded-pilule bg-sable text-xs font-semibold text-texte md:hidden"
        >
          {moi.initiales}
        </Link>
      </div>
    </header>
  )
}
