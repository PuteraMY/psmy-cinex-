'use client';

import { useEffect, useMemo, useState } from 'react';
import { FEATURE_FILMS, formatFeatureRuntime, type FeatureFilm } from './featureFilms';
import CINEXFilmPlayer from './CINEXFilmPlayer';
import { useDialogFocus } from './useDialogFocus';

const WATCHLIST_KEY = 'cinex-feature-film-list-v1';
const RECENT_KEY = 'cinex-feature-film-last-selected-v1';
type Genre = 'All films' | FeatureFilm['type'];
const CINEX_FEATURES = FEATURE_FILMS.filter(movie => Boolean(movie.nativeSource));

export default function FeatureFilmLibrary() {
  const [genre, setGenre] = useState<Genre>('All films');
  const [query, setQuery] = useState('');
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [lastSelected, setLastSelected] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const availableGenres = Array.from(new Set(CINEX_FEATURES.map(movie => movie.type)));

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
      Boolean(movie.nativeSource) &&
      (genre === 'All films' || movie.type === genre) &&
      (!showSaved || savedIds.includes(movie.id)) &&
      (!search || (movie.title + ' ' + movie.synopsis + ' ' + movie.type).toLowerCase().includes(search))
    );
  }, [genre, query, savedIds, showSaved]);

  const selected = FEATURE_FILMS.find(movie => movie.id === selectedId);
  const lastMovie = CINEX_FEATURES.find(movie => movie.id === lastSelected);
  const dialogRef = useDialogFocus(Boolean(selected), () => setSelectedId(null));

  useEffect(() => {
    const openHeroFilm = (event: Event) => {
      const id = (event as CustomEvent<string>).detail;
      const movie = CINEX_FEATURES.find(item => item.id === id);
      if (movie) {
        setSelectedId(movie.id);
        setLastSelected(movie.id);
        try { localStorage.setItem(RECENT_KEY, movie.id); } catch { /* Optional. */ }
      }
    };
    window.addEventListener('cinex-watch-feature', openHeroFilm);
    return () => window.removeEventListener('cinex-watch-feature', openHeroFilm);
  }, []);

  const playFilm = (movie: FeatureFilm) => {
    if (!movie.nativeSource) return; // Never disguise an external YouTube player as CINEX.
    setSelectedId(movie.id);
    setLastSelected(movie.id);
    try { localStorage.setItem(RECENT_KEY, movie.id); } catch { /* Optional. */ }
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
          <h3 id="feature-cinema-title">Available to watch in CINEX</h3>
          <p>These are the full-length films with approved direct video sources for the CINEX player. No trailers or YouTube embeds.</p>
        </div>
        <span className="feature-film-count">{CINEX_FEATURES.length} full films available</span>
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
          {(['All films', ...availableGenres] as Genre[]).map(item =>
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
                  <p className="feature-film-meta">{movie.year} · {movie.type} · {movie.nativeSource ? 'WATCH IN CINEX' : 'EXTERNAL PROVIDER ONLY'}</p>
                  <h4>{movie.title}</h4>
                  <p className="feature-film-description">{movie.synopsis}</p>
                  <div className="feature-film-actions">
                    {movie.nativeSource
                      ? <button type="button" className="btn primary"
                          aria-label={'Play full movie ' + movie.title}
                          onClick={() => playFilm(movie)}>WATCH IN CINEX</button>
                      : <a className="btn feature-external-link" href={movie.sourceUrl}
                          target="_blank" rel="noopener noreferrer"
                          aria-label={'Watch ' + movie.title + ' on external provider'}>WATCH AT PROVIDER</a>}
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
      ) : <p className="feature-empty">No playable full movies match this filter. Try a different genre or search.</p>}

      {lastMovie && !selected && (
        <div className="feature-recent-film" aria-live="polite">
          <span>Last selected: <strong>{lastMovie.title}</strong></span>
          {lastMovie.nativeSource && (
            <button type="button" className="btn" onClick={() => playFilm(lastMovie)}>
              CONTINUE IN CINEX
            </button>
          )}
        </div>
      )}
      {selected && (
        <div className="cinex-theater-overlay"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setSelectedId(null);
          }}>
          <section className="feature-player cinex-theater" id="feature-player"
            ref={dialogRef} tabIndex={-1} role="dialog"
            aria-modal="true" aria-label={'Now watching ' + selected.title}>
            <div className="cinex-theater-header">
              <button type="button" className="dialog-close cinex-theater-back"
                aria-label="Close player and return to library"
                onClick={() => setSelectedId(null)}>← BACK TO MOVIES</button>
              <span className="cinex-theater-logo">CINE<span>X.</span></span>
              <span className="cinex-theater-runtime">{formatFeatureRuntime(selected.minutes)} · FULL FILM</span>
            </div>
            <div className="cinex-theater-stage">
              <CINEXFilmPlayer key={selected.id} film={selected} />
            </div>
            <div className="cinex-theater-details">
              <div className="cinex-theater-summary">
                <p className="cinex-theater-label">Now screening / licensed open cinema</p>
                <h3>{selected.title}</h3>
                <p>{selected.synopsis}</p>
                <p className="cinex-theater-credit">{selected.creator} · {selected.license}. {selected.rightsNote}</p>
              </div>
              <div className="cinex-theater-links">
                <a href={selected.filmSite} target="_blank" rel="noopener noreferrer">FILM & RIGHTS</a>
                <a href={selected.licenseUrl} target="_blank" rel="noopener noreferrer">LICENSE</a>
                <a href={selected.alternateSource || selected.sourceUrl} target="_blank" rel="noopener noreferrer">
                  SOURCE / FALLBACK
                </a>
              </div>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
