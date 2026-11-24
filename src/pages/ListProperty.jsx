import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { cities } from '../data/cities.js';
import { api } from '../lib/api.js';
import { ImageError, prepareImage } from '../lib/images.js';
import { formatShortDate } from '../lib/format.js';
import { CheckIcon, ShieldIcon, SunIcon } from '../components/Icons.jsx';

const purposes = [
  { value: 'rental', label: 'Long-term rental', hint: 'Monthly rent to a tenant' },
  { value: 'stay', label: 'Hotel or vacation stay', hint: 'Nightly bookings for travellers' },
];

const requiredFields = [
  'title',
  'city',
  'district',
  'area',
  'description',
  'price',
  'contact-name',
  'contact-phone',
  'contact-email',
];

const amenityOptions = [
  'Furnished',
  'Air conditioning',
  'Heating',
  'Elevator',
  'Private parking',
  'Balcony',
  'Fibre internet',
  'Equipped kitchen',
  'Water tank',
  'Roof terrace',
];

const photoOptions = [
  { value: '/images/apt-hydra.jpg', label: 'Apartment, Algiers' },
  { value: '/images/casbah-riad.jpg', label: 'Courtyard house, Casbah' },
  { value: '/images/constantine-view.jpg', label: 'Apartment, Constantine' },
  { value: '/images/oran-balcony.jpg', label: 'Seafront flat, Oran' },
  { value: '/images/ghardaia-house.jpg', label: 'M’zab house, Ghardaïa' },
  { value: '/images/tipaza-villa.jpg', label: 'Villa with pool, Tipaza' },
  { value: '/images/bejaia-bungalow.jpg', label: 'Bungalow, Béjaïa' },
  { value: '/images/sahara-camp.jpg', label: 'Desert camp, Djanet' },
  { value: '/images/hotel-pool.jpg', label: 'Hotel with pool' },
  { value: '/images/hero-algiers.jpg', label: 'Algiers bay view' },
];

// The Worker names its validation errors after the payload, not the form fields.
const serverFieldNames = {
  contactName: 'contact-name',
  contactPhone: 'contact-phone',
  contactEmail: 'contact-email',
};

function fieldMessages(purpose) {
  return {
    title: 'Give the listing a title of at least 6 characters.',
    city: 'Choose the city the property is in.',
    district: 'Enter the district or neighbourhood.',
    area: 'Enter the surface area (at least 10 m²).',
    description: 'Add a short description of the place.',
    price:
      purpose === 'rental'
        ? 'Enter the monthly rent in dinars.'
        : 'Enter the nightly rate in dinars.',
    'contact-name': 'Enter your full name.',
    'contact-phone': 'Enter a phone number tenants can reach you on.',
    'contact-email': 'Enter a valid email address.',
  };
}

export default function ListProperty() {
  const { isAuthenticated, user } = useAuth();
  const formRef = useRef(null);
  const [purpose, setPurpose] = useState('rental');
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  // `needsSignIn` gates the sign-up/log-in links: a network or server failure
  // has nothing to do with the visitor's account, so it must not offer them.
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  // The prepared JPEG and its local preview. Uploaded on submit, not on pick,
  // so an abandoned form leaves nothing behind on the server.
  const [photo, setPhoto] = useState(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const objectUrl = useRef(null);

  useEffect(() => () => {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
  }, []);

  function clearPhoto() {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = null;
    setPhoto(null);
    setErrors((previous) => {
      const next = { ...previous };
      delete next.image;
      return next;
    });
  }

  async function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    // Clearing the input lets the same file be chosen again after a refusal.
    event.target.value = '';
    if (!file) return;

    setPhotoBusy(true);
    try {
      const prepared = await prepareImage(file);
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
      objectUrl.current = prepared.previewUrl;
      setPhoto(prepared);
      setErrors((previous) => {
        const next = { ...previous };
        delete next.image;
        return next;
      });
    } catch (photoError) {
      clearPhoto();
      setErrors((previous) => ({
        ...previous,
        image:
          photoError instanceof ImageError
            ? photoError.message
            : 'That photo could not be prepared. Try another one.',
      }));
    } finally {
      setPhotoBusy(false);
    }
  }

  function validateFields() {
    const form = formRef.current;
    if (!form) return [];
    const messages = fieldMessages(purpose);
    const next = {};
    requiredFields.forEach((name) => {
      const field = form.elements.namedItem(name);
      if (!field) return;
      const empty = !String(field.value ?? '').trim();
      const invalid =
        empty ||
        field.validity?.typeMismatch ||
        field.validity?.rangeUnderflow ||
        field.validity?.badInput;
      if (invalid) next[name] = messages[name];
    });
    setErrors(next);
    return Object.keys(next);
  }

  function focusField(name) {
    const field = formRef.current?.elements.namedItem(name);
    field?.focus();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!isAuthenticated) {
      setErrors({});
      setError({
        message: 'Create a free account to publish a listing — it takes a minute.',
        needsSignIn: true,
      });
      return;
    }
    setError(null);
    const invalid = validateFields();
    if (invalid.length) {
      focusField(invalid[0]);
      return;
    }

    const form = formRef.current;
    const get = (name) => String(form.elements.namedItem(name)?.value ?? '').trim();
    const amenities = [...form.querySelectorAll('input[name="amenities"]:checked')].map(
      (input) => input.value,
    );
    const available = get('available');

    setSending(true);
    try {
      const uploadedImage = photo ? await api.uploadImage(photo.blob) : '';
      await api.createListing({
        kind: purpose,
        title: get('title'),
        city: get('city'),
        district: get('district'),
        description: get('description'),
        area: get('area'),
        price: get('price'),
        beds: get('beds'),
        baths: get('baths'),
        guests: get('guests'),
        furnished: get('furnished') === 'furnished',
        available: available ? `Available from ${formatShortDate(available)}` : '',
        image: uploadedImage || get('image'),
        amenities,
        contact: {
          name: get('contact-name'),
          phone: get('contact-phone'),
          email: get('contact-email'),
        },
      });
      setErrors({});
      setSubmitted(true);
    } catch (requestError) {
      const next = {};
      Object.entries(requestError.errors ?? {}).forEach(([key, message]) => {
        next[serverFieldNames[key] ?? key] = message;
      });
      setErrors(next);
      if (requestError.status === 401) {
        setError({
          message: 'Your session has expired. Sign in again to publish this listing.',
          needsSignIn: true,
        });
      } else if (Object.keys(next).length === 0) {
        setError({
          message:
            requestError.status === 0
              ? 'Could not reach the Saken server. Check your connection and try again.'
              : requestError.message,
          needsSignIn: false,
        });
      } else {
        setError(null);
      }
      const [first] = Object.keys(next);
      if (first) focusField(first);
    } finally {
      setSending(false);
    }
  }

  function handleFormChange(event) {
    const name = event.target.name;
    if (!name || !errors[name]) return;
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  const errorCount = Object.keys(errors).length;

  if (submitted) {
    return (
      <div className="wrap section">
        <div className="empty-state" style={{ maxWidth: 620, margin: '0 auto' }}>
          <span className="step__icon" style={{ margin: '0 auto 18px' }}>
            <CheckIcon />
          </span>
          <h3>Listing submitted for review</h3>
          <p>
            Thanks, {user?.name.split(' ')[0]}. Your {purpose === 'rental' ? 'rental' : 'stay'} is
            saved to your account and sits in the review queue until an editor checks the details
            and photos.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/owner/dashboard" className="btn btn--primary">
              Go to owner dashboard
            </Link>
            <Link to="/rentals" className="btn btn--ghost">
              Browse rentals
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-head">
        <div className="wrap">
          <span className="eyebrow">For owners</span>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginTop: 14 }}>List your property</h1>
          <p>
            One form for both sections: choose whether you are renting long-term or taking nightly
            guests. You stay in control of viewings, prices and the final agreement.
          </p>
        </div>
      </div>

      <div className="wrap" style={{ paddingBottom: 90 }}>
        <div className="detail" style={{ alignItems: 'start' }}>
          {/* noValidate: every field is checked in handleSubmit so the inline messages are the
              single source of feedback instead of the browser's per-field popups. */}
          <form ref={formRef} onSubmit={handleSubmit} onChange={handleFormChange} noValidate>
            {error && (
              <div className="inline-alert inline-alert--error" style={{ marginBottom: 18 }}>
                <ShieldIcon />
                <span>
                  {error.message}
                  {error.needsSignIn && (
                    <>
                      {' '}
                      <Link to="/signup" style={{ textDecoration: 'underline', fontWeight: 600 }}>
                        Create an account
                      </Link>{' '}
                      or{' '}
                      <Link to="/login" style={{ textDecoration: 'underline', fontWeight: 600 }}>
                        log in
                      </Link>
                      .
                    </>
                  )}
                </span>
              </div>
            )}

            {errorCount > 0 && (
              <div className="inline-alert inline-alert--error" style={{ marginBottom: 18 }} role="alert">
                <ShieldIcon />
                <span>
                  Please fix the highlighted {errorCount === 1 ? 'field' : `${errorCount} fields`} before
                  submitting.
                </span>
              </div>
            )}

            <div className="form-section">
              <div className="form-section__head">
                <span>01</span>
                <h2>What are you listing?</h2>
              </div>
              <div className="role-choice">
                {purposes.map((option) => (
                  <label
                    key={option.value}
                    className={purpose === option.value ? 'is-selected' : undefined}
                  >
                    <input
                      type="radio"
                      name="purpose"
                      value={option.value}
                      checked={purpose === option.value}
                      onChange={() => setPurpose(option.value)}
                    />
                    <strong>{option.label}</strong>
                    <span>{option.hint}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-section">
              <div className="form-section__head">
                <span>02</span>
                <h2>Where is it?</h2>
              </div>
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="city">City</label>
                  <select
                    id="city"
                    name="city"
                    defaultValue=""
                    required
                    aria-invalid={Boolean(errors.city)}
                    aria-describedby={errors.city ? 'city-error' : undefined}
                  >
                    <option value="" disabled>
                      Choose a city
                    </option>
                    {cities.map((city) => (
                      <option key={city.name} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                  {errors.city && (
                    <span className="field__error" id="city-error" role="alert">
                      {errors.city}
                    </span>
                  )}
                </div>
                <div className="field">
                  <label htmlFor="district">District / neighbourhood</label>
                  <input
                    id="district"
                    name="district"
                    type="text"
                    placeholder="e.g. Hydra, El Kantara"
                    required
                    aria-invalid={Boolean(errors.district)}
                    aria-describedby={errors.district ? 'district-error' : undefined}
                  />
                  {errors.district && (
                    <span className="field__error" id="district-error" role="alert">
                      {errors.district}
                    </span>
                  )}
                </div>
                <div className="field field--full">
                  <label htmlFor="address">Street address</label>
                  <input id="address" type="text" placeholder="Shared privately with tenants" />
                  <span className="field__hint">
                    Only the district is shown publicly. The full address is given to tenants you
                    approve.
                  </span>
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section__head">
                <span>03</span>
                <h2>The property</h2>
              </div>
              <div className="form-grid form-grid--3">
                <div className="field field--full">
                  <label htmlFor="title">Listing title</label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    placeholder="Sunlit two-bedroom with a balcony in Hydra"
                    required
                    aria-invalid={Boolean(errors.title)}
                    aria-describedby={errors.title ? 'title-error' : undefined}
                  />
                  {errors.title ? (
                    <span className="field__error" id="title-error" role="alert">
                      {errors.title}
                    </span>
                  ) : (
                    <span className="field__hint">What a tenant sees first — street, light, size.</span>
                  )}
                </div>
                <div className="field">
                  <label htmlFor="beds">Bedrooms</label>
                  <select id="beds" name="beds" defaultValue="2">
                    {[1, 2, 3, 4, 5, 6].map((count) => (
                      <option key={count} value={count}>
                        {count}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="baths">Bathrooms</label>
                  <select id="baths" name="baths" defaultValue="1">
                    {[1, 2, 3, 4].map((count) => (
                      <option key={count} value={count}>
                        {count}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="area">Surface (m²)</label>
                  <input
                    id="area"
                    name="area"
                    type="number"
                    min="10"
                    placeholder="90"
                    required
                    aria-invalid={Boolean(errors.area)}
                    aria-describedby={errors.area ? 'area-error' : undefined}
                  />
                  {errors.area && (
                    <span className="field__error" id="area-error" role="alert">
                      {errors.area}
                    </span>
                  )}
                </div>
                <div className="field">
                  <label htmlFor="guests">Guests</label>
                  <input id="guests" name="guests" type="number" min="1" defaultValue="4" />
                </div>
                <div className="field">
                  <label htmlFor="furnished">Furnishing</label>
                  <select id="furnished" name="furnished" defaultValue="furnished">
                    <option value="furnished">Furnished</option>
                    <option value="unfurnished">Unfurnished</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="available">Available from</label>
                  <input id="available" name="available" type="date" />
                </div>
                <div className="field field--full">
                  <label htmlFor="description">Describe the place</label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Light, quiet, close to the tram… mention the water tank, heating and what is included in the rent."
                    required
                    aria-invalid={Boolean(errors.description)}
                    aria-describedby={errors.description ? 'description-error' : undefined}
                  />
                  {errors.description ? (
                    <span className="field__error" id="description-error" role="alert">
                      {errors.description}
                    </span>
                  ) : (
                    <span className="field__hint">
                      Owners who mention practical details get warmer enquiries.
                    </span>
                  )}
                </div>
                <div className="field field--full">
                  <span>What’s included</span>
                  <div className="amenity-picker">
                    {amenityOptions.map((amenity) => (
                      <label key={amenity} className="switch-row">
                        <input type="checkbox" name="amenities" value={amenity} />
                        {amenity}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section__head">
                <span>04</span>
                <h2>Price &amp; terms</h2>
              </div>
              <div className="form-grid form-grid--3">
                <div className="field">
                  <label htmlFor="price">
                    {purpose === 'rental' ? 'Monthly rent (DA)' : 'Nightly rate (DA)'}
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="1000"
                    placeholder={purpose === 'rental' ? '85000' : '14000'}
                    required
                    aria-invalid={Boolean(errors.price)}
                    aria-describedby={errors.price ? 'price-error' : undefined}
                  />
                  {errors.price && (
                    <span className="field__error" id="price-error" role="alert">
                      {errors.price}
                    </span>
                  )}
                </div>
                <div className="field">
                  <label htmlFor="deposit">Deposit (DA)</label>
                  <input id="deposit" type="number" min="0" placeholder={purpose === 'rental' ? '85000' : '0'} />
                </div>
                <div className="field">
                  <label htmlFor="notice">Notice period</label>
                  <select id="notice" defaultValue="1 month">
                    <option>1 month</option>
                    <option>2 months</option>
                    <option>Flexible</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section__head">
                <span>05</span>
                <h2>Photos &amp; contact</h2>
              </div>
              <div className="form-grid">
                <div className="field field--full">
                  <label htmlFor="image-file">Main photo</label>
                  <div className="photo-upload">
                    <div className="photo-upload__frame">
                      {photo ? (
                        <img src={photo.previewUrl} alt="Your listing photo" />
                      ) : (
                        <span>No photo yet</span>
                      )}
                    </div>
                    <div className="photo-upload__body">
                      <input
                        id="image-file"
                        name="photo-file"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handlePhotoChange}
                        disabled={photoBusy}
                        aria-describedby="image-hint"
                      />
                      <span className="field__hint" id="image-hint">
                        JPEG, PNG or WebP up to 25 MB. The photo is resized in your browser, then
                        checked again on the server — other file types are refused.
                      </span>

                      {photo && (
                        <span className="field__hint">
                          Ready to upload · {Math.round(photo.blob.size / 1024)} KB ·{' '}
                          {photo.width}×{photo.height}
                        </span>
                      )}

                      {photo && (
                        <button type="button" className="btn btn--ghost btn--sm" onClick={clearPhoto}>
                          Remove photo
                        </button>
                      )}

                      {!photo && (
                        <>
                          <label htmlFor="image" className="photo-upload__label">
                            Or start from a sample photo
                          </label>
                          <select id="image" name="image" defaultValue="">
                            <option value="">No photo — use the section default</option>
                            {photoOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </>
                      )}
                    </div>
                  </div>
                  {photoBusy && <span className="field__hint">Preparing the photo…</span>}
                  {errors.image && (
                    <span className="field__error" role="alert">
                      {errors.image}
                    </span>
                  )}
                </div>
                <div className="field">
                  <label htmlFor="contact-name">Your name</label>
                  <input
                    id="contact-name"
                    name="contact-name"
                    type="text"
                    defaultValue={user?.name || ''}
                    required
                    aria-invalid={Boolean(errors['contact-name'])}
                    aria-describedby={errors['contact-name'] ? 'contact-name-error' : undefined}
                  />
                  {errors['contact-name'] && (
                    <span className="field__error" id="contact-name-error" role="alert">
                      {errors['contact-name']}
                    </span>
                  )}
                </div>
                <div className="field">
                  <label htmlFor="contact-phone">Phone</label>
                  <input
                    id="contact-phone"
                    name="contact-phone"
                    type="tel"
                    placeholder="+213 5 00 00 00 00"
                    required
                    aria-invalid={Boolean(errors['contact-phone'])}
                    aria-describedby={errors['contact-phone'] ? 'contact-phone-error' : undefined}
                  />
                  {errors['contact-phone'] && (
                    <span className="field__error" id="contact-phone-error" role="alert">
                      {errors['contact-phone']}
                    </span>
                  )}
                </div>
                <div className="field field--full">
                  <label htmlFor="contact-email">Email</label>
                  <input
                    id="contact-email"
                    name="contact-email"
                    type="email"
                    defaultValue={user?.email || ''}
                    required
                    aria-invalid={Boolean(errors['contact-email'])}
                    aria-describedby={errors['contact-email'] ? 'contact-email-error' : undefined}
                  />
                  {errors['contact-email'] && (
                    <span className="field__error" id="contact-email-error" role="alert">
                      {errors['contact-email']}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="form-actions">
              <p>
                By publishing you confirm the property is yours to rent and the details are
                accurate.
              </p>
              <button
                type="submit"
                className="btn btn--primary btn--lg"
                disabled={sending || photoBusy}
              >
                {sending ? 'Saving…' : 'Save & submit for review'}
              </button>
            </div>
          </form>

          <aside>
            <div className="booking-card">
              <h3 style={{ fontSize: '1.15rem', marginBottom: 12 }}>Listing on Saken</h3>
              <ul className="assurance" style={{ marginTop: 0, paddingTop: 0, borderTop: 0 }}>
                <li>
                  <CheckIcon /> Free to publish during the launch period
                </li>
                <li>
                  <ShieldIcon /> Owner identity checked before going live
                </li>
                <li>
                  <SunIcon /> One account for rentals and holiday stays
                </li>
              </ul>
              <div className="inline-alert" style={{ marginTop: 18 }}>
                <ShieldIcon />
                <span>
                  Tip: listings with photos, a clear rent and the deposit stated get around three
                  times more enquiries.
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
