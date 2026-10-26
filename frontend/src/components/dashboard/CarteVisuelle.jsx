/** cloneme: C-14, A-03 — Carte visuelle LinkedAI : carte crème inclinée qui flotte (d'après la carte bancaire). */
import { motion } from 'framer-motion'
import { DUREES } from '@/lib/animations'
import { PROFIL } from '@/lib/profil'

export default function CarteVisuelle() {
  return (
    <div aria-hidden="true" className="pointer-events-none relative h-full w-full">
      {/* Halo doux qui remplace la photo de satin de la maquette. */}
      <div className="absolute -right-10 -top-16 h-72 w-72 rounded-pilule bg-surface opacity-80 blur-3xl" />
      <div className="absolute bottom-0 right-24 h-40 w-56 rounded-pilule bg-sable opacity-70 blur-3xl" />

      <motion.div
        className="absolute right-5 top-5 w-[230px] lg:right-8 xl:right-10 xl:top-6 xl:w-[290px]"
        initial={{ rotate: -8, y: 0 }}
        animate={{ y: [0, -8, 0], rotate: [-8, -6, -8] }}
        transition={{ duration: DUREES.flottement, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="relative aspect-[1.586] overflow-hidden rounded-[20px] border border-surface bg-carte p-5 shadow-flottante">
          <p className="relative text-base font-bold tracking-tight text-texte">
            LinkedAI<span className="text-accent">.</span>
          </p>
          <div className="relative mt-5 h-8 w-11 rounded-[7px] bg-puce" />
          <p className="relative mt-4 font-mono text-[11px] tracking-[0.2em] text-texte-doux">•••• •••• •••• 2026</p>
          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3">
            <p className="min-w-0 truncate text-[10px] font-medium uppercase tracking-[0.12em] text-texte-doux">{PROFIL.nomComplet}</p>
            <span className="flex shrink-0">
              <span className="h-7 w-7 rounded-pilule bg-olive" />
              <span className="-ml-3 h-7 w-7 rounded-pilule bg-peche opacity-90" />
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
