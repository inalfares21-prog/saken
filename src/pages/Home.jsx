import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar.jsx';
import ListingCard from '../components/ListingCard.jsx';
import { cities } from '../data/cities.js';
import { useListings } from '../lib/useListings.js';
import {
  ArrowRightIcon,
  BuildingIcon,
  CheckIcon,
  KeyIcon,
  MapPinIcon,
  MessageIcon,
  ShieldIcon,
  SunIcon,
} from '../components/Icons.jsx';

const steps = [
  {
    icon: <MapPinIcon />,
    title: 'Search by wilaya',
    text: 'Filter by city, property type and monthly budget. Every rental shows what is included — furnished, parking, water tank, internet.',
  },
  {
    icon: <MessageIcon />,
    title: 'Talk to the owner',
    text: 'Message the owner or agency directly from the listing. No middlemen, no tenant fees, no bidding wars.',
  },
  {
    icon: <KeyIcon />,
    title: 'Visit and settle in',
    text: 'Book a viewing, agree the terms and sign. Saken keeps the listing and the owner’s details on record for both sides.',
  },
];

export default function Home() {
  const { listings, loading, error } = useListings({ limit: 100 });
  const featured = listings
    .filter((listing) => listing.kind === 'rental' && listing.featured)
    .slice(0, 3);

  const countCity = (name, kind) =>
    listings.filter((listing) => listing.city === name && (!kind || listing.kind === kind)).length;

  return (
    <>
      <section className="hero">
        <img
          className="hero__image"
          src="/images/hero-algiers.jpg"
          alt="The bay of Algiers at golden hour"
        />
        <div className="wrap hero__inner">
          <div className="hero__copy">
            <span className="eyebrow">Algeria · Rentals &amp; stays</span>
            <h1>A home in Algeria, without the guesswork.</h1>
            <p className="hero__lede">
              Saken brings property owners and tenants together for long-term rentals — and keeps
              hotels and vacation stays in their own, carefully separate section for travellers.
            </p>
            <div className="hero__meta">
              <span>
                <CheckIcon width={16} height={16} /> Sample listings in 7 cities
              </span>
              <span>
                <CheckIcon width={16} height={16} /> No tenant fees
              </span>
              <span>
                <CheckIcon width={16} height={16} /> Owners reply directly
              </span>
            </div>
          </div>

          <SearchBar />
        </div>
      </section>

      <section className="section section--tight">
        <div className="wrap">
          <div className="stats">
            <div className="stat">
              <strong>{cities.length}</strong>
              <span>Wilayas covered, from Algiers to Djanet</span>
            </div>
            <div className="stat">
              <strong>{loading ? '—' : listings.length}</strong>
              <span>Rentals, hotels and stays listed</span>
            </div>
            <div className="stat">
              <strong>0 DA</strong>
              <span>Tenant fees on long-term rentals</span>
            </div>
            <div className="stat">
              <strong>48 h</strong>
              <span>Average owner reply time</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow">Two ways to use Saken</span>
              <h2>Somewhere to live. Somewhere to stay.</h2>
              <p>
                Long-term rentals and short stays are different businesses, so they get different
                pages. Tenants search monthly rents; travellers compare hotels and vacation
                properties.
              </p>
            </div>
          </div>

          <div className="split">
            <Link to="/rentals" className="path-card">
              <img src="/images/apt-hydra.jpg" alt="A furnished Algiers apartment living room" />
              <span className="path-card__tag">For tenants</span>
              <h3>Long-term rentals</h3>
              <p>
                Apartments, houses and family homes rented by the month, with the terms written
                plainly and the owner’s name attached.
              </p>
              <span className="link-arrow">
                Browse rentals <ArrowRightIcon width={16} height={16} />
              </span>
            </Link>

            <Link to="/stays" className="path-card">
              <img src="/images/hotel-pool.jpg" alt="A hotel pool terrace above the sea" />
              <span className="path-card__tag">For travellers</span>
              <h3>Hotels &amp; vacation stays</h3>
              <p>
                Coastal villas, city hotels, desert camps and guesthouses — booked by the night,
                from Tipaza to the Tassili.
              </p>
              <span className="link-arrow">
                Explore stays <ArrowRightIcon width={16} height={16} />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="section section--sand">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow">Hand-checked</span>
              <h2>Homes worth a closer look</h2>
              <p>A few rentals, published by their owners and checked by us.</p>
            </div>
            <Link to="/rentals" className="link-arrow">
              All rentals <ArrowRightIcon width={16} height={16} />
            </Link>
          </div>

          <div className="grid grid--3">
            {loading && <p style={{ color: 'var(--muted)' }}>Loading listings…</p>}
            {error && (
              <p style={{ color: 'var(--muted)' }}>
                The listings could not be loaded right now. Refresh the page to try again.
              </p>
            )}
            {!loading &&
              !error &&
              featured.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow">Where to look</span>
              <h2>Seven cities, one coastline and a desert</h2>
              <p>
                From the Casbah to the M’zab, these are the places with sample listings today.
              </p>
            </div>
          </div>

          <div className="city-grid">
            {cities.map((city, index) => {
              const rentalCount = countCity(city.name, 'rental');
              const stayCount = countCity(city.name) - rentalCount;
              const target = rentalCount > 0 ? '/rentals' : '/stays';
              const countLabel =
                rentalCount > 0
                  ? `${rentalCount} ${rentalCount === 1 ? 'rental' : 'rentals'}${
                      stayCount > 0 ? ` · ${stayCount} ${stayCount === 1 ? 'stay' : 'stays'}` : ''
                    }`
                  : `${stayCount} ${stayCount === 1 ? 'stay' : 'stays'}`;

              return (
                <Link
                  key={city.name}
                  to={`${target}?city=${encodeURIComponent(city.name)}`}
                  className={`city-card${index === 0 ? ' city-card--wide' : ''}`}
                >
                  <img src={city.image} alt={`${city.name}, Algeria`} loading="lazy" />
                  <div className="city-card__body">
                    <h3>{city.name}</h3>
                    <span>
                      {city.tagline}
                      <em>{countLabel}</em>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section section--sand">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow">For tenants</span>
              <h2>Three steps, no agency runaround</h2>
            </div>
            <Link to="/how-it-works" className="link-arrow">
              How it works <ArrowRightIcon width={16} height={16} />
            </Link>
          </div>

          <div className="steps">
            {steps.map((step) => (
              <div className="step" key={step.title}>
                <span className="step__icon">{step.icon}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="cta-band">
            <div>
              <span className="eyebrow" style={{ color: '#f0dcbb' }}>
                For owners
              </span>
              <h2>Your flat, in front of the right tenants.</h2>
              <p>
                Publish a rental in minutes, or list a holiday property in the stays section. You
                keep control of viewings, terms and the final agreement.
              </p>
            </div>
            <div className="cta-band__actions">
              <Link to="/list-property" className="btn btn--light btn--lg">
                List your property
              </Link>
              <Link to="/how-it-works" className="btn btn--ghost btn--lg" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.35)' }}>
                See owner terms
              </Link>
            </div>
          </div>

          <div className="grid grid--3" style={{ marginTop: 26 }}>
            <div className="card" style={{ padding: 24 }}>
              <ShieldIcon style={{ color: 'var(--pine)' }} />
              <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.98rem', fontWeight: 600, margin: '12px 0 6px' }}>
                Verified owners
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>
                Identity and property papers checked before a listing goes live.
              </p>
            </div>
            <div className="card" style={{ padding: 24 }}>
              <BuildingIcon style={{ color: 'var(--pine)' }} />
              <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.98rem', fontWeight: 600, margin: '12px 0 6px' }}>
                Written terms
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>
                Rent, deposit and notice period stated on the listing, not negotiated blind.
              </p>
            </div>
            <div className="card" style={{ padding: 24 }}>
              <SunIcon style={{ color: 'var(--pine)' }} />
              <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.98rem', fontWeight: 600, margin: '12px 0 6px' }}>
                Stays, kept separate
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>
                Hotels and vacation rentals live in their own section so rents stay comparable.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
