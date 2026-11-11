import type { GalleryPost } from '@/types';
import { galleryPosts as staticGalleryPosts } from '@/lib/data';
import GalleryGrid from '@/components/GalleryGrid';
import SectionHeader from '@/components/SectionHeader';

export default function PhotoGallery({ posts }: { posts?: GalleryPost[] }) {
  const galleryPosts = posts?.length ? posts : staticGalleryPosts;

  return (
    <section className="photo-gallery section" id="gallery">
      <div className="container">
        <SectionHeader section="gallery" />
        <GalleryGrid posts={galleryPosts} collapsible reveal />
      </div>
    </section>
  );
}
