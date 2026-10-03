'use client';

import { useEffect, useRef, useState } from 'react';
import { settings } from '@/lib/data';

const SLIDES = [
  '/images/DSC00557.webp',
  '/images/hero-background/DSC09876.webp',
];

const ROTATE_MS = 6000;

export default function Hero() {
  const [active, setActive] = useState(0);
  // Per-slide: CSS only shows `.hero-slide.active.loaded`, so a slide must be
  // flagged individually once its own image has decoded.
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [preloaderVisible, setPreloaderVisible] = useState(true);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep the preloader mounted for the length of its own 0.8s opacity
  // transition, then drop it from the tree.
  useEffect(() => {
    if (!preloaderDone) return;
    const t = setTimeout(() => setPreloaderVisible(false), 800);
    return () => clearTimeout(t);
  }, [preloaderDone]);

  // Preload each background so the slide is painted before it is shown.
  useEffect(() => {
    let cancelled = false;
    SLIDES.forEach((src, i) => {
      const img = new Image();
      const mark = () => {
        if (cancelled) return;
        setLoaded((prev) => (prev[i] ? prev : { ...prev, [i]: true }));
        // The preloader lifts as soon as the first slide is ready, or after a
        // 5s fallback in case the image never resolves.
        if (i === 0) setPreloaderDone(true);
      };
      img.onload = mark;
      img.onerror = mark;
      img.src = src;
    });
    const fallback = setTimeout(() => setPreloaderDone(true), 5000);
    return () => {
      cancelled = true;
      clearTimeout(fallback);
    };
  }, []);

  // Rotate every 6s, and pause while the tab is hidden so a backgrounded tab
  // is not flipping slides.
  useEffect(() => {
    const start = () => {
      timer.current = setInterval(() => {
        setActive((i) => (i + 1) % SLIDES.length);
      }, ROTATE_MS);
    };
    const stop = () => {
      if (timer.current) clearInterval(timer.current);
      timer.current = null;
    };
    const onVisibility = () => {
      stop();
      if (!document.hidden) start();
    };

    start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // Picking a slide restarts the clock from zero.
  function select(index: number) {
    if (timer.current) clearInterval(timer.current);
    setActive(index);
    timer.current = setInterval(() => {
      setActive((i) => (i + 1) % SLIDES.length);
    }, ROTATE_MS);
  }

  const hero = settings.hero;

  return (
    <section className="hero" id="hero">
      <div className="hero-carousel" aria-hidden="true">
        {SLIDES.map((src, i) => (
          <div
            key={src}
            className={`hero-slide${i === active ? ' active' : ''}${loaded[i] ? ' loaded' : ''}`}
            style={{ backgroundImage: `url('${src}')` }}
          />
        ))}
      </div>

      {preloaderVisible && (
        <div
          className={`hero-preloader${preloaderDone ? ' done' : ''}`}
          aria-hidden="true"
        />
      )}

      <div className="hero-overlay" />
      <div className="hero-content">
        <p className="hero-subtitle reveal-up">{hero.subtitle}</p>
        <h1 className="hero-title reveal-up" dangerouslySetInnerHTML={{ __html: hero.title }} />
        <p className="hero-description reveal-up">{hero.description}</p>
      </div>

      <div className="hero-carousel-dots" role="tablist" aria-label="Hero image carousel">
        {SLIDES.map((src, i) => (
          <button
            key={src}
            className={`carousel-dot${i === active ? ' active' : ''}`}
            role="tab"
            aria-selected={i === active}
            aria-label={`Slide ${i + 1}`}
            onClick={() => select(i)}
          />
        ))}
      </div>

      <div className="hero-scroll-indicator" aria-hidden="true">
        <span>Scroll to explore</span>
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path d="M12 16l-6-6h12z" fill="currentColor" />
        </svg>
      </div>
    </section>
  );
}
