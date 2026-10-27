/** cloneme: P-06 — Paramètres : ton par défaut des posts, webhook du scraper, à propos. Gardés dans ce navigateur. */
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Save } from 'lucide-react'
import useAppStore from '../store/useAppStore'
import Page from '../components/ui/Page'
import { Card, CardHeader } from '../components/ui/Card'
import { Field, Input, Select } from '../components/ui/Field'
import Button from '../components/ui/Button'
import { PROFIL } from '../lib/profil'
import { TONS_POST, MODELE_POST, TON_PAR_DEFAUT } from '../lib/posts'

export default function Settings() {
  const { settings, updateSettings } = useAppStore()
  const [form, setForm] = useState({
    ...settings,
    defaultTone: TONS_POST.includes(settings.defaultTone) ? settings.defaultTone : TON_PAR_DEFAUT,
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSave = () => {
    updateSettings(form)
    toast.success('Paramètres sauvegardés !')
  }

  return (
    <Page largeur="moyen" surtitre="Compte" titre="Paramètres" description="Préférences de génération et du scraper, gardées dans ce navigateur.">
      <Card className="space-y-5">
        <CardHeader titre="Génération des posts" marge={false} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Ton par défaut" htmlFor="defaultTone" aide="Pré-choisi à l'ouverture du générateur">
            <Select id="defaultTone" name="defaultTone" value={form.defaultTone} onChange={handleChange}>
              {TONS_POST.map((t) => <option key={t}>{t}</option>)}
            </Select>
          </Field>
          <Field label="Modèle IA" aide="Choisi par le backend">
            <p className="champ bg-surface-douce text-texte-doux">{MODELE_POST.libelle}</p>
          </Field>
        </div>

        <Field label="Webhook du scraper (optionnel)" htmlFor="scraperWebhook"
          aide="Laisse vide pour passer par le backend. À remplir seulement pour viser un autre n8n.">
          <Input id="scraperWebhook" name="scraperWebhook" value={form.scraperWebhook}
            onChange={handleChange} placeholder="https://ton-instance.../webhook/scraper" />
        </Field>

        <Button icone={Save} onClick={handleSave}>Sauvegarder</Button>
      </Card>

      <Card>
        <CardHeader titre="À propos" />
        <dl className="grid grid-cols-[110px_1fr] gap-x-4 gap-y-2.5 text-sm">
          <dt className="text-texte-pale">Projet</dt><dd className="text-texte">LinkedAI — AI Job Automation SaaS</dd>
          <dt className="text-texte-pale">Auteur</dt><dd className="text-texte">{PROFIL.nomAuteur}</dd>
          <dt className="text-texte-pale">Version</dt><dd className="text-texte">0.1.0 — Phase 1 MVP</dd>
          <dt className="text-texte-pale">Stack</dt><dd className="text-texte">React · Express · n8n · DeepSeek (OpenRouter) · Prisma</dd>
        </dl>
      </Card>
    </Page>
  )
}
