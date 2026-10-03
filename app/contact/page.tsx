import type { Metadata } from 'next';
import { settings } from '@/lib/data';
import { siteUrl, whatsappUrl } from '@/lib/whatsapp';
import SocialIcon, { socialNetworks } from '@/components/SocialIcon';
import SiteFooter from '@/components/SiteFooter';

const description =
  'Contact Syed Productions in Lahore, Pakistan. Message us on WhatsApp or email syed.production.ltd@gmail.com — we reply to every project enquiry within 24 hours.';

export const metadata: Metadata = {
  title: 'Contact Us',
  description,
  alternates: { canonical: '/contact' },
  openGraph: {
    type: 'website',
    url: `${siteUrl}/contact`,
    title: 'Contact Us | Syed Productions',
    description,
    images: [{ url: '/images/DSC00557.webp', width: 1200, height: 630, alt: 'Contact Syed Productions' }],
  },
};

const CONTACT_MESSAGE = "Hello! I'd like to discuss a project with Syed Productions.";

export default function ContactPage() {
  const info = settings.contactInfo;

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1 className="page-hero-title">Contact Us</h1>
          <p className="page-hero-subtitle">
            Get in touch — we&apos;d love to hear about your project
          </p>
        </div>
      </section>

      <div className="section">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info-card">
              <h2>Get In Touch</h2>

              <div className="contact-item">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <div>
                  <h4>Address</h4>
                  <p>{info.address}</p>
                </div>
              </div>

              <div className="contact-item">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <div>
                  <h4>Phone</h4>
                  <p>
                    <a href={`tel:${info.phone.replace(/\s+/g, '')}`}>{info.phone}</a>
                  </p>
                </div>
              </div>

              <div className="contact-item">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <div>
                  <h4>Email</h4>
                  <p>
                    <a href={`mailto:${info.email}`}>{info.email}</a>
                  </p>
                </div>
              </div>

              <div className="contact-item">
                <SocialIcon network="whatsapp" size={24} />
                <div>
                  <h4>WhatsApp</h4>
                  <p>
                    <a
                      href={whatsappUrl(CONTACT_MESSAGE)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--clr-ocean)' }}
                    >
                      Message us on WhatsApp
                    </a>
                  </p>
                </div>
              </div>

              <div className="contact-social">
                <h4>Follow Us</h4>
                <div className="social-links">
                  {socialNetworks.map((network) => (
                    <a
                      key={network}
                      className="social-link"
                      aria-label={network.charAt(0).toUpperCase() + network.slice(1)}
                      href={settings.socialLinks[network] || '#'}
                      {...(settings.socialLinks[network]
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                    >
                      <SocialIcon network={network} size={24} />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="contact-newsletter-card">
              <h2>Prefer to Chat?</h2>
              <p>
                Message us on WhatsApp for a fast reply, or send us an email with
                your project details and we&apos;ll come back to you within 24
                hours.
              </p>
              <a
                href={whatsappUrl(CONTACT_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link btn btn-primary"
                aria-label="WhatsApp"
                style={{
                  display: 'inline-flex',
                  width: 'auto',
                  height: 'auto',
                  padding: '0.85rem 2rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                }}
              >
                Message us on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
