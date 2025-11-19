import { useEffect, useMemo, useState } from 'react';
import './ImageGallery.css';

const ImageGallery = ({ images, title }) => {
  const normalized = useMemo(() => {
    if (!images) return [];
    if (Array.isArray(images)) return images.filter(Boolean);
    return [images];
  }, [images]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [normalized.length]);

  if (!normalized.length) return null;

  const activeImage = normalized[Math.min(activeIndex, normalized.length - 1)];

  return (
    <figure className="image-gallery">
      <img src={activeImage} alt={`${title || 'Gallery'} – bild ${activeIndex + 1}`} className="main-image" />
      {normalized.length > 1 && (
        <div className="thumbnail-row" role="list">
          {normalized.map((src, index) => (
            <img
              key={src}
              role="listitem"
              src={src}
              alt={`${title || 'Gallery'} – förhandsvisning ${index + 1}`}
              className={`thumbnail ${index === activeIndex ? 'selected' : ''}`}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      )}
    </figure>
  );
};

export default ImageGallery;
