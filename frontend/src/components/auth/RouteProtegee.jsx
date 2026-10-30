/**
 * cloneme: C-31 — Garde des routes (lot L0.4).
 * RouteProtegee : sans session, renvoie vers /connexion en retenant la page demandée.
 * RoutePublique : les pages de compte renvoient au dashboard quand on est déjà connecté.
 */
import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import useSessionStore from '@/store/useSessionStore'

function useSession() {
  const statut = useSessionStore((s) => s.statut)
  const charger = useSessionStore((s) => s.charger)
  useEffect(() => { if (statut === 'inconnu') charger() }, [statut, charger])
  return statut
}

const Chargement = () => (
  <div className="flex min-h-screen items-center justify-center bg-app" aria-label="Chargement de la session">
    <Loader2 size={24} className="animate-spin text-texte-pale" />
  </div>
)

export function RouteProtegee() {
  const statut = useSession()
  const location = useLocation()
  if (statut === 'inconnu') return <Chargement />
  if (statut === 'deconnecte') return <Navigate to="/connexion" replace state={{ depuis: location.pathname }} />
  return <Outlet />
}

export function RoutePublique() {
  const statut = useSession()
  if (statut === 'inconnu') return <Chargement />
  if (statut === 'connecte') return <Navigate to="/dashboard" replace />
  return <Outlet />
}
