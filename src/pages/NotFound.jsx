import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="wrap section">
      <div className="empty-state" style={{ maxWidth: 560, margin: '0 auto' }}>
        <span className="eyebrow" style={{ justifyContent: 'center' }}>
          Error 404
        </span>
        <h3 style={{ marginTop: 16 }}>This page has moved out</h3>
        <p>
          The link may be broken, or the listing has been taken down. Try the rental search or the
          stays section.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/rentals" className="btn btn--primary">
            Browse rentals
          </Link>
          <Link to="/stays" className="btn btn--ghost">
            Hotels &amp; stays
          </Link>
        </div>
      </div>
    </div>
  );
}
