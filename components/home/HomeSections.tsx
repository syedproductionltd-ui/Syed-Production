'use client';

import { useCallback, useEffect, useState } from 'react';
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
  /**
   * Service handed to the booking wizard when a card's "Book Now" is used.
   * Held here because the modal and the wizard are siblings, and the modal only
   * knows the id of what it is showing.
   */
  const [bookingId, setBookingId] = useState<number | null>(null);
  /** Set to defer the booking scroll until the modal's scroll lock is released. */
  const [scrollPending, setScrollPending] = useState(false);
  const openService = useCallback((id: number) => setOpenId(id), []);
  const close = useCallback(() => setOpenId(null), []);

  const destination = openId === null ? null : (destinations.find((d) => d.id === openId) ?? null);

  /**
   * "Book Now": go straight to WhatsApp with the deal.
   *
   * Called straight from the click so it is a user gesture - window.open is
   * popup-blocked otherwise.
   */
  const bookOnWhatsApp = useCallback(
    (service: Destination) => {
      window.open(whatsappUrl(serviceEnquiry(service)), '_blank', 'noopener');
      setOpenId(null);
    },
    []
  );

  /** "Use booking form": carry the service into the wizard and scroll to it. */
  const planBooking = useCallback((service: Destination) => {
    setBookingId(service.id);
    setScrollPending(true);
    setOpenId(null);
  }, []);

  /**
   * Scrolls only once the modal's scroll lock is actually released.
   *
   * The destination prop going null only schedules an unlock - React has not
   * re-rendered yet, so <html> still carries .scroll-locked
   * (position: fixed; overflow: hidden). Scrolling then is a no-op, and the
   * unlock's own window.scrollTo(0, lockedAtY) puts the page straight back,
   * which is why clicking Book Used to appear to do nothing at all.
   *
   * React flushes every passive cleanup for a commit before running any
   * effects, so the modal's unlock has already run by the time this fires.
   */
  useEffect(() => {
    if (!scrollPending) return;
    setScrollPending(false);
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
  }, [scrollPending]);

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
      <BookingWizard reveal preselectId={bookingId} />
      <Newsletter />

      <DestinationModal
        destination={destination}
        onClose={close}
        onBook={bookOnWhatsApp}
        onPlan={planBooking}
      />
    </>
  );
}
