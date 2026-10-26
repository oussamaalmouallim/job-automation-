/** cloneme: C-06, A-02 — Carte. Surface claire, rayon --rayon-carte ; entre en cascade dans une Page. */
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { entreeCarte } from '@/lib/animations'

export function Card({ className, children, as = 'section', ...props }) {
  const Composant = motion[as] || motion.section
  return (
    <Composant variants={entreeCarte} className={cn('carte', className)} {...props}>
      {children}
    </Composant>
  )
}

// En-tête de carte : titre à gauche, lien « Voir tout » ou action à droite (comme « See All → » de la maquette).
// `marge={false}` quand l'espacement vient du parent (space-y-*) : une classe mb-* en plus se contredirait.
export function CardHeader({ titre, sousTitre, lien, libelleLien = 'Voir tout', action, marge = true, className }) {
  return (
    <div className={cn('flex items-start justify-between gap-3', marge && 'mb-4', className)}>
      <div className="min-w-0">
        <h2 className="truncate text-[15px] font-semibold text-texte">{titre}</h2>
        {sousTitre && <p className="mt-0.5 text-xs text-texte-pale">{sousTitre}</p>}
      </div>
      {action}
      {lien && (
        <Link to={lien} className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-texte-doux transition-colors duration-rapide hover:text-texte">
          {libelleLien} <ArrowRight size={13} />
        </Link>
      )}
    </div>
  )
}
