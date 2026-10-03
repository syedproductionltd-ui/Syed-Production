'use client';

import { useCallback, useEffect } from 'react';

/**
 * Locks the root scroller while an overlay is open.
 *
 * Locks <html>, not <body>: body is not the scroll container. Combined with
 * `overflow-x: clip` (see app/styles.css) there is no second, phantom scroller
 * for the page to drift inside, and remembering the offset means the page is
 * exactly where the user left it when the overlay closes.
 */

// Module scope, not per-hook state: several overlays can be mounted at once
// (a lightbox opened from the reels viewer), and they must share one count.
let lockCount = 0;
let lockedAtY = 0;

function release() {
  const root = document.documentElement;
  root.classList.remove('scroll-locked');
  root.style.top = '';
  // html has scroll-behavior: smooth, which would animate the restore.
  const prev = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';
  window.scrollTo(0, lockedAtY);
  root.style.scrollBehavior = prev;
}

export function useScrollLock() {
  const lock = useCallback(() => {
    if (lockCount === 0) {
      lockedAtY = window.scrollY;
      document.documentElement.style.top = `-${lockedAtY}px`;
      document.documentElement.classList.add('scroll-locked');
    }
    lockCount += 1;
  }, []);

  const unlock = useCallback(() => {
    if (lockCount === 0) return;
    lockCount -= 1;
    if (lockCount > 0) return;
    release();
  }, []);

  useEffect(() => {
    return () => {
      // Never leave the page locked if an overlay unmounts while open.
      if (lockCount > 0) {
        lockCount = 0;
        release();
      }
    };
  }, []);

  return { lock, unlock };
}
