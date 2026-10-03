import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/whatsapp';

export const dynamic = 'force-static';

// Priorities and cadences carried over from the hand-written sitemap.xml.
// The old "#team" entry is gone: Google ignores URL fragments, so it was a
// duplicate of the home page rather than a separate target.
const ROUTES: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
}[] = [
  { path: '', changeFrequency: 'weekly', priority: 1.0 },
  { path: '/portfolio', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/gallery', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/booking', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/reviews', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.6 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: `${siteUrl}${path}`,
    changeFrequency,
    priority,
  }));
}
