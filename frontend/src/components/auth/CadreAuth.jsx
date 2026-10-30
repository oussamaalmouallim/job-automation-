/** cloneme: C-30 — Cadre des pages de compte : fond de l'app, logo, carte centrée, liens en pied. */
import { Link } from 'react-router-dom'
import { Card } from '../ui/Card'

export default function CadreAuth({ titre, sousTitre, children, pied }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-app px-4 py-10">
      <Link to="/connexion" className="mb-8 text-[22px] font-bold tracking-tight text-texte">
        LinkedAI<span className="text-accent">.</span>
      </Link>
      <Card className="w-full max-w-sm p-6 sm:p-8">
        <h1 className="text-xl font-semibold text-texte">{titre}</h1>
        {sousTitre && <p className="mt-1.5 text-sm leading-relaxed text-texte-doux">{sousTitre}</p>}
        <div className="mt-6">{children}</div>
      </Card>
      {pied && <div className="mt-5 space-y-1.5 text-center text-sm text-texte-doux">{pied}</div>}
    </main>
  )
}

// Lien de pied de page, au style des liens de l'app.
export const LienAuth = ({ to, children }) => (
  <Link to={to} className="font-medium text-accent hover:underline">{children}</Link>
)
