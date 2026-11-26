'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { useScrollLock } from '@/hooks/useScrollLock';
import type { GalleryPost } from '@/types';
import { largeImageUrl } from '@/lib/data';

export default function Lightbox({
  posts,
  openCoords,
  onClose,
}: {
  posts: GalleryPost[];
  openCoords: { postIndex: number; imageIndex: number } | null;
  onClose: () => void;
}) {
  const [postIndex, setPostIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const { lock, unlock } = useScrollLock();
  const isOpen = openCoords !== null;

  useEffect(() => {
    if (openCoords !== null) {
      setPostIndex(openCoords.postIndex);
      setImageIndex(openCoords.imageIndex);
    }
  }, [openCoords]);

  useEffect(() => {
    if (!isOpen) return;
    lock();
    return () => unlock();
  }, [isOpen, lock, unlock]);

  const [mounted, setMounted] = useState(false);
  const [fadingIn, setFadingIn] = useState(false);
  const [photoState, setPhotoState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [lightboxFallback, setLightboxFallback] = useState<Record<string, boolean>>({});

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

  const currentPost = posts[postIndex] ?? posts[0];
  const currentImages = currentPost?.images ?? [];
  const currentImage = currentImages[imageIndex] ?? currentImages[0];
  const currentOriginalSrc = currentImage?.imageUrl ?? '';
  const currentOptimizedSrc = currentImage ? largeImageUrl(currentImage.imageUrl) : '';
  const currentSrc = currentImage
    ? lightboxFallback[currentOriginalSrc]
      ? currentOriginalSrc
      : currentOptimizedSrc
    : '';

  const sourceFor = useCallback(
    (post: number, image: number) => {
      const images = posts[post]?.images ?? [];
      const item = images[image] ?? images[0];
      return item ? largeImageUrl(item.imageUrl) : '';
    },
    [posts]
  );

  const nextSrc = currentImages.length > 1
    ? sourceFor(postIndex, (imageIndex + 1) % currentImages.length)
    : sourceFor((postIndex + 1) % posts.length, 0);
  const prevSrc = currentImages.length > 1
    ? sourceFor(postIndex, (imageIndex - 1 + currentImages.length) % currentImages.length)
    : sourceFor((postIndex - 1 + posts.length) % posts.length, 0);

  // Outer navigation (different posts)
  const goPost = useCallback(
    (dir: number) => {
      setPostIndex((prev) => {
        const nextPost = (prev + dir + posts.length) % posts.length;
        setImageIndex(0);
        return nextPost;
      });
    },
    [posts.length]
  );

  // Inner navigation (related images within current post)
  const goImage = useCallback(
    (dir: number) => {
      const len = currentImages.length || 1;
      setImageIndex((prev) => (prev + dir + len) % len);
    },
    [currentImages.length]
  );

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') {
        if (currentImages.length > 1) goImage(-1);
        else goPost(-1);
      }
      if (e.key === 'ArrowRight') {
        if (currentImages.length > 1) goImage(1);
        else goPost(1);
      }
      if (e.key === 'ArrowUp') goPost(-1);
      if (e.key === 'ArrowDown') goPost(1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose, currentImages.length, goImage, goPost]);

  // Touch / swipe support
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      touchStartX.current = touch.clientX;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touch = e.changedTouches[0];
    if (!touch) return;
    const diff = touch.clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        if (currentImages.length > 1 && imageIndex > 0) goImage(-1);
        else goPost(-1);
      } else {
        if (currentImages.length > 1 && imageIndex < currentImages.length - 1) goImage(1);
        else goPost(1);
      }
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    setPhotoState(currentImage ? 'loading' : 'error');
  }, [isOpen, currentImage?.imageUrl, postIndex, imageIndex]);

  useEffect(() => {
    if (!isOpen) return;
    const preload = [currentImage?.imageUrl, nextSrc, prevSrc];
    for (const src of preload) {
      if (!src) continue;
      const prefetch = new Image();
      prefetch.src = src;
    }
  }, [isOpen, currentImage?.imageUrl, nextSrc, prevSrc]);

  return (
    <div
      className={`lightbox${fadingIn ? ' open' : ''}`}
      id="galleryLightbox"
      hidden={!mounted}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button
        className="lightbox-close"
        id="lightboxClose"
        onClick={onClose}
        aria-label="Close lightbox"
      >
        &times;
      </button>

      {/* Outer Navigation: Previous Post */}
      <button
        className="lightbox-arrow lightbox-outer-arrow lightbox-outer-prev"
        onClick={() => goPost(-1)}
        aria-label="Previous post"
        title="Previous post"
      >
        <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="currentColor" />
        </svg>
      </button>

      {/* Main Image Container */}
      <div className="lightbox-media-container">
        {currentImages.length > 1 && (
          <button
            className="lightbox-arrow lightbox-inner-arrow lightbox-inner-prev"
            onClick={() => goImage(-1)}
            aria-label="Previous photo in post"
            title="Previous photo"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="currentColor" />
            </svg>
          </button>
        )}

        {currentSrc && photoState !== 'error' && (
          <img
            key={currentSrc}
            className={`lightbox-img${photoState === 'ready' ? ' ready' : ''}`}
            id="lightboxImg"
            src={currentSrc}
            alt={currentImage?.altText ?? ''}
            decoding="async"
            fetchPriority="high"
            onLoad={() => setPhotoState('ready')}
            onError={() => {
              if (currentOriginalSrc && !lightboxFallback[currentOriginalSrc] && currentSrc !== currentOriginalSrc) {
                setLightboxFallback((prev) => ({ ...prev, [currentOriginalSrc]: true }));
                return;
              }
              setPhotoState('error');
            }}
          />
        )}
        {photoState === 'loading' && (
          <div className="lightbox-loading" id="lightboxLoading" role="status">
            <span className="lightbox-spinner" aria-hidden="true" />
            <span>Loading photo</span>
          </div>
        )}
        {photoState === 'error' && (
          <div className="lightbox-error" id="lightboxError" role="alert">
            <span>Unable to load this photo.</span>
          </div>
        )}

        {currentImages.length > 1 && (
          <button
            className="lightbox-arrow lightbox-inner-arrow lightbox-inner-next"
            onClick={() => goImage(1)}
            aria-label="Next photo in post"
            title="Next photo"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" fill="currentColor" />
            </svg>
          </button>
        )}
      </div>

      {/* Outer Navigation: Next Post */}
      <button
        className="lightbox-arrow lightbox-outer-arrow lightbox-outer-next"
        onClick={() => goPost(1)}
        aria-label="Next post"
        title="Next post"
      >
        <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" fill="currentColor" />
        </svg>
      </button>

      <div className="lightbox-counter" id="lightboxCounter">
        {currentImages.length > 1
          ? `Post ${postIndex + 1} / ${posts.length} — Photo ${imageIndex + 1} / ${currentImages.length}`
          : `Post ${postIndex + 1} / ${posts.length}`}
      </div>
    </div>
  );
}
