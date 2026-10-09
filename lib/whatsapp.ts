import { siteConfig, settings } from './data';
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
 * one" and nothing to match against, so the tier travels with it.
 *
 * Deliberately no price: rates are quoted per enquiry rather than published in
 * the message, so nothing on the site commits the studio to a figure.
 */
export function serviceEnquiry(service: Destination): string {
  return [
    `Hello! I'd like to book "${service.name}".`,
    '',
    `Package: ${service.tier}`,
    '',
    'Please share availability and a quote. Thank you!',
  ].join('\n');
}

export const brandName = settings.branding.companyName;

export const siteUrl = 'https://syedproductions.com';