/** cloneme: C-10 — État vide ou erreur : icône, titre, texte, action. */
import { cn } from '@/lib/utils'

export default function EmptyState({ icone: Icone, titre, texte, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 rounded-controle border border-dashed border-ligne px-6 py-10 text-center', className)}>
      {Icone && (
        <span className="flex h-11 w-11 items-center justify-center rounded-pilule bg-surface-douce text-texte-doux">
          <Icone size={20} />
        </span>
      )}
      <div className="space-y-1">
        <p className="text-sm font-medium text-texte">{titre}</p>
        {texte && <p className="mx-auto max-w-xs text-xs leading-relaxed text-texte-pale">{texte}</p>}
      </div>
      {action}
    </div>
  )
}
