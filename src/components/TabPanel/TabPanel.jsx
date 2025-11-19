import { useEffect, useMemo, useState } from 'react';
import ImageGallery from '../ImageGallery/ImageGallery';
import PdfViewer from '../PdfViewer/PdfViewer';
import SourceAttribution from '../SourceAttribution/SourceAttribution';
import VideoPlayer from '../VideoPlayer/VideoPlayer';
import './TabPanel.css';

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

export default TabPanel;
