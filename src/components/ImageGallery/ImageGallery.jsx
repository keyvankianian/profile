import { useEffect, useMemo, useState } from 'react';
import './ImageGallery.css';

const fallbackStrings = {
  galleryImageAlt: (itemTitle, index) => `${itemTitle || 'Gallery'} – bild ${index}`,
  galleryPreviewAlt: (itemTitle, index) => `${itemTitle || 'Gallery'} – förhandsvisning ${index}`
};

const ImageGallery = ({ images, title, language, strings }) => {
  const normalized = useMemo(() => {
    if (!images) return [];
    if (Array.isArray(images)) return images.filter(Boolean);
    return [images];
  }, [images]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [normalized]);

  if (!normalized.length) return null;

  const activeImage = normalized[Math.min(activeIndex, normalized.length - 1)];
  const copy = strings || fallbackStrings;

  return (
    <figure className="image-gallery">
      <img
        src={activeImage}
        alt={copy.galleryImageAlt?.(title, activeIndex + 1) || `${title || 'Gallery'} – bild ${activeIndex + 1}`}
        className="main-image"
        dir={language === 'fa' ? 'rtl' : 'ltr'}
      />
      {normalized.length > 1 && (
        <div className="thumbnail-row" role="list">
          {normalized.map((src, index) => (
            <img
              key={src}
              role="listitem"
              src={src}
              alt={
                copy.galleryPreviewAlt?.(title, index + 1) || `${title || 'Gallery'} – förhandsvisning ${index + 1}`
              }
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
