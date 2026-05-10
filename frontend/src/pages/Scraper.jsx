import { useState } from 'react'
import toast from 'react-hot-toast'
import { triggerScraper } from '../services/api'
import useAppStore from '../store/useAppStore'

// Colonnes retournées par ton scraper n8n existant :
// name | title | link | snippet | image | startIndex

export default function Scraper() {
  const { scrapedProfiles, addProfiles, clearProfiles } = useAppStore()

  const [form, setForm] = useState({
    query:    'recrutement IT maroc',
    location: 'maroc',
    maxPages: 2,
  })
  const [loading, setLoading] = useState(false)
  const [filter, setFilter]   = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleLaunch = async () => {
    if (!import.meta.env.VITE_N8N_SCRAPER_WEBHOOK) {
      toast.error('Configure VITE_N8N_SCRAPER_WEBHOOK dans ton .env')
      return
    }
    setLoading(true)
    try {
      const data = await triggerScraper(form)

      // Le scraper envoie les résultats dans Google Sheets.
      // Si tu ajoutes un nœud "Respond to Webhook" dans n8n,
      // les profils arrivent directement ici dans `data`.
      // Sinon, on affiche juste la confirmation.

      if (Array.isArray(data)) {
        addProfiles(data)
        toast.success(`${data.length} profils récupérés !`)
      } else {
        // n8n a bien reçu et a exporté vers Google Sheets
        toast.success('Scraper lancé ! Résultats envoyés vers Google Sheets.')
      }
    } catch (err) {
      toast.error('Erreur de connexion au scraper n8n.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = scrapedProfiles.filter((p) => {
    const q = filter.toLowerCase()
    return (
      (p.name?.toLowerCase().includes(q)) ||
      (p.title?.toLowerCase().includes(q)) ||
      (p.snippet?.toLowerCase().includes(q))
    )
  })

  const exportCSV = () => {
    const header = 'Nom,Titre,Lien,Snippet\n'
    const rows = scrapedProfiles.map(p =>
      `"${p.name || ''}","${p.title || ''}","${p.link || ''}","${(p.snippet || '').replace(/"/g, "'")}"`
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'profils-linkedin.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-5xl space-y-6">

      {/* Formulaire de lancement */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Lancer le scraper LinkedIn</h2>
          <span className="badge bg-green-50 text-green-700 border border-green-100 text-xs">
            ✅ n8n connecté
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Requête de recherche</label>
            <input
              className="input"
              name="query"
              value={form.query}
              onChange={handleChange}
              placeholder="ex: ingénieur cloud maroc"
            />
          </div>
          <div>
            <label className="label">Localisation</label>
            <input
              className="input"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="maroc, casablanca..."
            />
          </div>
          <div>
            <label className="label">Pages max (1 page = 10 résultats)</label>
            <select className="input" name="maxPages" value={form.maxPages} onChange={handleChange}>
              <option value={1}>1 page (10 profils)</option>
              <option value={2}>2 pages (20 profils)</option>
              <option value={5}>5 pages (50 profils)</option>
              <option value={10}>10 pages (100 profils) — max</option>
            </select>
          </div>
        </div>

        {/* Info sur le fonctionnement actuel */}
        <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-700 leading-relaxed">
          <strong>⚠️ Mode actuel :</strong> Ton scraper n8n utilise un <code>chatTrigger</code>.
          Les résultats sont exportés dans Google Sheets.
          Pour recevoir les profils directement ici, ajoute un nœud <strong>"Respond to Webhook"</strong> à la fin de ton workflow n8n.
          <a
            href="https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.respondtowebhook/"
            target="_blank"
            rel="noreferrer"
            className="underline ml-1"
          >
            Voir la doc →
          </a>
        </div>

        <div className="flex gap-3">
          <button
            className="btn-primary"
            onClick={handleLaunch}
            disabled={loading}
          >
            {loading ? 'Lancement...' : '🚀 Lancer le scraper'}
          </button>
          {scrapedProfiles.length > 0 && (
            <>
              <button className="btn-secondary" onClick={exportCSV}>
                📥 Exporter CSV
              </button>
              <button
                className="btn-secondary text-red-500 hover:text-red-600"
                onClick={() => { clearProfiles(); toast.success('Profils supprimés') }}
              >
                Vider
              </button>
            </>
          )}
        </div>
      </div>

      {/* Résultats */}
      {scrapedProfiles.length > 0 && (
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">
              Profils scrapés <span className="text-brand-600">({scrapedProfiles.length})</span>
            </h2>
            <input
              className="input max-w-xs"
              placeholder="Filtrer par nom, titre..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  {['Image', 'Nom', 'Titre', 'Extrait', 'Lien'].map((h) => (
                    <th key={h} className="px-4 py-2 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((p, i) => (
                  <tr key={i} className="bg-white hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2">
                      {p.image
                        ? <img src={p.image} alt="" className="w-8 h-8 rounded-full object-cover" />
                        : <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-xs text-brand-700 font-medium">
                            {(p.name || '?').charAt(0)}
                          </div>
                      }
                    </td>
                    <td className="px-4 py-2 font-medium text-gray-800 whitespace-nowrap">{p.name || '—'}</td>
                    <td className="px-4 py-2 text-gray-500 max-w-xs truncate">{p.title || '—'}</td>
                    <td className="px-4 py-2 text-gray-400 text-xs max-w-sm truncate">{p.snippet || '—'}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {p.link && (
                        <a href={p.link} target="_blank" rel="noreferrer"
                          className="text-brand-600 hover:underline text-xs font-medium">
                          Voir →
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {scrapedProfiles.length === 0 && !loading && (
        <div className="card text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-sm">Lance le scraper pour voir les profils ici.</p>
        </div>
      )}
    </div>
  )
}
