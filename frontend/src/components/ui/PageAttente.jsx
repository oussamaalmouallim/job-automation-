/** cloneme: C-25 — Page d'attente d'une fonction prévue dans une phase suivante. */
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check } from 'lucide-react'
import Page from './Page'
import { Card } from './Card'
import Badge from './Badge'
import Button from './Button'

export default function PageAttente({ icone: Icone, titre, phase, description, prevu = [] }) {
  const navigate = useNavigate()
  return (
    <Page largeur="moyen">
      <Card className="p-8 text-center sm:p-10">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-pilule bg-surface-douce text-texte">
          <Icone size={24} />
        </span>
        <Badge ton="attention" className="mt-5">{phase}</Badge>
        <h2 className="mt-3 text-xl font-semibold text-texte">{titre}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-texte-doux">{description}</p>
        {prevu.length > 0 && (
          <ul className="mx-auto mt-6 max-w-sm space-y-2 text-left">
            {prevu.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-texte-doux">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-pilule bg-accent-pale text-succes">
                  <Check size={12} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        )}
        <Button variante="secondaire" icone={ArrowLeft} className="mt-8" onClick={() => navigate('/dashboard')}>
          Retour au dashboard
        </Button>
      </Card>
    </Page>
  )
}
