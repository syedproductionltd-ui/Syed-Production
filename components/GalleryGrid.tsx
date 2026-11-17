'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { GalleryPost } from '@/types';
import { thumbUrl, galleryPosts as staticGalleryPosts } from '@/lib/data';
import Lightbox from './Lightbox';

function sameImageUrl(a?: string, b?: string): boolean {
  if (!a || !b) return false;
  return a.replace(/^\/+/, '') === b.replace(/^\/+/, '');
}

function normalizePost(p: any, idx = 0): GalleryPost {
  const images = [...(p.images || [])]
    .map((img: any, i: number) => {
      if (typeof img === 'string') {
        return { imageUrl: img, altText: p.title, hidden: i >= 5, sortOrder: i + 1, _i: i };
      }
      const so = typeof img.sortOrder === 'number' && Number.isFinite(img.sortOrder) ? img.sortOrder : i + 1;
      return { ...img, altText: img.altText || p.title, sortOrder: so, _i: i };
    })
    .sort((a: any, b: any) => (a.sortOrder - b.sortOrder) || (a._i - b._i))
    .map((img: any, i: number) => ({ imageUrl: img.imageUrl, altText: img.altText, hidden: Boolean(img.hidden), sortOrder: i + 1 }));
  const sortOrder = typeof p.sortOrder === 'number' && Number.isFinite(p.sortOrder) ? p.sortOrder : idx + 1;
  return { id: p.id || p.title, title: p.title, category: p.category, coverImage: p.coverImage || images[0]?.imageUrl, images, sortOrder };
}

function normalizePosts(posts?: GalleryPost[]): GalleryPost[] {
  const list = posts?.length ? posts : staticGalleryPosts;
  return [...list]
    .map((p, i) => normalizePost(p as any, i))
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((p, i) => ({ ...p, sortOrder: i + 1 }));
}

function coverIndexForPost(post: GalleryPost): number {
  if (!post.coverImage || !post.images?.length) return 0;
  const idx = post.images.findIndex((img) => sameImageUrl(img.imageUrl, post.coverImage));
  return idx >= 0 ? idx : 0;
}

function resolveInitial(posts?: GalleryPost[]): GalleryPost[] {
  return normalizePosts(posts);
}

/** Rows shown before the See More button expands the grid. */
const COLLAPSED_ROWS = 3;
/** Desktop column count, used until the grid has been measured. */
const DEFAULT_COLUMNS = 4;

/**
 * Masonry-ish gallery grid with a lightbox.
 *
 * Tiles paint their background-image only when near the viewport:
 * background-image cannot take loading="lazy", and painting all photos up
 * front makes scrolling stutter on low-power phones. Grid rows are a fixed
 * 200px in CSS, so nothing shifts height when a tile paints.
 *
 * Initial paint always uses server/static posts so the section is never blank
 * while a background refresh runs.
 *
 * `collapsible` reproduces the home page's "See More": the grid starts at three
 * rows and reveals the remaining posts on demand.
 */
export default function GalleryGrid({
  posts: initialPosts,
  collapsible = false,
  reveal = false,
}: {
  posts?: GalleryPost[];
  collapsible?: boolean;
  /** Adds .reveal-up so the grid fades in on scroll, as on the home page. */
  reveal?: boolean;
}) {
  const [posts, setPosts] = useState<GalleryPost[]>(() => resolveInitial(initialPosts));
  const [expanded, setExpanded] = useState(false);
  const [visibleLimit, setVisibleLimit] = useState(
    () => DEFAULT_COLUMNS * COLLAPSED_ROWS - 1
  );
  const [openCoords, setOpenCoords] = useState<{ postIndex: number; imageIndex: number } | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  // Keep in sync when the server passes fresh props (e.g. after navigation).
  useEffect(() => {
    setPosts(normalizePosts(initialPosts));
  }, [initialPosts]);

  /**
   * Keep the collapsed grid at exactly three rows on every breakpoint. The
   * first tile is double-height, so a three-row block holds one fewer tile
   * than `columns * COLLAPSED_ROWS`.
   */
  useEffect(() => {
    if (!collapsible) return;
    const el = gridRef.current;
    if (!el) return;

    const measure = () => {
      const columns = getComputedStyle(el).gridTemplateColumns
        .split(' ')
        .filter(Boolean).length;
      setVisibleLimit(columns * COLLAPSED_ROWS - 1);
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [collapsible]);

  // Server-provided posts are already fresh; only query the API when the page
  // mounted without any (static export / API-only usage) to avoid a second
  // fetch and a full grid re-render during the first scroll.
  useEffect(() => {
    if (initialPosts?.length) return;
    let cancelled = false;
    fetch('/api/gallery', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.success && data.posts && data.posts.length > 0) {
          setPosts(normalizePosts(data.posts));
        } else if (!initialPosts?.length) {
          setPosts(normalizePosts(staticGalleryPosts));
        }
      })
      .catch(() => {
        if (!initialPosts?.length) setPosts(normalizePosts(staticGalleryPosts));
      });
    return () => {
      cancelled = true;
    };
  }, [initialPosts]);

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
   */
  const paint = useCallback((el: HTMLElement) => {
    const src = el.dataset.bgSrc;
    if (!src) return;
    delete el.dataset.bgSrc;
    observer.current?.unobserve(el);
    const probe = new Image();
    probe.onload = () => {
      probe.onload = null;
      probe.onerror = null;
      if (!el.isConnected) return;
      el.style.backgroundImage = `url("${src}")`;
      el.classList.add('is-loaded');
      el.classList.remove('is-failed');
    };
    probe.onerror = () => {
      probe.onload = null;
      probe.onerror = null;
      if (el.isConnected) el.classList.add('is-failed');
    };
    probe.src = src;
  }, []);

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

    const raf = requestAnimationFrame(() => {
      for (const el of pending) {
        if (!el.isConnected || !el.dataset.bgSrc) continue;
        const box = el.getBoundingClientRect();
        // `display:none` tiles report a zero-size rect; painting them would
        // download full-size images for content the user cannot see.
        if (!box.width || !box.height) continue;
        if (box.bottom > -500 && box.top < window.innerHeight + 500) paint(el);
      }
    });

    return () => {
      cancelAnimationFrame(raf);
      observer.current?.disconnect();
      observer.current = null;
    };
    // Re-run when posts change so new/remounted tiles (cover updates) get painted.
  }, [expanded, visibleLimit, posts, paint, pendingTiles]);

  const toggle = useCallback(() => setExpanded((prev) => !prev), []);

  const tileCount = posts.filter(
    (post) => post.coverImage || post.images[0]?.imageUrl
  ).length;
  const canExpand = collapsible && tileCount > visibleLimit;

  // Render only the tiles that are actually shown while collapsed. Relying on
  // `display:none` alone still mounted every tile (and its lazy observer), and
  // the eager paint pass treated hidden zero-size rects as in-view.
  const shownPosts =
    collapsible && !expanded ? posts.slice(0, visibleLimit) : posts;

  return (
    <>
      <div
        ref={gridRef}
        className={`gallery-grid${reveal ? ' reveal-up' : ''}`}
        id="galleryGrid"
        data-collapsed={collapsible && !expanded ? 'true' : undefined}
      >
        {shownPosts.map((post, postIndex) => {
          const coverImageUrl = post.coverImage || post.images[0]?.imageUrl;
          if (!coverImageUrl) return null;
          const coverSrc = thumbUrl(coverImageUrl, 640);
          const initialImageIdx = coverIndexForPost(post);
          return (
            <div
              key={`${post.id}-${coverSrc}`}
              className="gallery-item"
              data-bg-src={coverSrc}
              role="button"
              tabIndex={0}
              aria-label={`View post: ${post.title}`}
              onClick={() => setOpenCoords({ postIndex, imageIndex: initialImageIdx })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setOpenCoords({ postIndex, imageIndex: initialImageIdx });
                }
              }}
            >
              {post.images.length > 1 && (
                <div className="gallery-item-badge" aria-label={`${post.images.length} photos in post`}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                    <path d="M16 1H4C2.9 1 2 1.9 2 3v12h2V3h12V1zm3 4H8C6.9 5 6 5.9 6 7v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {collapsible && canExpand && (
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

      <Lightbox posts={posts} openCoords={openCoords} onClose={() => setOpenCoords(null)} />
    </>
  );
}
