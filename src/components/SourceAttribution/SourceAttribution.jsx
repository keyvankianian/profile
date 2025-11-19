import './SourceAttribution.css';

const fallbackStrings = { sourceLabel: 'Källa' };

const SourceAttribution = ({ source, language, strings }) => {
  if (!source?.url) return null;

  const copy = strings || fallbackStrings;
  const direction = language === 'fa' ? 'rtl' : 'ltr';

  return (
    <p className="source" dir={direction}>
      <strong>{source.label || copy.sourceLabel}:</strong>{' '}
      <a href={source.url} target="_blank" rel="noreferrer">
        {source.url}
      </a>
    </p>
  );
};

export default SourceAttribution;
