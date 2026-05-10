import { useState } from 'react'
import toast from 'react-hot-toast'
import { generatePost } from '../services/api'
import useAppStore from '../store/useAppStore'

const TYPES  = ['Projet technique', 'Conseil Cloud/IA', 'Storytelling', 'Recherche d\'emploi']
const TONES  = ['Professionnel', 'Humain', 'Startup', 'Viral']
const MODELS = ['deepseek', 'gemini', 'llama', 'claude']

export default function PostGenerator() {
  const { posts, addPost } = useAppStore()

  const [form, setForm] = useState({
    type:        'Projet technique',
    description: '',
    tech:        '',
    tone:        'Professionnel',
    model:       'deepseek',
  })
  const [result,  setResult]  = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleGenerate = async () => {
    if (!form.description.trim()) {
      toast.error('Décris ton projet ou ton sujet.')
      return
    }
    setLoading(true)
    try {
      const data = await generatePost(form)
      const text = typeof data === 'string' ? data : data?.post || data?.text || JSON.stringify(data)
      setResult(text)
      addPost({ type: form.type, model: form.model, content: text })
      toast.success('Post généré !')
    } catch {
      toast.error('Erreur — vérifie VITE_N8N_POST_WEBHOOK dans ton .env')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result)
    toast.success('Copié !')
  }

  return (
    <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Formulaire */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-gray-800">Paramètres du post</h2>

        <div>
          <label className="label">Type de post</label>
          <select className="input" name="type" value={form.type} onChange={handleChange}>
            {TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            className="input min-h-24 resize-none"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Ex: J'ai automatisé l'extraction de profils LinkedIn avec n8n..."
          />
        </div>

        <div>
          <label className="label">Technologies</label>
          <input className="input" name="tech" value={form.tech} onChange={handleChange}
            placeholder="n8n, Python, AWS, React..." />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Ton</label>
            <select className="input" name="tone" value={form.tone} onChange={handleChange}>
              {TONES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Modèle IA</label>
            <select className="input" name="model" value={form.model} onChange={handleChange}>
              {MODELS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <button className="btn-primary w-full" onClick={handleGenerate} disabled={loading}>
          {loading ? 'Génération...' : '✏️ Générer le post'}
        </button>
      </div>

      {/* Résultat */}
      <div className="card flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Post généré</h2>
          {result && (
            <span className="text-xs text-gray-400">{result.length} caractères</span>
          )}
        </div>

        {result ? (
          <>
            <textarea
              className="flex-1 input min-h-64 resize-none text-sm leading-relaxed"
              value={result}
              onChange={(e) => setResult(e.target.value)}
            />
            <div className="flex gap-2">
              <button className="btn-primary" onClick={copyToClipboard}>📋 Copier</button>
              <a
                href="https://www.linkedin.com/feed/"
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
              >
                Ouvrir LinkedIn →
              </a>
              <button className="btn-secondary" onClick={handleGenerate}>🔄</button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-300 text-sm border border-dashed border-gray-200 rounded-lg">
            Le post apparaîtra ici
          </div>
        )}
      </div>

      {/* Historique */}
      {posts.length > 0 && (
        <div className="card md:col-span-2 space-y-3">
          <h2 className="font-semibold text-gray-800">Historique ({posts.length})</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {posts.map((p) => (
              <div key={p.id} className="flex items-start justify-between gap-3 bg-gray-50 rounded-lg px-3 py-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString('fr-FR')} · {p.type} · {p.model}</p>
                  <p className="text-sm text-gray-700 truncate">{p.content}</p>
                </div>
                <button className="btn-secondary text-xs shrink-0"
                  onClick={() => { setResult(p.content); toast.success('Post chargé') }}>
                  Charger
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
