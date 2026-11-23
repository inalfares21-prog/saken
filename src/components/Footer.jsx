import { Link } from 'react-router-dom';
import { KeyIcon, MapPinIcon, ShieldIcon } from './Icons.jsx';

const columns = [
  {
    title: 'Explore',
    links: [
      { to: '/rentals', label: 'Long-term rentals' },
      { to: '/stays', label: 'Hotels & vacation stays' },
      { to: '/rentals?city=Algiers', label: 'Rentals in Algiers' },
      { to: '/stays?city=Oran', label: 'Stays in Oran' },
    ],
  },
  {
    title: 'For owners',
    links: [
      { to: '/list-property', label: 'List a property' },
      { to: '/owner/dashboard', label: 'Owner dashboard' },
      { to: '/how-it-works', label: 'How Saken works' },
      { to: '/contact', label: 'Talk to the team' },
    ],
  },
  {
    title: 'Company',
    links: [
      { to: '/how-it-works', label: 'About Saken' },
      { to: '/contact', label: 'Contact' },
      { to: '/how-it-works', label: 'Trust & safety' },
      { to: '/how-it-works', label: 'Terms of use' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <Link to="/" className="brand">
              <span className="brand__mark" aria-hidden="true">
                <KeyIcon />
              </span>
              <span>Saken</span>
            </Link>
            <p>
              A rental marketplace built for Algeria — long-term homes for tenants, and hotels or
              vacation stays for travellers from Algiers to Djanet.
            </p>
          </div>

          {columns.map((column) => (
            <div className="footer-col" key={column.title}>
              <h4>{column.title}</h4>
              <ul>
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.label}`}>
                    <Link to={link.to}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Saken. A prototype — listings are sample data.</span>
          <span>
            <MapPinIcon width={15} height={15} /> Algiers, Algeria
          </span>
          <span>
            <ShieldIcon width={15} height={15} /> Prices in Algerian dinars (DZD)
          </span>
        </div>
      </div>
    </footer>
  );
}
