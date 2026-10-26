import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import PostGenerator from './pages/PostGenerator'
import Scraper from './pages/Scraper'
import MotivationLetter from './pages/MotivationLetter'
import JobsFinder from './pages/JobsFinder'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

// Routes : voir design.md §1 (P-01 à P-06, P-99).
export default function App() {
  return (
    <Routes>
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
    </Routes>
  )
}
