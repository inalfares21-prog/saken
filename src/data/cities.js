/**
 * The cities Saken covers. Shared by the UI (filters, city cards) and by the
 * Worker, which only accepts these names when a listing is created.
 */
export const cities = [
  {
    name: 'Algiers',
    arabicName: 'الجزائر',
    tagline: 'The white city by the bay',
    image: '/images/hero-algiers.jpg',
  },
  {
    name: 'Oran',
    arabicName: 'وهران',
    tagline: 'Sea air and late-night cafés',
    image: '/images/oran-balcony.jpg',
  },
  {
    name: 'Constantine',
    arabicName: 'قسنطينة',
    tagline: 'Bridges over the Rhumel gorge',
    image: '/images/constantine-view.jpg',
  },
  {
    name: 'Ghardaïa',
    arabicName: 'غرداية',
    tagline: 'Ochre lanes of the M’zab',
    image: '/images/ghardaia-house.jpg',
  },
  {
    name: 'Tipaza',
    arabicName: 'تيبازة',
    tagline: 'Roman ruins and quiet coves',
    image: '/images/tipaza-villa.jpg',
  },
  {
    name: 'Béjaïa',
    arabicName: 'بجاية',
    tagline: 'Pines meeting the Mediterranean',
    image: '/images/bejaia-bungalow.jpg',
  },
  {
    name: 'Djanet',
    arabicName: 'جانت',
    tagline: 'Dunes and Tassili nights',
    image: '/images/sahara-camp.jpg',
  },
];

export const cityOptions = ['All cities', ...cities.map((city) => city.name)];

export const propertyTypes = [
  { value: 'any', label: 'Any type' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
];
