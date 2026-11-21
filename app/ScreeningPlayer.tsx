'use client';

import { useRef, useState } from 'react';

const VIDEO_URL = 'https://download.blender.org/peach/bigbuckbunny_movies/BigBuckBunny_320x180.mp4';

export default function ScreeningPlayer() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  const retry = () => {
    setPlaying(false);
    setFailed(false);
    // Remounting the media element forces a fresh load after a network failure.
    setAttempt(value => value + 1);
  };

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (!video.paused) {
      video.pause();
      return;
    }
    try {
      await video.play();
      setFailed(false);
    } catch {
      setPlaying(false);
      setFailed(true);
    }
  };

  return (
    <>
      <div className="video">
        <video
          key={attempt}
          ref={videoRef}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          aria-label="Big Buck Bunny film player"
          controls
          playsInline
          preload="metadata"
          onError={() => { setPlaying(false); setFailed(true); }}
          onLoadedMetadata={() => setFailed(false)}
        >
          <source src={VIDEO_URL} type="video/mp4" />
          Your browser does not support video playback.
        </video>
      </div>
      <div className="screening-controls">
        <button type="button" className="btn primary" onClick={togglePlayback} aria-label={playing ? "Pause film" : "Play film"}>
          {playing ? "PAUSE FILM" : "PLAY FILM"}
        </button>
        <span>Use the player controls to seek, adjust volume or enter fullscreen.</span>
      </div>
      {failed && (
        <div className="playback-recovery" role="alert">
          <p>The film could not load from the video host. Check your connection or try again.</p>
          <div className="actions">
            <button type="button" className="btn primary" onClick={retry}>RETRY PLAYBACK</button>
            <a className="btn" href={VIDEO_URL} target="_blank" rel="noopener noreferrer">
              OPEN ORIGINAL VIDEO
            </a>
          </div>
        </div>
      )}
    </>
  );
}
