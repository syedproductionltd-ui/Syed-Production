'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { reviews, assetUrl } from '@/lib/data';
import SectionHeader from '@/components/SectionHeader';
import Stars from '@/components/Stars';

const GAP = 24;

function perView() {
  if (typeof window === 'undefined') return 3;
  if (window.innerWidth <= 768) return 1;
  if (window.innerWidth <= 1024) return 2;
  return 3;
}

export default function ReviewsSection() {
  const [index, setIndex] = useState(0);
  const [mobile, setMobile] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const maxIndex = Math.max(0, reviews.length - perView());

  // Desktop positions the track with a transform; mobile scrolls it natively so
  // touch swiping works without any pointer handling.
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  const goTo = useCallback(
    (next: number, shouldScroll: boolean) => {
      const clamped = Math.max(0, Math.min(maxIndex, next));
      setIndex(clamped);

      const track = trackRef.current;
      const card = track?.firstElementChild as HTMLElement | null;
      if (!track || !card) return;
      const offset = clamped * (card.offsetWidth + GAP);

      if (mobile) {
        track.style.transform = '';
        // Scroll the track only. scrollIntoView() walks up every scrollable
        // ancestor, so it drags the whole page with it.
        if (shouldScroll) track.scrollTo({ left: offset, behavior: 'smooth' });
      } else {
        track.style.transform = `translateX(-${offset}px)`;
      }
    },
    [mobile, maxIndex]
  );

  // Keep the index in step with a manual swipe on mobile.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || !mobile) return;

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const card = track.firstElementChild as HTMLElement | null;
        if (!card) return;
        const next = Math.round(track.scrollLeft / (card.offsetWidth + GAP));
        setIndex(Math.max(0, Math.min(maxIndex, next)));
      });
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener('scroll', onScroll);
    };
  }, [mobile, maxIndex]);

  // Mobile fires resize constantly (URL bar, keyboard, orientation). Never
  // scroll from here or the page drifts on its own.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const track = trackRef.current;
        if (track) track.style.transform = '';
        setIndex((i) => Math.min(i, maxIndex));
      }, 150);
    };
    window.addEventListener('resize', onResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', onResize);
    };
  }, [maxIndex]);

  return (
    <section className="reviews section" id="reviews">
      <div className="container">
        <SectionHeader section="reviews" />
        <div className="reviews-carousel reveal-up">
          <button
            className="carousel-arrow carousel-prev"
            onClick={() => goTo(index - 1, true)}
            aria-label="Previous review"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="currentColor" />
            </svg>
          </button>
          <div className="reviews-track-wrapper">
            <div className="reviews-track" id="reviewsTrack" ref={trackRef}>
              {reviews.map((rev) => (
                <div className="review-card" key={`${rev.name}-${rev.city}`}>
                  <div className="review-card-header">
                    <img className="review-avatar" src={assetUrl(rev.avatar)} alt={rev.name} loading="lazy" />
                    <div>
                      <div className="review-author">{rev.name}</div>
                      <div className="review-meta">
                        {rev.city}
                        {rev.verified && (
                          <span className="verified-badge">
                            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                              <path
                                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                                fill="currentColor"
                              />
                            </svg>{' '}
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="review-stars">
                    <Stars rating={rev.rating} />
                  </div>
                  <p className="review-text">&quot;{rev.text}&quot;</p>
                  <span className="review-service">{rev.service}</span>
                </div>
              ))}
            </div>
          </div>
          <button
            className="carousel-arrow carousel-next"
            onClick={() => goTo(index + 1, false)}
            aria-label="Next review"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" fill="currentColor" />
            </svg>
          </button>
        </div>
        <div className="carousel-dots" id="reviewsDots" role="tablist" aria-label="Review navigation">
          {Array.from({ length: maxIndex + 1 }, (_, i) => (
            <button
              key={i}
              className={`carousel-dot${i === index ? ' active' : ''}`}
              role="tab"
              aria-selected={i === index}
              aria-label={`Review group ${i + 1}`}
              onClick={() => goTo(i, true)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
