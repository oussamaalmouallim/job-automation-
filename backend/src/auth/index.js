/**
 * Comptes et sessions avec Better Auth (lot L0.4, décision D-03-bis).
 * - Inscription et connexion par e-mail et mot de passe ; mot de passe haché par Better Auth.
 * - Session en base (table session), cookie httpOnly SameSite=Lax, Secure en production.
 * - Mot de passe oublié : lien à usage unique valable 1 heure, envoyé par auth/emails.js.
 * - Limite de tentatives : 5 connexions par minute et par IP.
 * Routes servies sous /api/auth/* (voir app.js) ; garde des autres routes : exigerSession().
 */
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { fromNodeHeaders } from 'better-auth/node'
import { prisma } from '../lib/prisma.js'
import { envoyerEmail } from './emails.js'

export const LONGUEUR_MIN_MOT_DE_PASSE = 10

export function creerAuth({ originesAutorisees = [], limiteConnexion = true } = {}) {
  const production = process.env.NODE_ENV === 'production'
  if (production && !process.env.BETTER_AUTH_SECRET) {
    throw new Error('BETTER_AUTH_SECRET est obligatoire en production (voir backend/.env.example).')
  }

  return betterAuth({
    appName: 'LinkedAI',
    baseURL: process.env.BETTER_AUTH_URL || `http://localhost:${process.env.PORT || 4000}`,
    basePath: '/api/auth',
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: originesAutorisees,
    database: prismaAdapter(prisma, { provider: 'postgresql' }),

    emailAndPassword: {
      enabled: true,
      minPasswordLength: LONGUEUR_MIN_MOT_DE_PASSE,
      maxPasswordLength: 128,
      autoSignIn: true,
      resetPasswordTokenExpiresIn: 60 * 60,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, url }) => {
        await envoyerEmail({
          a: user.email,
          sujet: 'LinkedAI — réinitialiser ton mot de passe',
          texte: `Bonjour ${user.name},\n\nPour choisir un nouveau mot de passe, ouvre ce lien (valable 1 heure, une seule fois) :\n${url}\n\nSi tu n'as rien demandé, ignore ce message.`,
        })
      },
    },

    session: {
      expiresIn: 60 * 60 * 24 * 7,  // 7 jours
      updateAge: 60 * 60 * 24,      // prolongée au plus une fois par jour
    },

    rateLimit: {
      enabled: limiteConnexion,
      window: 60,
      max: 100,
      customRules: {
        '/sign-in/email': { window: 60, max: 5 },
        '/sign-up/email': { window: 60, max: 5 },
        '/request-password-reset': { window: 60, max: 3 },
      },
    },

    advanced: {
      useSecureCookies: production,
      defaultCookieAttributes: { httpOnly: true, sameSite: 'lax', secure: production },
      ipAddress: { ipAddressHeaders: ['x-forwarded-for'] },
    },
  })
}

// Garde des routes de l'API : 401 sans session valide ; sinon req.utilisateur et req.session.
export const exigerSession = (auth) => async (req, res, next) => {
  try {
    const resultat = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) })
    if (!resultat?.user) return res.status(401).json({ error: 'Connexion requise.' })
    req.utilisateur = resultat.user
    req.session = resultat.session
    return next()
  } catch (err) {
    console.error('[Auth] Lecture de session impossible :', err.message)
    return res.status(401).json({ error: 'Connexion requise.' })
  }
}
