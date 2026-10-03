'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Adds `.revealed` to every `.reveal-up` element as it scrolls into view.
 * One shared observer for the whole page rather than one per element.
 */
export default function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>('.reveal-up')
    );
    if (!targets.length) return;

    if (!('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}