import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import RequireAuth from '../components/RequireAuth.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';
import { formatDZD } from '../lib/format.js';
import { CheckIcon, CloseIcon as XIcon, ShieldIcon } from '../components/Icons.jsx';

const statusLabels = {
  published: { label: 'Live', className: 'status' },
  review: { label: 'In review', className: 'status status--muted' },
  rejected: { label: 'Rejected', className: 'status status--danger' },
};

function AdminContent() {
  const { user } = useAuth();
  const [status, setStatus] = useState('review');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.adminListings(status);
      setListings(data);
    } catch (requestError) {
      setError(requestError.message);
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAction(id, action) {
    setBusy(id);
    try {
      if (action === 'approve') await api.approveListing(id);
      else await api.rejectListing(id);
      await load();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(null);
    }
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="wrap section">
      <div className="dash-head">
        <div>
          <span className="eyebrow">Administration</span>
          <h1 style={{ marginTop: 12 }}>Review queue</h1>
          <p>
            Listings land here when an owner submits them. Approve to publish, or reject to send
            them back.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['review', 'published', 'rejected'].map((value) => (
            <button
              key={value}
              type="button"
              className={`btn btn--sm ${status === value ? 'btn--primary' : 'btn--ghost'}`}
              onClick={() => setStatus(value)}
            >
              {value === 'review' ? 'In review' : value === 'published' ? 'Live' : 'Rejected'}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="inline-alert inline-alert--error" style={{ marginBottom: 18 }}>
          <ShieldIcon />
          <span>{error}</span>
        </div>
      )}

      <div className="panel">
        <div className="panel__head">
          <h2>
            {status === 'review'
              ? 'Waiting for review'
              : status === 'published'
                ? 'Live listings'
                : 'Rejected listings'}
          </h2>
          <span className="status status--muted">{loading ? '—' : listings.length} total</span>
        </div>

        {loading && <p style={{ color: 'var(--muted)', padding: '16px 0' }}>Loading…</p>}

        {!loading && listings.length === 0 && (
          <div className="empty-state" style={{ border: 0, padding: '28px 0' }}>
            <h3>Nothing here</h3>
            <p>No listings match this filter.</p>
          </div>
        )}

        {listings.map((listing) => {
          const statusInfo = statusLabels[listing.status] ?? statusLabels.review;
          return (
            <div className="table-row" key={listing.id}>
              <img src={listing.image} alt="" />
              <div>
                <strong>{listing.title}</strong>
                <span>
                  {listing.city} · {formatDZD(listing.price)} / {listing.priceUnit} · by{' '}
                  {listing.owner.name}
                </span>
              </div>
              <span className={statusInfo.className}>{statusInfo.label}</span>
              {listing.status === 'review' && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    className="btn btn--primary btn--sm"
                    disabled={busy === listing.id}
                    onClick={() => handleAction(listing.id, 'approve')}
                  >
                    <CheckIcon width={14} height={14} /> Approve
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    disabled={busy === listing.id}
                    onClick={() => handleAction(listing.id, 'reject')}
                  >
                    <XIcon width={14} height={14} /> Reject
                  </button>
                </div>
              )}
              {listing.status !== 'review' && (
                <Link to={`/listings/${listing.id}`} className="btn btn--ghost btn--sm">
                  View
                </Link>
              )}
            </div>
          );
        })}
      </div>

      <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: 18 }}>
        <Link to="/owner/dashboard">← Back to owner dashboard</Link>
      </p>
    </div>
  );
}

export default function Admin() {
  return (
    <RequireAuth redirectTo="/login?admin=1">
      <AdminContent />
    </RequireAuth>
  );
}
