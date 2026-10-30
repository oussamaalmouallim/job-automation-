// Identité affichée (sidebar, barre du haut, accueil, carte du dashboard), tirée du compte connecté.
// Lot L0.4 : plus aucun nom d'utilisateur écrit en dur dans le code.
export function identite(utilisateur) {
  const nomComplet = utilisateur?.name?.trim() || utilisateur?.email || 'Mon compte'
  const mots = nomComplet.split(/\s+/).filter(Boolean)
  return {
    prenom: mots[0] || nomComplet,
    nomComplet,
    initiales: mots.slice(0, 2).map((m) => m[0]).join('').toUpperCase() || '?',
    email: utilisateur?.email || '',
  }
}

// Auteur du projet (page Paramètres, « À propos ») : une information sur l'application, pas sur l'utilisateur.
export const AUTEUR_PROJET = 'Oussama AL MOUALLIM EL KANOUNI'
