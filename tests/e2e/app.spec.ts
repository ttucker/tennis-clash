import { test, expect } from '@playwright/test';

test('renders the card level heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Select Your Available Cards Level');
});
