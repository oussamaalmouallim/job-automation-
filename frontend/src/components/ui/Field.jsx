/** cloneme: C-08 — Champs : libellé, contrôle, aide. */
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Field({ label, aide, htmlFor, className, children }) {
  return (
    <div className={className}>
      {label && <label htmlFor={htmlFor} className="libelle">{label}</label>}
      {children}
      {aide && <p className="mt-1.5 text-xs text-texte-pale">{aide}</p>}
    </div>
  )
}

export function Input({ className, ...props }) {
  return <input className={cn('champ', className)} {...props} />
}

export function Textarea({ className, ...props }) {
  return <textarea className={cn('champ resize-none leading-relaxed', className)} {...props} />
}

export function Select({ className, children, ...props }) {
  return (
    <div className="relative">
      <select className={cn('champ appearance-none pr-9', className)} {...props}>
        {children}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-texte-pale" />
    </div>
  )
}
