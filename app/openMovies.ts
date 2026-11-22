/**
 * CINEX's licensed screenings. These are full-length original uploads from
 * the official Blender Open Movies PeerTube channel, not commercial trailers.
 * IDs and thumbnail paths are pinned from Blender's public PeerTube API.
 *
 * Rights: CC attribution notices are supplied alongside the original films;
 * embedded source video/credits are never modified or rehosted.
 */
export type OpenMovie = {
  id: string;
  title: string;
  subtitle: string;
  year: number;
  duration: string;
  genre: string;
  description: string;
  thumbnail: string;
  embedUrl: string;
  officialPage: string;
  license: string;
  licenseUrl: string;
  projectUrl: string;
  credit: string;
};

const root = 'https://video.blender.org';

export const OPEN_MOVIES: readonly OpenMovie[] = [
  {
    id: 'big-buck-bunny',
    title: 'Big Buck Bunny',
    subtitle: 'An unlikely woodland hero',
    year: 2008,
    duration: '9:56',
    genre: 'Comedy · Animation',
    description: 'A gentle giant turns the tables on a trio of troublesome woodland creatures.',
    thumbnail: root + '/lazy-static/thumbnails/bf1f3fb5-b119-4f9f-9930-8e20e892b898.jpg',
    embedUrl: root + '/videos/embed/pAQiVCgv2CsLg79KKXUoMw',
    officialPage: root + '/w/pAQiVCgv2CsLg79KKXUoMw',
    license: 'CC BY 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/3.0/',
    projectUrl: 'https://peach.blender.org/',
    credit: '© 2008 Blender Foundation / www.bigbuckbunny.org',
  },
  {
    id: 'sintel',
    title: 'Sintel',
    subtitle: 'A story of courage and loss',
    year: 2010,
    duration: '14:48',
    genre: 'Fantasy · Adventure',
    description: 'A young traveller crosses a beautiful, dangerous world in search of a lost friend.',
    thumbnail: root + '/lazy-static/thumbnails/0eb052d0-fd51-43e6-aa33-ecdbf77a5d40.jpg',
    embedUrl: root + '/videos/embed/2PcJe5aZqozRvH7MJ8BTmC',
    officialPage: root + '/w/2PcJe5aZqozRvH7MJ8BTmC',
    license: 'CC BY 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/3.0/',
    projectUrl: 'https://durian.blender.org/about/',
    credit: '© 2010 Blender Foundation / durian.blender.org',
  },
  {
    id: 'tears-of-steel',
    title: 'Tears of Steel',
    subtitle: 'Amsterdam, reimagined',
    year: 2012,
    duration: '12:14',
    genre: 'Sci-Fi · Live Action',
    description: 'A science-fiction rescue unfolds where human performance meets digital worlds.',
    thumbnail: root + '/lazy-static/thumbnails/8533ea43-4271-4a57-9694-e9d0b35e1aa1.jpg',
    embedUrl: root + '/videos/embed/hs1zJY8mdr3iH2JNmxpeGV',
    officialPage: root + '/w/hs1zJY8mdr3iH2JNmxpeGV',
    license: 'CC BY 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/3.0/',
    projectUrl: 'https://mango.blender.org/about/',
    credit: '© Blender Foundation / mango.blender.org',
  },
  {
    id: 'elephants-dream',
    title: 'Elephants Dream',
    subtitle: 'The original open movie',
    year: 2006,
    duration: '10:54',
    genre: 'Surreal · Animation',
    description: 'Two travellers make their way through a strange, mechanical dreamscape.',
    thumbnail: root + '/lazy-static/thumbnails/cccc3e60-0291-4ecc-aa56-39b2e2c7d0d5.jpg',
    embedUrl: root + '/videos/embed/rhMeBiBURa2KgsAfkC6kda',
    officialPage: root + '/w/rhMeBiBURa2KgsAfkC6kda',
    license: 'CC BY 2.5',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.5/',
    projectUrl: 'https://orange.blender.org/press/',
    credit: '© 2006 Blender Foundation / Netherlands Media Art Institute / www.elephantsdream.org',
  },
  {
    id: 'spring',
    title: 'Spring',
    subtitle: 'The wild comes alive',
    year: 2019,
    duration: '7:44',
    genre: 'Fantasy · Animation',
    description: 'A shepherd girl and her dog confront ancient spirits of a changing season.',
    thumbnail: root + '/lazy-static/thumbnails/3d95fb3d-c866-42c8-9db1-fe82f48ccb95.jpg',
    embedUrl: root + '/videos/embed/8B5QmoLSS3mWJ4fmZZu3Ye',
    officialPage: root + '/w/8B5QmoLSS3mWJ4fmZZu3Ye',
    license: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    projectUrl: 'https://studio.blender.org/projects/spring/pages/about/',
    credit: '© 2019 Blender Foundation / Blender Animation Studio',
  },
  {
    id: 'caminandes-llamigos',
    title: 'Caminandes 3: Llamigos',
    subtitle: 'A very short adventure',
    year: 2016,
    duration: '2:30',
    genre: 'Comedy · Animation',
    description: 'A mischievous llama discovers that a simple obstacle can become a big problem.',
    thumbnail: root + '/lazy-static/thumbnails/23f3ef79-15dc-44c5-aa45-cf92e78a4509.jpg',
    embedUrl: root + '/videos/embed/5ruRYckTcQMTMQvyqMnVsr',
    officialPage: root + '/w/5ruRYckTcQMTMQvyqMnVsr',
    license: 'CC BY 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/3.0/',
    projectUrl: 'https://studio.blender.org/films/',
    credit: '© Blender Foundation / Caminandes Open Movie',
  },
];
