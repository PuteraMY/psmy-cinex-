'use client';

import { useState } from 'react';
import ScreeningPlayer from './ScreeningPlayer';
import { OPEN_MOVIES } from './openMovies';

export default function OpenMovieLibrary() {
  const [selectedId, setSelectedId] = useState(OPEN_MOVIES[0].id);
  const selected = OPEN_MOVIES.find(movie => movie.id === selectedId) || OPEN_MOVIES[0];

  return (
    <div className="open-movies-library">
      <div className="open-movies-heading">
        <div>
          <h3 id="open-movies-heading">Blender Open Movies</h3>
          <p>Six complete films. Independently made. Free to watch with attribution.</p>
        </div>
        <span>{OPEN_MOVIES.length} full films</span>
      </div>
      <div className="open-movies-list" role="group" aria-label="Choose an open movie">
        {OPEN_MOVIES.map(movie => (
          <button
            type="button"
            key={movie.id}
            className={'open-movie-choice' + (movie.id === selected.id ? ' selected' : '')}
            aria-label={'Watch ' + movie.title}
            aria-pressed={movie.id === selected.id}
            onClick={() => setSelectedId(movie.id)}
          >
            <span className="open-movie-artwork">
              <img src={movie.thumbnail} alt="" loading="lazy" />
              <span className="open-movie-runtime">{movie.duration}</span>
            </span>
            <span className="open-movie-name">{movie.title}</span>
            <span className="open-movie-year">{movie.year} · {movie.genre}</span>
          </button>
        ))}
      </div>
      <div className="open-movie-current" aria-live="polite">
        <span>Now screening</span>
        <strong>{selected.title}</strong>
        <span>{selected.duration} · {selected.license}</span>
      </div>
      <ScreeningPlayer key={selected.id} film={selected} />
      <div className="open-movie-credits">
        <div>
          <h3>{selected.title}</h3>
          <p className="open-movie-tagline">{selected.subtitle}</p>
          <p>{selected.description}</p>
          <p className="fine">{selected.credit}. Original film, unaltered. CINEX does not claim ownership.</p>
        </div>
        <div className="open-movie-links">
          <a href={selected.officialPage} target="_blank" rel="noopener noreferrer">WATCH AT BLENDER</a>
          <a href={selected.projectUrl} target="_blank" rel="noopener noreferrer">PROJECT & CREDITS</a>
          <a href={selected.licenseUrl} target="_blank" rel="noopener noreferrer">{selected.license} LICENSE</a>
        </div>
      </div>
      <p className="fine open-movie-disclaimer">Videos are streamed through the official Blender Open Movies channel. Commercial films elsewhere in the CINEX discovery collection are not offered as free full-length streams.</p>
    </div>
  );
}
