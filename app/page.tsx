import type { Metadata } from 'next';
import HomeSections from '@/components/home/HomeSections';
import RevealObserver from '@/components/RevealObserver';
import SiteFooter from '@/components/SiteFooter';
import JsonLd from '@/components/JsonLd';
import { getPublishedGalleryPosts } from '@/utils/gallery';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

/** Soft-refresh home data periodically; gallery still falls back to static seeds. */
export const revalidate = 60;

export default async function HomePage() {
  const galleryPosts = await getPublishedGalleryPosts();

  return (
    <>
      <RevealObserver />
      {/* Home is the breadcrumb root, so no BreadcrumbList here. */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Syed Production — Film, Photography & Videography',
          description:
            'Syed Production is a film, photography and videography studio in Lahore, Pakistan, covering weddings, corporate video, events and creative campaigns.',
          isPartOf: { '@type': 'WebSite', name: 'Syed Production' },
          about: { '@type': 'Organization', name: 'Syed Production' },
        }}
      />
      <HomeSections galleryPosts={galleryPosts} />
      <SiteFooter isHome />
    </>
  );
}
