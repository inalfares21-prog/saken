import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Footer from './Footer.jsx';
import { CloseIcon, KeyIcon, LogOutIcon, MenuIcon, PlusIcon, UserIcon } from './Icons.jsx';

const mainLinks = [
  { to: '/rentals', label: 'Rentals' },
  { to: '/stays', label: 'Hotels & stays' },
  { to: '/list-property', label: 'List your property' },
  { to: '/how-it-works', label: 'How it works' },
];

export default function Layout() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function onPointerDown(event) {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  const initials = user
    ? user.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase()
    : '';

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="wrap site-header__inner">
          <Link to="/" className="brand" aria-label="Saken home">
            <span className="brand__mark" aria-hidden="true">
              <KeyIcon />
            </span>
            <span>
              Saken
              <small>Rent in Algeria</small>
            </span>
          </Link>

          <nav className="nav" aria-label="Main navigation">
            {mainLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => (isActive ? 'is-active' : undefined)}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="header-actions">
            {user ? (
              <div className="account" ref={accountRef}>
                <button
                  type="button"
                  className="account__trigger"
                  onClick={() => setAccountOpen((open) => !open)}
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                >
                  <span className="avatar" aria-hidden="true">
                    {initials}
                  </span>
                  {user.name.split(' ')[0]}
                </button>
                {accountOpen && (
                  <div className="account__menu" role="menu">
                    <div className="account__menu-head">
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                    </div>
                    <Link to="/owner/dashboard" role="menuitem">
                      <UserIcon width={17} height={17} />
                      Owner dashboard
                    </Link>
                    <Link to="/list-property" role="menuitem">
                      <PlusIcon width={17} height={17} />
                      Add a listing
                    </Link>
                    {/* Sign-out has to be a POST to the Worker, never a link. */}
                    <form method="post" action="/auth/freebuff/signout">
                      <input type="hidden" name="returnTo" value="/" />
                      <button type="submit" role="menuitem">
                        <LogOutIcon width={17} height={17} />
                        Sign out
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn--ghost btn--sm btn--hide-sm">
                  Log in
                </Link>
                <Link to="/signup" className="btn btn--primary btn--sm">
                  Sign up
                </Link>
              </>
            )}
            <button
              type="button"
              className="menu-toggle"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="mobile-nav">
          <nav aria-label="Mobile navigation">
            {mainLinks.map((link) => (
              <NavLink key={link.to} to={link.to}>
                {link.label}
              </NavLink>
            ))}
            {user ? (
              <NavLink to="/owner/dashboard">Owner dashboard</NavLink>
            ) : (
              <NavLink to="/login">Log in</NavLink>
            )}
          </nav>
          {!user && (
            <div className="mobile-nav__actions">
              <Link to="/signup" className="btn btn--primary">
                Create an account
              </Link>
            </div>
          )}
        </div>
      )}

      <main className="app-main">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
