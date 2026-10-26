/** cloneme: C-18, A-08 — Donut à segments, total au centre, légende avec pourcentages. */
import { motion } from 'framer-motion'
import { DUREES, COURBES } from '@/lib/animations'

const RAYON = 42
const EPAISSEUR = 14
const ESPACE = 0.012 // petit jour entre deux segments, en fraction du tour

export default function Donut({ segments, total, libelleTotal }) {
  const visibles = segments.filter((s) => s.valeur > 0)
  let cumul = 0

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center lg:gap-4">
      <div className="relative h-36 w-36 shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={RAYON} fill="none" strokeWidth={EPAISSEUR} style={{ stroke: 'var(--couleur-surface-creuse)' }} />
          {visibles.map((s, i) => {
            const part = s.valeur / total
            const debut = cumul
            cumul += part
            const longueur = Math.max(part - (visibles.length > 1 ? ESPACE : 0), 0.001)
            return (
              <motion.circle
                key={s.cle}
                cx="50"
                cy="50"
                r={RAYON}
                fill="none"
                strokeWidth={EPAISSEUR}
                strokeLinecap="butt"
                transform={`rotate(${debut * 360} 50 50)`}
                style={{ stroke: s.couleur }}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: longueur }}
                transition={{ duration: DUREES.lente, ease: COURBES.standard, delay: i * 0.08 }}
              />
            )
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-bold text-texte">{total}</span>
          <span className="text-[11px] text-texte-pale">{libelleTotal}</span>
        </div>
      </div>

      <ul className="w-full min-w-0 flex-1 space-y-2.5">
        {segments.map((s) => (
          <li key={s.cle} className="flex items-center gap-2.5 text-xs">
            <span className="h-2.5 w-2.5 shrink-0 rounded-pilule" style={{ background: s.couleur }} />
            <span className="min-w-0 flex-1 truncate text-texte-doux" title={s.libelle}>{s.libelle}</span>
            <span className="text-right font-semibold text-texte">{s.pourcentage}%</span>
            <span className="w-5 text-right text-texte-pale">{s.valeur}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
