/** cloneme: P-03 — Scraper LinkedIn : lancement via le backend (webhook n8n), lecture souple de la réponse, filtre, export CSV. */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import axios from 'axios'
import { ScanSearch, Download, Trash2, UsersRound, Settings, CircleCheck, CircleAlert, Search } from 'lucide-react'
import useAppStore from '../store/useAppStore'
import { avecActivite } from '../store/useActiviteStore'
import { exporterProfilsCsv } from '../lib/exportCsv'
import { API_BASE } from '../services/api'
import Page from '../components/ui/Page'
import { Card, CardHeader } from '../components/ui/Card'
import { Field, Input, Select } from '../components/ui/Field'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import TableProfils from '../components/scraper/TableProfils'

const envScraperWebhook = import.meta.env.VITE_N8N_SCRAPER_WEBHOOK || ''

// Par défaut le scraper passe par le backend, qui relaie vers n8n (même chemin en local et en démo).
const getDefaultScraperWebhook = () => envScraperWebhook || `${API_BASE}/n8n/scraper`

const parseMaybeJson = (value) => {
  if (typeof value !== 'string') return value

  const text = value.trim()
  if (!text) return []

  try {
    return JSON.parse(text)
  } catch {
    return value
  }
}

const findProfiles = (data) => {
  const parsed = parseMaybeJson(data)

  if (Array.isArray(parsed)) return parsed
  if (Array.isArray(parsed?.data)) return parsed.data
  if (Array.isArray(parsed?.profiles)) return parsed.profiles
  if (Array.isArray(parsed?.items)) return parsed.items
  if (Array.isArray(parsed?.results)) return parsed.results

  const nestedOutput = parseMaybeJson(parsed?.output || parsed?.text || parsed?.message)
  if (Array.isArray(nestedOutput)) return nestedOutput
  if (Array.isArray(nestedOutput?.data)) return nestedOutput.data
  if (Array.isArray(nestedOutput?.profiles)) return nestedOutput.profiles

  return []
}

export default function Scraper() {
  const navigate = useNavigate()
  const { scrapedProfiles, addProfiles, clearProfiles, settings } = useAppStore()
  const scraperWebhook = settings.scraperWebhook?.trim() || getDefaultScraperWebhook()
  const hasScraperWebhook = Boolean(scraperWebhook)

  const [form, setForm] = useState({
    query: 'ingenieur cloud maroc',
    location: 'maroc',
    maxPages: 1,
  })
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleLaunch = async () => {
    if (!hasScraperWebhook) {
      toast.error("Configure d'abord l'URL du webhook scraper dans Parametres.")
      return
    }

    setLoading(true)
    try {
      const prompt = `scrape linkedin ${form.query} ${form.location} maxPages:${form.maxPages}`
      const res = await avecActivite(axios.post(
        scraperWebhook,
        {
          query: form.query,
          location: form.location,
          maxPages: Number(form.maxPages),
          message: prompt,
          chatInput: prompt,
        },
        {
          responseType: 'text',
          transformResponse: [(data) => data],
          timeout: 120000,
        }
      ))

      console.log('Reponse n8n:', res.data)

      const profiles = findProfiles(res.data)

      if (profiles.length > 0) {
        addProfiles(profiles)
        toast.success(`${profiles.length} profils recuperes !`)
      } else {
        toast("n8n a repondu, mais aucun profil exploitable n'a ete retourne.", { icon: '!' })
        console.log('Data brute:', res.data)
      }
    } catch (err) {
      console.error('Erreur:', err)
      if (err.response?.status) {
        toast.error(`Erreur n8n ${err.response.status}: verifie l'URL du webhook.`)
      } else if (err.message.includes('Network Error')) {
        toast.error('Erreur reseau/CORS: le webhook n8n doit autoriser cette app.')
      } else {
        toast.error(`Erreur: ${err.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const filtered = scrapedProfiles.filter((p) => {
    const q = filter.toLowerCase()
    return (
      p.name?.toLowerCase().includes(q) ||
      p.title?.toLowerCase().includes(q) ||
      p.snippet?.toLowerCase().includes(q)
    )
  })

  return (
    <Page
      surtitre="Prospection"
      titre="Scraper LinkedIn"
      description="Récupère des profils LinkedIn publics via ton workflow n8n (Google Custom Search)."
    >
      <Card className="space-y-5">
        <CardHeader
          titre="Lancer le scraper"
          marge={false}
          action={hasScraperWebhook
            ? <Badge ton="succes" icone={CircleCheck}>n8n configuré</Badge>
            : <Badge ton="attention" icone={CircleAlert}>Webhook à configurer</Badge>}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="Requête" htmlFor="query">
            <Input id="query" name="query" value={form.query} onChange={handleChange} placeholder="ex: ingenieur cloud maroc" />
          </Field>
          <Field label="Localisation" htmlFor="location">
            <Input id="location" name="location" value={form.location} onChange={handleChange} placeholder="maroc, casablanca..." />
          </Field>
          <Field label="Pages max" htmlFor="maxPages">
            <Select id="maxPages" name="maxPages" value={form.maxPages} onChange={handleChange}>
              <option value={1}>1 page (10 profils)</option>
              <option value={2}>2 pages (20 profils)</option>
              <option value={5}>5 pages (50 profils)</option>
              <option value={10}>10 pages (100 profils)</option>
            </Select>
          </Field>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button icone={ScanSearch} chargement={loading} onClick={handleLaunch}>
            {loading ? 'Scraping en cours…' : 'Lancer le scraper'}
          </Button>
          {!hasScraperWebhook && (
            <Button variante="secondaire" icone={Settings} onClick={() => navigate('/settings')}>Configurer le webhook</Button>
          )}
          {scrapedProfiles.length > 0 && (
            <>
              <Button variante="secondaire" icone={Download} onClick={() => exporterProfilsCsv(scrapedProfiles)}>
                Exporter CSV
              </Button>
              <Button variante="fantome" icone={Trash2} onClick={() => { clearProfiles(); toast.success('Profils supprimes') }}>
                Vider
              </Button>
            </>
          )}
        </div>
      </Card>

      <Card>
        {scrapedProfiles.length > 0 ? (
          <>
            <CardHeader
              titre={`Profils (${scrapedProfiles.length})`}
              action={
                <div className="flex h-9 w-full max-w-[220px] items-center gap-2 rounded-pilule border border-ligne bg-surface px-3 focus-within:border-accent focus-within:shadow-focus">
                  <Search size={14} className="shrink-0 text-texte-pale" />
                  <input
                    className="min-w-0 flex-1 bg-transparent text-xs text-texte placeholder:text-texte-pale focus:outline-none"
                    placeholder="Filtrer…"
                    aria-label="Filtrer les profils"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  />
                </div>
              }
            />
            {filtered.length > 0 ? (
              <TableProfils profils={filtered} />
            ) : (
              <EmptyState icone={Search} titre="Aucun profil ne correspond" texte={`Rien pour « ${filter} ».`}
                action={<Button petit variante="secondaire" onClick={() => setFilter('')}>Effacer le filtre</Button>} />
            )}
          </>
        ) : (
          !loading && (
            <EmptyState icone={UsersRound} titre="Aucun profil pour l'instant" texte="Lance le scraper pour voir les profils ici." />
          )
        )}
        {loading && scrapedProfiles.length === 0 && (
          <div className="space-y-2" aria-label="Chargement des profils">
            {[0, 1, 2].map((i) => <div key={i} className="h-12 animate-pulse rounded-controle bg-surface-douce" />)}
          </div>
        )}
      </Card>
    </Page>
  )
}
