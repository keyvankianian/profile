import { useMemo } from 'react';
import './VideoPlayer.css';

const VideoPlayer = ({ videoID, video, poster, title }) => {
  const normalizedVideos = useMemo(() => {
    if (!video) return [];
    if (Array.isArray(video)) return video.filter(Boolean);
    return [video];
  }, [video]);

  if (!videoID && !normalizedVideos.length) return null;

  return (
    <div className="video-section">
      {videoID && (
        <div className="video-container">
          <iframe
            src={`https://www.youtube.com/embed/${videoID}`}
            title={title || 'Video från YouTube'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}

      {normalizedVideos.map((src) => (
        <video key={src} controls poster={poster || undefined} preload="metadata">
          <source src={src} />
          Din webbläsare stödjer inte video-taggen.
        </video>
      ))}
    </div>
  );
};

export default VideoPlayer;
