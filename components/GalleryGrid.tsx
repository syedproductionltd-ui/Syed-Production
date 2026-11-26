'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import type { GalleryPost } from '@/types';
import { thumbUrl, thumbSrcSet, galleryPosts as staticGalleryPosts } from '@/lib/data';
import Lightbox from './Lightbox';

function sameImageUrl(a?: string, b?: string): boolean {
  if (!a || !b) return false;
  return a.replace(/^\/+/, '') === b.replace(/^\/+/, '');
}

function intrinsicSize(url?: string): { width?: number; height?: number } {
  if (url && /^\/?images\/gallery\//.test(url)) return { width: 1400, height: 2100 };
  return {};
}

function normalizePost(p: any, idx = 0): GalleryPost {
  const images = [...(p.images || [])]
    .map((img: any, i: number) => {
      if (typeof img === 'string') {
        return { imageUrl: img, altText: p.title, hidden: i >= 5, sortOrder: i + 1, ...intrinsicSize(img), _i: i };
      }
      const so = typeof img.sortOrder === 'number' && Number.isFinite(img.sortOrder) ? img.sortOrder : i + 1;
      return { ...img, altText: img.altText || p.title, sortOrder: so, ...intrinsicSize(img.imageUrl), _i: i };
    })
    .sort((a: any, b: any) => (a.sortOrder - b.sortOrder) || (a._i - b._i))
    .map((img: any, i: number) => ({
      imageUrl: img.imageUrl,
      altText: img.altText,
      hidden: Boolean(img.hidden),
      sortOrder: i + 1,
      width: img.width,
      height: img.height,
    }));
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

interface GalleryTile {
  post: GalleryPost;
  postIndex: number;
  imageIndex: number;
  imageUrl: string;
  altText: string;
  hidden: boolean;
  width?: number;
  height?: number;
}

function buildTiles(posts: GalleryPost[]): GalleryTile[] {
  const tiles: GalleryTile[] = [];
  posts.forEach((post, postIndex) => {
    const images = post.images ?? [];
    const coverIndex = coverIndexForPost(post);
    const cover = images[coverIndex] || images[0];
    const imageUrl = cover?.imageUrl || post.coverImage;
    if (!imageUrl) return;
    const size = intrinsicSize(imageUrl);
    tiles.push({
      post,
      postIndex,
      imageIndex: cover ? coverIndex : 0,
      imageUrl,
      altText: cover?.altText || post.title,
      hidden: false,
      width: cover?.width ?? size.width,
      height: cover?.height ?? size.height,
    });
  });
  return tiles;
}

function resolveInitial(posts?: GalleryPost[]): GalleryPost[] {
  return normalizePosts(posts);
}

/** Posts shown before the See More button expands the grid. */
const COLLAPSED_LIMIT = 16;

/**
 * Masonry-ish gallery grid with a lightbox.
 *
 * Covers are real <img> elements with native lazy loading and a srcset. Each
 * tile reserves space from its intrinsic ratio, then the image renders at
 * width:100% / height:auto so its full proportions are visible without crop.
 *
 * Initial paint always uses server/static posts so the section is never blank
 * while a background refresh runs.
 *
 * `collapsible` reproduces the home page's "See More": the grid starts with 16
 * images and reveals the remaining images (including hidden ones) on demand.
 */
export default function GalleryGrid({
  posts: initialPosts,
  collapsible = false,
  collapsedLimit = COLLAPSED_LIMIT,
}: {
  posts?: GalleryPost[];
  collapsible?: boolean;
  collapsedLimit?: number;
}) {
  const [posts, setPosts] = useState<GalleryPost[]>(() => resolveInitial(initialPosts));
  const [expanded, setExpanded] = useState(false);
  const [openCoords, setOpenCoords] = useState<{ postIndex: number; imageIndex: number } | null>(null);
  const [gridMetrics, setGridMetrics] = useState({ columnWidth: 0, rowUnit: 4, rowGap: 16 });
  const [loadedRatios, setLoadedRatios] = useState<Record<string, number>>({});
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const gridRef = useRef<HTMLDivElement | null>(null);

  const allTiles = useMemo(() => buildTiles(posts), [posts]);
  const visibleTiles = expanded ? allTiles : allTiles.filter((tile) => !tile.hidden);
  const shownTiles = collapsible && !expanded ? visibleTiles.slice(0, collapsedLimit) : visibleTiles;

  // Keep in sync when the server passes fresh props (e.g. after navigation).
  useEffect(() => {
    setPosts(normalizePosts(initialPosts));
  }, [initialPosts]);

  // Always refresh from the API so newly uploaded/published admin posts appear
  // without waiting for ISR revalidation or a hard refresh.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/gallery', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.success && Array.isArray(data.posts) && data.posts.length > 0) {
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

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    const measure = () => {
      const style = getComputedStyle(el);
      const columns = style.gridTemplateColumns.split(' ').filter(Boolean).length || 1;
      const columnGap = parseFloat(style.columnGap) || 0;
      const rowGap = parseFloat(style.rowGap) || columnGap;
      const rowUnit = parseFloat(style.gridAutoRows) || 4;
      const columnWidth = (el.clientWidth - columnGap * (columns - 1)) / columns;
      setGridMetrics((prev) =>
        prev.columnWidth === columnWidth && prev.rowUnit === rowUnit && prev.rowGap === rowGap
          ? prev
          : { columnWidth, rowUnit, rowGap }
      );
    };

    measure();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    observer?.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  // An image can finish downloading before React hydrates, so its onLoad never
  // fires. Mark those tiles loaded on mount to remove the skeleton overlay.
  useEffect(() => {
    const imgs = gridRef.current?.querySelectorAll<HTMLImageElement>('.gallery-item-img');
    imgs?.forEach((img) => {
      const tile = img.parentElement;
      if (!img.complete || !tile) return;
      if (img.naturalWidth > 0) {
        tile.classList.add('is-loaded');
        const key = img.dataset.ratioKey;
        if (key && img.naturalHeight > 0) {
          const ratio = img.naturalWidth / img.naturalHeight;
          setLoadedRatios((prev) => (prev[key] === ratio ? prev : { ...prev, [key]: ratio }));
        }
      }
    });
  }, [shownTiles]);

  const toggle = useCallback(() => setExpanded((prev) => !prev), []);

  const showToggle = collapsible && allTiles.length >= collapsedLimit;

  return (
    <>
      <div
        ref={gridRef}
        className="gallery-grid"
        id="galleryGrid"
        data-collapsed={collapsible && !expanded ? 'true' : undefined}
      >
        {shownTiles.map((tile, tileIndex) => {
          const ratioKey = tile.imageUrl.replace(/^\/+/, '');
          const useOriginal = Boolean(failedImages[ratioKey]);
          const coverSrc = useOriginal ? tile.imageUrl : thumbUrl(tile.imageUrl, 640);
          const coverSrcSet = useOriginal ? undefined : thumbSrcSet(tile.imageUrl);
          const ratio = loadedRatios[ratioKey] ?? (tile.width && tile.height ? tile.width / tile.height : 2 / 3);
          const imageHeight = gridMetrics.columnWidth ? gridMetrics.columnWidth / ratio : 0;
          const rowSpan = imageHeight
            ? Math.max(1, Math.ceil((imageHeight + gridMetrics.rowGap) / (gridMetrics.rowUnit + gridMetrics.rowGap)))
            : undefined;
          const eager = tileIndex < 8;
          const open = () =>
            setOpenCoords({ postIndex: tile.postIndex, imageIndex: tile.imageIndex });
          const markLoaded = (img: HTMLImageElement) => {
            const el = img.parentElement;
            el?.classList.add('is-loaded');
            el?.classList.remove('is-failed');
            if (img.naturalWidth > 0 && img.naturalHeight > 0) {
              const naturalRatio = img.naturalWidth / img.naturalHeight;
              setLoadedRatios((prev) => (prev[ratioKey] === naturalRatio ? prev : { ...prev, [ratioKey]: naturalRatio }));
            }
          };
          return (
            <div
              key={`${tile.post.id}-${tile.imageIndex}-${coverSrc}`}
              className="gallery-item"
              style={{ '--row-span': rowSpan } as CSSProperties}
              role="button"
              tabIndex={0}
              aria-label={`View photo from: ${tile.post.title}`}
              onClick={open}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  open();
                }
              }}
            >
              <img
                className="gallery-item-img"
                src={coverSrc}
                srcSet={coverSrcSet}
                sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 300px"
                alt={tile.altText}
                width={tile.width}
                height={tile.height}
                data-ratio-key={ratioKey}
                style={{ aspectRatio: String(ratio) }}
                loading={eager ? 'eager' : 'lazy'}
                fetchPriority={tileIndex < 4 ? 'high' : 'auto'}
                decoding="async"
                onLoad={(e) => markLoaded(e.currentTarget)}
                onError={() => {
                  setFailedImages((prev) => (prev[ratioKey] ? prev : { ...prev, [ratioKey]: true }));
                }}
              />
              {tile.post.images.length > 1 && (
                <div className="gallery-item-badge" aria-label={`${tile.post.images.length} photos in post`}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                    <path d="M16 1H4C2.9 1 2 1.9 2 3v12h2V3h12V1zm3 4H8C6.9 5 6 5.9 6 7v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showToggle && (
        <div className="gallery-see-more">
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
