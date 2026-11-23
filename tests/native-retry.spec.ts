import { test, expect } from '@playwright/test';

test('native feature film can retry a media error without leaving CINEX', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Play full movie Sita Sings the Blues' }).click();
  const video = page.getByRole('video').or(page.locator('.cinex-native-viewport video'));
  await expect(page.locator('.cinex-native-viewport video')).toHaveCount(1);
  const first = await page.locator('.cinex-native-viewport video').evaluate(element => {
    (element as HTMLVideoElement).dataset.retryMarker = 'before';
    element.dispatchEvent(new Event('error'));
    return element.dataset.retryMarker;
  });
  expect(first).toBe('before');
  await expect(page.getByRole('alert')).toContainText('could not load');
  await page.getByRole('button', { name: 'RETRY IN CINEX' }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.locator('.cinex-native-viewport video')).toHaveCount(1);
  await expect.poll(() => page.locator('.cinex-native-viewport video').evaluate(element => element.dataset.retryMarker || 'new')).toBe('new');
  // Simulated media error only; this does not certify real remote playback.
});
