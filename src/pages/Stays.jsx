import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ListingCard from '../components/ListingCard.jsx';
import { cityOptions } from '../data/cities.js';
import { sortListings } from '../lib/sortListings.js';
import { useListings } from '../lib/useListings.js';
import { formatDZD } from '../lib/format.js';
import { CheckIcon, SunIcon } from '../components/Icons.jsx';

const MAX_BUDGET = 50000;

const categories = [
  { value: 'all', label: 'All stays' },
  { value: 'hotel', label: 'Hotels' },
  { value: 'vacation', label: 'Vacation rentals' },
];

const sortOptions = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Best rated' },
];

const inclusions = [
  {
    title: 'No booking fee',
    text: 'The nightly price you see is the price the host quotes. Saken takes nothing from guests.',
    icon: <CheckIcon />,
  },
  {
    title: 'Direct confirmation',
    text: 'Your request goes to the hotel or host. They reply with availability and payment details.',
    icon: <SunIcon />,
  },
  {
    title: 'Local hosts',
    text: 'Family guesthouses and camps run by people who live there, alongside established hotels.',
    icon: <SunIcon />,
  },
];

export default function Stays() {
  const [params] = useSearchParams();
  const { listings, loading, error } = useListings({ kind: 'stay', limit: 100 });
  const [category, setCategory] = useState(params.get('kind') || 'all');
  const [city, setCity] = useState(params.get('city') || 'All cities');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(
    params.get('max') ? Number(params.get('max')) : MAX_BUDGET,
  );
  const [sort, setSort] = useState('recommended');

  const results = useMemo(() => {
    const filtered = listings.filter((listing) => {
      if (category !== 'all' && listing.kind !== category) return false;
      if (city !== 'All cities' && listing.city !== city) return false;
      if (listing.price < minPrice || listing.price > maxPrice) return false;
      return true;
    });

    return sortListings(filtered, sort);
  }, [listings, category, city, minPrice, maxPrice, sort]);

  return (
    <>
      <div className="page-head">
        <div className="wrap">
          <span className="eyebrow">Hotels &amp; vacation stays</span>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginTop: 14 }}>
            Nights by the sea, in the city or under the dunes
          </h1>
          <p>
            A separate section from long-term rentals: hotels, guesthouses, whole villas and
            seasonal camps, priced per night. Tell the host your dates and they confirm directly.
          </p>
        </div>
      </div>

      <div className="wrap" style={{ paddingBottom: 70 }}>
        <div className="list-toolbar">
          <div className="toolbar-right" style={{ marginRight: 'auto' }}>
            {categories.map((item) => (
              <button
                key={item.value}
                type="button"
                className={`btn btn--sm ${category === item.value ? 'btn--primary' : 'btn--ghost'}`}
                onClick={() => setCategory(item.value)}
                aria-pressed={category === item.value}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="toolbar-right">
            <select
              className="select-mini"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              aria-label="Filter stays by city"
            >
              {cityOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <div
              className="select-mini"
              style={{ display: 'inline-flex', flexDirection: 'column', gap: 4, padding: '6px 10px', minWidth: 220 }}
            >
              <span style={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                {minPrice > 0 ? formatDZD(minPrice) : '0 DA'} –{' '}
                {maxPrice >= MAX_BUDGET ? 'Any' : formatDZD(maxPrice)} / night
              </span>
              <div style={{ position: 'relative', height: 20 }}>
                <input
                  type="range"
                  min={0}
                  max={MAX_BUDGET}
                  step={1000}
                  value={minPrice}
                  onChange={(event) =>
                    setMinPrice(Math.min(Number(event.target.value), maxPrice))
                  }
                  aria-label="Minimum nightly budget"
                  style={{
                    position: 'absolute',
                    width: '100%',
                    pointerEvents: 'none',
                    background: 'transparent',
                  }}
                />
                <input
                  type="range"
                  min={0}
                  max={MAX_BUDGET}
                  step={1000}
                  value={maxPrice}
                  onChange={(event) =>
                    setMaxPrice(Math.max(Number(event.target.value), minPrice))
                  }
                  aria-label="Maximum nightly budget"
                  style={{
                    position: 'absolute',
                    width: '100%',
                    pointerEvents: 'none',
                    background: 'transparent',
                  }}
                />
              </div>
              <style>{`
                .select-mini input[type="range"]::-webkit-slider-thumb { pointer-events: auto; }
                .select-mini input[type="range"]::-moz-range-thumb { pointer-events: auto; }
              `}</style>
            </div>
            <select
              className="select-mini"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              aria-label="Sort stays"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="list-toolbar__count" style={{ marginBottom: 24 }}>
          {loading ? (
            <>Loading stays…</>
          ) : (
            <>
              <strong>{results.length}</strong> {results.length === 1 ? 'stay' : 'stays'} shown
              {city !== 'All cities' && ` in ${city}`}
            </>
          )}
        </p>

        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading stays…</p>
        ) : error ? (
          <div className="empty-state">
            <h3>Stays could not be loaded</h3>
            <p>{error}</p>
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid--3">
            {results.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>Nothing in this corner yet</h3>
            <p>Try another city or switch back to all stays.</p>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                setCity('All cities');
                setCategory('all');
                setMinPrice(0);
                setMaxPrice(MAX_BUDGET);
              }}
            >
              Show all stays
            </button>
          </div>
        )}
      </div>

      <section className="section section--sand section--tight">
        <div className="wrap">
          <div className="section-head" style={{ marginBottom: 24 }}>
            <div>
              <span className="eyebrow">Booking directly</span>
              <h2 style={{ fontSize: '1.7rem' }}>What every stay on Saken includes</h2>
            </div>
          </div>
          <div className="grid grid--3">
            {inclusions.map((item) => (
              <div className="card" key={item.title} style={{ padding: 24 }}>
                <span className="step__icon" style={{ marginBottom: 12 }}>
                  {item.icon}
                </span>
                <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.98rem', fontWeight: 600 }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--muted)', marginTop: 6 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
