/** Le dashboard s'ouvre sans erreur dans la console (premier test de bout en bout, lot L0.1), utilisateur connecté. */
import { test, expect } from '@playwright/test'
import { simulerApi, erreursConsole } from './fixtures/aides.js'

test('le dashboard s’affiche sans erreur console', async ({ page }) => {
  const erreurs = erreursConsole(page)
  await simulerApi(page)

  await page.goto('./')

  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(page.getByRole('navigation').first()).toBeVisible()
  expect(erreurs).toEqual([])
})
