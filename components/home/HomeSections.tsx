import type { GalleryPost } from '@/types';
import Hero from '@/components/home/Hero';
import PhotoGallery from '@/components/home/PhotoGallery';
import VideoShowcase from '@/components/home/VideoShowcase';
import ReviewsSection from '@/components/home/ReviewsSection';
import ServicesExplorer from '@/components/home/ServicesExplorer';
import ProjectPlanner from '@/components/home/ProjectPlanner';
import BookingWizard from '@/components/home/BookingWizard';
import Newsletter from '@/components/home/Newsletter';

/**
 * Static page composition. Only the interactive islands (gallery, videos,
 * services, planner, booking, newsletter) opt into a client boundary, so the
 * hero, reviews section and section headers stay server-rendered.
 *
 * Gallery posts are fetched on the server and passed in so the photo section
 * SSR's real tiles instead of an empty client-only fetch.
 */
export default function HomeSections({ galleryPosts }: { galleryPosts: GalleryPost[] }) {
  return (
    <>
      <Hero />
      <PhotoGallery posts={galleryPosts} />
      <VideoShowcase />
      <ReviewsSection />
      <ServicesExplorer />
      <ProjectPlanner />
      <BookingWizard reveal />
      <Newsletter />
    </>
  );
}
