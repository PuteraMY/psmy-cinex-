'use client';

import { useEffect, useMemo, useState } from 'react';
import { FEATURE_FILMS, formatFeatureRuntime, type FeatureFilm } from './featureFilms';
import CINEXFilmPlayer from './CINEXFilmPlayer';

const WATCHLIST_KEY = 'cinex-feature-film-list-v1';
const RECENT_KEY = 'cinex-feature-film-last-selected-v1';
type Genre = 'All films' | FeatureFilm['type'];

export default function FeatureFilmLibrary() {
  const [genre, setGenre] = useState<Genre>('All films');
  const [query, setQuery] = useState('');
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [lastSelected, setLastSelected] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(WATCHLIST_KEY) || '[]');
      if (Array.isArray(stored)) {
        setSavedIds(stored.filter((id): id is string => typeof id === 'string' &&
          FEATURE_FILMS.some(movie => movie.id === id)));
      }
      const last = localStorage.getItem(RECENT_KEY) || '';
      if (FEATURE_FILMS.some(movie => movie.id === last)) setLastSelected(last);
    } catch {
      // Storage is optional (private browsing, disabled storage or stale data).
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(WATCHLIST_KEY, JSON.stringify(savedIds)); }
    catch { /* Private mode can deny storage without breaking the player. */ }
  }, [savedIds, hydrated]);

  const matchingFilms = useMemo(() => {
    const search = query.toLowerCase().trim();
    return FEATURE_FILMS.filter(movie =>
      (genre === 'All films' || movie.type === genre) &&
      (!showSaved || savedIds.includes(movie.id)) &&
      (!search || (movie.title + ' ' + movie.synopsis + ' ' + movie.type).toLowerCase().includes(search))
    );
  }, [genre, query, savedIds, showSaved]);

  const selected = FEATURE_FILMS.find(movie => movie.id === selectedId);
  const lastMovie = FEATURE_FILMS.find(movie => movie.id === lastSelected);

  const playFilm = (movie: FeatureFilm) => {
    setSelectedId(movie.id);
    setLastSelected(movie.id);
    try { localStorage.setItem(RECENT_KEY, movie.id); } catch { /* Optional. */ }
    document.getElementById('feature-player')?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  const toggleSaved = (id: string) => {
    setSavedIds(previous => previous.includes(id) ?
      previous.filter(item => item !== id) : [...previous, id]);
  };

  return (
    <section className="feature-cinema" aria-labelledby="feature-cinema-title">
      <div className="feature-cinema-top">
        <div>
          <span className="feature-cinema-overline">Full-length cinema / Free and licensed</span>
          <h3 id="feature-cinema-title">Pick your film. Press play.</h3>
          <p>Real full-length films, not trailers. Licensed titles use CINEX's own film player wherever a direct stream is available.</p>
        </div>
        <span className="feature-film-count">{FEATURE_FILMS.length} feature films</span>
      </div>

      <div className="feature-toolbar">
        <input
          type="search"
          className="feature-search"
          aria-label="Search full movies"
          placeholder="Search a full movie..."
          value={query}
          onChange={event => setQuery(event.target.value)}
        />
        <div className="feature-genre-tabs" aria-label="Filter full movies">
          {(['All films', 'Drama', 'Documentary', 'Animation'] as const).map(item =>
            <button key={item} type="button"
              className={'feature-filter' + (genre === item ? ' active' : '')}
              aria-pressed={genre === item}
              onClick={() => setGenre(item)}>{item}</button>
          )}
          <button type="button"
            className={'feature-filter' + (showSaved ? ' active' : '')}
            aria-pressed={showSaved}
            onClick={() => setShowSaved(previous => !previous)}>My saved ({savedIds.length})</button>
        </div>
      </div>

      {matchingFilms.length ? (
        <div className="feature-film-grid" aria-label="Full-length movie selection">
          {matchingFilms.map(movie => {
            const saved = savedIds.includes(movie.id);
            return (
              <article className={'feature-film-card' + (selectedId === movie.id ? ' watching' : '')} key={movie.id}>
                <div className="feature-film-image">
                  <img src={movie.image} alt="" loading="lazy" />
                  <span className="feature-film-time">{formatFeatureRuntime(movie.minutes)}</span>
                </div>
                <div className="feature-film-body">
                  <p className="feature-film-meta">{movie.year} · {movie.type} · {movie.nativeSource ? 'CINEX Player' : 'Provider player'}</p>
                  <h4>{movie.title}</h4>
                  <p className="feature-film-description">{movie.synopsis}</p>
                  <div className="feature-film-actions">
                    <button type="button" className="btn primary" aria-label={'Play full movie ' + movie.title}
                      onClick={() => playFilm(movie)}>{movie.nativeSource ? 'WATCH IN CINEX' : 'OPEN PROVIDER PLAYER'}</button>
                    <button type="button" className="feature-save"
                      aria-label={(saved ? 'Remove from' : 'Add to') + ' full movie watchlist: ' + movie.title}
                      aria-pressed={saved} onClick={() => toggleSaved(movie.id)}
                      title={saved ? 'Remove from saved' : 'Save movie'}>{saved ? '♥' : '♡'}</button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : <p className="feature-empty">No full movies match this filter. Try a different genre or search.</p>}

      <div className="feature-player" id="feature-player" aria-label="Full movie playback area">
        {selected ? (
          <>
            <div className="feature-player-heading">
              <div>
                <span>Now watching · {formatFeatureRuntime(selected.minutes)}</span>
                <h4>{selected.title}</h4>
              </div>
              <button type="button" className="btn"
                onClick={() => setSelectedId(null)}>CLOSE PLAYER</button>
            </div>
            <CINEXFilmPlayer key={selected.id} film={selected} />
            <div className="feature-film-rights">
              <p>{selected.creator} · {selected.license}. {selected.rightsNote}</p>
              <a href={selected.sourceUrl} target="_blank" rel="noopener noreferrer">
                OPEN ORIGINAL PLAYER
              </a>
              <a href={selected.filmSite} target="_blank" rel="noopener noreferrer">
                FILM & RIGHTS INFORMATION
              </a>
              <a href={selected.licenseUrl} target="_blank" rel="noopener noreferrer">
                LICENSE DETAILS
              </a>
            </div>
            <p className="fine">Playback depends on video host access, format support and your region. Native HTML5 streams use the original licensed source; provider-only titles remain clearly marked. CINEX does not rehost movie files.</p>
          </>
        ) : (
          <div className="feature-player-idle">
            <span>FULL MOVIE PLAYER</span>
            <p>Select a film above to begin watching inside CINEX.</p>
            {lastMovie && <p className="feature-recent">Last selected: {lastMovie.title} · Choose it again to watch.</p>}
          </div>
        )}
      </div>
    </section>
  );
}
