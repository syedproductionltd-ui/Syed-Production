import type { Metadata } from 'next';
import './styles.css';
import { settings } from '@/lib/data';
import { siteUrl } from '@/lib/whatsapp';
import SiteNav from '@/components/SiteNav';
import DarkModeScript from '@/components/DarkModeScript';
import DeadLinkGuard from '@/components/DeadLinkGuard';

const description =
  'Syed Productions — Professional film, photography, videography, and event coverage. Meet our creative team including Tashfeen Bin Riaz, Burhan Uddin Shah, Tehseen Abbas, and Hussain. Bringing your vision to life with cinematic storytelling and creative media production.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Syed Productions — Film, Photography & Videography',
    template: '%s | Syed Productions',
  },
  description,
  keywords: [
    'Syed Productions',
    'film production',
    'photography',
    'videography',
    'media production',
    'creative professionals',
    'Tashfeen Bin Riaz photographer',
    'Burhan Uddin Shah',
    'Tehseen Abbas',
    'production team',
    'video production company',
    'event coverage',
    'Pakistani media',
    'cinematic storytelling',
  ],
  authors: [{ name: 'Syed Productions Team' }],
  creator: 'Syed Productions',
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
  alternates: {
    canonical: '/',
    languages: { en: '/' },
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    title: 'Syed Productions — Film, Photography & Videography',
    description:
      'Professional film, photography, videography, and event coverage. Creative team including Tashfeen Bin Riaz, Burhan, Tehseen, and Hussain.',
    siteName: 'Syed Productions',
    images: [
      {
        url: '/images/DSC00557.webp',
        width: 1200,
        height: 630,
        alt: 'Syed Productions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Syed Productions — Film, Photography & Videography',
    description,
    images: ['/images/DSC00557.webp'],
  },
  icons: {
    icon: [{ url: '/images/Syed-production.webp', type: 'image/webp' }],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0b1f17',
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: settings.branding.companyName,
  url: siteUrl,
  logo: `${siteUrl}/images/Syed-production.webp`,
  description:
    'Professional film, photography, videography, and event coverage',
  foundingDate: '2020',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Service',
    email: 'contact@syedproductions.com',
  },
  sameAs: [
    settings.socialLinks.facebook,
    settings.socialLinks.instagram,
  ].filter((url): url is string => Boolean(url && url.trim())),
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
    { '@type': 'ListItem', position: 2, name: 'Team', item: `${siteUrl}#team` },
  ],
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
          href="/images/DSC00557.webp"
          fetchPriority="high"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      </head>
      <body>
        <SiteNav />
        <main>{children}</main>
        <DeadLinkGuard />
      </body>
    </html>
  );
}