import { test, expect } from '@playwright/test';
import { stubWikimediaVideo } from './media-fixture';

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
  // Use a real VP8/WebM browser fixture to exercise native play and pause,
  // without depending on a media CDN or patented codec support in Chromium.
  await stubWikimediaVideo(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'USE DIRECT PLAYER' }).click();
  await page.getByRole('button', { name: 'SWITCH VIDEO SOURCE' }).click();

  const player = page.locator('#screening video');
  await expect(player).toBeVisible();
  await expect(page.locator('#screening video source')).toHaveAttribute('type', 'video/webm');
  await expect.poll(async () =>
    player.evaluate(element => (element as HTMLVideoElement).readyState)
  ).toBeGreaterThanOrEqual(2);

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


test('open movie library displays all six original films with credits', async ({ page }) => {
  await page.goto('/');
  const group = page.getByRole('group', { name: 'Choose an open movie' });
  const titles = ['Big Buck Bunny', 'Sintel', 'Tears of Steel', 'Elephants Dream', 'Spring', 'Caminandes 3: Llamigos'];
  await expect(group.getByRole('button')).toHaveCount(titles.length);
  for (const title of titles) {
    await expect(group.getByRole('button', { name: 'Watch ' + title })).toBeVisible();
  }
  await expect(group.getByRole('button', { name: 'Watch Big Buck Bunny' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#screening iframe')).toHaveAttribute(
    'src', 'https://video.blender.org/videos/embed/pAQiVCgv2CsLg79KKXUoMw'
  );
  await expect(page.locator('.open-movie-credits')).toContainText('CC BY 3.0');
});

test('film selection switches official embeds and updates license and source links', async ({ page }) => {
  await page.goto('/');
  const items = [
    { name: 'Sintel', id: '2PcJe5aZqozRvH7MJ8BTmC', license: 'CC BY 3.0' },
    { name: 'Tears of Steel', id: 'hs1zJY8mdr3iH2JNmxpeGV', license: 'CC BY 3.0' },
    { name: 'Elephants Dream', id: 'rhMeBiBURa2KgsAfkC6kda', license: 'CC BY 2.5' },
    { name: 'Spring', id: '8B5QmoLSS3mWJ4fmZZu3Ye', license: 'CC BY 4.0' },
    { name: 'Caminandes 3: Llamigos', id: '5ruRYckTcQMTMQvyqMnVsr', license: 'CC BY 3.0' },
  ];
  for (const item of items) {
    const choice = page.getByRole('button', { name: 'Watch ' + item.name });
    await choice.click();
    await expect(choice).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#screening iframe')).toHaveAttribute(
      'src', 'https://video.blender.org/videos/embed/' + item.id
    );
    await expect(page.locator('#screening iframe')).toHaveAttribute(
      'title', item.name + ' — Blender Open Movies official player'
    );
    await expect(page.locator('.open-movie-credits')).toContainText(item.name);
    await expect(page.locator('.open-movie-credits')).toContainText(item.license);
    await expect(page.getByRole('link', { name: 'OPEN ON BLENDER' }))
      .toHaveAttribute('href', 'https://video.blender.org/w/' + item.id);
    await expect(page.getByRole('button', { name: 'USE DIRECT PLAYER' })).toHaveCount(0);
  }

  await page.getByRole('button', { name: 'Watch Big Buck Bunny' }).click();
  await expect(page.getByRole('button', { name: 'USE DIRECT PLAYER' })).toBeVisible();
  await expect(page.locator('.open-movie-credits')).toContainText('bigbuckbunny.org');
});

test('open movies shelf remains selectable at 320px without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Watch Spring' }).click();
  await expect(page.locator('#screening iframe')).toHaveAttribute(
    'src', 'https://video.blender.org/videos/embed/8B5QmoLSS3mWJ4fmZZu3Ye'
  );
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(width).toBeLessThanOrEqual(320);
});


test('feature cinema shows three full-length licensed films, not trailers', async ({ page }) => {
  await page.goto('/');
  const cinema = page.locator('.feature-cinema');
  await expect(cinema.getByRole('heading', { name: 'Pick your film. Press play.' })).toBeVisible();
  await expect(page.locator('.feature-film-card')).toHaveCount(3);
  for (const title of ['Valkaama', 'Paywall: The Business of Scholarship', 'Sita Sings the Blues']) {
    await expect(cinema.getByRole('button', { name: 'Play full movie ' + title })).toBeVisible();
  }
  await expect(cinema.getByText('1h 33m')).toBeVisible();
  await expect(cinema.getByText('1h 5m')).toBeVisible();
  await expect(cinema.getByText('1h 21m')).toBeVisible();
  // Never autoplay an unrelated video before the user chooses one.
  await expect(page.locator('#feature-player iframe')).toHaveCount(0);
});

test('choosing feature film opens full player with original source and rights', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Play full movie Paywall: The Business of Scholarship' }).click();
  const player = page.locator('#feature-player');
  await expect(player.locator('iframe')).toHaveAttribute(
    'src', 'https://www.youtube-nocookie.com/embed/NBFFa9Tc12c?rel=0'
  );
  await expect(player.locator('iframe')).toHaveAttribute('allowfullscreen', '');
  await expect(player).toContainText('Creative Commons BY 4.0');
  await expect(player.getByRole('link', { name: 'OPEN ORIGINAL PLAYER' })).toHaveAttribute(
    'href', 'https://www.youtube.com/watch?v=NBFFa9Tc12c'
  );
  await expect(player.getByRole('link', { name: 'FILM & RIGHTS INFORMATION' })).toHaveAttribute(
    'href', 'https://paywallthemovie.com/'
  );
  await player.getByRole('button', { name: 'CLOSE PLAYER' }).click();
  await expect(player.locator('iframe')).toHaveCount(0);
});

test('choosing another feature unmounts prior iframe and changes correct source', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Play full movie Sita Sings the Blues' }).click();
  await expect(page.locator('#feature-player iframe')).toHaveAttribute(
    'src', 'https://www.youtube-nocookie.com/embed/RzTg7YXuy34?rel=0'
  );
  await page.getByRole('button', { name: 'Play full movie Valkaama' }).click();
  await expect(page.locator('#feature-player iframe')).toHaveCount(1);
  await expect(page.locator('#feature-player iframe')).toHaveAttribute(
    'src', 'https://www.youtube-nocookie.com/embed/Lz39dmLPDZE?rel=0'
  );
  await expect(page.locator('#feature-player')).toContainText('Creative Commons BY-SA 3.0');
});

test('full movie search, genre and saved filters work without affecting discovery', async ({ page }) => {
  await page.goto('/');
  const search = page.getByRole('searchbox', { name: 'Search full movies' });
  await search.fill('scholarship');
  await expect(page.locator('.feature-film-card')).toHaveCount(1);
  await expect(page.locator('.feature-film-card')).toContainText('Paywall');
  await search.fill('');
  await page.locator('.feature-cinema').getByRole('button', { name: 'Drama' }).click();
  await expect(page.locator('.feature-film-card')).toHaveCount(1);
  await expect(page.locator('.feature-film-card')).toContainText('Valkaama');
  await page.locator('.feature-cinema').getByRole('button', { name: 'All films' }).click();
  await expect(page.locator('.feature-film-card')).toHaveCount(3);
  await page.getByRole('button', { name: 'Add to full movie watchlist: Valkaama' }).click();
  await page.locator('.feature-cinema').getByRole('button', { name: 'My saved (1)' }).click();
  await expect(page.locator('.feature-film-card')).toHaveCount(1);
  await expect(page.locator('.feature-film-card')).toContainText('Valkaama');
});

test('feature cinema watchlist and last-selected title persist across reload', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Add to full movie watchlist: Sita Sings the Blues' }).click();
  await page.getByRole('button', { name: 'Play full movie Sita Sings the Blues' }).click();
  await page.reload();
  await expect(page.locator('#feature-player iframe')).toHaveCount(0);
  await expect(page.locator('.feature-recent')).toContainText('Sita Sings the Blues');
  await expect(page.getByRole('button', { name: 'Remove from full movie watchlist: Sita Sings the Blues' }))
    .toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('heading', { name: 'CINEX QA Alpha' })).toBeVisible();
});

test('feature cinema is usable on 320px mobile without page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/');
  const cinema = page.locator('.feature-cinema');
  await expect(cinema.getByRole('button', { name: 'Play full movie Valkaama' })).toBeVisible();
  await cinema.getByRole('button', { name: 'Play full movie Valkaama' }).click();
  await expect(page.locator('#feature-player iframe')).toHaveAttribute(
    'src', 'https://www.youtube-nocookie.com/embed/Lz39dmLPDZE?rel=0'
  );
  const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(pageWidth).toBeLessThanOrEqual(320);
});
