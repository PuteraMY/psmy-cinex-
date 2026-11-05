# CINEX — Beyond the Screen ✳

A premium cinematic discovery experience. **Developed by PSMY**.

**Live:** https://psmy-cinex.vercel.app/

## Stack
Vue 3 (Composition API), Vite, semantic HTML5, responsive CSS, JavaScript, localStorage, Vercel.

## Three public APIs
- **TVMaze** — TV shows, ratings, genres, official listing links: https://www.tvmaze.com/api
- **Jikan** — anime charts, metadata, official trailers when available: https://docs.api.jikan.moe/
- **Studio Ghibli API** — film descriptions, artwork, directors: https://ghibliapi.vercel.app/

## Features
- Premium responsive **Crimson Sunset** interface
- TV, anime, Studio Ghibli films, and personal saved list
- Search by title, description, and genre
- Genre filter, sort by rating/newest/name, progressive load-more
- Detailed information dialogs with official trailer playback where supplied
- Saved favorites persisted in browser localStorage
- Skeleton loading, empty states, error states, retry
- Keyboard-accessible controls and Escape to close dialogs

## Develop
```bash
npm install
npm run dev
npm run build
npm run preview
```

## Academic submission
This project is a Movie/TV Show Explorer. Verify the theme slot and unique API selection with your lecturer. The final submission also needs a report PDF, source ZIP, deployment URL, and a 5–10 minute demo video.

## Content rights
This is a discovery application, **not a service for streaming full copyrighted movies or episodes**. Videos are embedded only when the metadata provider supplies an official trailer URL. Third-party images, descriptions, and other media remain subject to their respective owners' terms.

## License
MIT for original project code; third-party media is excluded.
