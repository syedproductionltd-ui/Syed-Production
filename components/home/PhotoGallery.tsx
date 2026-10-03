import { galleryImages } from '@/lib/data';
import GalleryGrid from '@/components/GalleryGrid';
import SectionHeader from '@/components/SectionHeader';

export default function PhotoGallery() {
  return (
    <section className="photo-gallery section" id="gallery">
      <div className="container">
        <SectionHeader section="gallery" />
        <GalleryGrid images={galleryImages} collapsible reveal />
      </div>
    </section>
  );
}
