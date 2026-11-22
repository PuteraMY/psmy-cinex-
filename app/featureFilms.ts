/**
 * Full-length films (>= 60 minutes) with independently documented open
 * licensing. Never add unlicensed commercial discovery entries to this list.
 *
 * Native films stream the creators' authorized files via HTML5.\n * Other films use the provider's unchanged embed. No files are rehosted.
 * A link to the original producer/film site is always visible.
 */
export type FeatureFilm = {
  id: string;
  title: string;
  year: number;
  minutes: number;
  type: 'Drama' | 'Documentary' | 'Animation';
  synopsis: string;
  embedUrl: string;
  /** Native HTML5 source is used for authorized, directly downloadable films. */
  nativeSource?: { url: string; type: 'video/mp4' | 'video/ogg' | 'video/webm'; host: string };
  alternateSource?: string;
  image: string;
  provider: string;
  sourceUrl: string;
  filmSite: string;
  creator: string;
  license: string;
  licenseUrl: string;
  rightsNote: string;
};

export const FEATURE_FILMS: readonly FeatureFilm[] = [
  {
    id: 'valkaama',
    title: 'Valkaama',
    year: 2010,
    minutes: 93,
    type: 'Drama',
    synopsis: 'A restless poet journeys north with unexpected companions, searching for the place that might finally feel like home.',
    embedUrl: 'https://www.youtube-nocookie.com/embed/Lz39dmLPDZE',
    image: 'https://i.ytimg.com/vi/Lz39dmLPDZE/hqdefault.jpg',
    provider: 'YouTube · complete licensed film upload',
    sourceUrl: 'https://www.youtube.com/watch?v=Lz39dmLPDZE',
    filmSite: 'https://www.valkaama.com/index.php?l=en&page=valkaama',
    creator: 'Tim Baumann / Valkaama Open Source Movie project',
    license: 'Creative Commons BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    rightsNote: 'The original filmmakers released the full 93-minute film under CC BY-SA 3.0. CINEX embeds an existing full-film upload and credits the filmmakers; playback is subject to YouTube availability.',
  },
  {
    id: 'paywall',
    title: 'Paywall: The Business of Scholarship',
    year: 2018,
    minutes: 65,
    type: 'Documentary',
    synopsis: 'What happens when academic knowledge is locked behind expensive publishing paywalls? A documentary about access to research.',
    embedUrl: 'https://www.youtube-nocookie.com/embed/NBFFa9Tc12c',
    nativeSource: {
      url: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/2018_documentary_%27Paywall_%E2%80%93_The_Business_of_Scholarship%27.ogg',
      type: 'video/ogg',
      host: 'Wikimedia Commons · licensed Ogg stream',
    },
    alternateSource: 'https://archive.org/details/PaywallTheBusinessOfScholarshipFinalMovieMastered',
    image: 'https://i.ytimg.com/vi/NBFFa9Tc12c/hqdefault.jpg',
    provider: 'YouTube · CC BY 4.0 film',
    sourceUrl: 'https://www.youtube.com/watch?v=NBFFa9Tc12c',
    filmSite: 'https://paywallthemovie.com/',
    creator: 'Jason Schmitt / Paywall: The Business of Scholarship',
    license: 'Creative Commons BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    rightsNote: 'Published for free public and private viewing under CC BY 4.0 by its creators. CINEX streams the CC BY licensed Ogg copy from Wikimedia Commons directly in HTML5 where supported; fallback links retain attribution.',
  },
  {
    id: 'sita-sings-the-blues',
    title: 'Sita Sings the Blues',
    year: 2008,
    minutes: 81,
    type: 'Animation',
    synopsis: 'An imaginative animated feature interweaving the Ramayana, shadow-puppet storytelling and the music of a bygone era.',
    embedUrl: 'https://www.youtube-nocookie.com/embed/RzTg7YXuy34',
    nativeSource: {
      // Linked directly from the filmmaker's official free-download/watch page.
      url: 'https://archive.org/download/Sita_Sings_the_Blues/Sita_Sings_the_Blues_480p_2150kbps.mp4',
      type: 'video/mp4',
      host: 'Internet Archive · filmmaker-linked full movie',
    },
    alternateSource: 'https://www.sitasingstheblues.com/watch.html',
    image: 'https://i.ytimg.com/vi/RzTg7YXuy34/hqdefault.jpg',
    provider: 'YouTube · linked by the filmmaker',
    sourceUrl: 'https://www.youtube.com/watch?v=RzTg7YXuy34',
    filmSite: 'https://www.sitasingstheblues.com/watch.html',
    creator: 'Nina Paley / Sita Sings the Blues',
    license: 'Creative Commons BY-SA 3.0 (film)',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/us/',
    rightsNote: 'The filmmaker offers this full movie for free on her official site. Certain musical recordings have separate rights restrictions, so CINEX uses only the filmmaker-linked full-film MP4 from Internet Archive; no redistribution or soundtrack modification.',
  },
];

export const formatFeatureRuntime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  return hours ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
};
