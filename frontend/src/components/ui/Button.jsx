/** cloneme: C-07, A-01 — Bouton. Variantes primaire (noir), secondaire (surface), fantome. */
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const VARIANTES = {
  primaire: 'btn-primaire',
  secondaire: 'btn-secondaire',
  fantome: 'btn-fantome',
}

export default function Button({ variante = 'primaire', petit, chargement, icone: Icone, className, children, disabled, ...props }) {
  return (
    <button
      type="button"
      className={cn(VARIANTES[variante], petit && 'btn-petit', className)}
      disabled={disabled || chargement}
      {...props}
    >
      {chargement ? <Loader2 size={16} className="animate-spin" /> : Icone && <Icone size={16} />}
      {children}
    </button>
  )
}
