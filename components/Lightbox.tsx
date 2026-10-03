'use client';

import { useCallback, useEffect, useState } from 'react';
import { useScrollLock } from '@/lib/useScrollLock';

export interface LightboxItem {
  src: string;
  alt: string;
}

export default function Lightbox({
  items,
  openIndex,
  onClose,
}: {
  items: LightboxItem[];
  /** null keeps the lightbox closed. */
  openIndex: number | null;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const { lock, unlock } = useScrollLock();
  const isOpen = openIndex !== null;

  useEffect(() => {
    if (openIndex !== null) setIndex(openIndex);
  }, [openIndex]);

  useEffect(() => {
    if (!isOpen) return;
    lock();
    return () => unlock();
  }, [isOpen, lock, unlock]);

  // Mirror the original two-phase reveal. Opening: unhide, then add `.open` on
  // the next frame so the CSS opacity transition runs. Closing: drop `.open`
  // first, then set `hidden` once the 300ms transition has finished.
  const [mounted, setMounted] = useState(false);
  const [fadingIn, setFadingIn] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      const id = requestAnimationFrame(() => setFadingIn(true));
      return () => cancelAnimationFrame(id);
    }
    setFadingIn(false);
    const timer = setTimeout(() => setMounted(false), 300);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const go = useCallback(
    (dir: number) => setIndex((prev) => (prev + dir + items.length) % items.length),
    [items.length]
  );

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose, go]);

  const current = items[index];

  return (
    <div
      className={`lightbox${fadingIn ? ' open' : ''}`}
      id="galleryLightbox"
      hidden={!mounted}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button
        className="lightbox-close"
        id="lightboxClose"
        onClick={onClose}
        aria-label="Close lightbox"
      >
        &times;
      </button>
      <button
        className="lightbox-arrow lightbox-prev"
        id="lightboxPrev"
        onClick={() => go(-1)}
        aria-label="Previous photo"
      >
        <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
          <path
            d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"
            fill="currentColor"
          />
        </svg>
      </button>
      <img
        className="lightbox-img"
        id="lightboxImg"
        src={current?.src ?? ''}
        alt={current?.alt ?? ''}
      />
      <button
        className="lightbox-arrow lightbox-next"
        id="lightboxNext"
        onClick={() => go(1)}
        aria-label="Next photo"
      >
        <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" fill="currentColor" />
        </svg>
      </button>
      <div className="lightbox-counter" id="lightboxCounter">
        {index + 1} / {items.length}
      </div>
    </div>
  );
}