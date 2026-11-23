import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { signInUrl } from '../lib/api.js';
import { CheckIcon, KeyIcon, ShieldIcon } from '../components/Icons.jsx';

export default function Login() {
  const { user, loading } = useAuth();
  const location = useLocation();

  const from = location.state?.from || '/owner/dashboard';

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
          Sign in is handled by Freebuff. Saken never sees or stores your password.
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

          <h1>Log in</h1>
          <p>
            Use your Freebuff account to manage your properties and follow up on enquiries. No new
            password to remember.
          </p>

          <div className="demo-note">
            <strong>Sign in with Freebuff</strong> works with Google, GitHub or Apple through your
            Freebuff account. It takes a few seconds and comes back to this page.
          </div>

          <a href={signInUrl(from)} className="btn btn--primary btn--block btn--lg">
            Sign in with Freebuff
          </a>

          <p className="auth-foot">
            New to Saken? <Link to="/signup">Create an account</Link>
          </p>
          <p className="auth-foot" style={{ marginTop: 8 }}>
            <Link to="/">← Continue browsing</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
