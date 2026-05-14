import { useState } from 'react'
import toast from 'react-hot-toast'
import useAppStore from '../store/useAppStore'
import axios from 'axios'

export default function Scraper() {
  const { scrapedProfiles, addProfiles, clearProfiles } = useAppStore()

  const [form, setForm] = useState({
    query: 'ingenieur cloud maroc',
    location: 'maroc',
    maxPages: 1,
  })
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleLaunch = async () => {
    setLoading(true)
    try {
      const res = await axios.post('/n8n/webhook/scraper', {
        query: form.query,
        maxPages: Number(form.maxPages),
      })

      console.log('Réponse n8n:', res.data)

      // La réponse peut être un tableau ou un objet
      let profiles = []
      if (Array.isArray(res.data)) {
        profiles = res.data
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        profiles = res.data.data
      } else if (typeof res.data === 'string') {
        profiles = JSON.parse(res.data)
      }

      if (profiles.length > 0) {
        addProfiles(profiles)
        toast.success(`${profiles.length} profils récupérés !`)
      } else {
        toast('Aucun profil retourné — vérifie n8n', { icon: '⚠️' })
        console.log('Data brute:', res.data)
      }
    } catch (err) {
      console.error('Erreur:', err)
      toast.error(`Erreur: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const filtered = scrapedProfiles.filter((p) => {
    const q = filter.toLowerCase()
    return (
      p.name?.toLowerCase().includes(q) ||
      p.title?.toLowerCase().includes(q) ||
      p.snippet?.toLowerCase().includes(q)
    )
  })

  const exportCSV = () => {
    const header = 'Nom,Titre,Lien,Snippet\n'
    const rows = scrapedProfiles
      .map(
        (p) =>
          `"${p.name || ''}","${p.title || ''}","${p.link || ''}","${(p.snippet || '').replace(/"/g, "'")}"`
      )
      .join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'profils-linkedin.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-5xl space-y-6">
      {/* Formulaire */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Lancer le scraper LinkedIn</h2>
          <span className="badge bg-green-50 text-green-700 border border-green-100 text-xs px-2 py-1 rounded-full">
            ✅ n8n connecté
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Requête</label>
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
            <label className="label">Pages max</label>
            <select className="input" name="maxPages" value={form.maxPages} onChange={handleChange}>
              <option value={1}>1 page (10 profils)</option>
              <option value={2}>2 pages (20 profils)</option>
              <option value={5}>5 pages (50 profils)</option>
              <option value={10}>10 pages (100 profils)</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="btn-primary" onClick={handleLaunch} disabled={loading}>
            {loading ? '⏳ Scraping en cours...' : '🚀 Lancer le scraper'}
          </button>
          {scrapedProfiles.length > 0 && (
            <>
              <button className="btn-secondary" onClick={exportCSV}>
                📥 Exporter CSV
              </button>
              <button
                className="btn-secondary"
                onClick={() => { clearProfiles(); toast.success('Profils supprimés') }}
              >
                🗑️ Vider
              </button>
            </>
          )}
        </div>
      </div>

      {/* Résultats */}
      {scrapedProfiles.length > 0 ? (
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">
              Profils <span className="text-brand-600">({scrapedProfiles.length})</span>
            </h2>
            <input
              className="input max-w-xs"
              placeholder="Filtrer..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  {['Photo', 'Nom', 'Titre', 'Extrait', 'Lien'].map((h) => (
                    <th key={h} className="px-4 py-2 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((p, i) => (
                  <tr key={i} className="bg-white hover:bg-gray-50">
                    <td className="px-4 py-2">
                      {p.image ? (
                        <img src={p.image} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-xs text-brand-700 font-medium">
                          {(p.name || '?').charAt(0)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 font-medium text-gray-800 whitespace-nowrap">{p.name || '—'}</td>
                    <td className="px-4 py-2 text-gray-500 max-w-xs truncate">{p.title || '—'}</td>
                    <td className="px-4 py-2 text-gray-400 text-xs max-w-sm truncate">{p.snippet || '—'}</td>
                    <td className="px-4 py-2">
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
      ) : (
        !loading && (
          <div className="card text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-sm">Lance le scraper pour voir les profils ici.</p>
          </div>
        )
      )}
    </div>
  )
}