import { test, expect } from '@playwright/test';

const sampleShows = [
  { id: 101, name: 'CINEX QA Alpha', summary: '<p>Adventure in space</p>', image: { medium: 'https://example.com/alpha.jpg' }, genres: ['Adventure'], rating: { average: 8.5 }, premiered: '2024-01-01', url: 'https://www.tvmaze.com/' },
  { id: 102, name: 'CINEX QA Beta', summary: '<p>Quiet mystery</p>', image: { medium: 'https://example.com/beta.jpg' }, genres: ['Mystery'], rating: { average: 7.1 }, premiered: '2022-01-01', url: 'https://www.tvmaze.com/' },
];

test.beforeEach(async ({ page }) => {
  await page.route('https://api.tvmaze.com/shows?page=0', async route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(sampleShows) })
  );
});

test('desktop/mobile navigation, refresh and filtering', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('ENTER THE')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'CINEX QA Alpha' })).toBeVisible();
  await page.getByRole('searchbox', { name: 'Search titles' }).fill('quiet');
  await expect(page.getByRole('heading', { name: 'CINEX QA Beta' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'CINEX QA Alpha' })).toHaveCount(0);
  await page.getByRole('searchbox', { name: 'Search titles' }).fill('');
  await page.getByRole('combobox', { name: 'Genre' }).selectOption('Adventure');
  await expect(page.getByRole('heading', { name: 'CINEX QA Alpha' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'CINEX QA Beta' })).toHaveCount(0);
  await page.reload();
  await expect(page.getByText('EXTRAORDINARY.')).toBeVisible();
});

test('watchlist persists after reload and can be removed', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'CINEX QA Alpha' })).toBeVisible();
  await page.getByRole('button', { name: 'Add to My List' }).first().click();
  await page.reload();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('button', { name: /My List/ }).click();
  await expect(page.getByRole('heading', { name: 'CINEX QA Alpha' })).toBeVisible();
  await page.getByRole('button', { name: 'Remove from My List' }).click();
  await expect(page.getByText('Your list is empty.')).toBeVisible();
});

test('API failure displays retry and recovers', async ({ page }) => {
  // Keep the failure active until the retry is explicitly requested.
  // React Strict Mode can mount effects twice in development, so a
  // "fail first request only" mock can recover before the error is visible.
  await page.unroute('https://api.tvmaze.com/shows?page=0');
  await page.route('https://api.tvmaze.com/shows?page=0', async route =>
    route.fulfill({ status: 503, contentType: 'text/plain', body: 'Unavailable' })
  );
  await page.goto('/');
  await expect(page.getByText('The collection is temporarily unavailable. Please retry.')).toBeVisible();

  await page.unroute('https://api.tvmaze.com/shows?page=0');
  await page.route('https://api.tvmaze.com/shows?page=0', async route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(sampleShows) })
  );
  await page.getByRole('button', { name: 'TRY AGAIN' }).click();
  await expect(page.getByRole('heading', { name: 'CINEX QA Alpha' })).toBeVisible();
});

test('screening room has a real video element and declared MP4 source', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /WATCH A FILM/ }).click();
  await expect(page.locator('video')).toBeVisible();
  await expect(page.locator('video source')).toHaveAttribute('type', 'video/mp4');
  // This is not a playback certification: network-dependent play/pause/seek/fullscreen
  // must be tested against the actual production video host in a real browser.
});
