import { Link } from 'react-router-dom';
import { formatPrice } from '../lib/format.js';
import { BathIcon, BedIcon, MapPinIcon, UsersIcon } from './Icons.jsx';
import Rating from './Rating.jsx';

export default function ListingCard({ listing }) {
  return (
    <Link to={`/listings/${listing.id}`} className="listing-card">
      <div className="listing-card__media">
        <img src={listing.image} alt={listing.title} loading="lazy" />
        {listing.badge && <span className="listing-card__badge badge">{listing.badge}</span>}
      </div>
      <div className="listing-card__body">
        <div className="listing-card__top">
          <div>
            <p className="listing-card__loc">
              <MapPinIcon width={15} height={15} />
              {listing.district}, {listing.city}
            </p>
            <h3 className="listing-card__title">{listing.title}</h3>
          </div>
          {listing.reviews > 0 && <Rating value={listing.rating} reviews={listing.reviews} />}
        </div>

        <div className="listing-card__facts">
          <span>
            <BedIcon /> {listing.beds} {listing.beds === 1 ? 'bed' : 'beds'}
          </span>
          <span>
            <BathIcon /> {listing.baths} bath
          </span>
          <span>
            <UsersIcon /> {listing.guests} guests
          </span>
        </div>

        <div className="listing-card__foot">
          <span className="price">
            {formatPrice(listing).replace(/ \/ (month|night)$/, '')}
            <small> / {listing.priceUnit}</small>
          </span>
          <span className="badge badge--outline">{listing.area} m²</span>
        </div>
      </div>
    </Link>
  );
}
