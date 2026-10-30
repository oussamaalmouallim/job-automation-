/** Règles des formulaires de compte (lib/compte.js) et identité affichée (lib/profil.js). */
import { describe, it, expect } from 'vitest'
import { erreurInscription, erreurNouveauMotDePasse } from './compte'
import { identite } from './profil'

describe('erreurInscription', () => {
  const ok = { nom: 'Amina Test', email: 'amina@exemple.test', motDePasse: 'mot-de-passe-1' }
  it('accepte un formulaire complet', () => expect(erreurInscription(ok)).toBe(''))
  it.each([
    [{ nom: '  ' }, /nom/],
    [{ email: 'amina' }, /e-mail/],
    [{ email: 'amina@exemple' }, /e-mail/],
    [{ motDePasse: '123456789' }, /10 caractères/],
  ])('refuse %j', (changement, message) => {
    expect(erreurInscription({ ...ok, ...changement })).toMatch(message)
  })
})

describe('erreurNouveauMotDePasse', () => {
  it('demande 10 caractères puis une confirmation identique', () => {
    expect(erreurNouveauMotDePasse({ motDePasse: 'court', confirmation: 'court' })).toMatch(/10 caractères/)
    expect(erreurNouveauMotDePasse({ motDePasse: 'mot-de-passe-1', confirmation: 'mot-de-passe-2' })).toMatch(/identiques/)
    expect(erreurNouveauMotDePasse({ motDePasse: 'mot-de-passe-1', confirmation: 'mot-de-passe-1' })).toBe('')
  })
})

describe('identite', () => {
  it('tire prénom, nom et initiales du compte', () => {
    expect(identite({ name: 'Amina Ben Test', email: 'a@exemple.test' })).toEqual({
      prenom: 'Amina', nomComplet: 'Amina Ben Test', initiales: 'AB', email: 'a@exemple.test',
    })
  })
  it('se rabat sur l’e-mail, puis sur « Mon compte »', () => {
    expect(identite({ name: ' ', email: 'a@exemple.test' }).nomComplet).toBe('a@exemple.test')
    expect(identite(null)).toMatchObject({ nomComplet: 'Mon compte', initiales: 'MC', email: '' })
  })
})
