import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/whatsapp';

export const dynamic = 'force-static';

// Priorities and cadences carried over from the hand-written sitemap.xml.
// The old "#team" entry is gone: Google ignores URL fragments, so it was a
// duplicate of the home page rather than a separate target.
//
// The home page is deliberately absent from this list - see below.
const ROUTES: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
}[] = [
  { path: '/portfolio', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/gallery', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/booking', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/reviews', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.6 },
];

const HOME_PRIORITY = 1.0;

export default function sitemap(): MetadataRoute.Sitemap {
  const rest = ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: `${siteUrl}${path}`,
    changeFrequency,
    priority,
  }));

  // The home page is pinned ahead of every other route and given the highest
  // priority on the page, rather than relying on it happening to sit first in an
  // array. As written above it already does, but that is a coincidence nothing
  // protects: inserting a route above it, or giving one priority 1.0, would
  // silently hand the top slot to a page that is not the site's primary target.
  const topPriority = Math.max(HOME_PRIORITY, ...rest.map((r) => r.priority));

  return [
    { url: siteUrl, changeFrequency: 'weekly', priority: topPriority },
    ...rest,
  ];
}