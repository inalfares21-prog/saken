import { StarIcon } from './Icons.jsx';

export default function Rating({ value, reviews, className = 'rating' }) {
  return (
    <span className={className} aria-label={`Rated ${value} out of 5`}>
      <StarIcon />
      {value.toFixed(1)}
      {typeof reviews === 'number' && <em>({reviews})</em>}
    </span>
  );
}
