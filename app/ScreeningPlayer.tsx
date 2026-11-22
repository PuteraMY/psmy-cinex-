'use client';

import { useEffect, useRef, useState } from 'react';

// This film is CC BY 3.0 (Blender Foundation). Prefer a working MP4 mirror;
// retain a WebM fallback and Blender's original source if hosts change.
const SOURCES = [
  {
    label: '720p mirror',
    url: 'https://uploads.video-commander.com/sample/BigBuckBunny.mp4',
    type: 'video/mp4',
  },
  {
    label: 'Wikimedia Commons',
    url: 'https://upload.wikimedia.org/wikipedia/commons/3/37/Big_Buck_Bunny_with_VTT_acid_test.webm',
    type: 'video/webm',
  },
  {
    label: 'Blender original',
    url: 'https://download.blender.org/peach/bigbuckbunny_movies/BigBuckBunny_320x180.mp4',
    type: 'video/mp4',
  },
] as const;

const ORIGINAL_VIDEO = SOURCES[2].url;
const OFFICIAL_FILM = 'https://www.youtube.com/watch?v=aqz-KE-bpKQ';
const OFFICIAL_EMBED = 'https://video.blender.org/videos/embed/pAQiVCgv2CsLg79KKXUoMw';
const OFFICIAL_PAGE = 'https://video.blender.org/w/pAQiVCgv2CsLg79KKXUoMw';

type PlayerStatus = 'loading' | 'ready' | 'buffering' | 'playing' | 'paused' | 'error';

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '--:--';
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return String(minutes).padStart(2, '0') + ':' + String(remainder).padStart(2, '0');
};

const stateText: Record<PlayerStatus, string> = {
  loading: 'Loading video',
  ready: 'Ready to play',
  buffering: 'Buffering video',
  playing: 'Playing',
  paused: 'Paused',
  error: 'Video unavailable',
};

export default function ScreeningPlayer() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [officialMode, setOfficialMode] = useState(true);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [playRequested, setPlayRequested] = useState(false);
  const [failed, setFailed] = useState(false);
  const [status, setStatus] = useState<PlayerStatus>('loading');
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(Number.NaN);

  const source = SOURCES[sourceIndex];

  const fail = () => {
    setPlaying(false);
    setPlayRequested(false);
    setFailed(true);
    setStatus('error');
  };

  // A request that never reaches the first playable frame must not show
  // PAUSE FILM indefinitely. Browsers may block or stall external media.
  useEffect(() => {
    if (!playRequested) return;
    const timeout = window.setTimeout(() => {
      const video = videoRef.current;
      if (video && video.readyState < video.HAVE_CURRENT_DATA) fail();
    }, 15000);
    return () => window.clearTimeout(timeout);
  }, [playRequested, attempt, sourceIndex]);

  const reload = (nextSource: number) => {
    videoRef.current?.pause();
    setPlaying(false);
    setPlayRequested(false);
    setFailed(false);
    setStatus('loading');
    setPosition(0);
    setDuration(Number.NaN);
    setSourceIndex(nextSource);
    // Recreate the <video> element to discard the previous failed request.
    setAttempt(value => value + 1);
  };

  const retry = () => reload(sourceIndex);
  const nextSource = () => reload((sourceIndex + 1) % SOURCES.length);
  const openDirectPlayer = () => { reload(0); setOfficialMode(false); };
  const openOfficialPlayer = () => { videoRef.current?.pause(); setPlaying(false); setPlayRequested(false); setOfficialMode(true); };

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (playing || !video.paused) {
      video.pause();
      return;
    }
    setPlayRequested(true);
    setStatus('buffering');
    try {
      await video.play();
      // Only the "playing" media event confirms data is actually playing.
      // Calling play() or receiving "play" alone is not enough.
    } catch {
      fail();
    }
  };

  const updateTime = () => {
    const video = videoRef.current;
    if (!video) return;
    setPosition(video.currentTime);
    setDuration(video.duration);
  };

  return (
    <>
      <div className="video">
        {officialMode ? (
          <iframe
            title="Big Buck Bunny — Blender Open Movies official player"
            src={OFFICIAL_EMBED}
            loading="lazy"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        ) : (
        <video
          key={sourceIndex + '-' + attempt}
          ref={videoRef}
          controls
          playsInline
          preload="metadata"
          aria-label="Big Buck Bunny film player"
          onError={fail}
          onLoadedMetadata={updateTime}
          onLoadedData={() => { if (!failed) setStatus('ready'); }}
          onCanPlay={() => { if (!failed && !playing && !playRequested) setStatus('ready'); }}
          onWaiting={() => { if (!failed) setStatus('buffering'); }}
          onStalled={() => { if (!failed && (playing || playRequested)) setStatus('buffering'); }}
          onPlaying={() => {
            setPlaying(true);
            setPlayRequested(false);
            setFailed(false);
            setStatus('playing');
          }}
          onPause={() => {
            setPlaying(false);
            setPlayRequested(false);
            if (!failed) setStatus('paused');
          }}
          onEnded={() => {
            setPlaying(false);
            setPlayRequested(false);
            setStatus('paused');
          }}
          onTimeUpdate={updateTime}
          onDurationChange={updateTime}
        >
          <source src={source.url} type={source.type} onError={fail} />
          Your browser does not support video playback.
        </video>
        )}
      </div>
      {officialMode ? (
        <>
          <div className="screening-controls">
            <button type="button" className="btn" onClick={openDirectPlayer}>USE DIRECT PLAYER</button>
            <a className="btn" href={OFFICIAL_PAGE} target="_blank" rel="noopener noreferrer">OPEN ON BLENDER</a>
            <span>Watch the entire licensed film using Blender’s player controls.</span>
          </div>
          <div className="screening-status">
            <span role="status">Official Blender Open Movies player</span>
            <span>Full movie · 9:56 · CC BY 3.0</span>
          </div>
        </>
      ) : (
        <>
      <div className="screening-controls">
        <button
          type="button"
          className="btn primary"
          onClick={togglePlayback}
          disabled={playRequested}
          aria-label={playing ? 'Pause film' : playRequested ? 'Loading film' : 'Play film'}
        >
          {playing ? 'PAUSE FILM' : playRequested ? 'LOADING FILM…' : 'PLAY FILM'}
        </button>
        <button type="button" className="btn" onClick={nextSource}>
          SWITCH VIDEO SOURCE
        </button>
        <span>Native player controls support seeking, volume and fullscreen.</span>
      </div>
      <div className="screening-status">
        <span role="status">{stateText[status]}</span>
        <span aria-label="Playback time">{formatTime(position)} / {formatTime(duration)}</span>
        <span>Source: {source.label}</span>
      </div>
        </>
      )}
      {!officialMode && failed && (
        <div className="playback-recovery" role="alert">
          <p>The film could not load from the video host. Try another source or watch the official release.</p>
          <div className="actions">
            <button type="button" className="btn primary" onClick={openOfficialPlayer}>WATCH IN BLENDER PLAYER</button>
            <button type="button" className="btn" onClick={nextSource}>TRY ANOTHER SOURCE</button>
            <button type="button" className="btn" onClick={retry}>RETRY PLAYBACK</button>
            <a className="btn" href={OFFICIAL_FILM} target="_blank" rel="noopener noreferrer">WATCH OFFICIAL FILM</a>
            <a className="btn" href={ORIGINAL_VIDEO} target="_blank" rel="noopener noreferrer">OPEN ORIGINAL VIDEO</a>
          </div>
        </div>
      )}
    </>
  );
}
