import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRightIcon,
  BuildingIcon,
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  KeyIcon,
  MapPinIcon,
  MessageIcon,
  ShieldIcon,
  SunIcon,
} from '../components/Icons.jsx';

const faqs = [
  {
    question: 'Does Saken charge tenants anything?',
    answer:
      'No. Browsing, contacting owners and arranging viewings are free for tenants. Listing a property is free during the prototype as well — no fees on either side yet.',
  },
  {
    question: 'How are owners verified?',
    answer:
      'Before a listing goes live, the owner uploads an identity document and proof that the property is theirs to rent — a title deed, a lease or a mandate from the owner. We check the name on the papers matches the account.',
  },
  {
    question: 'Why are hotels and vacation rentals in a separate section?',
    answer:
      'A nightly rate and a monthly rent are not comparable, and the terms are different. Keeping short stays apart means tenants can compare monthly rents honestly, and travellers get availability, check-in times and nightly pricing without noise.',
  },
  {
    question: 'Can I list both a family flat and a holiday villa?',
    answer:
      'Yes — one account covers both. Choose “long-term rental” or “hotel or vacation stay” on the listing form, and the property appears in the matching section.',
  },
  {
    question: 'Is Saken live yet?',
    answer:
      'Not yet — this is a working prototype. Accounts, listings and enquiries are stored on a real backend, but the starting listings are sample data, photo uploads are not open, and listings are checked by hand before going public.',
  },
];

export default function HowItWorks() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <>
      <div className="page-head">
        <div className="wrap">
          <span className="eyebrow">How Saken works</span>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginTop: 14 }}>
            A rental market that shows its working
          </h1>
          <p>
            Algeria has plenty of empty flats and plenty of people looking for one. What is missing
            is a place where the rent, the terms and the owner are all visible before you call.
          </p>
        </div>
      </div>

      <section className="section section--tight" style={{ paddingTop: 10 }}>
        <div className="wrap">
          <div className="split">
            <div className="card" style={{ padding: 32 }}>
              <span className="step__icon">
                <MapPinIcon />
              </span>
              <h2 style={{ fontSize: '1.6rem', marginBottom: 10 }}>If you are renting</h2>
              <ul className="prose" style={{ display: 'grid', gap: 12 }}>
                {[
                  'Search by city and monthly budget, then filter by property type and furnishing.',
                  'Read the rent, deposit and notice period before you message anyone.',
                  'Send a viewing request straight to the owner or agency.',
                  'Agree the terms together — Saken keeps the listing and the owner’s details on record.',
                ].map((item) => (
                  <li key={item} style={{ display: 'flex', gap: 10, color: 'var(--ink-soft)' }}>
                    <CheckIcon width={17} height={17} style={{ color: 'var(--pine)', flexShrink: 0, marginTop: 4 }} />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/rentals" className="btn btn--primary" style={{ marginTop: 24 }}>
                Browse rentals
                <ArrowRightIcon width={16} height={16} />
              </Link>
            </div>

            <div className="card" style={{ padding: 32 }}>
              <span className="step__icon">
                <KeyIcon />
              </span>
              <h2 style={{ fontSize: '1.6rem', marginBottom: 10 }}>If you are listing</h2>
              <ul className="prose" style={{ display: 'grid', gap: 12 }}>
                {[
                  'Create one account for your long-term rentals and your holiday properties.',
                  'Fill in the property, the rent and the terms — practical details get better enquiries.',
                  'We check your identity and papers, then the listing goes live.',
                  'Manage viewings and enquiries from the owner dashboard.',
                ].map((item) => (
                  <li key={item} style={{ display: 'flex', gap: 10, color: 'var(--ink-soft)' }}>
                    <CheckIcon width={17} height={17} style={{ color: 'var(--pine)', flexShrink: 0, marginTop: 4 }} />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/list-property" className="btn btn--primary" style={{ marginTop: 24 }}>
                List your property
                <ArrowRightIcon width={16} height={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--sand">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow">Two sections, on purpose</span>
              <h2>Long-term homes and short stays</h2>
            </div>
          </div>

          <div className="grid grid--2">
            <div className="card" style={{ padding: 30 }}>
              <span className="badge badge--pine">For tenants</span>
              <h3 style={{ marginTop: 14, fontSize: '1.4rem' }}>Long-term rentals</h3>
              <p style={{ color: 'var(--muted)', marginTop: 8 }}>
                Monthly rents, year-long leases and family homes. Furnished or not, with parking,
                water tanks and heating stated clearly. Prices per month in dinars.
              </p>
              <ul className="amenities" style={{ marginTop: 18, gridTemplateColumns: '1fr' }}>
                <li>
                  <BuildingIcon /> Apartments, houses and whole floors
                </li>
                <li>
                  <CalendarIcon /> Move-in dates and notice periods
                </li>
                <li>
                  <MessageIcon /> Direct contact with the owner
                </li>
              </ul>
            </div>

            <div className="card" style={{ padding: 30 }}>
              <span className="badge badge--clay">For travellers</span>
              <h3 style={{ marginTop: 14, fontSize: '1.4rem' }}>Hotels &amp; vacation stays</h3>
              <p style={{ color: 'var(--muted)', marginTop: 8 }}>
                Nightly rates for hotels, guesthouses, villas and desert camps. Check-in and
                check-out times, what breakfast includes, and how far the beach really is.
              </p>
              <ul className="amenities" style={{ marginTop: 18, gridTemplateColumns: '1fr' }}>
                <li>
                  <SunIcon /> Coastal villas and pine-shaded bungalows
                </li>
                <li>
                  <ShieldIcon /> Hotels with verified star ratings
                </li>
                <li>
                  <MapPinIcon /> Desert camps and M’zab guesthouses
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow">Questions</span>
              <h2>What people ask first</h2>
            </div>
          </div>

          <div className="faq">
            {faqs.map((faq, index) => (
              <div className={`faq__item${openIndex === index ? ' is-open' : ''}`} key={faq.question}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                  aria-expanded={openIndex === index}
                >
                  {faq.question}
                  <ChevronDownIcon />
                </button>
                {openIndex === index && <p className="faq__answer">{faq.answer}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tight">
        <div className="wrap">
          <div className="cta-band">
            <div>
              <h2>Still deciding? Start with a look around.</h2>
              <p>
                The listings are sample data, but every page is real: filters, detail views, owner
                dashboard and the listing form.
              </p>
            </div>
            <div className="cta-band__actions">
              <Link to="/rentals" className="btn btn--light btn--lg">
                Browse rentals
              </Link>
              <Link
                to="/contact"
                className="btn btn--ghost btn--lg"
                style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.35)' }}
              >
                Ask a question
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
