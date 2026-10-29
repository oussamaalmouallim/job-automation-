/** Composant EmptyState (C-10) : premier test de composant, preuve que Testing Library est en place. */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Search } from 'lucide-react'
import EmptyState from './EmptyState'

describe('EmptyState', () => {
  it('affiche le titre, le texte et l’action', () => {
    render(<EmptyState icone={Search} titre="Aucun profil" texte="Lance le scraper." action={<button>Lancer</button>} />)
    expect(screen.getByText('Aucun profil')).toBeInTheDocument()
    expect(screen.getByText('Lance le scraper.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Lancer' })).toBeInTheDocument()
  })

  it('n’affiche pas de paragraphe de texte quand il n’y en a pas', () => {
    const { container } = render(<EmptyState titre="Vide" />)
    expect(container.querySelectorAll('p')).toHaveLength(1)
  })
})
