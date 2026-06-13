import { expect, test } from '@playwright/test';

const mockWordApi = async (page) => {
  await page.route('**/api/words/random?**', async (route) => {
    const url = new URL(route.request().url());
    const length = Number(url.searchParams.get('length') ?? 5);
    const words = {
      4: 'code',
      5: 'react',
      6: 'server',
    };

    await route.fulfill({ json: { word: words[length] ?? 'react' } });
  });

  await page.route('**/api/words/validate', async (route) => {
    await route.fulfill({ json: { valid: true } });
  });
};

test.describe('nerdle client', () => {
  test.beforeEach(async ({ page }) => {
    await mockWordApi(page);
  });

  test('loads the game shell and controls', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Nerdle/);
    await expect(page.getByRole('heading', { name: 'Nerdle' })).toBeVisible();
    await expect(page.getByRole('main', { name: 'Nerdle game' })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Statistics' })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Settings' })).toBeVisible();
    await expect(page.locator('.letter')).toHaveCount(30);
  });

  test('opens settings and changes word length', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Settings' }).click();
    await expect(page.getByRole('dialog', { name: 'Settings' })).toBeVisible();

    await page.getByRole('button', { name: '4' }).click();
    await expect(page.locator('.letter')).toHaveCount(24);

    await page.getByRole('button', { name: 'Close settings' }).click();
    await expect(
      page.getByRole('dialog', { name: 'Settings' })
    ).not.toBeVisible();
  });

  test('accepts a winning keyboard guess', async ({ page }) => {
    await page.goto('/');

    for (const letter of ['R', 'E', 'A', 'C', 'T']) {
      await page.getByRole('button', { name: letter, exact: true }).click();
    }

    await expect(page.locator('.word-row').first()).toContainText('react');

    await page.getByRole('button', { name: 'Enter' }).click();

    await expect(page.getByText(/Congratulations/)).toBeVisible({
      timeout: 4_000,
    });
  });
});
