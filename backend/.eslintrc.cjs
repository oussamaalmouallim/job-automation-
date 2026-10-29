// Règles de lint du backend (ESLint 8, Node, modules ES). Lancer : npm run lint
module.exports = {
  root: true,
  env: { node: true, es2022: true },
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  extends: ['eslint:recommended'],
  ignorePatterns: ['node_modules', 'prisma/*.db', '.eslintrc.cjs'],
  rules: {
    // Les paramètres non utilisés gardent leur nom quand ils commencent par _ (signature Express).
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
}
