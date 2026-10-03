'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { videos } from '@/lib/data';
import { getVideoEmbed } from '@/lib/video';
import { useScrollLock } from '@/lib/useScrollLock';
import type { Video } from '@/lib/types';

/**
 * Fullscreen vertical video viewer.
 *
 * Slide positioning uses `scrollTop` on the track rather than scrollIntoView:
 * scrollIntoView walks up every scrollable ancestor, so it drags the page
 * behind the overlay and leaves it at the wrong offset when the viewer closes.
 */
export default function ReelsViewer({
  items,
  startIndex,
  onClose,
}: {
  items: Video[];
  /** null keeps the viewer closed. */
  startIndex: number | null;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [muted, setMuted] = useState(false);
  const [counter, setCounter] = useState(0);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { lock, unlock } = useScrollLock();
  const isOpen = startIndex !== null;

  useEffect(() => {
    if (startIndex !== null) setCounter(startIndex);
  }, [startIndex]);

  useEffect(() => {
    if (!isOpen) return;
    lock();
    return () => unlock();
  }, [isOpen, lock, unlock]);

  // Unhide, then reveal on the next frame so the CSS transition runs; on close
  // wait out the 300ms fade before tearing the track down.
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }
    setVisible(false);
    const timer = setTimeout(() => setMounted(false), 300);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Position the track directly instead of scrollIntoView.
  useEffect(() => {
    if (!mounted || startIndex === null) return;
    const track = trackRef.current;
    const slide = slideRefs.current[startIndex];
    if (track && slide) track.scrollTop = slide.offsetTop;
  }, [mounted, startIndex]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Play/pause and iframe swap as each slide scrolls in or out.
  useEffect(() => {
    if (!mounted) return;
    const track = trackRef.current;
    if (!track || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const slide = entry.target as HTMLDivElement;
          const idx = Number(slide.dataset.index);
          const video = slide.querySelector('video');
          const iframe = slide.querySelector('iframe') as HTMLIFrameElement | null;

          if (entry.isIntersecting) {
            setCounter(idx);
            if (video) {
              video.muted = muted;
              video.play().catch(() => {
                video.muted = true;
                video.play().catch(() => {});
              });
              slide.classList.remove('paused');
            }
            if (iframe && !iframe.src && iframe.dataset.src) {
              iframe.src = iframe.dataset.src;
            }
          } else {
            if (video) {
              video.pause();
              slide.classList.add('paused');
            }
            if (iframe?.src) {
              iframe.dataset.src = iframe.src;
              iframe.src = '';
            }
          }
        }
      },
      { root: track, threshold: 0.7 }
    );

    slideRefs.current.forEach((s) => s && observer.observe(s));
    return () => observer.disconnect();
  }, [mounted, muted]);

  // Start the opening slide with sound, falling back to muted if blocked.
  useEffect(() => {
    if (!mounted || startIndex === null) return;
    const slide = slideRefs.current[startIndex];
    const video = slide?.querySelector('video');
    if (!video) return;
    video.muted = muted;
    video
      .play()
      .then(() => slide?.classList.remove('paused'))
      .catch(() => {
        video.muted = true;
        setMuted(true);
        video.play().catch(() => {});
        slide?.classList.remove('paused');
      });
  }, [mounted, startIndex, muted]);

  const toggleMute = useCallback(() => setMuted((m) => !m), []);

  // Apply the mute state to every live <video>.
  useEffect(() => {
    slideRefs.current.forEach((s) => {
      const v = s?.querySelector('video');
      if (v) v.muted = muted;
    });
  }, [muted]);

  if (!mounted) return null;

  return (
    <div className={`reels-viewer${visible ? ' open' : ''}`} id="reelsViewer">
      <button
        className="reels-close"
        id="reelsClose"
        onClick={onClose}
        aria-label="Close viewer"
      >
        &times;
      </button>
      <div className="reels-counter" id="reelsCounter">
        {counter + 1} / {items.length}
      </div>
      <button
        className={`reels-mute-btn${muted ? ' muted' : ''}`}
        id="reelsMuteBtn"
        onClick={toggleMute}
        aria-label={muted ? 'Unmute' : 'Mute'}
      >
        <svg
          className="icon-unmuted"
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
        </svg>
        <svg
          className="icon-muted"
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <path d="M23 9l-6 6M17 9l6 6" />
        </svg>
      </button>

      <div className="reels-track" id="reelsTrack" ref={trackRef}>
        {items.map((v, i) => {
          const embed = getVideoEmbed(v.videoUrl);
          return (
            <div
              key={`${v.videoUrl}-${i}`}
              className={`reel-slide${i === startIndex ? '' : ' paused'}`}
              data-index={i}
              data-embed-type={embed.type}
              ref={(el) => {
                slideRefs.current[i] = el;
              }}
            >
              {embed.type === 'direct' ? (
                <video
                  playsInline
                  loop
                  preload="none"
                  muted={muted}
                  src={encodeURI(v.videoUrl)}
                  onClick={(e) => {
                    const el = e.currentTarget;
                    const slide = el.parentElement;
                    if (el.paused) {
                      el.play().catch(() => {});
                      slide?.classList.remove('paused');
                    } else {
                      el.pause();
                      slide?.classList.add('paused');
                    }
                  }}
                />
              ) : (
                <iframe
                  src={embed.embedUrl}
                  title={v.title}
                  frameBorder="0"
                  allowFullScreen
                  allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
                  loading="lazy"
                />
              )}
              <div className="reel-play-btn">
                <svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true">
                  <path d="M19 15v18l15-9z" fill="white" />
                </svg>
              </div>
              <div className="reel-info">
                <h3>{v.title}</h3>
                <p>{v.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}