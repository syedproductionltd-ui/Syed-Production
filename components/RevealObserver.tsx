'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Adds `.revealed` to every `.reveal-up` element as it scrolls into view.
 * One shared observer for the whole page rather than one per element.
 *
 * Constraint: `.revealed` is added imperatively, so React has no record of it.
 * Any component that renders a `reveal-up` element must keep its className
 * static - a state-dependent class would make React rewrite the `class`
 * attribute on re-render and silently erase `.revealed`, leaving the element
 * stuck at the `.reveal-up` opacity of 0.
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