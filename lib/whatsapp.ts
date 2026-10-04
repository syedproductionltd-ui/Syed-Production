import { siteConfig, settings, formatPrice } from './data';
import type { Destination } from './types';

/** Digits-only WhatsApp number in international format, e.g. 923555551555 */
function waNumber(): string {
  return String(siteConfig.whatsappNumber).replace(/\D/g, '');
}

export function whatsappUrl(message: string): string {
  return `https://wa.me/${waNumber()}?text=${encodeURIComponent(message)}`;
}

export function openWhatsApp(message: string): void {
  window.open(whatsappUrl(message), '_blank', 'noopener');
}

/**
 * Enquiry sent straight from a service card's "Book Now".
 *
 * This skips the booking wizard, so unlike the wizard's message it has to carry
 * the deal itself. The service name alone leaves the studio with "the wedding
 * one" and nothing to match against, so the tier and starting price travel with
 * it.
 */
export function serviceEnquiry(service: Destination): string {
  return [
    `Hello! I'd like to book "${service.name}".`,
    '',
    `Package: ${service.tier}`,
    `Starting price: ${formatPrice(service.price)}`,
    '',
    'Please share availability and a quote. Thank you!',
  ].join('\n');
}

export const brandName = settings.branding.companyName;

export const siteUrl = 'https://syedproductions.com';