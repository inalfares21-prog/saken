import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';
import { CheckIcon, KeyIcon, ShieldIcon } from '../components/Icons.jsx';

export default function Login() {
  const { user, loading, refresh } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const from = location.state?.from || '/owner/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const initialAdmin =
    new URLSearchParams(location.search).get('admin') === '1' ||
    location.state?.from === '/admin';
  const [adminMode, setAdminMode] = useState(initialAdmin);

  if (loading) {
    return (
      <div className="auth-shell">
        <div className="auth-main">
          <div className="auth-card">
            <p style={{ color: 'var(--muted)' }}>Checking your session…</p>
          </div>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSending(true);
    try {
      await api.signIn({ email: email.trim(), password });
      await refresh();
      const profile = await api.me();
      if (adminMode && profile?.role !== 'admin') {
        await api.signOut();
        await refresh();
        setError('That account is not an administrator.');
        return;
      }
      navigate(adminMode ? '/admin' : from, { replace: true });
    } catch (requestError) {
      setError(
        requestError.status === 401
          ? 'That email and password do not match an account.'
          : requestError.message,
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <Link to="/" className="brand">
          <span className="brand__mark" aria-hidden="true">
            <KeyIcon />
          </span>
          <span>Saken</span>
        </Link>

        <div>
          <h2>Welcome back to your listings.</h2>
          <p>
            One account for long-term rentals and holiday stays, with tenants and guests reaching
            you directly.
          </p>
          <ul className="auth-aside__list">
            <li>
              <CheckIcon /> Edit and publish properties from your dashboard
            </li>
            <li>
              <CheckIcon /> Read every enquiry about your listings
            </li>
            <li>
              <CheckIcon /> Reply to tenants without an agency in between
            </li>
          </ul>
        </div>

        <p style={{ fontSize: '0.8rem' }}>
          <ShieldIcon width={14} height={14} style={{ verticalAlign: '-2px', marginRight: 6 }} />
          Your password is stored as a salted hash in Saken&apos;s own database — nobody can read it
          back.
        </p>
      </aside>

      <div className="auth-main">
        <div className="auth-card">
          <Link to="/" className="brand" style={{ marginBottom: 28 }}>
            <span className="brand__mark" aria-hidden="true">
              <KeyIcon />
            </span>
            <span>
              Saken
              <small>Rent in Algeria</small>
            </span>
          </Link>

          <h1>{adminMode ? 'Administrator login' : 'Log in'}</h1>
          <p>
            {adminMode
              ? 'Sign in with an administrator account to review and publish listings.'
              : 'Sign in with the email and password you used to create your Saken account.'}
          </p>

          {error && (
            <div className="inline-alert inline-alert--error" role="alert" style={{ marginBottom: 18 }}>
              <ShieldIcon />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn--primary btn--block btn--lg"
              style={{ marginTop: 20 }}
              disabled={sending}
            >
              {sending ? 'Signing in…' : 'Log in'}
            </button>
          </form>

          <p className="auth-foot">
            {adminMode ? (
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => {
                  setAdminMode(false);
                  setError('');
                }}
              >
                ← Back to standard login
              </button>
            ) : (
              <>
                New to Saken? <Link to="/signup">Create an account</Link>
              </>
            )}
          </p>
          <p className="auth-foot" style={{ marginTop: 8 }}>
            <Link to="/">← Continue browsing</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
