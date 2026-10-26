/** cloneme: P-05 — Offres d'emploi : page d'attente (Phase 3). */
import { BriefcaseBusiness } from 'lucide-react'
import PageAttente from '../components/ui/PageAttente'

export default function JobsFinder() {
  return (
    <PageAttente
      icone={BriefcaseBusiness}
      phase="Phase 3"
      titre="Recherche d'offres intelligente"
      description="LinkedIn, Indeed, RemoteOK centralisés avec filtres IA."
      prevu={['Recherche multi-sources', 'Filtres : métier, localisation, remote, stack', 'Offres sauvegardées en favoris']}
    />
  )
}
