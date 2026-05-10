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
    <aside className="w-56 bg-white border-r border-gray-100 flex flex-col py-5 px-3 shrink-0">
      {/* Logo */}
      <div className="px-3 mb-8">
        <span className="text-lg font-semibold text-brand-800 tracking-tight">LinkedAI</span>
        <p className="text-xs text-gray-400 mt-0.5">Automatisation IA</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-800 font-medium'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              )
            }
          >
            <span className="text-base leading-none">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 leading-relaxed">
          Oussama AL MOUALLIM<br />
          <span className="text-brand-600">Plan Gratuit</span> · 3/5 générations
        </p>
      </div>
    </aside>
  )
}
