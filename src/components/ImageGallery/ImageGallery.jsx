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

  useEffect(() => {
    if (!normalized.length) return undefined;

    const preloaders = normalized.map(
      (src) =>
        new Promise((resolve) => {
          const preloader = new Image();
          const handleDone = () => resolve();

          preloader.addEventListener('load', handleDone, { once: true });
          preloader.addEventListener('error', handleDone, { once: true });
          preloader.src = src;
        })
    );

    let cancelled = false;
    Promise.all(preloaders).then(() => {
      if (!cancelled) {
        // no-op: ensure images are requested ahead of print
      }
    });

    return () => {
      cancelled = true;
    };
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
      <div className="print-gallery" aria-hidden="true">
        {normalized.map((src, index) => (
          <img
            key={`${src}-${index}`}
            src={src}
            alt={copy.galleryImageAlt?.(title, index + 1) || `${title || 'Gallery'} – bild ${index + 1}`}
            className="print-image"
            loading="eager"
          />
        ))}
      </div>
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
