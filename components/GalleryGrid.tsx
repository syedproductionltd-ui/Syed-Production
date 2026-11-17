'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { GalleryPost } from '@/types';
import { thumbUrl, thumbSrcSet, galleryPosts as staticGalleryPosts } from '@/lib/data';
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

/** Posts shown before the See More button expands the grid. */
const COLLAPSED_LIMIT = 15;

/**
 * Masonry-ish gallery grid with a lightbox.
 *
 * Covers are real <img> elements with native lazy loading and a srcset, so
 * tiles are visible before hydration and the browser can pick a phone-sized
 * thumbnail. Grid rows are a fixed 200px in CSS, so nothing shifts on load.
 *
 * Initial paint always uses server/static posts so the section is never blank
 * while a background refresh runs.
 *
 * `collapsible` reproduces the home page's "See More": the grid starts with 15
 * posts and reveals the remaining posts on demand.
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
  const gridRef = useRef<HTMLDivElement | null>(null);

  // Render only the tiles that are actually shown while collapsed. Mounting
  // `display:none` tiles still queues their image requests.
  const shownPosts =
    collapsible && !expanded ? posts.slice(0, collapsedLimit) : posts;

  // Keep in sync when the server passes fresh props (e.g. after navigation).
  useEffect(() => {
    setPosts(normalizePosts(initialPosts));
  }, [initialPosts]);

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

  // An image can finish downloading before React hydrates, so its onLoad never
  // fires. Mark those tiles loaded on mount to remove the skeleton overlay.
  useEffect(() => {
    const imgs = gridRef.current?.querySelectorAll<HTMLImageElement>('.gallery-item-img');
    imgs?.forEach((img) => {
      const tile = img.parentElement;
      if (!img.complete || !tile) return;
      tile.classList.add(img.naturalWidth > 0 ? 'is-loaded' : 'is-failed');
    });
  }, [shownPosts]);

  const toggle = useCallback(() => setExpanded((prev) => !prev), []);

  const tileCount = posts.filter(
    (post) => post.coverImage || post.images[0]?.imageUrl
  ).length;
  const hasMore = tileCount > collapsedLimit;
  const showToggle = collapsible && tileCount >= collapsedLimit;

  return (
    <>
      <div
        ref={gridRef}
        className="gallery-grid"
        id="galleryGrid"
        data-collapsed={collapsible && !expanded ? 'true' : undefined}
      >
        {shownPosts.map((post, postIndex) => {
          const coverImageUrl = post.coverImage || post.images[0]?.imageUrl;
          if (!coverImageUrl) return null;
          const coverSrc = thumbUrl(coverImageUrl, 640);
          const coverSrcSet = thumbSrcSet(coverImageUrl);
          const initialImageIdx = coverIndexForPost(post);
          const eager = postIndex < 4;
          return (
            <div
              key={`${post.id}-${coverSrc}`}
              className="gallery-item"
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
              <img
                className="gallery-item-img"
                src={coverSrc}
                srcSet={coverSrcSet}
                sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 300px"
                alt={post.title}
                loading={eager ? 'eager' : 'lazy'}
                fetchPriority={postIndex === 0 ? 'high' : 'auto'}
                decoding="async"
                onLoad={(e) => {
                  const tile = e.currentTarget.parentElement;
                  tile?.classList.add('is-loaded');
                  tile?.classList.remove('is-failed');
                }}
                onError={(e) => {
                  e.currentTarget.parentElement?.classList.add('is-failed');
                }}
              />
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

      {showToggle && (
        <div className="gallery-see-more">
          {hasMore ? (
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
          ) : (
            <Link className="btn btn-outline gallery-toggle-btn" id="gallerySeeMore" href="/portfolio">
              See More
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path
                  d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"
                  fill="currentColor"
                />
              </svg>
            </Link>
          )}
        </div>
      )}

      <Lightbox posts={posts} openCoords={openCoords} onClose={() => setOpenCoords(null)} />
    </>
  );
}
