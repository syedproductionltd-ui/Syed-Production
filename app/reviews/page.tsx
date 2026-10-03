import type { Metadata } from 'next';
import { siteUrl } from '@/lib/whatsapp';
import ReviewsPageBody from '@/components/ReviewsPageBody';
import SiteFooter from '@/components/SiteFooter';
import JsonLd from '@/components/JsonLd';
import { pageBreadcrumb } from '@/lib/seo';

const description =
  'Read client reviews of Syed Production — feedback on wedding films, corporate videos, event coverage and photography from clients across Pakistan.';

export const metadata: Metadata = {
  title: 'Client Reviews',
  description,
  alternates: { canonical: '/reviews' },
  openGraph: {
    type: 'website',
    url: `${siteUrl}/reviews`,
    title: 'Client Reviews | Syed Production',
    description,
    images: [{ url: '/images/DSC00557.webp', width: 1200, height: 630, alt: 'Syed Production reviews' }],
  },
};

export default function ReviewsPage() {
  return (
    <>
      <JsonLd data={pageBreadcrumb('Client Reviews', '/reviews')} />
      <section className="page-hero">
        <div className="container">
          <h1 className="page-hero-title">Client Reviews</h1>
          <p className="page-hero-subtitle">
            What our clients say about working with Syed Production
          </p>
        </div>
      </section>

      <div className="section">
        <div className="container">
          <ReviewsPageBody />
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
