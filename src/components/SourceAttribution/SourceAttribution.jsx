import './SourceAttribution.css';

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

export default SourceAttribution;
