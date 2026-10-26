/** cloneme: C-12, A-02 — Conteneur de page : en-tête optionnel, largeur, cascade d'entrée des cartes. */
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { entreeConteneur, entreeCarte } from '@/lib/animations'

// Largeur max du contenu. Passée en prop (et non en className) : deux classes max-w-* se contrediraient.
const LARGEURS = {
  large: 'max-w-[1400px]',
  moyen: 'max-w-2xl',
}

export default function Page({ surtitre, titre, description, actions, largeur = 'large', className, children }) {
  return (
    <motion.div
      variants={entreeConteneur}
      initial="cache"
      animate="visible"
      className={cn('mx-auto w-full space-y-5', LARGEURS[largeur], className)}
    >
      {titre && (
        <motion.div variants={entreeCarte} className="flex flex-col gap-3 pb-1 pt-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            {surtitre && <p className="surtitre">{surtitre}</p>}
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-texte sm:text-[28px]">{titre}</h1>
            {description && <p className="mt-1 max-w-2xl text-sm text-texte-doux">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
        </motion.div>
      )}
      {children}
    </motion.div>
  )
}
