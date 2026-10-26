import { LayoutDashboard, PenLine, ScanSearch, FileText, BriefcaseBusiness, Settings } from 'lucide-react'

// Navigation principale : sidebar, barre basse mobile et recherche globale lisent cette liste.
export const NAVIGATION = [
  { to: '/dashboard', label: 'Dashboard',            court: 'Accueil',  icone: LayoutDashboard },
  { to: '/posts',     label: 'Générateur de posts',  court: 'Posts',    icone: PenLine },
  { to: '/scraper',   label: 'Scraper LinkedIn',     court: 'Scraper',  icone: ScanSearch },
  { to: '/lettre',    label: 'Lettre de motivation', court: 'Lettre',   icone: FileText },
  { to: '/offres',    label: "Offres d'emploi",      court: 'Offres',   icone: BriefcaseBusiness },
  { to: '/settings',  label: 'Paramètres',           court: 'Réglages', icone: Settings },
]
