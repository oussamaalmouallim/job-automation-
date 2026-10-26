/** cloneme: C-17 — Liste d'activité (comme « Recent Transactions ») : icône ronde, titre, méta, valeur à droite. */
import { cn } from '@/lib/utils'

export default function ListeActivite({ elements, className }) {
  return (
    <ul className={cn('-mx-2 divide-y divide-ligne', className)}>
      {elements.map(({ cle, icone, titre, meta, valeur, sousValeur, onClick, href }) => {
        const contenu = (
          <>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-pilule bg-surface-douce text-texte">
              {icone}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-texte">{titre}</span>
              <span className="block truncate text-xs text-texte-pale">{meta}</span>
            </span>
            {(valeur || sousValeur) && (
              <span className="shrink-0 text-right">
                <span className="block text-sm font-medium text-texte">{valeur}</span>
                <span className="block text-xs text-texte-pale">{sousValeur}</span>
              </span>
            )}
          </>
        )
        return (
          <li key={cle}>
            {href ? (
              <a href={href} target="_blank" rel="noreferrer" className="ligne-liste">{contenu}</a>
            ) : onClick ? (
              <button type="button" onClick={onClick} className="ligne-liste w-full text-left">{contenu}</button>
            ) : (
              <div className="flex items-center gap-3 px-2 py-2.5">{contenu}</div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
