import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import toast from 'react-hot-toast'
import axios from 'axios'

const TEMPLATES = ['Tech Card', 'Tip Card', 'Project Card']

const COLORS = {
  purple: { bg: '#1a1035', accent: '#7F77DD', text: '#fff', badge: '#2d1f6e' },
  dark:   { bg: '#0f172a', accent: '#38bdf8', text: '#fff', badge: '#1e3a5f' },
  orange: { bg: '#1c0f05', accent: '#f97316', text: '#fff', badge: '#431407' },
}

// ── Templates ──────────────────────────────────────────────────────

function TechCard({ data, color }) {
  const c = COLORS[color]
  return (
    <div style={{ background: c.bg, width: 600, minHeight: 340, borderRadius: 20, padding: 40, fontFamily: 'DM Sans, sans-serif', position: 'relative', overflow: 'hidden' }}>
      {/* Glow */}
      <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: c.accent, opacity: 0.15, filter: 'blur(60px)' }} />
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ width: 4, height: 32, background: c.accent, borderRadius: 4 }} />
        <span style={{ color: c.accent, fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2 }}>
          {data.category || 'Projet Tech'}
        </span>
      </div>

      {/* Title */}
      <h2 style={{ color: c.text, fontSize: 26, fontWeight: 700, marginBottom: 16, lineHeight: 1.3, margin: '0 0 16px' }}>
        {data.title}
      </h2>

      {/* Description */}
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.7, margin: '0 0 24px' }}>
        {data.description}
      </p>

      {/* Tech badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {(data.techs || []).map((t, i) => (
          <span key={i} style={{ background: c.badge, color: c.accent, padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500, border: `1px solid ${c.accent}30` }}>
            {t}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div style={{ position: 'absolute', bottom: 24, right: 32, color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>
        LinkedAI
      </div>
    </div>
  )
}

function TipCard({ data, color }) {
  const c = COLORS[color]
  return (
    <div style={{ background: c.bg, width: 600, minHeight: 340, borderRadius: 20, padding: 40, fontFamily: 'DM Sans, sans-serif', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', bottom: -80, left: -80, width: 250, height: 250, borderRadius: '50%', background: c.accent, opacity: 0.1, filter: 'blur(80px)' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <div style={{ width: 4, height: 32, background: c.accent, borderRadius: 4 }} />
        <span style={{ color: c.accent, fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2 }}>
          {data.category || 'Conseils'}
        </span>
      </div>

      <h2 style={{ color: c.text, fontSize: 22, fontWeight: 700, margin: '0 0 24px', lineHeight: 1.3 }}>
        {data.title}
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {(data.tips || []).slice(0, 4).map((tip, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <span style={{ background: c.accent, color: c.bg, width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
              {i + 1}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 1.6, paddingTop: 4 }}>{tip}</span>
          </div>
        ))}
      </div>

      <div style={{ position: 'absolute', bottom: 24, right: 32, color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>
        LinkedAI
      </div>
    </div>
  )
}

function ProjectCard({ data, color }) {
  const c = COLORS[color]
  return (
    <div style={{ background: c.bg, width: 600, minHeight: 340, borderRadius: 20, padding: 40, fontFamily: 'DM Sans, sans-serif', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: c.accent, opacity: 0.12, filter: 'blur(50px)' }} />
      <div style={{ position: 'absolute', bottom: -60, left: -60, width: 200, height: 200, borderRadius: '50%', background: c.accent, opacity: 0.08, filter: 'blur(70px)' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ width: 4, height: 32, background: c.accent, borderRadius: 4 }} />
        <span style={{ color: c.accent, fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2 }}>
          {data.category || 'Projet'}
        </span>
      </div>

      <h2 style={{ color: c.text, fontSize: 24, fontWeight: 700, margin: '0 0 12px', lineHeight: 1.3 }}>
        {data.title}
      </h2>

      <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, margin: '0 0 24px', lineHeight: 1.6 }}>
        {data.description}
      </p>

      {/* Stats */}
      {data.stats && (
        <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
          {data.stats.map((s, i) => (
            <div key={i} style={{ background: c.badge, borderRadius: 12, padding: '12px 20px', textAlign: 'center', border: `1px solid ${c.accent}20` }}>
              <div style={{ color: c.accent, fontSize: 22, fontWeight: 700 }}>{s.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {(data.techs || []).map((t, i) => (
          <span key={i} style={{ background: c.badge, color: c.accent, padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, border: `1px solid ${c.accent}25` }}>
            {t}
          </span>
        ))}
      </div>

      <div style={{ position: 'absolute', bottom: 24, right: 32, color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>
        LinkedAI
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────

export default function VisualCardGenerator({ post, tech, type }) {
  const cardRef  = useRef(null)
  const [loading, setLoading]   = useState(false)
  const [cardData, setCardData] = useState(null)
  const [template, setTemplate] = useState('Tech Card')
  const [color, setColor]       = useState('purple')

  const generateCard = async () => {
    if (!post) { toast.error('Génère un post d\'abord'); return }
    setLoading(true)
    try {
      const prompt = `Analyse ce post LinkedIn et retourne un JSON pour créer une belle carte visuelle.

Post: ${post.substring(0, 600)}
Technologies: ${tech}
Type: ${type}

Retourne UNIQUEMENT ce JSON valide, rien d'autre:
{
  "title": "titre court et accrocheur (max 8 mots)",
  "description": "résumé en 1-2 phrases (max 120 caractères)",
  "category": "catégorie courte (ex: Projet Web, Conseil DevOps, Automatisation IA)",
  "techs": ["tech1", "tech2", "tech3"],
  "tips": ["conseil 1 court", "conseil 2 court", "conseil 3 court"],
  "stats": [{"value": "100%", "label": "Automatisé"}, {"value": "3x", "label": "Plus rapide"}]
}`

      const res = await axios.post('/n8n/webhook/generate-post', {
        type: 'card-data',
        description: prompt,
        tech,
        tone: 'json',
        model: 'deepseek',
      })

      let raw = res.data?.post || res.data?.text || res.data?.content || ''
      raw = raw.replace(/```json/g, '').replace(/```/g, '').trim()
      const data = JSON.parse(raw)
      setCardData(data)
      toast.success('Carte générée !')
    } catch (err) {
      // Fallback avec données extraites du post
      const techList = tech.split(',').map(t => t.trim()).filter(Boolean)
      setCardData({
        title: post.split('\n')[0].substring(0, 60),
        description: post.substring(0, 120),
        category: type,
        techs: techList.slice(0, 5),
        tips: post.split('\n').filter(l => l.trim().length > 20).slice(0, 4),
        stats: [{ value: techList.length + '+', label: 'Technologies' }]
      })
      toast.success('Carte générée !')
    } finally {
      setLoading(false)
    }
  }

  const downloadPNG = async () => {
    if (!cardRef.current) return
    toast.loading('Export en cours...')
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      })
      const link = document.createElement('a')
      link.download = 'linkedin-card.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
      toast.dismiss()
      toast.success('PNG téléchargé !')
    } catch {
      toast.dismiss()
      toast.error('Erreur export')
    }
  }

  const renderCard = () => {
    if (!cardData) return null
    const props = { data: cardData, color }
    if (template === 'Tip Card')     return <TipCard {...props} />
    if (template === 'Project Card') return <ProjectCard {...props} />
    return <TechCard {...props} />
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex gap-3 flex-wrap items-end">
        <div>
          <label className="label">Template</label>
          <select className="input w-40" value={template} onChange={e => setTemplate(e.target.value)}>
            {TEMPLATES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Couleur</label>
          <select className="input w-36" value={color} onChange={e => setColor(e.target.value)}>
            <option value="purple">🟣 Purple</option>
            <option value="dark">🔵 Dark Blue</option>
            <option value="orange">🟠 Orange</option>
          </select>
        </div>
        <button className="btn-primary" onClick={generateCard} disabled={loading}>
          {loading ? '⏳ Génération...' : '✨ Générer la carte'}
        </button>
        {cardData && (
          <button className="btn-secondary" onClick={downloadPNG}>
            📥 Télécharger PNG
          </button>
        )}
      </div>

      {/* Preview */}
      {cardData ? (
        <div className="overflow-x-auto">
          <div ref={cardRef} style={{ display: 'inline-block' }}>
            {renderCard()}
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-300 text-sm" style={{ height: 200 }}>
          Clique sur "Générer la carte" pour créer ton visuel LinkedIn
        </div>
      )}
    </div>
  )
}