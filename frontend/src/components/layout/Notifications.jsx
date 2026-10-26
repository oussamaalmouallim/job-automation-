/** cloneme: C-05, A-07 — Cloche : activité récente réelle (posts générés, profils en mémoire). */
import { useCallback, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, PenLine, UsersRound } from 'lucide-react'
import useAppStore from '@/store/useAppStore'
import { titrePost } from '@/lib/posts'
import { dateRelative } from '@/lib/stats'
import { menuDeroulant } from '@/lib/animations'
import { useClicExterieur } from '@/lib/useClicExterieur'

const CLE_LECTURE = 'linkedai-notifications-lues'

// Date de dernière ouverture du menu. Le stockage peut être bloqué : on continue sans.
const lireDerniereLecture = () => {
  try { return Number(localStorage.getItem(CLE_LECTURE)) || 0 } catch { return 0 }
}
const ecrireDerniereLecture = (t) => {
  try { localStorage.setItem(CLE_LECTURE, String(t)) } catch { /* stockage indisponible */ }
}

export default function Notifications() {
  const navigate = useNavigate()
  const { posts, scrapedProfiles } = useAppStore()
  const [ouvert, setOuvert] = useState(false)
  const [derniereLecture, setDerniereLecture] = useState(lireDerniereLecture)
  const zone = useRef(null)

  const fermer = useCallback(() => setOuvert(false), [])
  useClicExterieur(zone, ouvert, fermer)

  const recents = posts.slice(0, 5)
  const nonLu = useMemo(
    () => posts.some((p) => new Date(p.createdAt).getTime() > derniereLecture),
    [posts, derniereLecture]
  )

  const basculer = () => {
    if (!ouvert) {
      const maintenant = Date.now()
      ecrireDerniereLecture(maintenant)
      setDerniereLecture(maintenant)
    }
    setOuvert((o) => !o)
  }

  const aller = (to, state) => { navigate(to, { state }); fermer() }

  return (
    <div ref={zone} className="relative">
      <button
        type="button"
        onClick={basculer}
        aria-label="Activité récente"
        aria-expanded={ouvert}
        className="relative flex h-10 w-10 items-center justify-center rounded-pilule border border-ligne bg-surface text-texte transition-colors duration-rapide hover:bg-surface-douce"
      >
        <Bell size={17} />
        {nonLu && <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-pilule bg-alerte ring-2 ring-surface" />}
      </button>

      <AnimatePresence>
        {ouvert && (
          <motion.div
            {...menuDeroulant}
            className="absolute right-0 top-12 z-50 w-[min(340px,calc(100vw-32px))] rounded-carte border border-ligne bg-surface p-2 shadow-menu"
          >
            <p className="px-3 pb-2 pt-2 text-sm font-semibold text-texte">Activité récente</p>
            {recents.length === 0 && scrapedProfiles.length === 0 ? (
              <p className="px-3 py-6 text-center text-xs text-texte-pale">Rien pour l'instant. Génère un post ou lance le scraper.</p>
            ) : (
              <ul>
                {recents.map((p) => (
                  <li key={p.id}>
                    <button type="button" onClick={() => aller('/posts', { postId: p.id })} className="ligne-liste w-full px-3 text-left">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pilule bg-surface-douce text-texte-doux"><PenLine size={14} /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-texte">{titrePost(p.content)}</span>
                        <span className="block text-xs text-texte-pale">Post généré · {dateRelative(p.createdAt)}</span>
                      </span>
                    </button>
                  </li>
                ))}
                {scrapedProfiles.length > 0 && (
                  <li>
                    <button type="button" onClick={() => aller('/scraper')} className="ligne-liste w-full px-3 text-left">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pilule bg-surface-douce text-texte-doux"><UsersRound size={14} /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-texte">{scrapedProfiles.length} profils LinkedIn en mémoire</span>
                        <span className="block text-xs text-texte-pale">Scraper</span>
                      </span>
                    </button>
                  </li>
                )}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
