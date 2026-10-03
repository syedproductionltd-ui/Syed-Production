import type { Metadata } from 'next';
import './styles.css';
import { siteUrl } from '@/lib/whatsapp';
import { organizationSchema, websiteSchema } from '@/lib/seo';
import SiteNav from '@/components/SiteNav';
import DarkModeScript from '@/components/DarkModeScript';
import DeadLinkGuard from '@/components/DeadLinkGuard';
import JsonLd from '@/components/JsonLd';

// Trimmed to sit inside the ~155 character window Google renders, so the
// strongest claim is the part that actually shows up in results.
const description =
  'Syed Production is a film, photography and videography studio in Lahore, Pakistan, covering weddings, corporate video, events and creative campaigns.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Syed Production — Film, Photography & Videography',
    template: '%s | Syed Production',
  },
  description,
  keywords: [
    'Syed Production',
    // The trading name is singular, but the domain is syedproductions.com, so
    // both spellings need to be searchable. The plural is carried here and by
    // the domain itself; the singular is what appears in the title, headings
    // and body copy.
    'Syed Productions',
    'syedproductions',
    'syed production',
    'film production',
    'photography',
    'videography',
    'media production',
    'creative professionals',
    'Syed Burhan Uddin Shah',
    'Akash Hussian',
    'Kashif Zayan',
    'Saqib Gull',
    'production team',
    'video production company',
    'event coverage',
    'Pakistani media',
    'cinematic storytelling',
  ],
  authors: [{ name: 'Syed Production Team' }],
  creator: 'Syed Production',
  publisher: 'Syed Production',
  applicationName: 'Syed Production',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'Syed Production',
    locale: 'en_US',
    title: 'Syed Production — Film, Photography & Videography',
    description,
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Syed Production',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Syed Production — Film, Photography & Videography',
    description,
    images: ['/images/og-image.jpg'],
  },
  icons: {
    icon: [{ url: '/images/Syed-production.webp', type: 'image/png' }],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0b1f17',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <DarkModeScript />
        {/* Preload the LCP image before the stylesheet is applied. */}
        <link
          rel="preload"
          as="image"
          type="image/webp"
          href="/images/og-image.jpg"
          fetchPriority="high"
        />
        <JsonLd data={organizationSchema} />
        <JsonLd data={websiteSchema} />
      </head>
      <body>
        <SiteNav />
        <main>{children}</main>
        <DeadLinkGuard />
      </body>
    </html>
  );
}