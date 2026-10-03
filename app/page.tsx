import type { Metadata } from 'next';
import HomeSections from '@/components/home/HomeSections';
import RevealObserver from '@/components/RevealObserver';
import SiteFooter from '@/components/SiteFooter';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return (
    <>
      <RevealObserver />
      {/* Home is the breadcrumb root, so no BreadcrumbList here. */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Syed Productions — Film, Photography & Videography',
          description:
            'Syed Productions is a film, photography and videography studio in Lahore, Pakistan, covering weddings, corporate video, events and creative campaigns.',
          isPartOf: { '@type': 'WebSite', name: 'Syed Productions' },
          about: { '@type': 'Organization', name: 'Syed Productions' },
        }}
      />
      <HomeSections />
      <SiteFooter isHome />
    </>
  );
}
