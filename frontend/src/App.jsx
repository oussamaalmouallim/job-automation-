/** Routes de l'application : pages de compte publiques, tout le reste derrière la connexion (lot L0.4). */
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import { RouteProtegee, RoutePublique } from './components/auth/RouteProtegee'
import Dashboard from './pages/Dashboard'
import PostGenerator from './pages/PostGenerator'
import Scraper from './pages/Scraper'
import MotivationLetter from './pages/MotivationLetter'
import JobsFinder from './pages/JobsFinder'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'
import Connexion from './pages/Connexion'
import Inscription from './pages/Inscription'
import MotDePasseOublie from './pages/MotDePasseOublie'
import NouveauMotDePasse from './pages/NouveauMotDePasse'

// Routes : voir design.md §1 (P-01 à P-10, P-99).
export default function App() {
  return (
    <Routes>
      <Route element={<RoutePublique />}>
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />
      </Route>
      {/* Ouverte connecté ou non : le lien de l'e-mail doit toujours aboutir. */}
      <Route path="/reinitialiser" element={<NouveauMotDePasse />} />

      <Route element={<RouteProtegee />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/posts" element={<PostGenerator />} />
          <Route path="/scraper" element={<Scraper />} />
          <Route path="/lettre" element={<MotivationLetter />} />
          <Route path="/offres" element={<JobsFinder />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  )
}
