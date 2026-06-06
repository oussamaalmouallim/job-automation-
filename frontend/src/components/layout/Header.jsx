import { useLocation } from 'react-router-dom'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/posts': 'Generateur de posts LinkedIn',
  '/scraper': 'Scraper LinkedIn',
  '/lettre': 'Lettre de motivation',
  '/offres': "Offres d'emploi",
  '/settings': 'Parametres',
}

export default function Header() {
  const { pathname } = useLocation()
  const title = PAGE_TITLES[pathname] || 'LinkedAI'

  return (
    <header className="flex min-h-14 shrink-0 items-center justify-between gap-3 border-b border-gray-100 bg-white px-4 py-3 sm:px-5 md:h-14 md:px-6 md:py-0">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-brand-700 md:hidden">LinkedAI</p>
        <h1 className="truncate text-base font-semibold text-gray-800">{title}</h1>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="hidden text-xs text-gray-400 sm:inline">v0.1.0 - Phase 1 MVP</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-800">
          OA
        </div>
      </div>
    </header>
  )
}
