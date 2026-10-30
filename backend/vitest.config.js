// Tests du backend (Vitest + Supertest). Lancer : npm test
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.js'],
    // Aucun appel réel : OpenRouter, n8n et Prisma sont simulés dans chaque test.
    env: {
      OPENROUTER_API_KEY: 'cle-de-test',
      CORS_ORIGINS: 'http://localhost:3000',
      BETTER_AUTH_SECRET: 'secret-de-test-long-de-plus-de-trente-deux-caracteres',
      BETTER_AUTH_URL: 'http://localhost:4000',
    },
  },
})
