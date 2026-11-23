import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';
import { CheckIcon, KeyIcon, ShieldIcon } from '../components/Icons.jsx';

const roles = [
  {
    value: 'tenant',
    label: 'I am looking to rent',
    hint: 'Contact owners and save the places you like',
  },
  {
    value: 'owner',
    label: 'I am an owner or agency',
    hint: 'Publish rentals and holiday stays',
  },
];

export default function Signup() {
  const { user, loading, chooseRole, refresh } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [role, setRole] = useState(params.get('role') === 'owner' ? 'owner' : 'tenant');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);

  async function handleSignUp(event) {
    event.preventDefault();
    setError('');
    setFieldErrors({});

    const next = {};
    if (!name.trim()) next.name = 'Enter the name tenants and guests will see.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) next.email = 'Enter a valid email address.';
    if (password.length < 8) next.password = 'Use at least 8 characters.';
    if (Object.keys(next).length) {
      setFieldErrors(next);
      return;
    }

    setSaving(true);
    try {
      await api.signUp({ name: name.trim(), email: email.trim(), password });
      await refresh();
      const profile = await chooseRole(role);
      navigate(profile.role === 'owner' ? '/owner/dashboard' : '/rentals', { replace: true });
    } catch (requestError) {
      if (requestError.status === 422 || /exist/i.test(requestError.message)) {
        setError('An account already uses that email. Try logging in instead.');
      } else if (Object.keys(requestError.errors ?? {}).length) {
        setFieldErrors(requestError.errors);
      } else {
        setError(requestError.message);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleContinue() {
    setSaving(true);
    setError('');
    try {
      const profile = await chooseRole(role);
      navigate(profile.role === 'owner' ? '/owner/dashboard' : '/rentals', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
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
          <h2>A calmer way to rent in Algeria.</h2>
          <p>
            Whether you are moving to a new wilaya or letting a family flat, everything starts with
            a free account.
          </p>
          <ul className="auth-aside__list">
            <li>
              <CheckIcon /> Sample rentals from Algiers to Djanet
            </li>
            <li>
              <CheckIcon /> Hotels and vacation stays kept separate
            </li>
            <li>
              <CheckIcon /> Verified owners, written terms, no tenant fees
            </li>
          </ul>
        </div>

        <p style={{ fontSize: '0.8rem' }}>
          <ShieldIcon width={14} height={14} style={{ verticalAlign: '-2px', marginRight: 6 }} />
          Your account is created directly on Saken, with a password only you know.
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

          {loading ? (
            <p style={{ color: 'var(--muted)' }}>Checking your session…</p>
          ) : user ? (
            <>
              <h1>One last step</h1>
              <p>
                How will you use Saken, {user.name.split(' ')[0]}? You can change this later from
                your account.
              </p>

              {error && (
                <div className="inline-alert inline-alert--error">
                  <ShieldIcon />
                  <span>{error}</span>
                </div>
              )}

              <div className="role-choice">
                {roles.map((option) => (
                  <label
                    key={option.value}
                    className={role === option.value ? 'is-selected' : undefined}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={option.value}
                      checked={role === option.value}
                      onChange={() => setRole(option.value)}
                    />
                    <strong>{option.label}</strong>
                    <span>{option.hint}</span>
                  </label>
                ))}
              </div>

              <button
                type="button"
                className="btn btn--primary btn--block btn--lg"
                onClick={handleContinue}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Continue'}
              </button>

              <p className="auth-foot">Signed in as {user.email || user.name}.</p>
            </>
          ) : (
            <>
              <h1>Create your account</h1>
              <p>Two minutes, no fees. You can switch between renting and listing later.</p>

              {error && (
                <div className="inline-alert inline-alert--error" role="alert" style={{ marginBottom: 18 }}>
                  <ShieldIcon />
                  <span>{error}</span>
                </div>
              )}

              <div className="role-choice">
                {roles.map((option) => (
                  <label
                    key={option.value}
                    className={role === option.value ? 'is-selected' : undefined}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={option.value}
                      checked={role === option.value}
                      onChange={() => setRole(option.value)}
                    />
                    <strong>{option.label}</strong>
                    <span>{option.hint}</span>
                  </label>
                ))}
              </div>

              <form onSubmit={handleSignUp} noValidate>
                <div className="field">
                  <label htmlFor="name">Full name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    aria-invalid={Boolean(fieldErrors.name)}
                    required
                  />
                  {fieldErrors.name && (
                    <span className="field__error" role="alert">
                      {fieldErrors.name}
                    </span>
                  )}
                </div>

                <div className="field">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    aria-invalid={Boolean(fieldErrors.email)}
                    required
                  />
                  {fieldErrors.email && (
                    <span className="field__error" role="alert">
                      {fieldErrors.email}
                    </span>
                  )}
                </div>

                <div className="field">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    aria-invalid={Boolean(fieldErrors.password)}
                    minLength={8}
                    required
                  />
                  {fieldErrors.password ? (
                    <span className="field__error" role="alert">
                      {fieldErrors.password}
                    </span>
                  ) : (
                    <span className="field__hint">At least 8 characters.</span>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn--primary btn--block btn--lg"
                  style={{ marginTop: 20 }}
                  disabled={saving}
                >
                  {saving ? 'Creating your account…' : 'Create my account'}
                </button>
              </form>

              <p className="auth-foot">
                Already have an account? <Link to="/login">Log in</Link>
              </p>
            </>
          )}

          <p className="auth-foot" style={{ marginTop: 8 }}>
            <Link to="/">← Continue browsing</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
