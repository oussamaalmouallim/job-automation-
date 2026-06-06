import { NavLink } from 'react-router-dom'
import clsx from 'clsx'

const NAV = [
  { to: '/dashboard', label: 'Dashboard',      icon: '⬜' },
  { to: '/posts',     label: 'Générateur posts', icon: '✏️' },
  { to: '/scraper',   label: 'Scraper LinkedIn', icon: '🔍' },
  { to: '/lettre',    label: 'Lettre de motiv.', icon: '📄' },
  { to: '/offres',    label: 'Offres d\'emploi', icon: '💼' },
  { to: '/settings',  label: 'Paramètres',       icon: '⚙️' },
]

export default function Sidebar() {
  return (
    <aside className="fixed inset-x-0 bottom-0 z-40 flex h-16 border-t border-gray-100 bg-white/95 px-2 py-1 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] backdrop-blur md:static md:h-auto md:w-56 md:shrink-0 md:flex-col md:border-r md:border-t-0 md:bg-white md:px-3 md:py-5 md:shadow-none">
      {/* Logo */}
      <div className="mb-8 hidden px-3 md:block">
        <span className="text-lg font-semibold text-brand-800 tracking-tight">LinkedAI</span>
        <p className="text-xs text-gray-400 mt-0.5">Automatisation IA</p>
      </div>

      {/* Nav */}
      <nav className="grid w-full grid-cols-6 gap-1 md:block md:flex-1 md:space-y-1">
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1 py-1.5 text-[10px] leading-tight transition-colors md:flex-row md:justify-start md:gap-3 md:px-3 md:py-2 md:text-sm',
                isActive
                  ? 'bg-brand-50 text-brand-800 font-medium'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              )
            }
          >
            <span className="text-base leading-none">{icon}</span>
            <span className="w-full truncate text-center md:text-left">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="hidden px-3 pt-4 border-t border-gray-100 md:block">
        <p className="text-xs text-gray-400 leading-relaxed">
          Oussama AL MOUALLIM<br />
          <span className="text-brand-600">Plan Gratuit</span> · 3/5 générations
        </p>
      </div>
    </aside>
  )
}
