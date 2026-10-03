'use client';

import { useCallback, useState } from 'react';
import { destinations } from '@/lib/data';
import Hero from '@/components/home/Hero';
import PhotoGallery from '@/components/home/PhotoGallery';
import VideoShowcase from '@/components/home/VideoShowcase';
import ReviewsSection from '@/components/home/ReviewsSection';
import TeamSection from '@/components/home/TeamSection';
import { FeaturedServices, ServicesGrid } from '@/components/home/Services';
import DestinationModal from '@/components/DestinationModal';
import ProjectPlanner from '@/components/home/ProjectPlanner';
import BookingWizard from '@/components/home/BookingWizard';
import Newsletter from '@/components/home/Newsletter';

/**
 * Owns the one piece of state shared across sections: which service is being
 * previewed. Featured cards, the service grid and the modal all live here so
 * the modal can be a single instance.
 */
export default function HomeSections() {
  const [openId, setOpenId] = useState<number | null>(null);
  const openService = useCallback((id: number) => setOpenId(id), []);
  const close = useCallback(() => setOpenId(null), []);

  const destination = openId === null ? null : (destinations.find((d) => d.id === openId) ?? null);

  function scrollToBooking() {
    close();
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <>
      <Hero />
      <PhotoGallery />
      <VideoShowcase />
      <ReviewsSection />
      <TeamSection />
      <FeaturedServices onOpen={openService} />
      <ServicesGrid onOpen={openService} />
      <ProjectPlanner />
      <BookingWizard reveal />
      <Newsletter />

      <DestinationModal
        destination={destination}
        onClose={close}
        onBook={scrollToBooking}
      />
    </>
  );
}
