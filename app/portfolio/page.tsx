import type { Metadata } from 'next';
import { galleryImages } from '@/lib/data';
import { siteUrl } from '@/lib/whatsapp';
import GalleryGrid from '@/components/GalleryGrid';
import SiteFooter from '@/components/SiteFooter';
import JsonLd from '@/components/JsonLd';
import { pageBreadcrumb } from '@/lib/seo';

const description =
  'Browse the Syed Productions portfolio — cinematic wedding films, corporate videos, event coverage and photography from Lahore, Pakistan.';

export const metadata: Metadata = {
  title: 'Our Portfolio',
  description,
  alternates: { canonical: '/portfolio' },
  openGraph: {
    type: 'website',
    url: `${siteUrl}/portfolio`,
    title: 'Our Portfolio | Syed Productions',
    description,
    images: [{ url: '/images/DSC00557.webp', width: 1200, height: 630, alt: 'Syed Productions portfolio' }],
  },
};

export default function PortfolioPage() {
  return (
    <>
      <JsonLd data={pageBreadcrumb('Our Portfolio', '/portfolio')} />
      <section className="page-hero">
        <div className="container">
          <h1 className="page-hero-title">Our Portfolio</h1>
          <p className="page-hero-subtitle">
            A showcase of our finest photography and cinematic stills
          </p>
        </div>
      </section>

      <div className="section">
        <div className="container">
          <GalleryGrid images={galleryImages} />
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
