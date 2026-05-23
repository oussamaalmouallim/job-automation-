import { useState } from 'react'
import toast from 'react-hot-toast'
import useAppStore from '../store/useAppStore'
import axios from 'axios'
import { getResources } from '../services/api'
import VisualCardGenerator from '../components/layout/VisualCardGenerator'

const TYPES  = ['Projet technique', 'Conseil Cloud/IA', 'Storytelling', 'Recherche d\'emploi']
const TONES  = ['Professionnel', 'Humain', 'Startup', 'Viral']
const MODELS = ['deepseek', 'gemini', 'grok']

export default function PostGenerator() {
  const { posts, addPost } = useAppStore()

  const [form, setForm] = useState({
    type: 'Projet technique', description: '', tech: '', tone: 'Professionnel', model: 'deepseek',
  })
  const [result,    setResult]    = useState('')
  const [resources, setResources] = useState(null)
  const [loading,   setLoading]   = useState(false)
  const [loadingRes,setLoadingRes]= useState(false)
  const [activeTab, setActiveTab] = useState('post') // 'post' | 'resources' | 'visual'

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleGenerate = async () => {
    if (!form.description.trim()) { toast.error('Décris ton projet ou ton sujet.'); return }
    setLoading(true)
    try {
      const res = await axios.post('/n8n/webhook/generate-post', {
        type: form.type, description: form.description,
        tech: form.tech, tone: form.tone, model: form.model,
      })
      console.log('Réponse n8n:', res.data)
      const text = res.data?.post || res.data?.text || res.data?.content ||
                   res.data?.choices?.[0]?.message?.content ||
                   (typeof res.data === 'string' ? res.data : JSON.stringify(res.data))
      setResult(text)
      setResources(null)
      addPost({ type: form.type, model: form.model, content: text })
      toast.success('Post généré !')
      setActiveTab('post')
    } catch (err) {
      console.error(err)
      toast.error(`Erreur: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleGetResources = async () => {
    if (!result) { toast.error('Génère un post d\'abord'); return }
    setLoadingRes(true)
    try {
      const data = await getResources({ post: result, tech: form.tech, type: form.type })
      setResources(data)
      setActiveTab('resources')
      toast.success('Ressources trouvées !')
    } catch (err) {
      toast.error(`Erreur ressources: ${err.message}`)
    } finally {
      setLoadingRes(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result)
    toast.success('Copié !')
  }

  const downloadImage = async (url, filename) => {
    const a = document.createElement('a')
    a.href = url; a.download = filename || 'image.jpg'
    a.target = '_blank'; a.click()
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ── Formulaire ── */}
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
            <textarea className="input min-h-24 resize-none" name="description"
              value={form.description} onChange={handleChange}
              placeholder="Ex: J'ai automatisé l'extraction de profils LinkedIn avec n8n..." />
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
            {loading ? '⏳ Génération...' : '✏️ Générer le post'}
          </button>
        </div>

        {/* ── Résultat + Ressources ── */}
        <div className="card flex flex-col gap-4">

          {/* Tabs */}
          {result && (
            <div className="flex gap-2">
              <button onClick={() => setActiveTab('post')}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${activeTab === 'post' ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                ✏️ Post
              </button>
              <button onClick={() => setActiveTab('resources')}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${activeTab === 'resources' ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                🖼️ Ressources {resources ? `(${resources.images?.length || 0})` : ''}
              </button>
              <button onClick={() => setActiveTab('visual')}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${activeTab === 'visual' ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                ✨ Visuel IA
              </button>
            </div>
          )}

          {/* Tab Post */}
          {activeTab === 'post' && (
            result ? (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-gray-800">Post généré</h2>
                  <span className="text-xs text-gray-400">{result.length} caractères</span>
                </div>
                <textarea className="flex-1 input min-h-56 resize-none text-sm leading-relaxed"
                  value={result} onChange={(e) => setResult(e.target.value)} />
                <div className="flex gap-2 flex-wrap">
                  <button className="btn-primary" onClick={copyToClipboard}>📋 Copier</button>
                  <button className="btn-secondary" onClick={handleGetResources} disabled={loadingRes}>
                    {loadingRes ? '⏳...' : '🖼️ Trouver ressources'}
                  </button>
                  <a href="https://www.linkedin.com/feed/" target="_blank" rel="noreferrer" className="btn-secondary">
                    LinkedIn →
                  </a>
                  <button className="btn-secondary" onClick={handleGenerate}>🔄</button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-300 text-sm border border-dashed border-gray-200 rounded-lg min-h-48">
                Le post apparaîtra ici
              </div>
            )
          )}

          {/* Tab Ressources */}
          {activeTab === 'resources' && (
            <div className="flex-1 space-y-4 overflow-y-auto">
              {resources ? (
                <>
                  {/* Type visuel suggéré */}
                  <div className="bg-brand-50 rounded-lg px-3 py-2 text-xs text-brand-800">
                    💡 Visuel suggéré : <strong>{resources.suggestedVisualType}</strong>
                  </div>

                  {/* Images */}
                  {resources.images?.length > 0 && (
                    <div>
                      <p className="label mb-2">Images suggérées</p>
                      <div className="grid grid-cols-1 gap-3">
                        {resources.images.map((img, i) => (
                          <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                            <img src={img.thumb} alt={img.alt} className="w-full h-32 object-cover" />
                            <div className="p-2 flex items-center justify-between">
                              <span className="text-xs text-gray-400">{img.credit}</span>
                              <button onClick={() => downloadImage(img.url, `image-${i+1}.jpg`)}
                                className="btn-secondary text-xs py-1 px-2">
                                📥 Télécharger
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Documents */}
                  {resources.documents?.length > 0 && (
                    <div>
                      <p className="label mb-2">Documentation utile</p>
                      <div className="space-y-2">
                        {resources.documents.map((doc, i) => (
                          <a key={i} href={doc.url} target="_blank" rel="noreferrer"
                            className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                            <span className="text-sm text-gray-700">{doc.title}</span>
                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{doc.type}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tips */}
                  {resources.tips?.length > 0 && (
                    <div>
                      <p className="label mb-2">Conseils</p>
                      <ul className="space-y-1">
                        {resources.tips.map((tip, i) => (
                          <li key={i} className="text-xs text-gray-500 flex gap-2">
                            <span>💡</span><span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-300 text-sm min-h-48">
                  Clique sur "Trouver ressources" après avoir généré un post
                </div>
              )}
            </div>
          )}

          {/* Tab Visual */}
          {activeTab === 'visual' && (
            <div className="flex-1">
              <VisualCardGenerator
                post={result}
                tech={form.tech}
                type={form.type}
              />
            </div>
          )}
        </div>
      </div>

      {/* Historique */}
      {posts.length > 0 && (
        <div className="card space-y-3">
          <h2 className="font-semibold text-gray-800">Historique ({posts.length})</h2>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {posts.map((p) => (
              <div key={p.id} className="flex items-start justify-between gap-3 bg-gray-50 rounded-lg px-3 py-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString('fr-FR')} · {p.type} · {p.model}</p>
                  <p className="text-sm text-gray-700 truncate">{p.content}</p>
                </div>
                <button className="btn-secondary text-xs shrink-0"
                  onClick={() => { setResult(p.content); setActiveTab('post'); toast.success('Post chargé') }}>
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
