/** cloneme: C-11 — Onglets en pilules ; l'onglet actif est plein. */
import { cn } from '@/lib/utils'

export default function Tabs({ onglets, actif, onChange, className }) {
  return (
    <div role="tablist" className={cn('-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1', className)}>
      {onglets.map(({ id, label, icone: Icone }) => (
        <button
          key={id}
          role="tab"
          type="button"
          aria-selected={actif === id}
          onClick={() => onChange(id)}
          className={cn(
            'inline-flex shrink-0 items-center gap-1.5 rounded-pilule border px-3 py-1.5 text-xs font-medium transition-colors duration-rapide ease-standard',
            actif === id
              ? 'border-primaire bg-primaire text-sur-primaire'
              : 'border-ligne bg-surface text-texte-doux hover:bg-surface-douce hover:text-texte'
          )}
        >
          {Icone && <Icone size={13} />}
          {label}
        </button>
      ))}
    </div>
  )
}
