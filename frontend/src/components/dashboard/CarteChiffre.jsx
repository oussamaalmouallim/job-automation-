/** cloneme: C-15 — Carte chiffre clé : libellé, grand compteur, pastille, flèche (comme « Total Balance »). */
import { useNavigate } from 'react-router-dom'
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react'
import { motion } from 'framer-motion'
import CountUp from '@/components/lightswind/CountUp'
import Badge from '@/components/ui/Badge'
import { entreeCarte } from '@/lib/animations'

export default function CarteChiffre({ libelle, valeur, cetteSemaine, ecart, secondaires, lien }) {
  const navigate = useNavigate()
  const hausse = ecart >= 0
  return (
    <motion.section variants={entreeCarte} className="carte relative w-full max-w-[460px] bg-surface p-5 sm:p-6">
      <p className="text-sm text-texte-doux">{libelle}</p>
      <div className="mt-1.5 flex items-center justify-between gap-4">
        <CountUp value={valeur} className="text-[30px] leading-tight tracking-tight sm:text-kpi" />
        <button
          type="button"
          onClick={() => navigate(lien)}
          aria-label="Générer un post"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pilule border border-ligne bg-surface-douce text-texte transition-colors duration-rapide hover:bg-sable"
        >
          <ArrowRight size={18} />
        </button>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-texte-doux">
        <Badge ton={hausse ? 'succes' : 'attention'} icone={hausse ? TrendingUp : TrendingDown}>
          {hausse ? '+' : ''}{ecart}
        </Badge>
        <span>{cetteSemaine} cette semaine, comparé aux 7 jours d'avant</span>
      </div>
      <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-ligne pt-4">
        {secondaires.map(({ libelle: l, valeur: v }) => (
          <div key={l} className="min-w-0">
            <dt className="truncate text-[11px] text-texte-pale">{l}</dt>
            <dd className="text-base font-semibold text-texte"><CountUp value={v} className="text-base font-semibold" /></dd>
          </div>
        ))}
      </dl>
    </motion.section>
  )
}
