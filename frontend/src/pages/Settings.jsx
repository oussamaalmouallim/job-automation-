import { useState } from 'react'
import toast from 'react-hot-toast'
import useAppStore from '../store/useAppStore'

export default function Settings() {
  const { settings, updateSettings } = useAppStore()
  const [form, setForm] = useState({ ...settings })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSave = () => {
    updateSettings(form)
    toast.success('Paramètres sauvegardés !')
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="card space-y-5">
        <h2 className="font-semibold text-gray-800">Connexion n8n</h2>

        <div>
          <label className="label">URL de base n8n</label>
          <input className="input" name="n8nBaseUrl" value={form.n8nBaseUrl}
            onChange={handleChange} placeholder="https://ton-instance.app.n8n.cloud" />
        </div>

        <div>
          <label className="label">Webhook scraper LinkedIn</label>
          <input className="input" name="scraperWebhook" value={form.scraperWebhook}
            onChange={handleChange} placeholder="https://ton-instance.../webhook/scraper" />
          <p className="text-xs text-gray-400 mt-1">
            URL du webhook de ton scraper n8n existant (chatTrigger ou Webhook HTTP)
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Modèle IA par défaut</label>
            <select className="input" name="defaultModel" value={form.defaultModel} onChange={handleChange}>
              <option value="deepseek">DeepSeek</option>
              <option value="gemini">Gemini</option>
              <option value="llama">Llama</option>
              <option value="claude">Claude</option>
            </select>
          </div>
          <div>
            <label className="label">Ton par défaut</label>
            <select className="input" name="defaultTone" value={form.defaultTone} onChange={handleChange}>
              <option value="professional">Professionnel</option>
              <option value="human">Humain</option>
              <option value="startup">Startup</option>
              <option value="viral">Viral</option>
            </select>
          </div>
        </div>

        <button className="btn-primary" onClick={handleSave}>Sauvegarder</button>
      </div>

      <div className="card space-y-3">
        <h2 className="font-semibold text-gray-800">À propos</h2>
        <div className="text-sm text-gray-500 space-y-1">
          <p><strong>Projet :</strong> LinkedAI — AI Job Automation SaaS</p>
          <p><strong>Auteur :</strong> Oussama AL MOUALLIM EL KANOUNI</p>
          <p><strong>Version :</strong> 0.1.0 — Phase 1 MVP</p>
          <p><strong>Stack :</strong> React · n8n · OpenRouter · Supabase</p>
        </div>
      </div>
    </div>
  )
}
