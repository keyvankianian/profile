import { useMemo, useState } from 'react';
import './VideoPlayer.css';

const fallbackStrings = {
  videoTitle: (itemTitle) => itemTitle || 'Video från YouTube',
  playVideo: (itemTitle) => `Spela ${itemTitle || 'videon'}`,
  videoFallback: 'Din webbläsare stödjer inte video-taggen.'
};

const VideoPlayer = ({ videoID, video, poster, title, language, strings }) => {
  const normalizedVideos = useMemo(() => {
    if (!video) return [];
    if (Array.isArray(video)) return video.filter(Boolean);
    return [video];
  }, [video]);

  const copy = strings || fallbackStrings;
  const direction = language === 'fa' ? 'rtl' : 'ltr';
  const [showEmbed, setShowEmbed] = useState(!poster);

  const shouldShowPosterPreview = Boolean(videoID && poster && !showEmbed);

  if (!videoID && !normalizedVideos.length) return null;

  return (
    <div className="video-section" dir={direction}>
      {videoID && (
        <>
          {shouldShowPosterPreview ? (
            <button type="button" className="video-preview" onClick={() => setShowEmbed(true)}>
              <img src={poster} alt={copy.videoTitle?.(title)} loading="lazy" />
              <span className="video-preview-cta">{copy.playVideo?.(title)}</span>
            </button>
          ) : (
            <div className="video-container">
              <iframe
                src={`https://www.youtube.com/embed/${videoID}`}
                title={copy.videoTitle?.(title)}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>

              {poster ? (
                <img className="video-poster-print" src={poster} alt={copy.videoTitle?.(title)} />
              ) : null}
            </div>
          )}
        </>
      )}

      {normalizedVideos.map((src) => (
        <div className="video-wrapper" key={src}>
          <video controls poster={poster || undefined} preload="metadata">
            <source src={src} />
            {copy.videoFallback}
          </video>

          {poster ? (
            <img className="video-poster-print" src={poster} alt={copy.videoTitle?.(title)} />
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default VideoPlayer;
