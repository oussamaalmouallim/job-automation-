/** cloneme: C-02, A-06 — Sidebar : logo, navigation, carte profil. Barre basse sous 768 px. */
import { NavLink, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAVIGATION } from '@/lib/navigation'
import { useIdentite } from '@/store/useSessionStore'
import { DUREES, COURBES } from '@/lib/animations'

export default function Sidebar() {
  const moi = useIdentite()
  return (
    <aside className="fixed inset-x-0 bottom-0 z-40 flex h-nav-mobile border-t border-ligne bg-surface px-2 md:static md:h-auto md:w-sidebar md:shrink-0 md:flex-col md:border-t-0 md:bg-app md:px-4 md:py-6">
      <Link to="/dashboard" className="mb-9 hidden px-3 text-[22px] font-bold tracking-tight text-texte md:block">
        LinkedAI<span className="text-accent">.</span>
      </Link>

      <nav aria-label="Navigation principale" className="grid w-full grid-cols-6 gap-1 md:flex md:flex-1 md:flex-col md:gap-1">
        {NAVIGATION.map(({ to, label, court, icone: Icone }) => (
          <NavLink key={to} to={to} className="nav-item flex-col justify-center gap-1 px-1 py-2 md:flex-row md:justify-start md:gap-3 md:px-3 md:py-2.5">
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="nav-actif"
                    className="absolute inset-0 rounded-controle bg-surface-douce"
                    transition={{ duration: DUREES.standard, ease: COURBES.standard }}
                  />
                )}
                <Icone size={18} strokeWidth={isActive ? 2.2 : 1.8} className={cn('relative', isActive && 'text-texte')} />
                <span className={cn('relative w-full truncate text-center text-[10px] md:text-left md:text-sm', isActive && 'font-medium text-texte')}>
                  <span className="md:hidden">{court}</span>
                  <span className="hidden md:inline">{label}</span>
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <Link
        to="/settings"
        className="mt-4 hidden items-center gap-3 rounded-carte border border-ligne bg-surface p-3 transition-colors duration-rapide hover:bg-surface-douce md:flex"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pilule bg-sable text-xs font-semibold text-texte">
          {moi.initiales}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-texte">{moi.nomComplet}</span>
          <span className="block truncate text-xs text-texte-pale">{moi.email}</span>
        </span>
        <ChevronRight size={16} className="shrink-0 text-texte-pale" />
      </Link>
    </aside>
  )
}
