/** cloneme: C-24 — Table des profils scrapés : photo, nom, titre, extrait, lien. */
import { ExternalLink } from 'lucide-react'

export default function TableProfils({ profils }) {
  return (
    <div className="overflow-x-auto rounded-controle border border-ligne">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="bg-surface-douce text-left text-xs text-texte-doux">
          <tr>
            {['Profil', 'Titre', 'Extrait', ''].map((h) => (
              <th key={h} className="px-4 py-2.5 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ligne bg-surface">
          {profils.map((p, i) => (
            <tr key={i} className="transition-colors duration-rapide hover:bg-app">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {p.image ? (
                    <img src={p.image} alt="" className="h-9 w-9 shrink-0 rounded-pilule object-cover" />
                  ) : (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pilule bg-sable text-xs font-semibold text-texte">
                      {(p.name || '?').charAt(0)}
                    </span>
                  )}
                  <span className="whitespace-nowrap font-medium text-texte">{p.name || '-'}</span>
                </div>
              </td>
              <td className="max-w-xs truncate px-4 py-3 text-texte-doux">{p.title || '-'}</td>
              <td className="max-w-sm truncate px-4 py-3 text-xs text-texte-pale">{p.snippet || '-'}</td>
              <td className="px-4 py-3 text-right">
                {p.link && (
                  <a href={p.link} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline">
                    Voir <ExternalLink size={12} />
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
