import { useEffect, useMemo, useState } from 'react';

// Using a relative path keeps the JSON fetches working no matter if the app is served
// from the domain root, a subdirectory (like GitHub Pages) or even directly from the
// file system. `import.meta.env.BASE_URL` becomes problematic in those scenarios
// because it is resolved at build-time only.
const DATA_BASE_PATH = './data';
const ACTIVE_TAB_KEY = 'activeTab';
const DEFAULT_TAB = 'Performance';

const tabs = [
  { id: 'artiklar', label: 'Artiklar', dataPath: `${DATA_BASE_PATH}/artiklar.json` },
  { id: 'bilder', label: 'Bilder', dataPath: `${DATA_BASE_PATH}/bilder.json` },
  { id: 'Performance', label: 'Performance', dataPath: `${DATA_BASE_PATH}/Performance.json` },
  { id: 'interview', label: 'Interview', dataPath: `${DATA_BASE_PATH}/interview.json` },
  { id: 'pdfs', label: 'Dokuments', dataPath: `${DATA_BASE_PATH}/pdfs.json` }
];

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

const useScrollSpy = (ids = [], options = {}, enabled = true) => {
  const [activeId, setActiveId] = useState(null);
  const { rootMargin = '-45% 0px -45% 0px', threshold = 0.1 } = options;

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

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.filter((entry) => entry.isIntersecting);
        if (intersecting.length) {
          intersecting.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActiveId(intersecting[0].target.id);
          return;
        }

        const closest = entries.reduce(
          (acc, entry) => {
            const offset = Math.abs(entry.boundingClientRect.top);
            if (offset < acc.offset) {
              return { id: entry.target.id, offset };
            }
            return acc;
          },
          { id: null, offset: Number.POSITIVE_INFINITY }
        );

        setActiveId(closest.id);
      },
      { rootMargin, threshold }
    );

    validIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [enabled, rootMargin, threshold, ids.join('|')]);

  return activeId;
};

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

const SourceAttribution = ({ source }) => {
  if (!source?.url) return null;

  return (
    <p className="source">
      <strong>{source.label || 'Källa'}:</strong>{' '}
      <a href={source.url} target="_blank" rel="noreferrer">
        {source.url}
      </a>
    </p>
  );
};

const PdfViewer = ({ item }) => {
  if (!item) {
    return <p>Välj ett dokument från listan för att visa det här.</p>;
  }

  return (
    <article className="performance-item pdf-panel" id={item.id}>
      <h2>{item.title}</h2>
      {item.caption && <p>{item.caption}</p>}
      {item.pdf && (
        <iframe
          className="pdf-frame"
          src={`${item.pdf}#toolbar=0`}
          title={item.title}
          loading="lazy"
        ></iframe>
      )}
      {item.pdf && (
        <p>
          <a href={item.pdf} target="_blank" rel="noreferrer">
            Öppna dokumentet i en ny flik
          </a>
        </p>
      )}
    </article>
  );
};

const TabPanel = ({ tab, isActive, isSidebarOpen, closeSidebar }) => {
  const { data, loading, error } = useJsonData(tab.dataPath);
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

  return (
    <section id={tab.id} className={`tabcontent ${isActive ? 'active' : ''}`} aria-hidden={!isActive}>
      <div className="tab-inner">
        <aside className={`sidebar ${isActive && isSidebarOpen ? 'open' : ''}`}>
          {loading && <p>Loading list…</p>}
          {error && <p role="alert">Failed to load content.</p>}
          {!loading && !error && (
            <nav>
              {items.map((item, index) => {
                const itemId = item.id || `${tab.id}-${index}`;
                const label = item.title || `Item ${index + 1}`;
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
          {loading && <p>Loading content…</p>}
          {error && <p role="alert">Could not render {tab.label} just yet.</p>}
          {!loading && !error && (
            <>
              {isPdfTab ? (
                <PdfViewer item={selectedPdf} />
              ) : (
                items.map((item, index) => {
                  const itemId = itemIds[index];
                  const galleryImages = item.img || item.image;
                  return (
                    <article key={itemId} id={itemId} className="performance-item">
                      <h2>{item.title || 'Untitled entry'}</h2>
                      {item.text && (
                        <div className="text-content" dangerouslySetInnerHTML={{ __html: item.text }} />
                      )}

                      <ImageGallery images={galleryImages} title={item.title} />
                      <VideoPlayer
                        videoID={item.videoID}
                        video={item.video}
                        poster={item.poster}
                        title={item.title}
                      />

                      {item.pdf && !isPdfTab && (
                        <p>
                          <a href={item.pdf} target="_blank" rel="noreferrer">
                            Öppna PDF-dokument
                          </a>
                        </p>
                      )}

                      <SourceAttribution source={item.source} />
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

const App = () => {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window === 'undefined') {
      return DEFAULT_TAB;
    }
    const saved = localStorage.getItem(ACTIVE_TAB_KEY);
    return tabs.some((tab) => tab.id === saved) ? saved : DEFAULT_TAB;
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACTIVE_TAB_KEY, activeTab);
  }, [activeTab]);

  useEffect(() => {
    document.body.classList.toggle('sidebar-open', sidebarOpen);
    return () => document.body.classList.remove('sidebar-open');
  }, [sidebarOpen]);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setSidebarOpen(false);
  };

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <>
      <header>
        <span className="logo">Keyvan Kianian</span>
        <h1 className="title">Profile</h1>
      </header>

      <div className="tabs-container">
        <button className="sidebar-toggle" type="button" onClick={toggleSidebar}>
          ☰ All List
        </button>
        <div className="tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`tablink ${tab.id === activeTab ? 'active' : ''}`}
              onClick={() => handleTabClick(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {tabs.map((tab) => (
        <TabPanel
          key={tab.id}
          tab={tab}
          isActive={tab.id === activeTab}
          isSidebarOpen={sidebarOpen}
          closeSidebar={closeSidebar}
        />
      ))}

      <div className={`overlay ${sidebarOpen ? 'show' : ''}`} onClick={closeSidebar}></div>
    </>
  );
};

export default App;
