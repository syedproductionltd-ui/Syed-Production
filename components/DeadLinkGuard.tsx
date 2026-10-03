'use client';

import { useEffect } from 'react';

/**
 * The footer and several sections carry placeholder links (`href="#"`).
 * With `scroll-behavior: smooth` on <html>, tapping one animates the whole
 * page back to the top, which reads as the site scrolling on its own.
 * Neutralise navigation for those without changing their appearance.
 */
export default function DeadLinkGuard() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const link = target?.closest?.('a[href="#"]');
      if (link) e.preventDefault();
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return null;
}