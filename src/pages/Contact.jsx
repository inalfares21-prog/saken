import { useState } from 'react';
import { api } from '../lib/api.js';
import { CheckIcon, MailIcon, MapPinIcon, PhoneIcon, ShieldIcon } from '../components/Icons.jsx';

const topics = {
  renting: 'About renting a home',
  listing: 'About listing a property',
  stays: 'About hotels & vacation stays',
  other: 'Something else',
};

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const get = (key) => String(data.get(key) ?? '').trim();

    setSending(true);
    setError('');
    try {
      await api.sendEnquiry({
        name: get('contact-name'),
        email: get('contact-email'),
        message: `${topics[get('contact-topic')] ?? topics.other}: ${get('contact-message')}`,
      });
      setSent(true);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <div className="page-head">
        <div className="wrap">
          <span className="eyebrow">Contact</span>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginTop: 14 }}>Talk to the team</h1>
          <p>
            Questions about a listing, the verification process or publishing a property — write to
            us and we will come back within two working days.
          </p>
        </div>
      </div>

      <div className="wrap" style={{ paddingBottom: 90 }}>
        <div className="contact-grid">
          <div className="form-section">
            {sent ? (
              <div className="empty-state" style={{ border: 0, padding: '40px 10px' }}>
                <span className="step__icon" style={{ margin: '0 auto 18px' }}>
                  <CheckIcon />
                </span>
                <h3>Message received</h3>
                <p>
                  Thank you — your message is stored with the Saken team. We come back within two
                  working days.
                </p>
                <button type="button" className="btn btn--ghost" onClick={() => setSent(false)}>
                  Send another message
                </button>
              </div>
            ) : (
              <form className="auth-form" onSubmit={handleSubmit}>
                {error && (
                  <div className="inline-alert inline-alert--error" role="alert">
                    <ShieldIcon />
                    <span>{error}</span>
                  </div>
                )}
                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="contact-name">Your name</label>
                    <input
                      id="contact-name"
                      name="contact-name"
                      type="text"
                      placeholder="Amel Bouzid"
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="contact-email">Email</label>
                    <input
                      id="contact-email"
                      name="contact-email"
                      type="email"
                      placeholder="you@example.dz"
                      required
                    />
                  </div>
                  <div className="field field--full">
                    <label htmlFor="contact-topic">What is this about?</label>
                    <select id="contact-topic" name="contact-topic" defaultValue="renting">
                      <option value="renting">Renting a home</option>
                      <option value="listing">Listing a property</option>
                      <option value="stays">Hotels &amp; vacation stays</option>
                      <option value="other">Something else</option>
                    </select>
                  </div>
                  <div className="field field--full">
                    <label htmlFor="contact-message">Message</label>
                    <textarea
                      id="contact-message"
                      name="contact-message"
                      placeholder="Tell us what you need — the city, the budget, the dates."
                      required
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <p>We never share your details with owners until you ask us to.</p>
                  <button type="submit" className="btn btn--primary btn--lg" disabled={sending}>
                    {sending ? 'Sending…' : 'Send message'}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div>
            <div className="contact-card">
              <h3>Direct lines</h3>
              <ul>
                <li>
                  <MailIcon />
                  <div>
                    <strong>Email</strong>
                    hello@saken.dz
                  </div>
                </li>
                <li>
                  <PhoneIcon />
                  <div>
                    <strong>Tenants &amp; owners</strong>
                    +213 (0) 23 00 00 00
                  </div>
                </li>
                <li>
                  <MapPinIcon />
                  <div>
                    <strong>Office</strong>
                    12 Rue Didouche Mourad, Algiers Centre
                  </div>
                </li>
              </ul>
            </div>

            <div className="inline-alert" style={{ marginTop: 18 }}>
              <ShieldIcon />
              <span>
                This is a prototype. Phone numbers and addresses are placeholders, but messages
                are stored with the team.
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
