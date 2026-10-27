/** Démarrage du front : routeur (base = chemin de déploiement), animations, notifications. */
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { MotionConfig } from 'framer-motion'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      {/* Respecte prefers-reduced-motion pour toutes les animations framer-motion. */}
      <MotionConfig reducedMotion="user">
        <App />
      </MotionConfig>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: 'var(--police-texte)',
            fontSize: '14px',
            borderRadius: 'var(--rayon-controle)',
            border: '1px solid var(--couleur-ligne)',
            background: 'var(--couleur-surface)',
            color: 'var(--couleur-texte)',
            boxShadow: 'var(--ombre-menu)',
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
