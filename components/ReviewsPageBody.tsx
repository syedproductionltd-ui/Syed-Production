'use client';

import { useState } from 'react';
import ReviewModal from '@/components/ReviewModal';
import GoogleReviews from '@/components/GoogleReviews';

export default function ReviewsPageBody() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="reviews-widget">
        <GoogleReviews />
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
