/** cloneme: C-16 — Rangée d'actions rapides : la première en primaire (comme « Send / Pay / Top Up / More »). */
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { entreeCarte } from '@/lib/animations'

export default function ActionsRapides({ actions }) {
  const navigate = useNavigate()
  return (
    <motion.div variants={entreeCarte} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {actions.map(({ label, to, icone: Icone }, i) => (
        <button
          key={to}
          type="button"
          onClick={() => navigate(to)}
          className={cn(
            'flex items-center gap-3 rounded-carte px-4 py-4 text-left text-sm font-medium transition duration-rapide ease-standard active:scale-[0.98]',
            i === 0
              ? 'bg-primaire text-sur-primaire hover:bg-primaire-survol'
              : 'border border-ligne bg-surface text-texte hover:bg-surface-douce'
          )}
        >
          <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-controle', i === 0 ? 'bg-primaire-survol' : 'bg-surface-douce')}>
            <Icone size={17} />
          </span>
          <span className="min-w-0 leading-tight">{label}</span>
        </button>
      ))}
    </motion.div>
  )
}
