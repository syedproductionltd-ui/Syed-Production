import { connectDB } from '@/lib/db';
import { GalleryPostModel } from '@/models/GalleryPost';
import { galleryPosts as staticGalleryPosts } from '@/lib/data';
import type { GalleryPost } from '@/types';

function mapPost(p: {
  id?: string;
  title: string;
  category?: string;
  coverImage?: string;
  images: Array<{ imageUrl: string; altText?: string; hidden?: boolean } | string>;
}): GalleryPost {
  const images = p.images.map((img, imgIdx) => {
    if (typeof img === 'string') {
      return { imageUrl: img, altText: p.title, hidden: imgIdx >= 5 };
    }
    return {
      imageUrl: img.imageUrl,
      altText: img.altText || p.title,
      hidden: img.hidden !== undefined ? img.hidden : imgIdx >= 5,
    };
  });

  return {
    id: p.id || p.title,
    title: p.title,
    category: p.category,
    coverImage: p.coverImage || images[0]?.imageUrl,
    images,
  };
}

/**
 * Published gallery posts for public pages. Falls back to static seeds when
 * Mongo is unavailable or empty so SSR never renders a blank grid.
 */
export async function getPublishedGalleryPosts(): Promise<GalleryPost[]> {
  try {
    await connectDB();
    const posts = await GalleryPostModel.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .lean();

    if (!posts.length) return staticGalleryPosts;
    return posts.map((p) => mapPost(p as Parameters<typeof mapPost>[0]));
  } catch (err) {
    console.error('getPublishedGalleryPosts failed, using static seeds:', err);
    return staticGalleryPosts;
  }
}
