// Tests de bout en bout (Playwright). Lancer depuis la racine : npm run test:e2e
// Démarre le front Vite tout seul ; le backend n'est pas nécessaire tant que les tests simulent l'API.
import { defineConfig, devices } from '@playwright/test'

// Port du front pendant les tests ; E2E_PORT=3100 si le 3000 sert déjà à autre chose.
const PORT = Number(process.env.E2E_PORT) || 3000
const BASE = '/job-automation-/'

export default defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.js',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never', outputFolder: 'rapport' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}${BASE}`,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run dev --prefix ../frontend -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}${BASE}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
