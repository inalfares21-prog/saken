import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cities, propertyTypes } from '../data/cities.js';
import { BuildingIcon, SearchIcon, SunIcon } from './Icons.jsx';

const tabs = [
  { id: 'rental', label: 'Long-term rent', icon: <BuildingIcon width={16} height={16} /> },
  { id: 'stay', label: 'Hotels & vacation', icon: <SunIcon width={16} height={16} /> },
];

export default function SearchBar({ defaultTab = 'rental' }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState(defaultTab);
  const [city, setCity] = useState('');
  const [type, setType] = useState('any');
  const [stayType, setStayType] = useState('any');
  const [budget, setBudget] = useState('any');

  function handleSubmit(event) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (tab === 'rental' && type !== 'any') params.set('type', type);
    if (tab === 'stay' && stayType !== 'any') params.set('kind', stayType);
    if (budget !== 'any') params.set('max', budget);
    const path = tab === 'rental' ? '/rentals' : '/stays';
    const query = params.toString();
    navigate(query ? `${path}?${query}` : path);
  }

  return (
    <form className="search-card" onSubmit={handleSubmit}>
      <div className="search-card__tabs" role="tablist" aria-label="What are you looking for?">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => {
              setTab(item.id);
              // Budgets are not comparable between a monthly rent and a nightly rate.
              setBudget('any');
            }}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      <div className="search-card__fields">
        <div className="search-field">
          <label htmlFor="search-city">Where</label>
          <select id="search-city" value={city} onChange={(event) => setCity(event.target.value)}>
            <option value="">All of Algeria</option>
            {cities.map((item) => (
              <option key={item.name} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        {tab === 'rental' ? (
          <div className="search-field">
            <label htmlFor="search-type">Property</label>
            <select id="search-type" value={type} onChange={(event) => setType(event.target.value)}>
              {propertyTypes.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="search-field">
            <label htmlFor="search-stay">Stay type</label>
            <select
              id="search-stay"
              value={stayType}
              onChange={(event) => setStayType(event.target.value)}
            >
              <option value="any">Hotels & rentals</option>
              <option value="hotel">Hotels</option>
              <option value="vacation">Vacation rentals</option>
            </select>
          </div>
        )}

        <div className="search-field">
          <label htmlFor="search-budget">Budget</label>
          <select
            id="search-budget"
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
          >
            <option value="any">Any budget</option>
            {tab === 'rental' ? (
              <>
                <option value="60000">Up to 60 000 DA</option>
                <option value="120000">Up to 120 000 DA</option>
                <option value="200000">Up to 200 000 DA</option>
              </>
            ) : (
              <>
                <option value="6000">Up to 6 000 DA</option>
                <option value="12000">Up to 12 000 DA</option>
                <option value="20000">Up to 20 000 DA</option>
              </>
            )}
          </select>
        </div>

        <button type="submit" className="btn btn--primary search-card__submit">
          <SearchIcon width={18} height={18} />
          Search
        </button>
      </div>
    </form>
  );
}
