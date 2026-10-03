'use client';

import { useEffect, useState } from 'react';
import { useScrollLock } from '@/lib/useScrollLock';
import type { Destination } from '@/lib/types';
import { thumbSrcSet, thumbUrl } from '@/lib/data';
import Stars from './Stars';

/**
 * Quick-preview overlay for a service card.
 *
 * Mirrors openModal()/closeModal(): add `.open` on the next frame so the CSS
 * transition runs, and keep the overlay mounted for 300ms after the close so
 * it can fade out. `shown` holds the last non-null destination because
 * unmounting immediately would skip that transition.
 */
export default function DestinationModal({
  destination,
  onClose,
  onBook,
}: {
  destination: Destination | null;
  onClose: () => void;
  onBook: () => void;
}) {
  const [shown, setShown] = useState<Destination | null>(null);
  const [open, setOpen] = useState(false);
  const { lock, unlock } = useScrollLock();

  useEffect(() => {
    if (destination) return;
    setOpen(false);
    const timer = setTimeout(() => setShown(null), 300);
    return () => clearTimeout(timer);
  }, [destination]);

  // Lock lifecycle stays symmetric: lock on open, release on close and on
  // unmount. Split from the fade-out effect above so a destination -> null
  // transition cannot unlock twice, nor leak a lock on a direct A -> B switch.
  useEffect(() => {
    if (!destination) return;
    setShown(destination);
    lock();
    const id = requestAnimationFrame(() => setOpen(true));
    return () => {
      cancelAnimationFrame(id);
      unlock();
    };
  }, [destination, lock, unlock]);

  useEffect(() => {
    if (!destination) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [destination, onClose]);

  if (!shown) return null;

  return (
    <div
      className={`modal-overlay${open ? ' open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modalTitle"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-content">
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          &times;
        </button>
        <img
          className="modal-image"
          src={thumbUrl(shown.image)}
          srcSet={thumbSrcSet(shown.image)}
          sizes="(max-width: 768px) 92vw, 60vw"
          alt={shown.name}
          loading="lazy"
          decoding="async"
        />
        <div className="modal-body">
          <h3 className="modal-title" id="modalTitle">
            {shown.name}
          </h3>
          <div className="modal-rating">
            <span className="stars">
              <Stars rating={shown.rating} />
            </span>{' '}
            {shown.rating} ({shown.reviews.toLocaleString()} reviews)
          </div>
          <p className="modal-description">{shown.description}</p>
          <div className="modal-highlights">
            {shown.highlights.map((h) => (
              <span className="highlight-tag" key={h}>
                {h}
              </span>
            ))}
          </div>
          <div className="modal-footer">
            <button className="btn btn-primary modal-book-btn" onClick={onBook}>
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
