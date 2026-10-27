/** cloneme: C-21 — Générateur de visuel IA : appel n8n, aperçu dans un iframe isolé, export PNG. Logique inchangée. */
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
      console.log('Visual data:', data)
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

  const handleDownload = async () => {
    if (!iframeRef.current) return
    toast.loading('Export en cours...')
    try {
      const { default: html2canvas } = await import('html2canvas')
      const iframeDoc = iframeRef.current.contentDocument
      const canvas = await html2canvas(iframeDoc.body, {
        scale: 2,
        backgroundColor: '#0f0a2e', // cloneme-ok : fond du visuel généré par n8n, pas de l'interface
        useCORS: true,
        width: 560,
        height: 300,
      })
      const link = document.createElement('a')
      link.download = `linkedin-visual-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      toast.dismiss()
      toast.success('PNG téléchargé !')
    } catch (err) {
      toast.dismiss()
      toast.error('Erreur export: ' + err.message)
    }
  }

  // Document isolé du visuel généré : ses styles appartiennent au visuel, pas à l'interface.
  const fullHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 100%; height: 100%; overflow: hidden; font-family: 'Inter', -apple-system, sans-serif; } /* cloneme-ok */
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
</style>
</head>
<body>${htmlCode}</body>
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
