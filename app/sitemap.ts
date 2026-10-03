import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/whatsapp';

export const dynamic = 'force-static';

// Preserves the priorities and cadences from the hand-written sitemap.xml.
const ROUTES: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
}[] = [
  { path: '', changeFrequency: 'weekly', priority: 1.0 },
  { path: '#team', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/portfolio', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/gallery', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/booking', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/reviews', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.6 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: `${siteUrl}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
