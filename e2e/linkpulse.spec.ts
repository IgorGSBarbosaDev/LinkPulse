import { expect, test } from '@playwright/test'

test('registers, signs in, creates, redirects and inspects analytics', async ({
  page,
}) => {
  const suffix = Date.now().toString()
  const email = `e2e-${suffix}@example.test`
  const alias = `e2e-${suffix}`

  await page.goto('/register')
  await page.getByLabel('Name').fill('Playwright User')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill('Playwright-password-123')
  await page.getByRole('button', { name: /create account/i }).click()
  await expect(page).toHaveURL(/\/login$/)

  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill('Playwright-password-123')
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page).toHaveURL(/\/dashboard$/)

  await page.goto('/links/new')
  await page.getByLabel('Original URL').fill('https://example.com/linkpulse-e2e')
  await page.getByLabel('Custom alias').fill(alias)
  await page.getByLabel('Title').fill('Playwright link')
  await page.getByRole('button', { name: /create link/i }).click()
  await expect(page).toHaveURL(/\/links\/[0-9a-f-]+$/)

  const redirectResponse = await page.request.get(
    `http://127.0.0.1:3000/r/${alias}`,
    { maxRedirects: 0 },
  )
  expect(redirectResponse.status()).toBe(302)
  expect(redirectResponse.headers().location).toBe(
    'https://example.com/linkpulse-e2e',
  )

  const linkId = page.url().match(/\/links\/([0-9a-f-]+)$/)?.[1]
  expect(linkId).toBeTruthy()
  await page.goto('/dashboard')
  await expect(page.getByRole('heading', { name: 'Top links' })).toBeVisible()
  await expect(page.getByText(alias, { exact: true }).last()).toBeVisible()

  await page.goto(`/links/${linkId}/analytics`)
  await expect(page.getByText('Total clicks')).toBeVisible()
  await expect(page.getByText('1', { exact: true }).first()).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Latest access events' }),
  ).toBeVisible()
})
