/** cloneme: P-99 — Page introuvable. */
import { useNavigate } from 'react-router-dom'
import { Compass } from 'lucide-react'
import Page from '../components/ui/Page'
import { Card } from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import Button from '../components/ui/Button'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <Page largeur="moyen">
      <Card>
        <EmptyState
          icone={Compass}
          titre="Page introuvable"
          texte="Cette adresse ne correspond à aucune page de LinkedAI."
          action={<Button onClick={() => navigate('/dashboard')}>Retour au dashboard</Button>}
        />
      </Card>
    </Page>
  )
}
