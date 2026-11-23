const comparators = {
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  rating: (a, b) => b.rating - a.rating,
};

/**
 * Returns the listings ordered by the given sort key. Unknown keys (including
 * "recommended") keep the order the API returned.
 */
export function sortListings(listings, sort) {
  const compare = comparators[sort];
  return compare ? [...listings].sort(compare) : listings;
}
