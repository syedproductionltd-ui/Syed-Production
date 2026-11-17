'use client';

import { useCallback, useState } from 'react';
import { destinations } from '@/lib/data';
import type { Destination } from '@/types';
import { serviceEnquiry, whatsappUrl } from '@/utils/whatsapp';
import { FeaturedServices, ServicesGrid } from '@/components/home/Services';
import DestinationModal from '@/components/DestinationModal';

/**
 * Owns the one piece of state shared across the service sections: which service
 * is being previewed. Keeping this island separate lets the hero, gallery,
 * videos, reviews, planner, booking and newsletter render outside a single
 * page-wide client boundary.
 */
export default function ServicesExplorer() {
  const [openId, setOpenId] = useState<number | null>(null);
  const openService = useCallback((id: number) => setOpenId(id), []);
  const close = useCallback(() => setOpenId(null), []);

  const destination =
    openId === null ? null : (destinations.find((d) => d.id === openId) ?? null);

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
      <FeaturedServices onOpen={openService} />
      <ServicesGrid onOpen={openService} />
      <DestinationModal
        destination={destination}
        onClose={close}
        onBook={bookOnWhatsApp}
      />
    </>
  );
}
