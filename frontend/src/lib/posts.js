// Options du générateur de posts. Partagées avec le dashboard (couleurs du donut).
export const TYPES_POST = ['Projet technique', 'Conseil Cloud/IA', 'Storytelling', "Recherche d'emploi"]
export const TONS_POST = ['Professionnel', 'Humain', 'Startup', 'Viral']
export const MODELES_POST = ['deepseek']

// Une couleur de graphique par type, dans l'ordre de TYPES_POST ; le reste va dans « Autre ».
export const COULEURS_TYPES = ['var(--couleur-olive)', 'var(--couleur-peche)', 'var(--couleur-lavande)', 'var(--couleur-sable)']
export const COULEUR_AUTRE = 'var(--couleur-brume)'

// Première ligne non vide d'un post, pour les listes.
export const titrePost = (contenu = '') =>
  contenu.split('\n').map((l) => l.trim()).find(Boolean) || 'Post sans texte'
