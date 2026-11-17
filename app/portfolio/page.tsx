import type { Metadata } from 'next';
import { siteUrl } from '@/utils/whatsapp';
import { getPublishedGalleryPosts } from '@/utils/gallery';
import GalleryGrid from '@/components/GalleryGrid';
import SiteFooter from '@/components/SiteFooter';
import JsonLd from '@/components/JsonLd';
import { pageBreadcrumb } from '@/utils/seo';

const description =
  'Browse the Syed Production portfolio — cinematic wedding films, corporate videos, event coverage and photography from Lahore, Pakistan.';

export const metadata: Metadata = {
  title: 'Our Portfolio',
  description,
  alternates: { canonical: '/portfolio' },
  openGraph: {
    type: 'website',
    url: `${siteUrl}/portfolio`,
    title: 'Our Portfolio | Syed Production',
    description,
    images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'Syed Production portfolio' }],
  },
};

export const revalidate = 60;

export default async function PortfolioPage() {
  const galleryPosts = await getPublishedGalleryPosts();

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
          <GalleryGrid posts={galleryPosts} />
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
