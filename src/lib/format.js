export function formatDZD(value) {
  const rounded = Math.round(value);
  const grouped = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${grouped} DA`;
}

export function formatPrice(listing) {
  const suffix = listing.priceUnit === 'month' ? '/ month' : '/ night';
  return `${formatDZD(listing.price)} ${suffix}`;
}

export function formatShortDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function pluralize(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural || `${singular}s`}`;
}
