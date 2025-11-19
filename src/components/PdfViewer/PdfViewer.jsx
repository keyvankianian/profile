import './PdfViewer.css';

const PdfViewer = ({ item }) => {
  if (!item) {
    return <p>Välj ett dokument från listan för att visa det här.</p>;
  }

  return (
    <article className="performance-item pdf-panel" id={item.id}>
      <h2>{item.title}</h2>
      {item.caption && <p>{item.caption}</p>}
      {item.pdf && (
        <iframe className="pdf-frame" src={`${item.pdf}#toolbar=0`} title={item.title} loading="lazy"></iframe>
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
