/** cloneme: C-20 — Liste d'actions : icône, libellé, chevron (comme « Quick Actions »). */
import { ChevronRight } from 'lucide-react'

export default function ListeActions({ actions }) {
  return (
    <ul className="-mx-2 space-y-0.5">
      {actions.map(({ label, aide, icone: Icone, onClick, desactive }) => (
        <li key={label}>
          <button type="button" onClick={onClick} disabled={desactive} className="ligne-liste w-full text-left disabled:cursor-not-allowed disabled:opacity-50">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pilule border border-ligne text-texte">
              <Icone size={16} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm text-texte">{label}</span>
              {aide && <span className="block truncate text-xs text-texte-pale">{aide}</span>}
            </span>
            <ChevronRight size={16} className="shrink-0 text-texte-pale" />
          </button>
        </li>
      ))}
    </ul>
  )
}
