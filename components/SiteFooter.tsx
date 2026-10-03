import Link from 'next/link';
import { settings } from '@/lib/data';
import { brandName } from '@/lib/whatsapp';
import SocialIcon, { socialNetworks, type SocialNetwork } from './SocialIcon';

const networkLabels: Record<SocialNetwork, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
};

/**
 * Social hrefs come from settings. Networks with no URL yet fall back to '#',
 * which DeadLinkGuard neutralises.
 */
function socialHref(network: SocialNetwork): string {
  const value = settings.socialLinks[network];
  return value && value.trim() ? value : '';
}

export function SocialLinks({ size = 20 }: { size?: number }) {
  return (
    <div className="social-links">
      {socialNetworks.map((network) => {
        const href = socialHref(network);
        const external = href !== '';
        return (
          <a
            key={network}
            href={href || '#'}
            className="social-link"
            aria-label={networkLabels[network]}
            aria-disabled={external ? undefined : true}
            {...(external
              ? { target: '_blank', rel: 'noopener noreferrer' }
              : {})}
          >
            <SocialIcon network={network} size={size} />
          </a>
        );
      })}
    </div>
  );
}

const HOME_COMPANY_LINKS = [
  { href: '#', label: 'About Us' },
  { href: '#', label: 'Our Team' },
  { href: '#', label: 'Portfolio' },
  { href: '#', label: 'Careers' },
  { href: '#', label: 'Partners' },
];

const HOME_SUPPORT_LINKS = [
  { href: '#', label: 'Help Center' },
  { href: '#', label: 'Reschedule Booking' },
  { href: '#', label: 'Privacy Policy' },
  { href: '#', label: 'Terms of Service' },
  { href: '#', label: 'FAQ' },
];

const INNER_COMPANY_LINKS = [
  { href: '/', label: 'About Us' },
  { href: '/#team', label: 'Our Team' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/contact', label: 'Contact' },
];

const INNER_SUPPORT_LINKS = [
  { href: '/contact', label: 'Help Center' },
  { href: '/booking', label: 'Reschedule Booking' },
  { href: '#', label: 'Privacy Policy' },
  { href: '#', label: 'Terms of Service' },
  { href: '#', label: 'FAQ' },
];

const TRUST_BADGES = [
  {
    label: 'Professional Grade',
    path: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z',
  },
  {
    label: 'Licensed Production House',
    path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
  },
  {
    label: 'Best Price Guarantee',
    path: 'M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z',
  },
  {
    label: '24/7 Client Support',
    path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
  },
];

/**
 * The home page historically shipped a different footer (trust badges plus a
 * longer, mostly dead-link column set). Preserved behind `isHome` so the
 * migration does not silently change content.
 */
export default function SiteFooter({ isHome = false }: { isHome?: boolean }) {
  const servicesPrefix = isHome ? '' : '/';
  const companyLinks = isHome ? HOME_COMPANY_LINKS : INNER_COMPANY_LINKS;
  const supportLinks = isHome ? HOME_SUPPORT_LINKS : INNER_SUPPORT_LINKS;

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href={isHome ? '#hero' : '/'} className="nav-logo">
              <img
                src="/images/Syed-production.webp"
                alt={brandName}
                className="logo-img"
              />
              <span>{brandName}</span>
            </Link>
            <p>{settings.footer.description}</p>
            <SocialLinks />
          </div>

          <div className="footer-links">
            <h4>Services</h4>
            <ul>
              <li>
                <Link href={`${servicesPrefix}#featured-services`}>Wedding Films</Link>
              </li>
              <li>
                <Link href={`${servicesPrefix}#featured-services`}>
                  Corporate Videos
                </Link>
              </li>
              <li>
                <Link href={`${servicesPrefix}#featured-services`}>
                  Event Coverage
                </Link>
              </li>
              <li>
                <Link href={`${servicesPrefix}#featured-services`}>Photography</Link>
              </li>
              <li>
                <Link href={`${servicesPrefix}#services`}>All Services</Link>
              </li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Company</h4>
            <ul>
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-links">
            <h4>Support</h4>
            <ul>
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {isHome && (
          <div className="footer-trust">
            <div className="trust-badges">
              {TRUST_BADGES.map((badge) => (
                <span className="trust-badge" key={badge.label}>
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d={badge.path} />
                  </svg>
                  {badge.label}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="footer-bottom">
          <p
            dangerouslySetInnerHTML={{ __html: settings.footer.copyrightText }}
          />
        </div>
      </div>
    </footer>
  );
}