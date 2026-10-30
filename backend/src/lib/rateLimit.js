// Limite le nombre d'appels par clé (par défaut l'IP) et par fenêtre de temps.
// En mémoire : suffisant pour un seul serveur ; à partager entre instances au lot L6.5.
// `cle(req)` choisit qui est compté : l'IP, l'utilisateur connecté…
export function limiter({ windowMs = 60_000, max = 20, cle = (req) => req.ip } = {}) {
  const hits = new Map()

  // Nettoie les clés qui ne reviennent plus ; unref() pour ne pas empêcher l'arrêt du serveur.
  setInterval(() => {
    const now = Date.now()
    for (const [k, entry] of hits) if (entry.reset < now) hits.delete(k)
  }, windowMs).unref()

  return (req, res, next) => {
    const now = Date.now()
    const k = cle(req)
    const entry = hits.get(k)

    if (!entry || entry.reset < now) {
      hits.set(k, { count: 1, reset: now + windowMs })
      return next()
    }

    entry.count += 1
    if (entry.count > max) {
      res.set('Retry-After', String(Math.ceil((entry.reset - now) / 1000)))
      return res.status(429).json({ error: 'Trop de requêtes, réessaie dans une minute.' })
    }
    return next()
  }
}
