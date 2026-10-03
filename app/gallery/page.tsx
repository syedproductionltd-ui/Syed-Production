import type { Metadata } from 'next';
import { siteUrl } from '@/lib/whatsapp';
import GalleryTabs from '@/components/GalleryTabs';
import SiteFooter from '@/components/SiteFooter';
import JsonLd from '@/components/JsonLd';
import { pageBreadcrumb } from '@/lib/seo';

const description =
  'Photo and video gallery from Syed Production — wedding films, travel cinematography, commercials and client stories from Lahore, Pakistan.';

export const metadata: Metadata = {
  title: 'Gallery',
  description,
  alternates: { canonical: '/gallery' },
  openGraph: {
    type: 'website',
    url: `${siteUrl}/gallery`,
    title: 'Gallery | Syed Production',
    description,
    images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'Syed Production gallery' }],
  },
};

export default function GalleryPage() {
  return (
    <>
      <JsonLd data={pageBreadcrumb('Gallery', '/gallery')} />
      <section className="page-hero">
        <div className="container">
          <h1 className="page-hero-title">Gallery</h1>
          <p className="page-hero-subtitle">Browse our photos and watch our productions</p>
        </div>
      </section>

      <div className="section">
        <div className="container">
          <GalleryTabs />
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
