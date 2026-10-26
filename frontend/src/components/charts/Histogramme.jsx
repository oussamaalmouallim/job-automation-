/** cloneme: C-19, A-08 — Histogramme : barres arrondies, la dernière (aujourd'hui) en accent. */
import { motion } from 'framer-motion'
import { DUREES, COURBES } from '@/lib/animations'
import { cn } from '@/lib/utils'

export default function Histogramme({ donnees, hauteur = 120 }) {
  const max = Math.max(1, ...donnees.map((d) => d.total))
  return (
    <div className="flex items-end gap-2.5" style={{ height: hauteur + 24 }}>
      {donnees.map((d, i) => {
        const derniere = i === donnees.length - 1
        // Une barre vide garde une petite hauteur, comme les barres basses de la maquette.
        const h = Math.max(10, (d.total / max) * hauteur)
        return (
          <div key={d.cle} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <motion.div
              title={`${d.total} post${d.total > 1 ? 's' : ''}`}
              className={cn('w-full max-w-[22px] origin-bottom rounded-[6px]', derniere ? 'bg-accent' : 'bg-surface-creuse')}
              style={{ height: h }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: DUREES.lente, ease: COURBES.standard, delay: i * 0.05 }}
            />
            <span className={cn('text-[10px] capitalize', derniere ? 'font-semibold text-texte' : 'text-texte-pale')}>{d.libelle}</span>
          </div>
        )
      })}
    </div>
  )
}
