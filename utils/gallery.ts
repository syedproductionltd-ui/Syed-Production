import { connectDB } from '@/lib/db';
import { GalleryPostModel } from '@/models/GalleryPost';
import { galleryPosts as staticGalleryPosts } from '@/lib/data';
import type { GalleryPost } from '@/types';

type RawImage =
  | { imageUrl: string; altText?: string; hidden?: boolean; sortOrder?: number; width?: number; height?: number }
  | string;

function normalizeImages(images: RawImage[] = [], fallbackTitle = '') {
  const mapped = images.map((img, idx) => {
    if (typeof img === 'string') {
      return { imageUrl: img, altText: fallbackTitle, hidden: idx >= 5, sortOrder: idx + 1, _idx: idx };
    }
    const so = typeof img.sortOrder === 'number' && Number.isFinite(img.sortOrder) ? img.sortOrder : idx + 1;
    return {
      imageUrl: img.imageUrl,
      altText: img.altText || fallbackTitle,
      hidden: img.hidden !== undefined ? img.hidden : idx >= 5,
      sortOrder: so,
      width: img.width,
      height: img.height,
      _idx: idx,
    };
  });
  mapped.sort((a, b) => (a.sortOrder - b.sortOrder) || (a._idx - b._idx));
  return mapped.map((img, idx) => ({
    imageUrl: img.imageUrl,
    altText: img.altText,
    hidden: img.hidden,
    sortOrder: idx + 1,
    width: img.width,
    height: img.height,
  }));
}

function mapPost(
  p: {
    id?: string;
    title: string;
    category?: string;
    coverImage?: string;
    images: RawImage[];
    sortOrder?: number;
  },
  idx = 0
): GalleryPost {
  const images = normalizeImages(p.images || [], p.title);
  const sortOrder = typeof p.sortOrder === 'number' && Number.isFinite(p.sortOrder) ? p.sortOrder : idx + 1;

  return {
    id: p.id || p.title,
    title: p.title,
    category: p.category,
    coverImage: p.coverImage || images[0]?.imageUrl,
    images,
    sortOrder,
  };
}

/**
 * Published gallery posts for public pages. Falls back to static seeds when
 * Mongo is unavailable or empty so SSR never renders a blank grid.
 */
export async function getPublishedGalleryPosts(limit = 60): Promise<GalleryPost[]> {
  try {
    const conn = await connectDB();
    if (!conn) return staticGalleryPosts;

    const posts = await GalleryPostModel.find({ isPublished: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .limit(limit)
      .lean();

    if (!posts.length) return staticGalleryPosts;
    return posts.map((p, i) => mapPost(p as Parameters<typeof mapPost>[0], i));
  } catch {
    return staticGalleryPosts;
  }
}
