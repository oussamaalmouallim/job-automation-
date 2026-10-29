/** Le dashboard s'ouvre sans erreur dans la console (premier test de bout en bout, lot L0.1). */
import { test, expect } from '@playwright/test'

test('le dashboard s’affiche sans erreur console', async ({ page }) => {
  const erreurs = []
  page.on('console', (msg) => { if (msg.type() === 'error') erreurs.push(msg.text()) })
  page.on('pageerror', (err) => erreurs.push(err.message))

  await page.goto('./')

  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(page.getByRole('navigation').first()).toBeVisible()
  expect(erreurs).toEqual([])
})
