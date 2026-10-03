import type { Metadata } from 'next';
import Link from 'next/link';
import { brandName } from '@/lib/whatsapp';
import SiteFooter from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: 'Page not found',
  // The default not-found page shipped both a noindex and the layout's
  // index,follow. Two conflicting directives, so Google may have indexed the
  // 404 as a real page and, because the layout supplied a canonical, treated
  // it as a duplicate of the home page. Declare this page explicitly instead.
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1 className="page-hero-title">Page not found</h1>
          <p className="page-hero-subtitle">
            That page has moved or never existed.
          </p>
        </div>
      </section>

      <div className="section">
        <div className="container">
          <p>
            Try the <Link href="/portfolio">portfolio</Link>, the{' '}
            <Link href="/gallery">gallery</Link>, or head back to{' '}
            <Link href="/">{brandName}</Link>.
          </p>
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
