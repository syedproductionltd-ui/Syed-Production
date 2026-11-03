import type { SiteData, GalleryPost } from './types';
import rawConfig from './__config.json';
import rawData from './__data.json';

export const siteConfig = rawConfig;
export const siteData = rawData as SiteData;

export const destinations = siteData.destinations;
export const reviews = siteData.reviews;
export const videos = siteData.videos;

export const galleryPosts: GalleryPost[] = [
  {
    id: 'bridal-portraits',
    title: 'Bridal Portraits Collection',
    images: [
      { imageUrl: 'images/gallery/IMG_0196.JPG', altText: 'Bridal portrait in maroon lehenga against red drapery', hidden: false },
      { imageUrl: 'images/gallery/IMG_2628.JPG', altText: 'Bridal portrait in gold lehenga against red studio backdrop', hidden: false },
      { imageUrl: 'images/gallery/IMG_4066.JPG', altText: 'Portrait in pink attire among yellow wildflowers', hidden: false },
      { imageUrl: 'images/gallery/IMG_8099.JPG', altText: 'Bridal portrait with pink dupatta by carved wooden door', hidden: false },
      { imageUrl: 'images/gallery/IMG_8383.JPG', altText: 'Bridal portrait holding peach dupatta in rustic courtyard', hidden: false },
    ],
  },
  {
    id: 'studio-session-1',
    title: 'Studio Production Session A',
    images: [
      { imageUrl: 'images/gallery/016A5232.JPG', altText: 'Syed Production shoot', hidden: false },
      { imageUrl: 'images/gallery/016A5554.JPG', altText: 'Syed Production shoot', hidden: false },
      { imageUrl: 'images/gallery/016A5694.JPG', altText: 'Syed Production shoot', hidden: false },
      { imageUrl: 'images/gallery/016A6854.JPG', altText: 'Syed Production shoot', hidden: false },
      { imageUrl: 'images/gallery/016A7255.JPG', altText: 'Syed Production shoot', hidden: false },
    ],
  },
  {
    id: 'studio-session-2',
    title: 'Studio Production Session B',
    images: [
      { imageUrl: 'images/gallery/016A7313.JPG', altText: 'Syed Production shoot', hidden: false },
      { imageUrl: 'images/gallery/016A7354.JPG', altText: 'Syed Production shoot', hidden: false },
      { imageUrl: 'images/gallery/016A7448.JPG', altText: 'Syed Production shoot', hidden: false },
      { imageUrl: 'images/gallery/016A7491.JPG', altText: 'Syed Production shoot', hidden: false },
    ],
  },
  {
    id: 'cinematic-event-1',
    title: 'Cinematic Event Series A',
    images: [
      { imageUrl: 'images/gallery/3C4A5309.JPG', altText: 'Syed Production shoot', hidden: false },
      { imageUrl: 'images/gallery/3C4A5429.JPG', altText: 'Syed Production shoot', hidden: false },
      { imageUrl: 'images/gallery/DSC00440.JPG', altText: 'Syed Production shoot', hidden: false },
      { imageUrl: 'images/gallery/DSC00488.JPG', altText: 'Syed Production shoot', hidden: false },
      { imageUrl: 'images/gallery/DSC00518.JPG', altText: 'Syed Production shoot', hidden: false },
    ],
  },
  {
    id: 'cinematic-event-2',
    title: 'Cinematic Event Series B',
    images: [
      { imageUrl: 'images/gallery/DSC00542.JPG', altText: 'Syed Production shoot', hidden: false },
      { imageUrl: 'images/gallery/DSC00546.JPG', altText: 'Syed Production shoot', hidden: false },
      { imageUrl: 'images/gallery/DSC00579.JPG', altText: 'Syed Production shoot', hidden: false },
      { imageUrl: 'images/gallery/DSC01185.JPG', altText: 'Syed Production shoot', hidden: false },
      { imageUrl: 'images/gallery/DSC01270.JPG', altText: 'Syed Production shoot', hidden: false },
    ],
  },
  {
    id: 'cinematic-event-3',
    title: 'Cinematic Event Series C',
    images: [
      { imageUrl: 'images/gallery/DSC01310.JPG', altText: 'Syed Production shoot', hidden: true },
      { imageUrl: 'images/gallery/DSC01418.JPG', altText: 'Syed Production shoot', hidden: true },
      { imageUrl: 'images/gallery/DSC01916.JPG', altText: 'Syed Production shoot', hidden: true },
      { imageUrl: 'images/gallery/DSC02039.JPG', altText: 'Syed Production shoot', hidden: true },
      { imageUrl: 'images/gallery/DSC02069.JPG', altText: 'Syed Production shoot', hidden: true },
    ],
  },
  {
    id: 'cinematic-event-4',
    title: 'Cinematic Event Series D',
    images: [
      { imageUrl: 'images/gallery/DSC02160.JPG', altText: 'Syed Production shoot', hidden: true },
      { imageUrl: 'images/gallery/DSC02194.JPG', altText: 'Syed Production shoot', hidden: true },
      { imageUrl: 'images/gallery/DSC02227.JPG', altText: 'Syed Production shoot', hidden: true },
      { imageUrl: 'images/gallery/DSC02309.JPG', altText: 'Syed Production shoot', hidden: true },
      { imageUrl: 'images/gallery/DSC02367.JPG', altText: 'Syed Production shoot', hidden: true },
    ],
  },
  {
    id: 'cinematic-event-5',
    title: 'Cinematic Event Series E',
    images: [
      { imageUrl: 'images/gallery/DSC02419.JPG', altText: 'Syed Production shoot', hidden: true },
      { imageUrl: 'images/gallery/DSC04563.JPG', altText: 'Syed Production shoot', hidden: true },
      { imageUrl: 'images/gallery/DSC09472.JPG', altText: 'Syed Production shoot', hidden: true },
      { imageUrl: 'images/gallery/DSC09537.JPG', altText: 'Syed Production shoot', hidden: true },
    ],
  },
  {
    id: 'editorial-collection',
    title: 'Editorial & Commercial Collection',
    images: [
      { imageUrl: 'images/gallery/IMG_1266.JPG', altText: 'Syed Production shoot', hidden: true },
      { imageUrl: 'images/gallery/IMG_4983.JPG', altText: 'Syed Production shoot', hidden: true },
      { imageUrl: 'images/gallery/M4M05012.JPG', altText: 'Syed Production shoot', hidden: true },
      { imageUrl: 'images/gallery/M4M05048.JPG', altText: 'Syed Production shoot', hidden: true },
    ],
  },
];

export const galleryImages = galleryPosts.flatMap((post, postIdx) =>
  post.images.map((img, imgIdx) => ({
    imageUrl: img.imageUrl,
    altText: img.altText,
    hidden: img.hidden,
    sortOrder: postIdx * 100 + imgIdx + 1,
  }))
);

export const teamMembers = siteData.team;
export const settings = siteData.settings;

/** Cards shown in the "Featured Services" spotlight grid. */
export const featuredDestinations = destinations.filter((d) => Boolean(d.featured));

/**
 * The booking wizard offers the first six, featured ones first. Ported from
 * renderBookingDestinations().
 */
export const bookingDestinations = [
  ...featuredDestinations,
  ...destinations.filter((d) => !d.featured),
].slice(0, 6);

/** Categories present in the data, in first-seen order. */
export const serviceCategories = Array.from(
  new Set(destinations.map((d) => d.category))
);

export function destinationsByCategory(category: string) {
  if (category === 'all') return destinations;
  return destinations.filter((d) => d.category === category);
}

/**
 * Base prices are stored as whole PKR (150000 -> "PKR 150,000"). en-US grouping
 * is pinned because the runtime default locale decides the thousands separator,
 * which would otherwise change the WhatsApp message text depending on the
 * visitor's device.
 */
export function formatPrice(value: number): string {
  return `PKR ${value.toLocaleString('en-US')}`;
}

/** Normalised filter key for a video's tag, e.g. "Client Story" -> "client-story". */
export function videoFilterKey(tag: string): string {
  return tag.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Video filter tabs derived from the data. The original hardcoded tab values
 * (advertisements, weddings, ...) against a `category` field the records never
 * had, so every tab except "All" rendered an empty grid.
 */
export const videoFilters = Array.from(
  new Map(videos.map((v) => [videoFilterKey(v.tag), v.tag]))
).map(([key, label]) => ({ key, label }));

/**
 * Percent-encodes a root-relative asset path, leaving the separators alone.
 *
 * Several team photos have spaces in their filenames. A space is legal inside a
 * plain src attribute, but srcset candidates are whitespace-delimited, so
 * "…/Syed Burhan Uddin Shah@240.webp 240w" is parsed as the URL
 * "/images/team/Syed" and the browser requests a file that does not exist.
 */
function encodePath(rel: string): string {
  return `/${rel.split('/').map(encodeURIComponent).join('/')}`;
}

/**
 * Resolves an image path from the data to a usable src.
 *
 * Most records hold a root-relative path such as "images/team/Hussain.jpg",
 * but the review avatars hold absolute Unsplash URLs. Prefixing those with a "/"
 * produced "/https://images.unsplash.com/...", which resolves to nothing, so
 * the review avatars rendered as broken images.
 */
export function assetUrl(value: string): string {
  return /^https?:\/\//i.test(value) ? value : encodePath(value);
}

/**
 * Widths of the pre-generated WebP siblings for each image folder, matching the
 * derivatives written by the generation script (`<stem>@<width>.webp`).
 *
 * A static export cannot use the Next image optimiser, so the raw camera files
 * were being served untouched: 1400x2100 JPEGs of 300-600 KB as CSS
 * backgrounds for ~340x200 gallery tiles, and one 3072x4096 / 2 MB JPEG for a
 * team avatar. The originals are kept for the lightbox and modal.
 */
const DERIVATIVES: Record<string, number[] | undefined> = {
  gallery: [600],
  services: [400, 800],
  team: [240, 480, 800],
};

function derivatives(rel: string): { url: string; w: number }[] {
  const dir = rel.split('/')[1];
  if (dir === undefined) return [];
  const widths = DERIVATIVES[dir];
  if (!widths) return [];
  const stem = rel.replace(/\.[^./]+$/, '');
  return widths.map((w) => ({ url: `${encodePath(stem)}@${w}.webp`, w }));
}

/**
 * Largest pre-generated derivative, for the places that render an image large
 * (lightbox-adjacent modals, popups) or as a CSS background, which cannot
 * take a srcset. Falls back to the original when no derivative exists.
 */
export function thumbUrl(rel: string): string {
  const d = derivatives(rel);
  const largest = d[d.length - 1];
  return largest ? largest.url : encodePath(rel);
}

/** srcset for <img>, so phones download a smaller file than a 2x desktop. */
export function thumbSrcSet(rel: string): string | undefined {
  const d = derivatives(rel);
  return d.length ? d.map((x) => `${x.url} ${x.w}w`).join(', ') : undefined;
}
