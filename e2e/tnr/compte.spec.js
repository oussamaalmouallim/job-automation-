/** Comptes et connexion (lot L0.4) : garde des routes, inscription, connexion, déconnexion, mot de passe oublié. */
import { test, expect } from '@playwright/test'
import { simulerApi, erreursConsole } from '../fixtures/aides.js'

const BON = 'mot-de-passe-solide-1'

test('un visiteur est renvoyé vers la connexion, puis ramené sur la page demandée', async ({ page }) => {
  const erreurs = erreursConsole(page)
  const api = await simulerApi(page, {}, { connecte: false })

  await page.goto('./scraper')
  await expect(page).toHaveURL(/\/connexion$/)
  await expect(page.getByRole('heading', { name: 'Connexion' })).toBeVisible()

  await page.getByLabel('E-mail').fill('amina@exemple.test')
  await page.getByLabel('Mot de passe').fill(BON)
  await page.getByRole('button', { name: 'Se connecter' }).click()

  await expect(page).toHaveURL(/\/scraper$/)
  expect(api.vers('auth/sign-in/email')[0].corps).toEqual({ email: 'amina@exemple.test', password: BON })
  expect(erreurs).toEqual([])
})

test('mauvais mot de passe : message clair, on reste sur la connexion', async ({ page }) => {
  await simulerApi(page, {}, { connecte: false })
  await page.goto('./connexion')
  await page.getByLabel('E-mail').fill('amina@exemple.test')
  await page.getByLabel('Mot de passe').fill('pas-le-bon-mot-de-passe')
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await expect(page.getByRole('alert')).toHaveText('E-mail ou mot de passe incorrect.')
  await expect(page).toHaveURL(/\/connexion$/)
})

test('trop de tentatives : message clair', async ({ page }) => {
  await simulerApi(page, { 'auth/sign-in/email': () => ({ status: 429, json: { message: 'Too many requests' } }) }, { connecte: false })
  await page.goto('./connexion')
  await page.getByLabel('E-mail').fill('amina@exemple.test')
  await page.getByLabel('Mot de passe').fill(BON)
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await expect(page.getByRole('alert')).toHaveText('Trop de tentatives. Réessaie dans une minute.')
})

test('inscription → dashboard avec le prénom du compte → déconnexion → reconnexion', async ({ page }) => {
  const erreurs = erreursConsole(page)
  const api = await simulerApi(page, {}, { connecte: false })

  await page.goto('./inscription')
  // Vérification locale avant tout appel.
  await page.getByLabel('Nom').fill('Youssef Essai')
  await page.getByLabel('E-mail').fill('youssef@exemple.test')
  await page.getByLabel('Mot de passe').fill('court')
  await page.getByRole('button', { name: 'Créer mon compte' }).click()
  await expect(page.getByRole('alert')).toHaveText('Le mot de passe doit faire au moins 10 caractères.')
  expect(api.vers('auth/sign-up/email')).toHaveLength(0)

  await page.getByLabel('Mot de passe').fill(BON)
  await page.getByRole('button', { name: 'Créer mon compte' }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Youssef')
  expect(api.vers('auth/sign-up/email')[0].corps).toEqual({ name: 'Youssef Essai', email: 'youssef@exemple.test', password: BON })

  // Le nom du compte remplace partout l'ancien nom écrit en dur.
  await expect(page.getByText('Oussama')).toHaveCount(0)

  await page.goto('./settings')
  await expect(page.getByText('youssef@exemple.test').first()).toBeVisible()
  await page.getByRole('button', { name: 'Se déconnecter' }).click()
  await expect(page).toHaveURL(/\/connexion$/)

  // Une page protégée n'est plus accessible.
  await page.goto('./dashboard')
  await expect(page).toHaveURL(/\/connexion$/)

  await page.getByLabel('E-mail').fill('youssef@exemple.test')
  await page.getByLabel('Mot de passe').fill(BON)
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
  expect(erreurs).toEqual([])
})

test('connecté : les pages de compte renvoient au dashboard', async ({ page }) => {
  await simulerApi(page)
  await page.goto('./connexion')
  await expect(page).toHaveURL(/\/dashboard$/)
})

test('session expirée pendant l’utilisation : retour à la connexion', async ({ page }) => {
  await simulerApi(page, { 'posts/generate': () => ({ status: 401, json: { error: 'Connexion requise.' } }) })
  await page.goto('./posts')
  await page.getByLabel('Description').fill('Un sujet')
  await page.getByRole('button', { name: 'Générer le post' }).click()
  await expect(page).toHaveURL(/\/connexion$/)
})

test.describe('mot de passe oublié', () => {
  test('demande un lien sans dire si le compte existe', async ({ page }) => {
    const api = await simulerApi(page, {}, { connecte: false })
    await page.goto('./connexion')
    await page.getByRole('link', { name: 'Mot de passe oublié ?' }).click()
    await page.getByLabel('E-mail').fill('amina@exemple.test')
    await page.getByRole('button', { name: 'Envoyer le lien' }).click()

    await expect(page.getByRole('status')).toContainText('Si un compte existe pour amina@exemple.test')
    const corps = api.vers('auth/request-password-reset')[0].corps
    expect(corps.email).toBe('amina@exemple.test')
    expect(corps.redirectTo).toMatch(/\/job-automation-\/reinitialiser$/)
  })

  test('nouveau mot de passe depuis un lien valable', async ({ page }) => {
    const api = await simulerApi(page, {}, { connecte: false })
    await page.goto('./reinitialiser?token=jeton-valide')
    await page.getByLabel('Nouveau mot de passe').fill('nouveau-mot-de-passe-2')
    await page.getByLabel('Confirmation').fill('autre-chose-2')
    await page.getByRole('button', { name: 'Changer le mot de passe' }).click()
    await expect(page.getByRole('alert')).toHaveText('Les deux mots de passe ne sont pas identiques.')

    await page.getByLabel('Confirmation').fill('nouveau-mot-de-passe-2')
    await page.getByRole('button', { name: 'Changer le mot de passe' }).click()
    await expect(page).toHaveURL(/\/connexion$/)
    await expect(page.getByText('Mot de passe changé. Connecte-toi avec le nouveau.')).toBeVisible()
    expect(api.vers('auth/reset-password')[0].corps).toEqual({ token: 'jeton-valide', newPassword: 'nouveau-mot-de-passe-2' })
  })

  test('lien refusé par le backend : message clair', async ({ page }) => {
    await simulerApi(page, {}, { connecte: false })
    await page.goto('./reinitialiser?token=jeton-perime')
    await page.getByLabel('Nouveau mot de passe').fill('nouveau-mot-de-passe-2')
    await page.getByLabel('Confirmation').fill('nouveau-mot-de-passe-2')
    await page.getByRole('button', { name: 'Changer le mot de passe' }).click()
    await expect(page.getByRole('alert')).toHaveText('Ce lien n’est plus valable. Demande un nouveau lien.')
  })

  test('lien expiré (redirection ?error=INVALID_TOKEN) : pas de formulaire, nouveau lien proposé', async ({ page }) => {
    await simulerApi(page, {}, { connecte: false })
    await page.goto('./reinitialiser?error=INVALID_TOKEN')
    await expect(page.getByRole('alert')).toContainText('a expiré ou a déjà servi')
    await expect(page.getByRole('link', { name: 'Demander un nouveau lien' })).toBeVisible()
  })
})

test.describe('mobile (375 px)', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('les pages de compte tiennent sans défilement horizontal', async ({ page }) => {
    await simulerApi(page, {}, { connecte: false })
    for (const chemin of ['connexion', 'inscription', 'mot-de-passe-oublie', 'reinitialiser?token=x']) {
      await page.goto(`./${chemin}`)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.scrollWidth), chemin).toBeLessThanOrEqual(375)
    }
  })
})
