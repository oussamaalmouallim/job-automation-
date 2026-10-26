/** cloneme: C-09 — Pastille (comme « ↑ 12% » de la maquette). */
import { cn } from '@/lib/utils'

const TONS = {
  succes: 'bg-accent-pale text-succes',
  attention: 'bg-attention-pale text-attention',
  danger: 'bg-danger-pale text-danger',
  neutre: 'bg-surface-douce text-texte-doux',
}

export default function Badge({ ton = 'neutre', icone: Icone, className, children }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-pilule px-2 py-0.5 text-xs font-medium', TONS[ton], className)}>
      {Icone && <Icone size={12} />}
      {children}
    </span>
  )
}
