/**
 * cloneme: C-21 — Générateur de visuel IA.
 * Le HTML produit par n8n (deepseek) est affiché dans un iframe isolé (sandbox sans allow-same-origin) :
 * il ne peut ni lire la page ni la modifier. L'export PNG se fait donc DANS l'iframe, qui renvoie l'image
 * par postMessage (voir SCRIPT_EXPORT).
 */
import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { Sparkles, Download, Boxes, ListOrdered, ArrowLeftRight, Workflow } from 'lucide-react'
import { generateVisual } from '../../services/api'
import { avecActivite } from '../../store/useActiviteStore'
import Button from '../ui/Button'

const TYPES_VISUELS = [
  { icone: Boxes, label: 'Architecture', desc: 'Diagramme de composants animé' },
  { icone: ListOrdered, label: 'Conseils', desc: 'Liste numérotée avec stagger' },
  { icone: ArrowLeftRight, label: 'Before / After', desc: 'Comparaison avec compteurs' },
  { icone: Workflow, label: 'Flowchart', desc: 'Pipeline qui s\'allume étape par étape' },
]

// Script ajouté au visuel : à la demande du parent, charge html-to-image et renvoie le PNG.
// html-to-image dessine la page via SVG, sans ouvrir d'iframe : il marche dans un iframe isolé,
// là où html2canvas est bloqué. Chargé seulement au moment de l'export.
const SCRIPT_EXPORT = `<script>
window.addEventListener('message', function (e) {
  if (!e.data || e.data.type !== 'linkedai-export-png') return;
  var envoyer = function (msg) { parent.postMessage(msg, '*'); };
  var lancer = function () {
    // Premier vrai élément du visuel (le HTML généré commence souvent par une balise <style>).
    var cible = Array.prototype.find.call(document.body.children, function (el) {
      return !/^(STYLE|SCRIPT|LINK)$/.test(el.tagName);
    }) || document.body;
    htmlToImage.toPng(cible, { pixelRatio: 2 })
      .then(function (dataUrl) { envoyer({ type: 'linkedai-png', dataUrl: dataUrl }); })
      .catch(function (err) { envoyer({ type: 'linkedai-png', error: String(err && err.message || err) }); });
  };
  if (window.htmlToImage) return lancer();
  var s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.js';
  s.onload = lancer;
  s.onerror = function () { envoyer({ type: 'linkedai-png', error: 'html-to-image indisponible' }); };
  document.head.appendChild(s);
});
</script>`

export default function VisualCardGenerator({ post, tech, type }) {
  const [loading, setLoading] = useState(false)
  const [htmlCode, setHtmlCode] = useState('')
  const [visualType, setVisualType] = useState('')
  const iframeRef = useRef(null)

  const handleGenerate = async () => {
    if (!post) { toast.error('Génère un post d\'abord'); return }
    setLoading(true)
    try {
      const data = await avecActivite(generateVisual({ post, tech, type }))
      const code = data?.htmlCode || data?.html || ''
      if (!code) { toast.error('Aucun visuel généré'); return }
      setHtmlCode(code)
      setVisualType(data?.visualType || '')
      toast.success('Visuel généré !')
    } catch (err) {
      toast.error(`Erreur: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Demande l'image à l'iframe et attend sa réponse (20 s au plus).
  const handleDownload = () => {
    const cible = iframeRef.current?.contentWindow
    if (!cible) return
    const toastId = toast.loading('Export en cours…')

    const terminer = (erreur) => {
      window.removeEventListener('message', surMessage)
      clearTimeout(minuterie)
      toast.dismiss(toastId)
      if (erreur) toast.error(`Erreur export : ${erreur}`)
    }

    const surMessage = (e) => {
      if (e.source !== cible || e.data?.type !== 'linkedai-png') return
      if (e.data.error) return terminer(e.data.error)
      const lien = document.createElement('a')
      lien.download = `linkedin-visual-${Date.now()}.png`
      lien.href = e.data.dataUrl
      lien.click()
      terminer()
      toast.success('PNG téléchargé !')
    }

    const minuterie = setTimeout(() => terminer('pas de réponse du visuel'), 20000)
    window.addEventListener('message', surMessage)
    cible.postMessage({ type: 'linkedai-export-png' }, '*')
  }

  // Document isolé du visuel généré : ses styles appartiennent au visuel, pas à l'interface.
  const fullHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 100%; height: 100%; overflow: hidden; font-family: 'Inter', -apple-system, sans-serif; } /* cloneme-ok */
</style>
</head>
<body>${htmlCode}${SCRIPT_EXPORT}</body>
</html>`

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-[15px] font-semibold text-texte">Visuel animé LinkedIn</h3>
          {visualType && (
            <p className="mt-0.5 text-xs text-texte-pale">
              Type détecté : <span className="font-medium text-accent">{visualType}</span>
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button icone={Sparkles} chargement={loading} onClick={handleGenerate}>
            {loading ? 'Génération IA…' : 'Générer le visuel'}
          </Button>
          {htmlCode && (
            <Button variante="secondaire" icone={Download} onClick={handleDownload}>PNG</Button>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex h-[220px] items-center justify-center rounded-controle border border-dashed border-ligne bg-surface-douce sm:h-[300px]">
          <div className="space-y-2 text-center">
            <Sparkles size={28} className="mx-auto animate-pulse text-accent" />
            <p className="text-sm font-medium text-texte">L'IA génère ton visuel…</p>
            <p className="text-xs text-texte-pale">Architecture · Animation · Design</p>
          </div>
        </div>
      )}

      {!loading && htmlCode && (
        <div className="overflow-hidden rounded-controle border border-ligne shadow-carte">
          <iframe
            ref={iframeRef}
            srcDoc={fullHtml}
            className="block h-[220px] w-full border-0 sm:h-[300px]"
            title="Visuel LinkedIn"
            sandbox="allow-scripts"
          />
        </div>
      )}

      {!loading && !htmlCode && (
        <div className="flex h-[220px] items-center justify-center rounded-controle border border-dashed border-ligne px-4 text-center sm:h-[260px]">
          <div className="space-y-2">
            <Sparkles size={28} className="mx-auto text-texte-pale" />
            <p className="text-sm text-texte-doux">Clique sur « Générer le visuel » pour créer<br />un visuel animé unique basé sur ton post.</p>
          </div>
        </div>
      )}

      {!htmlCode && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {TYPES_VISUELS.map(({ icone: Icone, label, desc }) => (
            <div key={label} className="flex items-start gap-2.5 rounded-controle bg-surface-douce px-3 py-2.5">
              <Icone size={16} className="mt-0.5 shrink-0 text-texte-doux" />
              <div>
                <p className="text-xs font-medium text-texte">{label}</p>
                <p className="text-xs text-texte-pale">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
