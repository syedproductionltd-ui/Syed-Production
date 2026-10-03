import type { Metadata } from 'next';
import { siteUrl } from '@/lib/whatsapp';
import BookingWizard from '@/components/home/BookingWizard';
import SiteFooter from '@/components/SiteFooter';
import JsonLd from '@/components/JsonLd';
import { pageBreadcrumb } from '@/lib/seo';

const description =
  'Book your production with Syed Productions. Choose a service, pick your dates, and send the brief straight to our WhatsApp — we reply within 24 hours.';

export const metadata: Metadata = {
  title: 'Book Your Production',
  description,
  alternates: { canonical: '/booking' },
  openGraph: {
    type: 'website',
    url: `${siteUrl}/booking`,
    title: 'Book Your Production | Syed Productions',
    description,
    images: [{ url: '/images/DSC00557.webp', width: 1200, height: 630, alt: 'Book with Syed Productions' }],
  },
};

export default function BookingPage() {
  return (
    <>
      <JsonLd data={pageBreadcrumb('Book Your Production', '/booking')} />
      <section className="page-hero">
        <div className="container">
          <h1 className="page-hero-title">Book Your Production</h1>
          <p className="page-hero-subtitle">
            Simple, transparent booking in just a few steps
          </p>
        </div>
      </section>

      <div className="section">
        <div className="container">
          <BookingWizard bare />
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
