/** cloneme: C-04, A-07 — Recherche globale : pages, posts de l'historique, profils scrapés. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, PenLine, UserRound, X } from 'lucide-react'
import useAppStore from '@/store/useAppStore'
import { NAVIGATION } from '@/lib/navigation'
import { titrePost } from '@/lib/posts'
import { menuDeroulant } from '@/lib/animations'
import { useClicExterieur } from '@/lib/useClicExterieur'
import { cn } from '@/lib/utils'

const contient = (texte, q) => (texte || '').toLowerCase().includes(q)

export default function RechercheGlobale() {
  const navigate = useNavigate()
  const { posts, scrapedProfiles } = useAppStore()
  const [requete, setRequete] = useState('')
  const [ouvert, setOuvert] = useState(false)
  const [actif, setActif] = useState(0)
  const zone = useRef(null)
  const champ = useRef(null)

  const fermer = useCallback(() => { setOuvert(false); setActif(0) }, [])
  useClicExterieur(zone, ouvert, fermer)

  // Ctrl/Cmd + K place le curseur dans la recherche.
  useEffect(() => {
    const surTouche = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        champ.current?.focus()
        setOuvert(true)
      }
    }
    document.addEventListener('keydown', surTouche)
    return () => document.removeEventListener('keydown', surTouche)
  }, [])

  const resultats = useMemo(() => {
    const q = requete.trim().toLowerCase()
    const pages = NAVIGATION
      .filter((n) => !q || contient(n.label, q))
      .map((n) => ({ cle: `page-${n.to}`, groupe: 'Pages', icone: n.icone, titre: n.label, action: () => navigate(n.to) }))
    if (!q) return pages
    const postsTrouves = posts
      .filter((p) => contient(p.content, q) || contient(p.type, q))
      .slice(0, 4)
      .map((p) => ({
        cle: `post-${p.id}`, groupe: 'Posts', icone: PenLine, titre: titrePost(p.content), meta: p.type,
        action: () => navigate('/posts', { state: { postId: p.id } }),
      }))
    const profils = scrapedProfiles
      .filter((p) => p.link && (contient(p.name, q) || contient(p.title, q)))
      .slice(0, 4)
      .map((p, i) => ({
        cle: `profil-${p.link}-${i}`, groupe: 'Profils', icone: UserRound, titre: p.name || p.link, meta: p.title,
        action: () => window.open(p.link, '_blank', 'noopener,noreferrer'),
      }))
    return [...pages, ...postsTrouves, ...profils]
  }, [requete, posts, scrapedProfiles, navigate])

  const choisir = (r) => {
    r.action()
    setRequete('')
    fermer()
    champ.current?.blur()
  }

  const surTouche = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActif((a) => Math.min(a + 1, resultats.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActif((a) => Math.max(a - 1, 0)) }
    if (e.key === 'Enter' && resultats[actif]) { e.preventDefault(); choisir(resultats[actif]) }
  }

  return (
    <div ref={zone} className="relative min-w-0 flex-1 md:max-w-md">
      <div className="flex h-10 items-center gap-2.5 rounded-pilule border border-ligne bg-surface px-4 transition duration-rapide focus-within:border-accent focus-within:shadow-focus">
        <Search size={16} className="shrink-0 text-texte-pale" />
        <input
          ref={champ}
          value={requete}
          onChange={(e) => { setRequete(e.target.value); setActif(0); setOuvert(true) }}
          onFocus={() => setOuvert(true)}
          onKeyDown={surTouche}
          placeholder="Rechercher…"
          aria-label="Rechercher une page, un post ou un profil"
          className="min-w-0 flex-1 bg-transparent text-sm text-texte placeholder:text-texte-pale focus:outline-none"
        />
        {requete ? (
          <button type="button" aria-label="Effacer" onClick={() => setRequete('')} className="text-texte-pale hover:text-texte">
            <X size={14} />
          </button>
        ) : (
          <kbd className="hidden rounded-[6px] border border-ligne px-1.5 py-0.5 font-mono text-[10px] text-texte-pale lg:block">⌘K</kbd>
        )}
      </div>

      <AnimatePresence>
        {ouvert && (
          <motion.div
            {...menuDeroulant}
            className="absolute left-0 right-0 top-12 z-50 max-h-[60vh] overflow-y-auto rounded-carte border border-ligne bg-surface p-2 shadow-menu"
          >
            {resultats.length === 0 ? (
              <p className="px-3 py-6 text-center text-xs text-texte-pale">Aucun résultat pour « {requete} »</p>
            ) : (
              resultats.map((r, i) => (
                <div key={r.cle}>
                  {(i === 0 || resultats[i - 1].groupe !== r.groupe) && (
                    <p className="surtitre px-3 pb-1 pt-2 text-[10px]">{r.groupe}</p>
                  )}
                  <button
                    type="button"
                    onMouseEnter={() => setActif(i)}
                    onClick={() => choisir(r)}
                    className={cn('flex w-full items-center gap-3 rounded-controle px-3 py-2 text-left transition-colors duration-rapide', actif === i && 'bg-surface-douce')}
                  >
                    <r.icone size={16} className="shrink-0 text-texte-doux" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-texte">{r.titre}</span>
                      {r.meta && <span className="block truncate text-xs text-texte-pale">{r.meta}</span>}
                    </span>
                  </button>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
