import type { SiteData } from './types';
import rawConfig from './__config.json';
import rawData from './__data.json';

export const siteConfig = rawConfig;
export const siteData = rawData as SiteData;

export const destinations = siteData.destinations;
export const reviews = siteData.reviews;
export const videos = siteData.videos;
export const galleryImages = siteData.gallery;
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
 * Resolves an image path from the data to a usable src.
 *
 * Most records hold a root-relative path such as "images/team/Hussain.jpg",
 * but the review avatars hold absolute Unsplash URLs. Prefixing those with "/"
 * produced "/https://images.unsplash.com/...", which resolves to nothing, so
 * the review avatars rendered as broken images.
 */
export function assetUrl(value: string): string {
  return /^https?:\/\//i.test(value) ? value : `/${value}`;
}
