import { siteConfig, settings } from './data';

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

export const brandName = settings.branding.companyName;

export const siteUrl = 'https://syedproductions.com';