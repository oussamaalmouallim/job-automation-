import { create } from 'zustand'

// Compte les appels IA / n8n en cours, pour la barre de progression globale (A-05). Non persisté.
const useActiviteStore = create((set) => ({
  enCours: 0,
  debut: () => set((s) => ({ enCours: s.enCours + 1 })),
  fin: () => set((s) => ({ enCours: Math.max(0, s.enCours - 1) })),
}))

// Enveloppe une promesse : la barre avance tant qu'elle n'est pas terminée.
export async function avecActivite(promesse) {
  const { debut, fin } = useActiviteStore.getState()
  debut()
  try {
    return await promesse
  } finally {
    fin()
  }
}

export default useActiviteStore
