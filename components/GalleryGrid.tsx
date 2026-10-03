'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { GalleryImage } from '@/lib/types';
import { assetUrl, thumbUrl } from '@/lib/data';
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
  const gridRef = useRef<HTMLDivElement | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  const items = useMemo<LightboxItem[]>(
    () => images.map((img) => ({ src: assetUrl(img.imageUrl), alt: img.altText })),
    [images]
  );

  /** Tiles still waiting for a background, scoped to this grid only. */
  const pendingTiles = useCallback(
    () =>
      Array.from(
        gridRef.current?.querySelectorAll<HTMLElement>('.gallery-item[data-bg-src]') ?? []
      ),
    []
  );

  /**
   * Swaps the placeholder tint for the thumbnail only once the bytes arrive.
   *
   * A CSS background raises no load/error events, so assigning
   * `backgroundImage` directly makes a failed fetch look identical to a pending
   * one: a tile that stays empty forever with nothing to distinguish "still
   * loading" from "will never load". Probing through `Image` first gives us both
   * outcomes - `is-loaded` paints the photo, `is-failed` settles the tile as
   * unavailable instead of leaving it looking pending.
   */
  const paint = useCallback((el: HTMLElement) => {
    const src = el.dataset.bgSrc;
    if (!src) return;
    delete el.dataset.bgSrc;
    observer.current?.unobserve(el);
    const probe = new Image();
    probe.onload = () => {
      el.style.backgroundImage = `url("${src}")`;
      el.classList.add('is-loaded');
    };
    probe.onerror = () => el.classList.add('is-failed');
    probe.src = src;
  }, []);

  /**
   * Re-arms whenever `expanded` flips, not just on mount.
   *
   * A collapsed tile is `display: none`, so it has no box and the observer
   * never reports it as intersecting. Arming once on mount left those tiles
   * holding their `data-bg-src` forever, so revealing them on "See More" showed
   * empty placeholders that never painted as they were scrolled into view.
   */
  useEffect(() => {
    const pending = pendingTiles();
    if (!pending.length) return;

    if (!('IntersectionObserver' in window)) {
      pending.forEach(paint);
      return;
    }

    observer.current?.disconnect();
    observer.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) paint(entry.target as HTMLElement);
        }
      },
      { rootMargin: '500px 0px' }
    );
    pending.forEach((el) => observer.current?.observe(el));

    // Paint what is already on screen straight away instead of waiting a frame
    // for the observer to report it.
    const raf = requestAnimationFrame(() => {
      for (const el of pending) {
        if (!el.isConnected || !el.dataset.bgSrc) continue;
        const box = el.getBoundingClientRect();
        if (box.bottom > -500 && box.top < window.innerHeight + 500) paint(el);
      }
    });

    return () => {
      cancelAnimationFrame(raf);
      observer.current?.disconnect();
      observer.current = null;
    };
  }, [expanded, paint, pendingTiles]);

  const toggle = useCallback(() => setExpanded((prev) => !prev), []);

  return (
    <>
      <div
        ref={gridRef}
        className={`gallery-grid${reveal ? ' reveal-up' : ''}${expanded ? ' expanded' : ''}`}
        id="galleryGrid"
      >
        {images.map((img, i) => (
          <div
            key={img.imageUrl}
            className={`gallery-item${img.hidden && !expanded ? ' gallery-hidden' : ''}`}
            data-bg-src={thumbUrl(img.imageUrl)}
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
