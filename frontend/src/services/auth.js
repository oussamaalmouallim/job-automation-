/**
 * Comptes et sessions (lot L0.4) : appels aux routes Better Auth du backend (/api/auth/*).
 * Le cookie de session est httpOnly : le front ne le lit jamais, il demande la session au backend.
 * Chaque erreur est traduite en un message en français.
 */
import { client } from './api'

const MESSAGES = {
  INVALID_EMAIL_OR_PASSWORD: 'E-mail ou mot de passe incorrect.',
  USER_ALREADY_EXISTS: 'Un compte existe déjà avec cet e-mail.',
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: 'Un compte existe déjà avec cet e-mail.',
  PASSWORD_TOO_SHORT: 'Le mot de passe doit faire au moins 10 caractères.',
  PASSWORD_TOO_LONG: 'Le mot de passe est trop long (128 caractères au plus).',
  INVALID_EMAIL: 'Cette adresse e-mail n’est pas valide.',
  INVALID_TOKEN: 'Ce lien n’est plus valable. Demande un nouveau lien.',
}

export function messageErreur(err) {
  if (!err.response) return 'Backend injoignable : lance-le avec npm run dev (voir README).'
  if (err.response.status === 429) return 'Trop de tentatives. Réessaie dans une minute.'
  return MESSAGES[err.response.data?.code] || 'Une erreur est survenue. Réessaie.'
}

const appeler = async (requete) => {
  try {
    return (await requete).data
  } catch (err) {
    throw new Error(messageErreur(err))
  }
}

// Utilisateur connecté, ou null.
export const sessionCourante = async () => (await appeler(client.get('/auth/get-session')))?.user ?? null

export const inscrire = async ({ nom, email, motDePasse }) =>
  (await appeler(client.post('/auth/sign-up/email', { name: nom, email, password: motDePasse }))).user

export const connecter = async ({ email, motDePasse }) =>
  (await appeler(client.post('/auth/sign-in/email', { email, password: motDePasse }))).user

export const deconnecter = () => appeler(client.post('/auth/sign-out', {}))

// Le lien envoyé par e-mail ramène sur la page « Nouveau mot de passe » de ce front.
export const demanderReinitialisation = ({ email }) =>
  appeler(client.post('/auth/request-password-reset', {
    email,
    redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}reinitialiser`,
  }))

export const reinitialiser = ({ jeton, motDePasse }) =>
  appeler(client.post('/auth/reset-password', { token: jeton, newPassword: motDePasse }))
