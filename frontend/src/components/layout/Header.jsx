import { useLocation } from 'react-router-dom'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/posts':     'Générateur de posts LinkedIn',
  '/scraper':   'Scraper LinkedIn',
  '/lettre':    'Lettre de motivation',
  '/offres':    'Offres d\'emploi',
  '/settings':  'Paramètres',
}

export default function Header() {
  const { pathname } = useLocation()
  const title = PAGE_TITLES[pathname] || 'LinkedAI'

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0">
      <h1 className="text-base font-semibold text-gray-800">{title}</h1>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-400">v0.1.0 — Phase 1 MVP</span>
        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-800 text-xs font-semibold">
          OA
        </div>
      </div>
    </header>
  )
}
