import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ListingCard from '../components/ListingCard.jsx';
import { SlidersIcon } from '../components/Icons.jsx';
import { cityOptions, propertyTypes } from '../data/cities.js';
import { sortListings } from '../lib/sortListings.js';
import { useListings } from '../lib/useListings.js';

const budgetLabels = {
  any: 'Any budget',
  60000: 'Up to 60 000 DA',
  120000: 'Up to 120 000 DA',
  200000: 'Up to 200 000 DA',
  '200000-plus': '200 000 DA and above',
};

const sortOptions = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Best rated' },
];

export default function Rentals() {
  const [params] = useSearchParams();
  const { listings, loading, error } = useListings({ kind: 'rental', limit: 100 });
  const [city, setCity] = useState(params.get('city') || 'All cities');
  const [type, setType] = useState(params.get('type') || 'any');
  const [budget, setBudget] = useState(params.get('max') || 'any');
  const [furnishedOnly, setFurnishedOnly] = useState(false);
  const [sort, setSort] = useState('recommended');
  // open by default on wide screens; on phones the results come first and filters start collapsed
  const [filtersOpen, setFiltersOpen] = useState(
    () => window.matchMedia('(min-width: 721px)').matches,
  );

  const results = useMemo(() => {
    const filtered = listings.filter((listing) => {
      if (city !== 'All cities' && listing.city !== city) return false;
      if (type !== 'any' && listing.type !== type) return false;
      if (budget === '200000-plus' && listing.price < 200000) return false;
      if (budget !== 'any' && budget !== '200000-plus' && listing.price > Number(budget)) return false;
      if (furnishedOnly && !listing.furnished) return false;
      return true;
    });

    return sortListings(filtered, sort);
  }, [listings, city, type, budget, furnishedOnly, sort]);

  const activeFilters =
    (city !== 'All cities' ? 1 : 0) + (type !== 'any' ? 1 : 0) + (budget !== 'any' ? 1 : 0) + (furnishedOnly ? 1 : 0);

  function resetFilters() {
    setCity('All cities');
    setType('any');
    setBudget('any');
    setFurnishedOnly(false);
  }

  return (
    <>
      <div className="page-head">
        <div className="wrap">
          <span className="eyebrow">Long-term rentals</span>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginTop: 14 }}>
            Rent by the month, across Algeria
          </h1>
          <p>
            Furnished and unfurnished apartments and houses, listed by their owners and agencies.
            Prices are monthly, in dinars.
          </p>
        </div>
      </div>

      <div className="wrap" style={{ paddingBottom: 90 }}>
        <div className="list-toolbar">
          <p className="list-toolbar__count">
            {loading ? (
              <>Looking for rentals…</>
            ) : (
              <>
                <strong>{results.length}</strong> {results.length === 1 ? 'rental' : 'rentals'}{' '}
                available
                {city !== 'All cities' && ` in ${city}`}
              </>
            )}
          </p>
          <div className="toolbar-right">
            <button
              type="button"
              className={`filter-toggle${filtersOpen ? ' is-open' : ''}`}
              onClick={() => setFiltersOpen((open) => !open)}
              aria-expanded={filtersOpen}
            >
              <SlidersIcon width={16} height={16} />
              Filters{activeFilters > 0 ? ` (${activeFilters})` : ''}
            </button>
            <select
              className="select-mini"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              aria-label="Sort rentals"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filtersOpen && (
          <div className="filter-panel">
            <div className="field">
              <label htmlFor="filter-city">City</label>
              <select id="filter-city" value={city} onChange={(event) => setCity(event.target.value)}>
                {cityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="filter-type">Property type</label>
              <select id="filter-type" value={type} onChange={(event) => setType(event.target.value)}>
                {propertyTypes.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="filter-budget">Monthly budget</label>
              <select
                id="filter-budget"
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
              >
                {Object.entries(budgetLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <span>Furnishing</span>
              <label className="switch-row">
                <input
                  type="checkbox"
                  checked={furnishedOnly}
                  onChange={(event) => setFurnishedOnly(event.target.checked)}
                />
                Furnished only
              </label>
            </div>

            <div className="filter-panel__foot">
              <span className="filter-panel__note">
                Monthly rents in DZD. Bills and deposit are stated on each listing.
              </span>
              <button type="button" className="btn btn--ghost btn--sm" onClick={resetFilters}>
                Clear filters
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading rentals…</p>
        ) : error ? (
          <div className="empty-state">
            <h3>Rentals could not be loaded</h3>
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
            <h3>No rentals match those filters</h3>
            <p>
              Try widening the budget or choosing another city. New listings are added as owners
              publish them.
            </p>
            <button type="button" className="btn btn--primary" onClick={resetFilters}>
              Clear filters
            </button>
          </div>
        )}
      </div>
    </>
  );
}
