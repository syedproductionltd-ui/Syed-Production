'use client';

import { useCallback, useState } from 'react';
import { destinations } from '@/lib/data';
import type { Destination } from '@/lib/types';
import { serviceEnquiry, whatsappUrl } from '@/lib/whatsapp';
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

  /**
   * "Book Now": go straight to WhatsApp with the deal.
   *
   * Called straight from the click so it is a user gesture - window.open is
   * popup-blocked otherwise. This is the only path from a service card to
   * WhatsApp; the booking wizard below is reached from the nav instead.
   */
  const bookOnWhatsApp = useCallback((service: Destination) => {
    window.open(whatsappUrl(serviceEnquiry(service)), '_blank', 'noopener');
    setOpenId(null);
  }, []);

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
        onBook={bookOnWhatsApp}
      />
    </>
  );
}
