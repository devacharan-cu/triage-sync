import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  // Next.js default app might not have a specific title, but we will change it later
  // For now just expect page to load
  await expect(page).toHaveTitle(/Create Next App/);
});
