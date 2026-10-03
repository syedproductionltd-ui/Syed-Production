'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { GalleryImage } from '@/lib/types';
import Lightbox, { type LightboxItem } from './Lightbox';

/**
 * Masonry-ish gallery grid with a lightbox.
 *
 * Tiles paint their background-image only when near the viewport:
 * background-image cannot take loading="lazy", and painting all 37 photos up
 * front makes scrolling stutter on low-power phones. Grid rows are a fixed
 * 200px in CSS, so nothing shifts height when a tile paints — which is what
 * keeps the browser from re-anchoring the scroll.
 *
 * `collapsible` reproduces the home page's "See More": tiles flagged hidden in
 * the data stay collapsed until the button is pressed.
 */
export default function GalleryGrid({
  images,
  collapsible = false,
  reveal = false,
}: {
  images: GalleryImage[];
  collapsible?: boolean;
  /** Adds .reveal-up so the grid fades in on scroll, as on the home page. */
  reveal?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  const items = useMemo<LightboxItem[]>(
    () => images.map((img) => ({ src: `/${img.imageUrl}`, alt: img.altText })),
    [images]
  );

  const paint = useCallback((el: HTMLElement) => {
    const src = el.dataset.bgSrc;
    if (!src) return;
    el.style.backgroundImage = `url('${src}')`;
    el.classList.add('loaded');
    delete el.dataset.bgSrc;
    observer.current?.unobserve(el);
  }, []);

  useEffect(() => {
    const pending = () =>
      document.querySelectorAll<HTMLElement>('.gallery-item[data-bg-src]');

    if (!('IntersectionObserver' in window)) {
      pending().forEach(paint);
      return;
    }

    observer.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) paint(entry.target as HTMLElement);
        }
      },
      { rootMargin: '500px 0px' }
    );

    pending().forEach((el) => observer.current?.observe(el));
    return () => observer.current?.disconnect();
  }, [paint]);

  const toggle = useCallback(() => {
    setExpanded((prev) => {
      if (!prev) {
        // Newly revealed tiles are not observed yet, so paint them directly.
        requestAnimationFrame(() => {
          document
            .querySelectorAll<HTMLElement>('.gallery-item[data-bg-src]')
            .forEach(paint);
        });
      }
      return !prev;
    });
  }, [paint]);

  return (
    <>
      <div
        className={`gallery-grid${reveal ? ' reveal-up' : ''}${expanded ? ' expanded' : ''}`}
        id="galleryGrid"
      >
        {images.map((img, i) => (
          <div
            key={img.imageUrl}
            className={`gallery-item${img.hidden && !expanded ? ' gallery-hidden' : ''}`}
            data-bg-src={`/${img.imageUrl}`}
            role="button"
            tabIndex={0}
            aria-label={`View photo ${i + 1}`}
            onClick={() => setOpenIndex(i)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setOpenIndex(i);
              }
            }}
          />
        ))}
      </div>

      {collapsible && (
        <div className={`gallery-see-more${reveal ? ' reveal-up' : ''}`}>
          <button
            className="btn btn-outline gallery-toggle-btn"
            id="gallerySeeMore"
            onClick={toggle}
            aria-expanded={expanded}
          >
            {expanded ? 'See Less' : 'See More'}
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path
                d={
                  expanded
                    ? 'M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z'
                    : 'M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z'
                }
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      )}

      <Lightbox items={items} openIndex={openIndex} onClose={() => setOpenIndex(null)} />
    </>
  );
}
