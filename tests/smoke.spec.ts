import { test, expect } from '@playwright/test';
import { stubBigBuckBunnyVideo } from './media-fixture';

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
  await page.getByRole('button', { name: 'USE DIRECT PLAYER' }).click();
  await page.getByRole('button', { name: /WATCH A FILM/ }).click();
  await expect(page.locator('video')).toBeVisible();
  await expect(page.locator('video source')).toHaveAttribute('type', 'video/mp4');
  // This is not a playback certification: network-dependent play/pause/seek/fullscreen
  // must be tested against the actual production video host in a real browser.
});


test('movie details dialog traps keyboard focus and restores the opening button', async ({ page }) => {
  await page.goto('/');
  const opener = page.getByRole('button', { name: 'Explore CINEX QA Alpha' });
  await expect(opener).toBeVisible();
  await opener.click();

  const dialog = page.getByRole('dialog', { name: 'CINEX QA Alpha' });
  await expect(dialog).toBeVisible();
  const close = dialog.getByRole('button', { name: 'Close' });
  await expect(close).toBeFocused();

  await page.keyboard.press('Shift+Tab');
  await expect(dialog.locator('a').last()).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
});

test('details dialog closes with Escape and restores the collection', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'CINEX QA Alpha' })).toBeVisible();
  await page.getByRole('button', { name: 'Explore CINEX QA Alpha' }).click();
  await expect(page.getByRole('dialog', { name: 'CINEX QA Alpha' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'CINEX QA Alpha' })).toBeVisible();
});

test('navigation and discovery controls remain within mobile viewport', async ({ page }, testInfo) => {
  if (!testInfo.project.name.startsWith('mobile')) test.skip();
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/');
  await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('button', { name: 'My List' })).toBeVisible();
  await expect(page.getByRole('searchbox', { name: 'Search titles' })).toBeVisible();
  const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(documentWidth).toBeLessThanOrEqual(320);
});

test('screening room handles video host errors with retry and a direct source', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'USE DIRECT PLAYER' }).click();
  const player = page.locator('#screening video');
  await expect(player).toBeVisible();

  // Simulate the browser media error deterministically, without depending on the external host.
  await player.evaluate(element => element.dispatchEvent(new Event('error')));
  const recovery = page.locator('#screening .playback-recovery');
  await expect(recovery).toContainText('The film could not load');
  await expect(recovery.getByRole('link', { name: 'OPEN ORIGINAL VIDEO' }))
    .toHaveAttribute('href', 'https://download.blender.org/peach/bigbuckbunny_movies/BigBuckBunny_320x180.mp4');

  await recovery.getByRole('button', { name: 'RETRY PLAYBACK' }).click();
  await expect(page.locator('#screening video')).toHaveCount(1);
});


test('screening room provides a visible Play control and updates state on play', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'USE DIRECT PLAYER' }).click();
  const player = page.locator('#screening video');
  await expect(player).toBeVisible();
  await player.evaluate(element => {
    (element as HTMLVideoElement).play = function () {
      this.dispatchEvent(new Event('playing'));
      return Promise.resolve();
    };
  });
  await page.getByRole('button', { name: 'Play film' }).click();
  await expect(page.getByRole('button', { name: 'Pause film' })).toBeVisible();
});


test('screening room pause control reflects the paused video state', async ({ page }) => {
  // A real, tiny 4-second media fixture exercises native browser play/pause,
  // while staying independent of remote hosts and their transient errors.
  await stubBigBuckBunnyVideo(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'USE DIRECT PLAYER' }).click();
  const player = page.locator('#screening video');
  await expect(player).toBeVisible();
  await page.getByRole('button', { name: 'Play film' }).click();
  const pause = page.getByRole('button', { name: 'Pause film' });
  await expect(pause).toBeVisible();
  await pause.click();
  await expect(page.getByRole('button', { name: 'Play film' })).toBeVisible();
});

test('screening room recovers when the browser rejects play', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'USE DIRECT PLAYER' }).click();
  const player = page.locator('#screening video');
  await expect(player).toBeVisible();
  await player.evaluate(element => {
    (element as HTMLVideoElement).play = () => Promise.reject(new Error('Playback blocked'));
  });

  await page.getByRole('button', { name: 'Play film' }).click();
  const recovery = page.locator('#screening .playback-recovery');
  await expect(recovery).toContainText('The film could not load');
  await recovery.getByRole('button', { name: 'RETRY PLAYBACK' }).click();
  await expect(recovery).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Play film' })).toBeVisible();
});


test('screening selects an available MP4 mirror and exposes progress/source status', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'USE DIRECT PLAYER' }).click();
  await expect(page.locator('#screening video source')).toHaveAttribute(
    'src', 'https://uploads.video-commander.com/sample/BigBuckBunny.mp4'
  );
  await expect(page.locator('#screening .screening-status')).toContainText('Source: 720p mirror');
  await expect(page.locator('#screening .screening-status')).toContainText('00:00');
});

test('failed film can switch source without refreshing the whole page', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'USE DIRECT PLAYER' }).click();
  const player = page.locator('#screening video');
  await expect(player).toBeVisible();

  await player.evaluate(element => element.dispatchEvent(new Event('error')));
  const recovery = page.locator('#screening .playback-recovery');
  await expect(recovery).toContainText('The film could not load');
  await recovery.getByRole('button', { name: 'TRY ANOTHER SOURCE' }).click();
  await expect(page.locator('#screening video source')).toHaveAttribute(
    'src', 'https://upload.wikimedia.org/wikipedia/commons/3/37/Big_Buck_Bunny_with_VTT_acid_test.webm'
  );
  await expect(page.locator('#screening .screening-status')).toContainText('Source: Wikimedia Commons');
});

test('play request does not claim playback before the playing event', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'USE DIRECT PLAYER' }).click();
  const player = page.locator('#screening video');
  await expect(player).toBeVisible();
  await player.evaluate(element => {
    (element as HTMLVideoElement).play = () => Promise.resolve();
  });
  await page.getByRole('button', { name: 'Play film' }).click();
  await expect(page.getByRole('button', { name: 'Loading film' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pause film' })).toHaveCount(0);
});


test('screening room defaults to the official Blender Open Movies embed', async ({ page }) => {
  await page.goto('/');
  const official = page.locator('#screening iframe');
  await expect(official).toBeVisible();
  await expect(official).toHaveAttribute(
    'src', 'https://video.blender.org/videos/embed/pAQiVCgv2CsLg79KKXUoMw'
  );
  await expect(page.locator('#screening video')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'OPEN ON BLENDER' })).toHaveAttribute(
    'href', 'https://video.blender.org/w/pAQiVCgv2CsLg79KKXUoMw'
  );
  await page.getByRole('button', { name: 'USE DIRECT PLAYER' }).click();
  await expect(page.locator('#screening video')).toBeVisible();
});

test('failed direct player offers a return to the official hosted film', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'USE DIRECT PLAYER' }).click();
  const video = page.locator('#screening video');
  await expect(video).toBeVisible();
  await video.evaluate(element => element.dispatchEvent(new Event('error')));
  await page.getByRole('button', { name: 'WATCH IN BLENDER PLAYER' }).click();
  await expect(page.locator('#screening iframe')).toBeVisible();
  await expect(page.locator('#screening video')).toHaveCount(0);
});
