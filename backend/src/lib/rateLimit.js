// Limite le nombre d'appels par IP et par minute. En mémoire : suffisant pour une démo à un seul serveur.
export function limiter({ windowMs = 60_000, max = 20 } = {}) {
  const hits = new Map()

  // Nettoie les IP qui ne reviennent plus ; unref() pour ne pas empêcher l'arrêt du serveur.
  setInterval(() => {
    const now = Date.now()
    for (const [ip, entry] of hits) if (entry.reset < now) hits.delete(ip)
  }, windowMs).unref()

  return (req, res, next) => {
    const now = Date.now()
    const entry = hits.get(req.ip)

    if (!entry || entry.reset < now) {
      hits.set(req.ip, { count: 1, reset: now + windowMs })
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
