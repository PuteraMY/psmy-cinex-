'use client';

import { useState } from 'react';

const VIDEO_URL = 'https://download.blender.org/peach/bigbuckbunny_movies/BigBuckBunny_320x180.mp4';

export default function ScreeningPlayer() {
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);

  const retry = () => {
    setFailed(false);
    // Remounting the media element forces a fresh load after a network failure.
    setAttempt(value => value + 1);
  };

  return (
    <>
      <div className="video">
        <video
          key={attempt}
          aria-label="Big Buck Bunny film player"
          controls
          playsInline
          preload="metadata"
          onError={() => setFailed(true)}
          onLoadedMetadata={() => setFailed(false)}
        >
          <source src={VIDEO_URL} type="video/mp4" />
          Your browser does not support video playback.
        </video>
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
