import { settings } from './data';
import { siteUrl } from './whatsapp';

/**
 * Page-level structured data helpers.
 *
 * Breadcrumbs used to be a single hardcoded "Home > Team" list rendered by the
 * root layout, so every page claimed to be a child of the team section. They
 * are now built per route.
 */

export function breadcrumbSchema(
  trail: { name: string; path: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: `${siteUrl}${crumb.path}`,
    })),
  };
}

/** Home > <section>, used by every inner page. */
export function pageBreadcrumb(name: string, path: string) {
  return breadcrumbSchema([
    { name: 'Home', path: '/' },
    { name, path },
  ]);
}

const [locality, country = ''] = settings.contact.address
  .split(',')
  .map((part) => part.trim());

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: settings.branding.companyName,
  url: siteUrl,
  logo: `${siteUrl}/images/Syed-production.png`,
  image: `${siteUrl}/images/og-image.jpg`,
  description:
    'Professional film, photography, videography, and event coverage',
  foundingDate: '2020',
  email: settings.contact.email,
  telephone: settings.contact.phone,
  address: {
    '@type': 'PostalAddress',
    addressLocality: locality,
    ...(country ? { addressCountry: country === 'Pakistan' ? 'PK' : country } : {}),
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Service',
    email: settings.contact.email,
    telephone: settings.contact.phone,
  },
  sameAs: [
    settings.socialLinks.facebook,
    settings.socialLinks.instagram,
  ].filter((url): url is string => Boolean(url && url.trim())),
};

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: settings.branding.companyName,
  url: siteUrl,
  inLanguage: 'en',
};
