// Règles des formulaires de compte (lot L0.4), vérifiées avant d'appeler le backend, qui les refait.
export const LONGUEUR_MIN = 10

export function erreurInscription({ nom, email, motDePasse }) {
  if (!nom.trim()) return 'Indique ton nom.'
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) return 'Cette adresse e-mail n’est pas valide.'
  if (motDePasse.length < LONGUEUR_MIN) return `Le mot de passe doit faire au moins ${LONGUEUR_MIN} caractères.`
  return ''
}

export function erreurNouveauMotDePasse({ motDePasse, confirmation }) {
  if (motDePasse.length < LONGUEUR_MIN) return `Le mot de passe doit faire au moins ${LONGUEUR_MIN} caractères.`
  if (motDePasse !== confirmation) return 'Les deux mots de passe ne sont pas identiques.'
  return ''
}
