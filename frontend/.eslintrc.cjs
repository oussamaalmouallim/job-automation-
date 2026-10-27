// Règles de lint du front (ESLint 8). Lancer : npm run lint
module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.3' } },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  plugins: ['react-refresh'],
  ignorePatterns: ['dist', 'node_modules', '.eslintrc.cjs', 'tailwind.config.js', 'postcss.config.js', 'vite.config.js'],
  rules: {
    // Pas de PropTypes : le projet est en JavaScript simple, les props sont documentées en tête de composant.
    'react/prop-types': 'off',
    // Les apostrophes du français sont permises dans le JSX ; seuls > et } restent interdits.
    'react/no-unescaped-entities': ['error', { forbid: ['>', '}'] }],
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
  },
}
