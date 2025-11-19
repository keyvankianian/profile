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

const fallbackStrings = {
  choosePdf: 'Välj ett dokument från listan för att visa det här.',
  openPdfInNewTab: 'Öppna dokumentet i en ny flik'
};

const PdfViewer = ({ item, language, strings }) => {
  const copy = strings || fallbackStrings;
  const direction = language === 'fa' ? 'rtl' : 'ltr';

  if (!item) {
    return <p>{copy.choosePdf}</p>;
  }

  const pdfSrc = buildPdfSrc(item.pdf);

  return (
    <article className="performance-item pdf-panel" id={item.id} dir={direction}>
      <h2>{item.title}</h2>
      {item.caption && <p>{item.caption}</p>}
      {item.pdf && (
        <iframe className="pdf-frame" src={pdfSrc} title={item.title} loading="lazy"></iframe>
      )}
      {item.pdf && (
        <p>
          <a href={item.pdf} target="_blank" rel="noreferrer">
            {copy.openPdfInNewTab}
          </a>
        </p>
      )}
    </article>
  );
};

export default PdfViewer;
