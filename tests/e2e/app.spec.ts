import { test, expect } from '@playwright/test';
import { GEARS } from '../../src/app/gears';

test('renders the card level heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1').first()).toContainText('Select Your Available Cards Level');
});

test('lets you click every category tab and shows the expected first item', async ({ page }) => {
  await page.goto('/');

  for (const [category, items] of Object.entries(GEARS)) {
    const firstItem = items[0]!;
    const categoryTab = page.locator('mat-tab-group').first().getByRole('tab', { name: category, exact: true });

    await categoryTab.click();
    await expect(categoryTab).toHaveAttribute('aria-selected', 'true');

    const itemTab = page.getByRole('tab').filter({ hasText: firstItem.name }).first();
    await expect(itemTab).toBeVisible();
    await itemTab.click();
    await expect(itemTab).toContainText(firstItem.name);

    const itemTable = page.locator('table.border').first();
    const [firstAttribute, firstValues] = Object.entries(firstItem.skills)[0]!;
    await expect(itemTable.locator('tr', { hasText: firstAttribute })).toContainText(String(firstValues[0]));
  }
});

test('updates the selected item level when a card level is clicked', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('tab', { name: 'Character' }).click();
  const abekeTab = page.getByRole('tab').filter({ hasText: 'Abeke' }).first();
  await abekeTab.click();

  const itemTable = page.locator('table.border').first();
  await itemTable.locator('tr').first().locator('th').nth(1).click();

  await expect(abekeTab).toContainText('Abeke (1)');
});
