/** Petits utilitaires partagés. */
import clsx from 'clsx'

// Même signature que le `cn` des composants Lightswind (sans tailwind-merge, inutile ici).
export const cn = (...classes) => clsx(...classes)
