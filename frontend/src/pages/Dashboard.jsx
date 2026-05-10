import { useNavigate } from 'react-router-dom'
import useAppStore from '../store/useAppStore'

const QUICK_ACTIONS = [
  { label: 'Générer un post LinkedIn', to: '/posts',   color: 'bg-brand-50 text-brand-800 border-brand-100' },
  { label: 'Lancer le scraper',         to: '/scraper', color: 'bg-green-50 text-green-800 border-green-100' },
  { label: 'Adapter une lettre',         to: '/lettre',  color: 'bg-amber-50 text-amber-800 border-amber-100' },
  { label: 'Chercher des offres',        to: '/offres',  color: 'bg-blue-50 text-blue-800 border-blue-100' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const { posts, scrapedProfiles, letters, savedJobs } = useAppStore()

  const stats = [
    { label: 'Posts générés',   value: posts.length },
    { label: 'Profils scrapés', value: scrapedProfiles.length },
    { label: 'Lettres créées',  value: letters.length },
    { label: 'Offres sauvées',  value: savedJobs.length },
  ]

  return (
    <div className="max-w-4xl space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value }) => (
          <div key={label} className="card text-center">
            <p className="text-3xl font-semibold text-brand-700">{value}</p>
            <p className="text-xs text-gray-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Actions rapides */}
      <div>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Actions rapides</h2>
        <div className="grid grid-cols-2 gap-3">
          {QUICK_ACTIONS.map(({ label, to, color }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className={`card border text-left text-sm font-medium hover:shadow-md transition-shadow cursor-pointer ${color}`}
            >
              {label} →
            </button>
          ))}
        </div>
      </div>

      {/* Derniers posts */}
      {posts.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Derniers posts générés</h2>
          <div className="space-y-3">
            {posts.slice(0, 3).map((post) => (
              <div key={post.id} className="card">
                <p className="text-xs text-gray-400 mb-1">{new Date(post.createdAt).toLocaleDateString('fr-FR')} · {post.type}</p>
                <p className="text-sm text-gray-700 line-clamp-2">{post.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profils scrapés récents */}
      {scrapedProfiles.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Derniers profils scrapés</h2>
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-2 text-left">Nom</th>
                  <th className="px-4 py-2 text-left">Titre</th>
                  <th className="px-4 py-2 text-left">Lien</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {scrapedProfiles.slice(0, 5).map((p, i) => (
                  <tr key={i} className="bg-white">
                    <td className="px-4 py-2 font-medium text-gray-800">{p.name || '—'}</td>
                    <td className="px-4 py-2 text-gray-500">{p.title || '—'}</td>
                    <td className="px-4 py-2">
                      {p.link && (
                        <a href={p.link} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline text-xs">
                          Voir profil →
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
    </div>
  )
}
