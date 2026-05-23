import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { generateVisual } from '../../services/api'

export default function VisualCardGenerator({ post, tech, type }) {
  const [loading, setLoading] = useState(false)
  const [htmlCode, setHtmlCode] = useState('')
  const [visualType, setVisualType] = useState('')
  const iframeRef = useRef(null)

  const handleGenerate = async () => {
    if (!post) { toast.error('Génère un post d\'abord'); return }
    setLoading(true)
    try {
      const data = await generateVisual({ post, tech, type })
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
        backgroundColor: '#0f0a2e',
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

  const fullHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { width: 560px; height: 300px; overflow: hidden; font-family: 'Inter', -apple-system, sans-serif; }
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
</style>
</head>
<body>${htmlCode}</body>
</html>`

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-800 text-sm">Visuel animé LinkedIn</h3>
          {visualType && (
            <p className="text-xs text-gray-400 mt-0.5">
              Type détecté : <span className="text-brand-600 font-medium">{visualType}</span>
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            className="btn-primary"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? '⏳ Génération IA...' : '✨ Générer le visuel'}
          </button>
          {htmlCode && (
            <button className="btn-secondary" onClick={handleDownload}>
              📥 PNG
            </button>
          )}
        </div>
      </div>

      {/* Preview */}
      {loading && (
        <div className="flex items-center justify-center border border-dashed border-brand-200 rounded-xl bg-brand-50" style={{ height: 300 }}>
          <div className="text-center space-y-2">
            <div className="text-3xl animate-spin">✨</div>
            <p className="text-sm text-brand-600 font-medium">Gemini génère ton visuel...</p>
            <p className="text-xs text-gray-400">Architecture · Animation · Design</p>
          </div>
        </div>
      )}

      {!loading && htmlCode && (
        <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
          <iframe
            ref={iframeRef}
            srcDoc={fullHtml}
            style={{ width: '100%', height: 300, border: 'none', display: 'block' }}
            title="Visuel LinkedIn"
            sandbox="allow-scripts"
          />
        </div>
      )}

      {!loading && !htmlCode && (
        <div
          className="flex items-center justify-center border border-dashed border-gray-200 rounded-xl text-gray-300 text-sm"
          style={{ height: 300 }}
        >
          <div className="text-center space-y-2">
            <p className="text-4xl">✨</p>
            <p>Clique sur "Générer le visuel" pour créer<br/>un visuel animé unique basé sur ton post</p>
          </div>
        </div>
      )}

      {/* Types disponibles */}
      {!htmlCode && (
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: '🏗️', label: 'Architecture', desc: 'Diagramme de composants animé' },
            { icon: '📋', label: 'Conseils', desc: 'Liste numérotée avec stagger' },
            { icon: '⚡', label: 'Before / After', desc: 'Comparaison avec compteurs' },
            { icon: '🔄', label: 'Flowchart', desc: 'Pipeline qui s\'allume étape par étape' },
          ].map(({ icon, label, desc }) => (
            <div key={label} className="bg-gray-50 rounded-lg px-3 py-2 flex gap-2 items-start">
              <span className="text-base">{icon}</span>
              <div>
                <p className="text-xs font-medium text-gray-700">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
