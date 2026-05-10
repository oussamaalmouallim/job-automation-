import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAppStore = create(
  persist(
    (set, get) => ({
      // ─── Posts générés ────────────────────────────────
      posts: [],
      addPost: (post) =>
        set((state) => ({
          posts: [{ ...post, id: Date.now(), createdAt: new Date().toISOString() }, ...state.posts],
        })),
      clearPosts: () => set({ posts: [] }),

      // ─── Profils scrapés ──────────────────────────────
      scrapedProfiles: [],
      setScrapedProfiles: (profiles) => set({ scrapedProfiles: profiles }),
      addProfiles: (profiles) =>
        set((state) => ({
          scrapedProfiles: [...profiles, ...state.scrapedProfiles],
        })),
      clearProfiles: () => set({ scrapedProfiles: [] }),

      // ─── Lettres générées ─────────────────────────────
      letters: [],
      addLetter: (letter) =>
        set((state) => ({
          letters: [{ ...letter, id: Date.now(), createdAt: new Date().toISOString() }, ...state.letters],
        })),

      // ─── Offres sauvegardées ──────────────────────────
      savedJobs: [],
      toggleSavedJob: (job) => {
        const exists = get().savedJobs.find((j) => j.link === job.link)
        if (exists) {
          set((state) => ({ savedJobs: state.savedJobs.filter((j) => j.link !== job.link) }))
        } else {
          set((state) => ({ savedJobs: [...state.savedJobs, job] }))
        }
      },

      // ─── Settings ─────────────────────────────────────
      settings: {
        defaultModel: 'deepseek',
        defaultTone: 'professional',
        n8nBaseUrl: '',
        scraperWebhook: '',
      },
      updateSettings: (partial) =>
        set((state) => ({ settings: { ...state.settings, ...partial } })),
    }),
    {
      name: 'linkedai-storage',
      partialize: (state) => ({
        posts: state.posts.slice(0, 50),       // garde les 50 derniers
        letters: state.letters.slice(0, 20),
        savedJobs: state.savedJobs,
        settings: state.settings,
        scrapedProfiles: state.scrapedProfiles.slice(0, 200),
      }),
    }
  )
)

export default useAppStore
