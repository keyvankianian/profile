import './PdfViewer.css';

const buildPdfSrc = (src) => {
  if (!src) return '';

  const [base, rawHash = ''] = src.split('#');
  const params = new URLSearchParams(rawHash);
  params.set('toolbar', '0');
  params.set('view', 'FitH');
  params.set('zoom', 'page-width');

  return `${base}#${params.toString()}`;
};

const PdfViewer = ({ item }) => {
  if (!item) {
    return <p>Välj ett dokument från listan för att visa det här.</p>;
  }

  const pdfSrc = buildPdfSrc(item.pdf);

  return (
    <article className="performance-item pdf-panel" id={item.id}>
      <h2>{item.title}</h2>
      {item.caption && <p>{item.caption}</p>}
      {item.pdf && (
        <iframe className="pdf-frame" src={pdfSrc} title={item.title} loading="lazy"></iframe>
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

export default PdfViewer;
