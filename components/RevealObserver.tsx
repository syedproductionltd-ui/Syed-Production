'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Progressive-enhancement scroll reveal.
 *
 * Content stays visible by default (see `.reveal-up` in styles.css). This
 * component opts into hide-until-in-view by adding `reveal-js` on <html>, then
 * adds `.revealed` as elements enter the viewport.
 *
 * React has no record of the imperative `.revealed` class, so a re-render that
 * rewrites `className` can strip it. A WeakSet + MutationObserver re-applies
 * `.revealed` to anything already revealed so sections never go blank again.
 * Scroll-out never removes `.revealed`.
 */
export default function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const revealed = new WeakSet<Element>();

    const markRevealed = (el: Element) => {
      revealed.add(el);
      el.classList.add('revealed');
    };

    const retarget = () =>
      Array.from(document.querySelectorAll<HTMLElement>('.reveal-up'));

    const targets = retarget();
    if (!targets.length) return;

    if (!('IntersectionObserver' in window)) {
      targets.forEach(markRevealed);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          markRevealed(entry.target);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    // Mark in-view targets BEFORE enabling hide-until-reveal, so above-the-fold
    // content never flashes to opacity 0 for a frame.
    const vh = window.innerHeight || 0;
    targets.forEach((el) => {
      if (el.classList.contains('revealed')) {
        markRevealed(el);
        return;
      }
      const rect = el.getBoundingClientRect();
      if (rect.top < vh * 0.92 && rect.bottom > 0) {
        markRevealed(el);
        return;
      }
      observer.observe(el);
    });

    root.classList.add('reveal-js');

    // Re-apply `.revealed` when React rewrites className without it.
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type !== 'attributes' || m.attributeName !== 'class') continue;
        const el = m.target;
        if (!(el instanceof Element)) continue;
        if (!el.classList.contains('reveal-up')) continue;
        if (revealed.has(el) && !el.classList.contains('revealed')) {
          el.classList.add('revealed');
        }
      }
    });
    mo.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    });

    // Elements mounted after the first pass (rare) still get observed.
    const moNodes = new MutationObserver(() => {
      for (const el of retarget()) {
        if (revealed.has(el) || el.classList.contains('revealed')) {
          markRevealed(el);
          continue;
        }
        observer.observe(el);
      }
    });
    moNodes.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mo.disconnect();
      moNodes.disconnect();
      // Leaving `.revealed` in place; removing reveal-js makes everything visible.
      root.classList.remove('reveal-js');
    };
  }, [pathname]);

  return null;
}
