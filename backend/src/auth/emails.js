/**
 * Envoi des e-mails liés aux comptes (lot L0.4).
 * Aujourd'hui : envoi simulé. Le message est écrit dans le terminal du backend et gardé en mémoire
 * (les tests y lisent le lien de réinitialisation). Un vrai service d'envoi viendra avant la mise en ligne.
 */

const boite = []

// Derniers e-mails « envoyés », du plus ancien au plus récent (tests et développement).
export const emailsEnvoyes = () => [...boite]
export const viderEmails = () => { boite.length = 0 }

export async function envoyerEmail({ a, sujet, texte }) {
  boite.push({ a, sujet, texte, le: new Date() })
  if (boite.length > 50) boite.shift()
  if (process.env.NODE_ENV !== 'test') {
    console.info(`\n✉ E-mail simulé pour ${a} — ${sujet}\n${texte}\n`)
  }
}
