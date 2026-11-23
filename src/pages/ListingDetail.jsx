import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ListingCard from '../components/ListingCard.jsx';
import Rating from '../components/Rating.jsx';
import {
  BathIcon,
  BedIcon,
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  MapPinIcon,
  ShieldIcon,
  UsersIcon,
} from '../components/Icons.jsx';
import { cities } from '../data/cities.js';
import { api } from '../lib/api.js';
import { formatDZD } from '../lib/format.js';

export default function ListingDetail() {
  const { id } = useParams();
  const [state, setState] = useState({ listing: null, similar: [], loading: true, error: null });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    const controller = new AbortController();
    setState({ listing: null, similar: [], loading: true, error: null });
    setSent(false);
    setFormError('');
    setFieldErrors({});

    api
      .listing(id, controller.signal)
      .then(({ listing, similar }) =>
        setState({ listing, similar: similar ?? [], loading: false, error: null }),
      )
      .catch((error) => {
        if (error?.name === 'AbortError') return;
        setState({ listing: null, similar: [], loading: false, error });
      });

    return () => controller.abort();
  }, [id]);

  if (state.loading) {
    return (
      <div className="wrap section">
        <p style={{ color: 'var(--muted)' }}>Loading this listing…</p>
      </div>
    );
  }

  if (!state.listing) {
    return (
      <div className="wrap section">
        <div className="empty-state">
          <h3>This listing is no longer available</h3>
          <p>
            {state.error?.status === 404
              ? 'The link may be out of date, or the owner has taken the listing down.'
              : state.error?.message || 'The listing could not be loaded right now.'}
          </p>
          <Link to="/rentals" className="btn btn--primary">
            Back to rentals
          </Link>
        </div>
      </div>
    );
  }

  const listing = state.listing;
  const similar = state.similar;
  const isRental = listing.kind === 'rental';
  const city = cities.find((item) => item.name === listing.city);
  const ownerInitials = listing.owner.name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('');

  const facts = [
    {
      value: `${listing.beds} ${listing.beds === 1 ? 'bedroom' : 'bedrooms'}`,
      label: 'Sleeping space',
    },
    { value: `${listing.baths} bathroom${listing.baths > 1 ? 's' : ''}`, label: 'Bathrooms' },
    { value: `${listing.area} m²`, label: 'Surface' },
    { value: `${listing.guests} guests`, label: 'Comfortably fits' },
  ];

  async function handleRequest(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const get = (key) => String(data.get(key) ?? '').trim();

    if (!isRental && get('check-out') && get('check-out') <= get('check-in')) {
      setFormError('Check-out has to be after check-in.');
      return;
    }

    const details = isRental
      ? [`Preferred move-in: ${get('move-in') || 'flexible'}`]
      : [`Check in: ${get('check-in')}`, `Check out: ${get('check-out')}`, `Guests: ${get('guests')}`];
    const note = get('note');
    const message = [...details, ...(note ? [note] : [])].join('\n');

    setSending(true);
    setFormError('');
    setFieldErrors({});
    try {
      await api.sendEnquiry({
        listingId: listing.id,
        name: get('name'),
        email: get('email'),
        phone: get('phone'),
        message,
      });
      setSent(true);
    } catch (error) {
      setFieldErrors(error.errors ?? {});
      setFormError(error.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <div className="wrap">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to={isRental ? '/rentals' : '/stays'}>{isRental ? 'Rentals' : 'Hotels & stays'}</Link>
          <span>/</span>
          <span>{listing.city}</span>
        </nav>

        <div className="detail__hero">
          <img src={listing.image} alt={listing.title} />
        </div>

        <div className="detail">
          <div>
            <div className="detail__head">
              <div>
                <div className="detail__sub" style={{ marginTop: 0 }}>
                  <span>
                    <MapPinIcon width={16} height={16} /> {listing.district}, {listing.city} ·{' '}
                    {listing.wilaya}
                  </span>
                  {listing.badge && <span className="badge badge--pine">{listing.badge}</span>}
                </div>
                <h1 style={{ marginTop: 12 }}>{listing.title}</h1>
                <div className="detail__sub">
                  {listing.rating > 0 && (
                    <Rating value={listing.rating} reviews={listing.reviews} />
                  )}
                  {listing.available && (
                    <span>
                      <CalendarIcon width={15} height={15} /> {listing.available}
                    </span>
                  )}
                  {listing.furnished && (
                    <span>
                      <CheckIcon width={15} height={15} /> Furnished
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="detail__facts">
              {facts.map((fact) => (
                <div className="fact" key={fact.label}>
                  <strong>{fact.value}</strong>
                  <span>{fact.label}</span>
                </div>
              ))}
            </div>

            <section className="detail__block">
              <h2>About this {isRental ? 'home' : 'stay'}</h2>
              <p>{listing.description}</p>
            </section>

            {listing.amenities.length > 0 && (
              <section className="detail__block">
                <h2>What’s included</h2>
                <ul className="amenities">
                  {listing.amenities.map((amenity) => (
                    <li key={amenity}>
                      <CheckIcon /> {amenity}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="detail__block">
              <h2>The neighbourhood</h2>
              <p>
                {city ? city.tagline : listing.city} — {listing.district}, in the wilaya of{' '}
                {listing.wilaya}. Distances to shops, transport and the coast are confirmed by the
                owner before a visit.
              </p>
            </section>

            <section className="detail__block" style={{ borderBottom: 0 }}>
              <h2>Your host</h2>
              <div className="owner-card">
                <span className="owner-card__avatar" aria-hidden="true">
                  {ownerInitials}
                </span>
                <div>
                  <h3>
                    {listing.owner.name}
                    {listing.owner.verified && (
                      <span className="badge badge--pine">
                        <ShieldIcon width={12} height={12} /> Verified
                      </span>
                    )}
                  </h3>
                  <p>
                    {listing.owner.role}
                    {listing.owner.since ? ` · on Saken since ${listing.owner.since}` : ''}
                  </p>
                  {listing.owner.responseTime && <p>{listing.owner.responseTime}</p>}
                </div>
              </div>
            </section>
          </div>

          <aside>
            <div className="booking-card">
              <div className="booking-card__price">
                <span className="price">{formatDZD(listing.price)}</span>
                <span>per {listing.priceUnit}</span>
              </div>

              {sent ? (
                <div className="inline-alert">
                  <CheckIcon />
                  <span>
                    Request sent. The message is stored against this listing and{' '}
                    {listing.owner.name} can read it from their dashboard.
                  </span>
                </div>
              ) : (
                <form className="booking-form" onSubmit={handleRequest}>
                  {formError && (
                    <div className="inline-alert inline-alert--error" role="alert">
                      <ShieldIcon />
                      <span>{formError}</span>
                    </div>
                  )}

                  <div className="field">
                    <label htmlFor="enquiry-name">Your name</label>
                    <input id="enquiry-name" name="name" type="text" required />
                    {fieldErrors.name && (
                      <span className="field__error" role="alert">
                        {fieldErrors.name}
                      </span>
                    )}
                  </div>

                  <div className="field">
                    <label htmlFor="enquiry-email">Email</label>
                    <input
                      id="enquiry-email"
                      name="email"
                      type="email"
                      placeholder="you@example.dz"
                      required
                    />
                    {fieldErrors.email && (
                      <span className="field__error" role="alert">
                        {fieldErrors.email}
                      </span>
                    )}
                  </div>

                  {isRental ? (
                    <div className="field">
                      <label htmlFor="move-in">Preferred move-in date</label>
                      <input id="move-in" name="move-in" type="date" required />
                    </div>
                  ) : (
                    <>
                      <div className="field">
                        <div>
                          <div>
                            <label htmlFor="check-in">Check in</label>
                            <input id="check-in" name="check-in" type="date" required />
                          </div>
                          <div>
                            <label htmlFor="check-out">Check out</label>
                            <input id="check-out" name="check-out" type="date" required />
                          </div>
                        </div>
                      </div>
                      <div className="field">
                        <label htmlFor="stay-guests">Guests</label>
                        <select
                          id="stay-guests"
                          name="guests"
                          defaultValue={String(Math.min(2, listing.guests))}
                        >
                          {Array.from({ length: listing.guests }, (_, index) => index + 1).map(
                            (count) => (
                              <option key={count} value={count}>
                                {count} {count === 1 ? 'guest' : 'guests'}
                              </option>
                            ),
                          )}
                        </select>
                      </div>
                    </>
                  )}

                  <div className="field">
                    <label htmlFor="enquiry-phone">Phone (optional)</label>
                    <input
                      id="enquiry-phone"
                      name="phone"
                      type="tel"
                      placeholder="+213 5 00 00 00 00"
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="enquiry-note">Message (optional)</label>
                    <textarea
                      id="enquiry-note"
                      name="note"
                      placeholder={
                        isRental ? 'Anything the owner should know?' : 'Anything the host should know?'
                      }
                    />
                    {fieldErrors.message && (
                      <span className="field__error" role="alert">
                        {fieldErrors.message}
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn btn--primary btn--block btn--lg"
                    disabled={sending}
                  >
                    {sending ? 'Sending…' : isRental ? 'Request a viewing' : 'Check availability'}
                  </button>
                </form>
              )}

              <p className="booking-note">
                No payment is taken on Saken. The owner replies with availability and terms directly.
                Prices in Algerian dinars.
              </p>

              <ul className="assurance">
                <li>
                  <ShieldIcon /> Owner and listing details on record
                </li>
                <li>
                  <CheckIcon /> No booking fee for guests
                </li>
                <li>
                  <ChevronDownIcon style={{ transform: 'rotate(-90deg)' }} /> Cancel terms agreed
                  directly with the owner
                </li>
              </ul>
            </div>

            <ul className="assurance" style={{ paddingLeft: 6 }}>
              <li>
                <BedIcon width={15} height={15} /> {listing.beds} beds · {listing.baths} bath
              </li>
              <li>
                <UsersIcon width={15} height={15} /> {listing.guests} guests maximum
              </li>
              <li>
                <BathIcon width={15} height={15} /> {listing.area} m² of living space
              </li>
            </ul>
          </aside>
        </div>
      </div>

      {similar.length > 0 && (
        <section className="section section--sand">
          <div className="wrap">
            <div className="section-head">
              <div>
                <span className="eyebrow">More like this</span>
                <h2 style={{ fontSize: '1.8rem' }}>
                  Other {isRental ? 'rentals' : 'stays'} on Saken
                </h2>
              </div>
              <Link to={isRental ? '/rentals' : '/stays'} className="link-arrow">
                See all
              </Link>
            </div>
            <div className="grid grid--3">
              {similar.map((item) => (
                <ListingCard key={item.id} listing={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
