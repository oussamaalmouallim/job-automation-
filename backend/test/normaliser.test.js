/**
 * Normalisation des profils (profils/normaliser.js).
 * Les titres et adresses reprennent les formes relevées sur un échantillon réel de résultats Google
 * (octobre 2026), avec des noms inventés : sous-domaines pays, suffixe de langue, « - LinkedIn »,
 * troncature « ... », caractères invisibles des pages en arabe, entités HTML.
 */
import { describe, it, expect } from 'vitest'
import { nettoyer, normaliserUrl, analyserTitre, extraireLieu, normaliserProfil, normaliserLot } from '../src/profils/normaliser.js'

describe('normaliserUrl', () => {
  it.each([
    ['https://www.linkedin.com/in/amina-test', 'https://www.linkedin.com/in/amina-test'],
    ['https://ma.linkedin.com/in/amina-test', 'https://www.linkedin.com/in/amina-test'],
    ['https://qa.linkedin.com/in/amina-test/fr', 'https://www.linkedin.com/in/amina-test'],
    ['https://fr.linkedin.com/in/Amina-Test/?trk=public_profile', 'https://www.linkedin.com/in/amina-test'],
    ['http://linkedin.com/in/amina-test#about', 'https://www.linkedin.com/in/amina-test'],
    ['https://www.linkedin.com/in/s%C3%A9bastien-essai', 'https://www.linkedin.com/in/s%C3%A9bastien-essai'],
  ])('%s → %s', (entree, attendu) => {
    expect(normaliserUrl(entree)).toBe(attendu)
  })

  it.each([
    [null], [''], ['pas une url'], ['ftp://www.linkedin.com/in/x'],
    ['https://www.linkedin.com/company/exemple'], ['https://www.linkedin.com/in/'],
    ['https://linkedin.com.exemple.test/in/x'], ['https://exemple.test/in/x'],
  ])('rejette %s', (entree) => {
    expect(normaliserUrl(entree)).toBeNull()
  })
})

describe('nettoyer', () => {
  it('retire les caractères invisibles, décode les entités et réduit les espaces', () => {
    expect(nettoyer('\u200fIngénieur d\'État Cloud &amp; DevSecOps\u200f   ·  Rabat ')).toBe("Ingénieur d'État Cloud & DevSecOps · Rabat")
  })
  it('renvoie null pour un texte vide', () => {
    expect(nettoyer('  \u200f ')).toBeNull()
    expect(nettoyer(undefined)).toBeNull()
  })
})

describe('analyserTitre', () => {
  it.each([
    ['Amina Test - Ingénieure Cloud - Exemple SA | LinkedIn', { nom: 'Amina Test', poste: 'Ingénieure Cloud', entreprise: 'Exemple SA' }],
    ['Amina Test - Cloud Solution Architect - Engineering at Microsoft', { nom: 'Amina Test', poste: 'Cloud Solution Architect - Engineering', entreprise: 'Microsoft' }],
    ['Amina Test - Cloud and DevOps Engineer at Cellenza | LinkedIn', { nom: 'Amina Test', poste: 'Cloud and DevOps Engineer', entreprise: 'Cellenza' }],
    ['Amina Test - Azure Cloud Engineer @ Company - LinkedIn', { nom: 'Amina Test', poste: 'Azure Cloud Engineer', entreprise: 'Company' }],
    ['Amina Test - Ingénieure DevOps chez Exemple', { nom: 'Amina Test', poste: 'Ingénieure DevOps', entreprise: 'Exemple' }],
    ['Amina Test - Responsable de projet Cloud & DevOps @Be Ys', { nom: 'Amina Test', poste: 'Responsable de projet Cloud & DevOps', entreprise: 'Be Ys' }],
    ['Amina Test - Contact: amina@exemple.test', { nom: 'Amina Test', poste: 'Contact: amina@exemple.test', entreprise: null }],
    ['Amina Test - \u200fDevOps Engineer | Kubernetes • Python • CI/CD', { nom: 'Amina Test', poste: 'DevOps Engineer | Kubernetes • Python • CI/CD', entreprise: null }],
    ['Amina Test - \u200fCybersecurity Engineer | SOC Analyst - LinkedIn', { nom: 'Amina Test', poste: 'Cybersecurity Engineer | SOC Analyst', entreprise: null }],
    ['Amina Test - \u200fCloud Solutions Engineer / DevSecOps at ...', { nom: 'Amina Test', poste: 'Cloud Solutions Engineer / DevSecOps', entreprise: null }],
    ["Amina Test - \u200fIngénieur d'état | Data & cloud ... - LinkedIn", { nom: 'Amina Test', poste: "Ingénieur d'état | Data & cloud", entreprise: null }],
    ['Amina Test - Cloud & DevSecOps engineer - LinkedIn', { nom: 'Amina Test', poste: 'Cloud & DevSecOps engineer', entreprise: null }],
    ['Amina Test | LinkedIn', { nom: 'Amina Test', poste: null, entreprise: null }],
    ['Sébastien Essai – Développeur Full-Stack – Atlas Tech', { nom: 'Sébastien Essai', poste: 'Développeur Full-Stack', entreprise: 'Atlas Tech' }],
  ])('%s', (titre, attendu) => {
    expect(analyserTitre(titre)).toEqual(attendu)
  })

  it('accepte un titre vide', () => {
    expect(analyserTitre('')).toEqual({ nom: null, poste: null, entreprise: null })
  })

  it('ne coupe pas un nom composé avec un trait d’union sans espaces', () => {
    expect(analyserTitre('Jean-Pierre Essai - Architecte AWS').nom).toBe('Jean-Pierre Essai')
  })
})

describe('extraireLieu', () => {
  it('lit un lieu écrit explicitement', () => {
    expect(extraireLieu('Ingénieure Cloud · Expérience : Exemple · Lieu : Casablanca-Settat, Maroc · 500 relations')).toBe('Casablanca-Settat, Maroc')
    expect(extraireLieu('Location: Rabat, Morocco · 300+ connections on LinkedIn')).toBe('Rabat, Morocco')
  })
  it('ne devine rien sans mention explicite', () => {
    expect(extraireLieu('Cloud infrastructure Engineer. Safy. Marrakech, M')).toBeNull()
    expect(extraireLieu(null)).toBeNull()
  })
})

describe('normaliserProfil et normaliserLot', () => {
  const brut = {
    titre: 'Amina Test - Cloud and DevOps Engineer at Cellenza | LinkedIn',
    lien: 'https://fr.linkedin.com/in/amina-test/en',
    extrait: 'Cloud and DevOps Engineer at Cellenza · Expérience : Cellenza &amp; partenaires',
    image: 'https://media.exemple.test/photo.jpg',
  }

  it('produit un profil au schéma unique', () => {
    expect(normaliserProfil(brut, 'n8n')).toEqual({
      ok: true,
      profil: {
        urlNormalisee: 'https://www.linkedin.com/in/amina-test',
        nom: 'Amina Test',
        poste: 'Cloud and DevOps Engineer',
        entreprise: 'Cellenza',
        lieu: null,
        extrait: 'Cloud and DevOps Engineer at Cellenza · Expérience : Cellenza & partenaires',
        image: 'https://media.exemple.test/photo.jpg',
        source: 'n8n',
      },
    })
  })

  it('remplace une image invalide par null', () => {
    expect(normaliserProfil({ ...brut, image: 'javascript:alert(1)' }, 'n8n').profil.image).toBeNull()
  })

  it('rejette un profil sans URL de profil valide', () => {
    expect(normaliserProfil({ ...brut, lien: 'https://www.linkedin.com/company/x' }, 'n8n')).toEqual({ ok: false, raison: 'url-invalide' })
    expect(normaliserProfil(null, 'n8n')).toEqual({ ok: false, raison: 'url-invalide' })
  })

  it('compte les rejets d’un lot et garde l’ordre', () => {
    const r = normaliserLot([brut, { titre: 'X', lien: null }, { ...brut, lien: 'https://ma.linkedin.com/in/youssef-essai' }], 'n8n')
    expect(r.rejetes).toBe(1)
    expect(r.profils.map((p) => p.urlNormalisee)).toEqual([
      'https://www.linkedin.com/in/amina-test',
      'https://www.linkedin.com/in/youssef-essai',
    ])
  })
})
