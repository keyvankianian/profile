import { useEffect, useMemo, useState } from 'react';
import ImageGallery from '../ImageGallery/ImageGallery';
import PdfViewer from '../PdfViewer/PdfViewer';
import SourceAttribution from '../SourceAttribution/SourceAttribution';
import VideoPlayer from '../VideoPlayer/VideoPlayer';
import './TabPanel.css';

const textContent = {
  sv: {
    loadingList: 'Laddar lista…',
    loadError: 'Misslyckades med att ladda innehållet.',
    loadingContent: 'Laddar innehåll…',
    renderError: (label) => `Kunde inte visa ${label} än.`,
    openPdf: 'Öppna PDF-dokument',
    sourceLabel: 'Källa',
    choosePdf: 'Välj ett dokument från listan för att visa det här.',
    openPdfInNewTab: 'Öppna dokumentet i en ny flik',
    galleryImageAlt: (title, index) => `${title || 'Gallery'} – bild ${index}`,
    galleryPreviewAlt: (title, index) => `${title || 'Gallery'} – förhandsvisning ${index}`,
    videoTitle: (title) => title || 'Video från YouTube',
    playVideo: (title) => `Spela ${title || 'videon'}`,
    videoFallback: 'Din webbläsare stödjer inte video-taggen.'
  },
  fa: {
    loadingList: 'در حال بارگذاری فهرست…',
    loadError: 'بارگذاری محتوا انجام نشد.',
    loadingContent: 'در حال بارگذاری محتوا…',
    renderError: (label) => `فعلاً نمی‌توان ${label} را نمایش داد.`,
    openPdf: 'باز کردن فایل PDF',
    sourceLabel: 'منبع',
    choosePdf: 'برای نمایش، یک سند از فهرست انتخاب کنید.',
    openPdfInNewTab: 'باز کردن سند در زبانه جدید',
    galleryImageAlt: (title, index) => `${title || 'گالری'} – تصویر ${index}`,
    galleryPreviewAlt: (title, index) => `${title || 'گالری'} – پیش‌نمایش ${index}`,
    videoTitle: (title) => title || 'ویدیو از یوتیوب',
    playVideo: (title) => `پخش ${title || 'ویدیو'}`,
    videoFallback: 'مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.'
  }
};

const useJsonData = (path) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(path, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${path}`);
        return res.json();
      })
      .then((json) => {
        setData(Array.isArray(json) ? json : []);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setError(err);
        setLoading(false);
      });

    return () => controller.abort();
  }, [path]);

  return { data, loading, error };
};

const useScrollSpy = (ids = [], _options = {}, enabled = true) => {
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      setActiveId(null);
      return undefined;
    }

    const validIds = ids.filter(Boolean);
    if (!validIds.length) {
      setActiveId(null);
      return undefined;
    }

    let frameId = null;

    const updateActiveId = () => {
      const viewportHeight = window.innerHeight || 0;
      const referencePoint = viewportHeight * 0.35;
      const elements = validIds
        .map((id) => document.getElementById(id))
        .filter((el) => el && el.getBoundingClientRect);

      if (!elements.length) {
        setActiveId(null);
        return;
      }

      const candidate = elements
        .map((el) => {
          const rect = el.getBoundingClientRect();
          const visibleHeight = Math.max(0, Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0));
          const distance = Math.abs(rect.top - referencePoint);
          return {
            id: el.id,
            visibleHeight,
            distance
          };
        })
        .sort((a, b) => {
          if (b.visibleHeight !== a.visibleHeight) return b.visibleHeight - a.visibleHeight;
          return a.distance - b.distance;
        })[0];

      setActiveId(candidate?.id || null);
    };

    const handleScroll = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        updateActiveId();
      });
    };

    updateActiveId();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [enabled, ids.join('|')]);

  return activeId;
};

const TabPanel = ({ tab, isActive, isSidebarOpen, closeSidebar, language }) => {
  const localizedText = textContent[language] ?? textContent.sv;
  const dataPath = useMemo(() => {
    if (typeof tab.dataPath === 'string') return tab.dataPath;
    return tab.dataPath?.[language] || tab.dataPath?.sv || tab.dataPath?.fa || '';
  }, [language, tab.dataPath]);

  const { data, loading, error } = useJsonData(dataPath);
  const items = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const [selectedPdfId, setSelectedPdfId] = useState(null);
  const isPdfTab = tab.id === 'pdfs';
  const itemIds = useMemo(() => items.map((item, index) => item.id || `${tab.id}-${index}`), [items, tab.id]);
  const activeSectionId = useScrollSpy(itemIds, undefined, isActive && !isPdfTab);

  useEffect(() => {
    if (!isPdfTab) return;
    if (!items.length) {
      setSelectedPdfId(null);
      return;
    }

    setSelectedPdfId((current) => {
      if (current && items.some((item) => item.id === current)) {
        return current;
      }
      return items[0].id;
    });
  }, [isPdfTab, items]);

  const selectedPdf = isPdfTab ? items.find((item) => item.id === selectedPdfId) : null;
  const direction = language === 'fa' ? 'rtl' : 'ltr';

  const getLocalizedField = (item, field) => {
    const baseValue = item[field];
    if (baseValue && typeof baseValue === 'object' && !Array.isArray(baseValue)) {
      return baseValue[language] || baseValue.sv || baseValue.fa || Object.values(baseValue)[0];
    }

    if (item.translations?.[language]?.[field]) {
      return item.translations[language][field];
    }

    return baseValue;
  };

  const tabLabel = typeof tab.label === 'string' ? tab.label : tab.label[language] || tab.label.sv || tab.id;

  const formatTitle = (value) => {
    if (typeof value !== 'string' || language !== 'fa') return value;

    const wrapLTR = (match) => `\u2066${match}\u2069`;
    const patterns = [
      /([0-9]{4}-[0-9]{2}-[0-9]{2})/g,
      /([۰-۹]{4}-[۰-۹]{2}-[۰-۹]{2})/g
    ];

    return patterns.reduce((text, pattern) => text.replace(pattern, wrapLTR), value);
  };

  return (
    <section
      id={tab.id}
      className={`tabcontent ${isActive ? 'active' : ''}`}
      aria-hidden={!isActive}
      dir={direction}
    >
      <div className="tab-inner">
        <aside id={`sidebar-${tab.id}`} className={`sidebar ${isActive && isSidebarOpen ? 'open' : ''}`}>
          {loading && <p>{localizedText.loadingList}</p>}
          {error && <p role="alert">{localizedText.loadError}</p>}
          {!loading && !error && (
            <nav>
              {items.map((item, index) => {
                const itemId = item.id || `${tab.id}-${index}`;
                const label = formatTitle(getLocalizedField(item, 'title')) || `Item ${index + 1}`;
                if (isPdfTab) {
                  return (
                    <button
                      key={itemId}
                      type="button"
                      className={`sidebar-link ${itemId === selectedPdfId ? 'active-link' : ''}`}
                      onClick={() => {
                        setSelectedPdfId(itemId);
                        closeSidebar();
                      }}
                    >
                      {label}
                    </button>
                  );
                }

                const linkClass = `sidebar-link ${activeSectionId === itemId ? 'active-link' : ''}`;
                return (
                  <a key={itemId} href={`#${itemId}`} className={linkClass} onClick={closeSidebar}>
                    {label}
                  </a>
                );
              })}
            </nav>
          )}
        </aside>
        <main className="content">
          {loading && <p>{localizedText.loadingContent}</p>}
          {error && <p role="alert">{localizedText.renderError(tabLabel)}</p>}
          {!loading && !error && (
            <>
              {isPdfTab ? (
                <PdfViewer item={selectedPdf} language={language} strings={localizedText} />
              ) : (
                items.map((item, index) => {
                  const itemId = itemIds[index];
                  const galleryImages = item.img || item.image;
                  const title = formatTitle(getLocalizedField(item, 'title'));
                  const text = getLocalizedField(item, 'text');
                  return (
                    <article key={itemId} id={itemId} className="performance-item">
                      <h2>{title || 'Untitled entry'}</h2>
                      {text && (
                        <div className="text-content" dangerouslySetInnerHTML={{ __html: text }} />
                      )}

                      <ImageGallery images={galleryImages} title={title} language={language} strings={localizedText} />
                      <VideoPlayer
                        videoID={item.videoID}
                        video={item.video}
                        poster={item.poster}
                        title={title}
                        language={language}
                        strings={localizedText}
                      />

                      {item.pdf && !isPdfTab && (
                        <p>
                          <a href={item.pdf} target="_blank" rel="noreferrer">
                            {localizedText.openPdf}
                          </a>
                        </p>
                      )}

                      <SourceAttribution source={item.source} language={language} strings={localizedText} />
                    </article>
                  );
                })
              )}
            </>
          )}
        </main>
      </div>
    </section>
  );
};

export default TabPanel;
