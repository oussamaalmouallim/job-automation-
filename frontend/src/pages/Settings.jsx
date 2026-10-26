/** cloneme: P-06 — Paramètres : connexion n8n, modèle et ton par défaut, à propos. Logique inchangée. */
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Save } from 'lucide-react'
import useAppStore from '../store/useAppStore'
import Page from '../components/ui/Page'
import { Card, CardHeader } from '../components/ui/Card'
import { Field, Input, Select } from '../components/ui/Field'
import Button from '../components/ui/Button'
import { PROFIL } from '../lib/profil'

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
    <Page largeur="moyen" surtitre="Compte" titre="Paramètres" description="Connexion à n8n et préférences de génération, gardées dans ce navigateur.">
      <Card className="space-y-5">
        <CardHeader titre="Connexion n8n" marge={false} />

        <Field label="URL de base n8n" htmlFor="n8nBaseUrl">
          <Input id="n8nBaseUrl" name="n8nBaseUrl" value={form.n8nBaseUrl}
            onChange={handleChange} placeholder="https://ton-instance.app.n8n.cloud" />
        </Field>

        <Field label="Webhook scraper LinkedIn" htmlFor="scraperWebhook"
          aide="URL du webhook de ton scraper n8n existant (chatTrigger ou Webhook HTTP)">
          <Input id="scraperWebhook" name="scraperWebhook" value={form.scraperWebhook}
            onChange={handleChange} placeholder="https://ton-instance.../webhook/scraper" />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Modèle IA par défaut" htmlFor="defaultModel">
            <Select id="defaultModel" name="defaultModel" value={form.defaultModel} onChange={handleChange}>
              <option value="deepseek">DeepSeek</option>
              <option value="gemini">Gemini</option>
              <option value="llama">Llama</option>
              <option value="claude">Claude</option>
            </Select>
          </Field>
          <Field label="Ton par défaut" htmlFor="defaultTone">
            <Select id="defaultTone" name="defaultTone" value={form.defaultTone} onChange={handleChange}>
              <option value="professional">Professionnel</option>
              <option value="human">Humain</option>
              <option value="startup">Startup</option>
              <option value="viral">Viral</option>
            </Select>
          </Field>
        </div>

        <Button icone={Save} onClick={handleSave}>Sauvegarder</Button>
      </Card>

      <Card>
        <CardHeader titre="À propos" />
        <dl className="grid grid-cols-[110px_1fr] gap-x-4 gap-y-2.5 text-sm">
          <dt className="text-texte-pale">Projet</dt><dd className="text-texte">LinkedAI — AI Job Automation SaaS</dd>
          <dt className="text-texte-pale">Auteur</dt><dd className="text-texte">{PROFIL.nomAuteur}</dd>
          <dt className="text-texte-pale">Version</dt><dd className="text-texte">0.1.0 — Phase 1 MVP</dd>
          <dt className="text-texte-pale">Stack</dt><dd className="text-texte">React · n8n · OpenRouter · Prisma</dd>
        </dl>
      </Card>
    </Page>
  )
}
