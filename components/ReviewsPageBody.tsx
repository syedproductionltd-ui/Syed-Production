'use client';

import { useState } from 'react';
import { reviews } from '@/lib/data';
import Stars from '@/components/Stars';
import ReviewModal from '@/components/ReviewModal';

const STAR_CHECK =
  'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z';

export default function ReviewsPageBody() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="reviews-grid-page" id="reviewsGrid">
        {reviews.map((rev) => (
          <div className="review-card" key={`${rev.name}-${rev.city}`}>
            <div className="review-card-header">
              <img className="review-avatar" src={`/${rev.avatar}`} alt={rev.name} loading="lazy" />
              <div>
                <div className="review-author">{rev.name}</div>
                <div className="review-meta">
                  {rev.city}
                  {rev.verified && (
                    <span className="verified-badge">
                      <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                        <path d={STAR_CHECK} fill="currentColor" />
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

      {/*
        The static build has no review endpoint, so this form exists purely to
        hand the review to WhatsApp. It had no trigger in the original markup,
        which left the dialog unreachable; the button below is what makes it
        usable.
      */}
      <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
        <button
          className="btn btn-primary"
          id="writeReviewBtn"
          onClick={() => setModalOpen(true)}
        >
          Write a Review
        </button>
      </div>

      <ReviewModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
