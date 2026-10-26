// Export CSV des profils scrapés (déplacé tel quel depuis la page Scraper pour être réutilisé par le dashboard).
export function exporterProfilsCsv(profiles) {
  const header = 'Nom,Titre,Lien,Snippet\n'
  const rows = profiles
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
