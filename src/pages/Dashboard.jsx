import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import RequireAuth from '../components/RequireAuth.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';
import { formatDZD } from '../lib/format.js';
import { MessageIcon, PlusIcon, ShieldIcon, StarIcon } from '../components/Icons.jsx';

const statusLabels = {
  published: { label: 'Live', className: 'status' },
  review: { label: 'In review', className: 'status status--muted' },
};

function formatDay(value) {
  if (!value) return '';
  const date = new Date(`${value.replace(' ', 'T')}Z`);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function DashboardContent() {
  const { user } = useAuth();
  const [state, setState] = useState({
    listings: [],
    enquiryCount: 0,
    enquiries: [],
    loading: true,
    error: null,
  });

  const load = useCallback(async () => {
    setState((previous) => ({ ...previous, loading: true, error: null }));
    try {
      const [{ listings, enquiries: enquiryCount }, enquiries] = await Promise.all([
        api.myListings(),
        api.myEnquiries(),
      ]);
      setState({ listings, enquiryCount, enquiries, loading: false, error: null });
    } catch (error) {
      setState({
        listings: [],
        enquiryCount: 0,
        enquiries: [],
        loading: false,
        error: error.message,
      });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const live = state.listings.filter((listing) => listing.status === 'published').length;
  const inReview = state.listings.filter((listing) => listing.status !== 'published').length;

  return (
    <div className="wrap">
      <div className="dash-head">
        <div>
          <span className="eyebrow">Owner dashboard</span>
          <h1 style={{ marginTop: 12 }}>Good to see you, {user.name.split(' ')[0]}.</h1>
          <p>
            Every listing and enquiry here is stored against your account. A new listing appears
            publicly once it has been reviewed.
          </p>
        </div>
        <Link to="/list-property" className="btn btn--primary">
          <PlusIcon width={17} height={17} />
          Add a listing
        </Link>
      </div>

      {state.error && (
        <div className="inline-alert inline-alert--error" style={{ marginBottom: 18 }}>
          <ShieldIcon />
          <span>
            {state.error}{' '}
            <button type="button" className="btn btn--ghost btn--sm" onClick={load}>
              Try again
            </button>
          </span>
        </div>
      )}

      <div className="kpi-grid">
        <div className="kpi">
          <span>Your listings</span>
          <strong>{state.loading ? '—' : state.listings.length}</strong>
          <small>Rentals and stays together</small>
        </div>
        <div className="kpi">
          <span>Live</span>
          <strong>{state.loading ? '—' : live}</strong>
          <small>Visible to tenants and guests</small>
        </div>
        <div className="kpi">
          <span>In review</span>
          <strong>{state.loading ? '—' : inReview}</strong>
          <small>Waiting for an editor</small>
        </div>
        <div className="kpi">
          <span>Enquiries</span>
          <strong>{state.loading ? '—' : state.enquiryCount}</strong>
          <small>
            <MessageIcon width={13} height={13} /> From your listings
          </small>
        </div>
      </div>

      <div className="dash-grid">
        <div>
          <div className="panel">
            <div className="panel__head">
              <h2>Your listings</h2>
              <Link to="/list-property">Add new</Link>
            </div>

            {state.loading && (
              <p style={{ color: 'var(--muted)', padding: '16px 0' }}>Loading your listings…</p>
            )}

            {!state.loading && state.listings.length === 0 && (
              <div className="empty-state" style={{ border: 0, padding: '28px 0' }}>
                <h3>No listings yet</h3>
                <p>Publish your first rental or holiday stay and it will show up here.</p>
                <Link to="/list-property" className="btn btn--primary">
                  List a property
                </Link>
              </div>
            )}

            {state.listings.map((listing) => {
              const status = statusLabels[listing.status] ?? statusLabels.review;
              return (
                <div className="table-row" key={listing.id}>
                  <img src={listing.image} alt="" />
                  <div>
                    <strong>{listing.title}</strong>
                    <span>
                      {listing.city} · {formatDZD(listing.price)} / {listing.priceUnit}
                    </span>
                  </div>
                  <span className={status.className}>{status.label}</span>
                  {listing.status === 'published' ? (
                    <Link to={`/listings/${listing.id}`} className="btn btn--ghost btn--sm">
                      View
                    </Link>
                  ) : (
                    <span
                      className="btn btn--ghost btn--sm"
                      aria-disabled="true"
                      style={{ opacity: 0.5 }}
                    >
                      Draft
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="inline-alert" style={{ marginTop: 18 }}>
            <StarIcon />
            <span>
              Listings are reviewed before going public. You can upload your own main photo when
              you publish — JPEG, PNG or WebP.
            </span>
          </div>
        </div>

        <div className="panel">
          <div className="panel__head">
            <h2>Recent enquiries</h2>
            {state.enquiryCount > 0 && (
              <span className="status status--muted">{state.enquiryCount} total</span>
            )}
          </div>

          {!state.loading && state.enquiries.length === 0 && (
            <p style={{ color: 'var(--muted)', padding: '16px 0' }}>
              No enquiries yet. They arrive here as soon as a tenant or guest sends a request.
            </p>
          )}

          {state.enquiries.map((enquiry) => (
            <div className="inquiry" key={enquiry.id}>
              <span className="inquiry__avatar" aria-hidden="true">
                {enquiry.name.charAt(0)}
              </span>
              <div>
                <strong>{enquiry.name}</strong>
                <p>{enquiry.message}</p>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                  {enquiry.listing_title}
                </span>
                <time>{formatDay(enquiry.created_at)}</time>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}
