/** Outils communs des tests backend. */

// Garde de test : remplace la vérification de session, l'utilisateur est réputé connecté.
// La vraie garde est testée dans test/auth.test.js.
export const UTILISATEUR_TEST = { id: 'utilisateur-test', email: 'test@exemple.test', name: 'Test' }
export const gardeTest = (req, _res, next) => {
  req.utilisateur = UTILISATEUR_TEST
  next()
}
