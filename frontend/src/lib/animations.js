// Réglages d'animation partagés — copies JS des variables de tokens.css (voir animation.md).

// Durées en secondes (framer-motion). Copies de --duree-rapide, --duree-standard, --duree-lente.
export const DUREES = {
  rapide: 0.15,
  standard: 0.25,
  lente: 0.6,
  flottement: 6,
}

// Copie de --courbe-standard.
export const COURBES = {
  standard: [0.22, 1, 0.36, 1],
}

export const DECALAGES = {
  cartes: 0.06,
}

// A-02 — entrée des cartes : fondu + montée de 12 px, en cascade.
export const entreeConteneur = {
  cache: {},
  visible: { transition: { staggerChildren: DECALAGES.cartes } },
}

export const entreeCarte = {
  cache: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: DUREES.lente, ease: COURBES.standard } },
}

// A-07 — ouverture des menus déroulants.
export const menuDeroulant = {
  initial: { opacity: 0, y: -6, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: DUREES.standard, ease: COURBES.standard } },
  exit: { opacity: 0, y: -4, scale: 0.98, transition: { duration: DUREES.rapide } },
}
