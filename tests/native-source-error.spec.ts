import { test, expect } from '@playwright/test';

test('native source failure exposes licensed fallback', async ({ page }) => {
  await page.route('https://archive.org/download/**', route => route.abort());
  await page.goto('/');
  await page.getByRole('button', { name: 'Play full movie Sita Sings the Blues' }).click();
  const source = page.locator('.cinex-native-viewport video source');
  await expect(source).toHaveCount(1);
  await source.dispatchEvent('error');
  const error = page.locator('.cinex-native-error[role="alert"]');
  await expect(error).toContainText('could not load');
  await expect(error.getByRole('link', { name: 'OPEN LICENSED SOURCE' })).toHaveAttribute('href', 'https://www.sitasingstheblues.com/watch.html');
  // Simulated source failure; not a real playback certification.
});
