'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { useScrollLock } from '@/lib/useScrollLock';
import type { GalleryPost } from '@/lib/types';
import { assetUrl } from '@/lib/data';

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
  const currentSrc = currentImage ? assetUrl(currentImage.imageUrl) : '';

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

  const [photoState, setPhotoState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    if (!isOpen) return;
    if (!currentSrc) {
      setPhotoState('error');
      return;
    }
    let cancelled = false;
    setPhotoState('loading');
    const probe = new Image();
    probe.onload = () => {
      if (!cancelled) setPhotoState('ready');
    };
    probe.onerror = () => {
      if (!cancelled) setPhotoState('error');
    };
    probe.src = currentSrc;
    return () => {
      cancelled = true;
    };
  }, [isOpen, currentSrc]);

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

        {photoState === 'ready' && (
          <img
            className="lightbox-img"
            id="lightboxImg"
            src={currentSrc}
            alt={currentImage?.altText ?? ''}
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
