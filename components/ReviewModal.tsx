'use client';

import { useState } from 'react';
import { destinations } from '@/lib/data';
import { whatsappUrl } from '@/lib/whatsapp';

const STAR_PATH =
  'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z';

const panelStyle = {
  background: '#fff',
  borderRadius: 12,
  padding: '2rem',
  width: 420,
  maxWidth: '92vw',
  maxHeight: '90vh',
  overflowY: 'auto',
  position: 'relative',
} as const;

const fieldStyle = {
  width: '100%',
  padding: '0.5rem 0.6rem',
  border: '1px solid #e2e8f0',
  borderRadius: 8,
  fontFamily: 'inherit',
  fontSize: '0.9rem',
} as const;

const labelStyle = {
  display: 'block',
  fontSize: '0.85rem',
  fontWeight: 600,
  marginBottom: '0.25rem',
} as const;

/**
 * "Write a Review" dialog. There is no backend, so a submission is handed to
 * WhatsApp for the client to send on — same hand-off as the booking wizard.
 */
export default function ReviewModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [service, setService] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function close() {
    onClose();
    setError('');
    setSuccess('');
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!service) return setError('Please select a service');
    if (!rating) return setError('Please select a rating');
    if (!text.trim()) return setError('Please write your review');

    const stars = '*'.repeat(rating);
    window.open(
      whatsappUrl(
        [
          'New review submission!',
          '',
          `Service: ${service}`,
          `Rating: ${stars} (${rating}/5)`,
          '',
          text.trim(),
          '',
          'Please publish this on the website. Thank you!',
        ].join('\n')
      ),
      '_blank',
      'noopener'
    );

    setSuccess(
      "Thanks! We have opened WhatsApp with your review — send it there to have it published."
    );
    setText('');
    setRating(0);
    setService('');
  }

  const shown = hover || rating;

  return (
    <div
      id="reviewModal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reviewModalTitle"
      style={{
        display: open ? 'flex' : 'none',
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        zIndex: 9999,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div style={panelStyle}>
        <button
          onClick={close}
          aria-label="Close review form"
          style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#64748b',
            lineHeight: 1,
          }}
        >
          &times;
        </button>
        <h3 id="reviewModalTitle" style={{ color: '#1B4332', marginBottom: '1rem', fontSize: '1.25rem' }}>
          Write a Review
        </h3>

        {error && (
          <div style={{ background: '#fef2f2', color: '#ef4444', padding: '0.6rem', borderRadius: 8, marginBottom: '0.75rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '0.6rem', borderRadius: 8, marginBottom: '0.75rem', fontSize: '0.85rem' }}>
            {success}
          </div>
        )}

        <form
          onSubmit={submit}
          onMouseLeave={() => setHover(0)}
        >
          <div style={{ marginBottom: '0.75rem' }}>
            <label htmlFor="rmDest" style={labelStyle}>Service</label>
            <select
              id="rmDest"
              value={service}
              onChange={(e) => setService(e.target.value)}
              style={fieldStyle}
              required
            >
              <option value="">Select a service...</option>
              {destinations.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <label style={labelStyle}>Rating</label>
            <div style={{ display: 'flex', gap: 4, cursor: 'pointer' }}>
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  type="button"
                  aria-label={`${v} star${v > 1 ? 's' : ''}`}
                  aria-pressed={rating === v}
                  onClick={() => setRating(v)}
                  onMouseEnter={() => setHover(v)}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', lineHeight: 0 }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="28"
                    height="28"
                    style={{ color: v <= shown ? '#D4A03C' : '#e2e8f0', transition: 'color 0.15s' }}
                    aria-hidden="true"
                  >
                    <path d={STAR_PATH} fill="currentColor" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <label htmlFor="rmText" style={labelStyle}>Your Review</label>
            <textarea
              id="rmText"
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share your experience..."
              style={{ ...fieldStyle, resize: 'vertical' }}
              required
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '0.65rem',
              background: '#2D6A4F',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontFamily: 'inherit',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Submit Review
          </button>
        </form>
      </div>
    </div>
  );
}
