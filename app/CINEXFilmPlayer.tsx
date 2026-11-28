'use client';

import { useEffect, useRef, useState } from 'react';
import type { FeatureFilm } from './featureFilms';

const progressKey = (id: string) => 'cinex-full-film-progress-v1-' + id;
const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m + ':' + String(s).padStart(2, '0');
};
type PlayerState = 'loading' | 'ready' | 'playing' | 'paused' | 'buffering' | 'ended' | 'unavailable';

export default function CINEXFilmPlayer({ film }: { film: FeatureFilm }) {
  const video = useRef<HTMLVideoElement | null>(null);
  const container = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<PlayerState>('loading');
  const [elapsed, setElapsed] = useState(0);
  const [length, setLength] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [savedPosition, setSavedPosition] = useState(0);
  const [fullScreen, setFullScreen] = useState(false);

  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(progressKey(film.id)) || 0);
      if (Number.isFinite(saved) && saved > 0) setSavedPosition(saved);
    } catch { /* Private browsing can disable storage. */ }
  }, [film.id]);

  const savePosition = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) return;
    try { localStorage.setItem(progressKey(film.id), String(Math.floor(seconds))); }
    catch { /* Resume information is optional. */ }
  };

  const updatePosition = () => {
    const element = video.current;
    if (!element) return;
    setElapsed(element.currentTime);
    setLength(Number.isFinite(element.duration) ? element.duration : 0);
    savePosition(element.currentTime);
  };

  const onMetadata = () => {
    const element = video.current;
    if (!element) return;
    setLength(Number.isFinite(element.duration) ? element.duration : 0);
    setState('ready');
  };

  const resume = async () => {
    const element = video.current;
    if (!element) return;
    if (savedPosition > 0 && element.readyState >= element.HAVE_METADATA &&
        Number.isFinite(element.duration) && savedPosition < element.duration - 8) {
      try { element.currentTime = savedPosition; } catch { /* Source may disallow seeking. */ }
    }
    try {
      await element.play();
      // The browser's "playing" event confirms playback; play() alone does not.
    } catch { setState('unavailable'); setPlaying(false); }
  };

  const toggle = async () => {
    const element = video.current;
    if (!element) return;
    if (!element.paused) { element.pause(); return; }
    try { await element.play(); }
    catch { setState('unavailable'); setPlaying(false); }
  };

  const toggleFullScreen = async () => {
    if (!container.current) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await container.current.requestFullscreen();
    } catch { /* Browser may prohibit fullscreen without a user gesture. */ }
  };

  useEffect(() => {
    const handle = () => setFullScreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handle);
    return () => document.removeEventListener('fullscreenchange', handle);
  }, []);

  if (!film.nativeSource) {
    return (
      <div className="cinex-native-player">
        <div className="cinex-native-caption">
          <span>Provider player</span>
          <span>This title has no verified direct HTML5 source yet</span>
        </div>
        <div className="feature-iframe-wrap">
          <iframe key={film.id}
            title={'Full movie player: ' + film.title}
            src={film.embedUrl + '?rel=0'}
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen loading="eager" referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
        <p className="fine cinex-provider-note">The original video provider controls this player. CINEX will not hide or replace the provider's branding.</p>
      </div>
    );
  }

  return (
    <div className="cinex-native-player">
      <div className="cinex-native-caption">
        <span>CINEX PLAYER · FULL FEATURE</span>
        <span>{film.nativeSource.host}</span>
      </div>
      <div className="cinex-native-viewport" ref={container}>
        <video
          key={film.id}
          ref={video}
          aria-label={'CINEX full movie player: ' + film.title}
          controls
          playsInline
          preload="metadata"
          onLoadedMetadata={onMetadata}
          onTimeUpdate={updatePosition}
          onDurationChange={onMetadata}
          onPlaying={() => { setState('playing'); setPlaying(true); }}
          onPause={() => { setState(current => current === 'unavailable' ? current : 'paused'); setPlaying(false); updatePosition(); }}
          onWaiting={() => setState('buffering')}
          onEnded={() => {
            setState('ended'); setPlaying(false);
            setSavedPosition(0);
            savePosition(0);
          }}
          onError={() => { setState('unavailable'); setPlaying(false); }}
        >
          <source src={film.nativeSource.url} type={film.nativeSource.type}
            onError={() => { setState('unavailable'); setPlaying(false); }} />
          Your browser does not support this video format.
        </video>
      </div>
      <div className="cinex-native-controls">
        <button type="button" className="btn primary" onClick={toggle}
          aria-label={playing ? 'Pause full movie' : 'Play full movie in CINEX'}>
          {playing ? 'PAUSE' : 'PLAY'}
        </button>
        {savedPosition > 10 &&
          <button type="button" className="btn" onClick={resume}
            aria-label={'Resume ' + film.title + ' from ' + formatTime(savedPosition)}>
            RESUME {formatTime(savedPosition)}
          </button>}
        <button type="button" className="btn" onClick={toggleFullScreen}
          aria-label={fullScreen ? 'Exit fullscreen' : 'Enter fullscreen'}>
          {fullScreen ? 'EXIT FULLSCREEN' : 'FULLSCREEN'}
        </button>
        <span role="status" className="cinex-playback-status">
          {state === 'unavailable' ? 'Source unavailable' : state === 'buffering' ? 'Buffering…' :
            state === 'loading' ? 'Loading source…' : state.charAt(0).toUpperCase() + state.slice(1)}
        </span>
        <span className="cinex-playback-clock" aria-label="Video playback time">
          {formatTime(elapsed)} / {formatTime(length)}
        </span>
      </div>
      {state === 'unavailable' && (
        <div className="cinex-native-error" role="alert">
          <p>This movie could not load in the CINEX player. It may be blocked by the video host or unsupported in this browser.</p>
          <div className="actions">
            <a className="btn primary" target="_blank" rel="noopener noreferrer"
              href={film.alternateSource || film.sourceUrl}>OPEN LICENSED SOURCE</a>
            <a className="btn" target="_blank" rel="noopener noreferrer"
              href={film.filmSite}>FILMMAKER WEBSITE</a>
          </div>
        </div>
      )}
      <p className="fine cinex-provider-note">Use the player controls for seek, volume, captions when available and fullscreen. Playback comes from the licensed source, not CINEX servers.</p>
    </div>
  );
}
