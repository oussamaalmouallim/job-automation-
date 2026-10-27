/** Hook des menus déroulants : fermeture au clic extérieur et à Échap. */
import { useEffect } from 'react'

// Ferme un menu au clic hors de `ref` ou à la touche Échap.
export function useClicExterieur(ref, ouvert, fermer) {
  useEffect(() => {
    if (!ouvert) return undefined
    const surClic = (e) => { if (ref.current && !ref.current.contains(e.target)) fermer() }
    const surTouche = (e) => { if (e.key === 'Escape') fermer() }
    document.addEventListener('mousedown', surClic)
    document.addEventListener('keydown', surTouche)
    return () => {
      document.removeEventListener('mousedown', surClic)
      document.removeEventListener('keydown', surTouche)
    }
  }, [ref, ouvert, fermer])
}
