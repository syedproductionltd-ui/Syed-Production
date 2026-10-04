'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import {
  bookingDestinations,
  destinations,
  formatPrice,
  thumbSrcSet,
  thumbUrl,
} from '@/lib/data';
import type { Destination } from '@/lib/types';
import { whatsappUrl } from '@/lib/whatsapp';
import SectionHeader from '@/components/SectionHeader';

const TOTAL_STEPS = 5;
const STEP_LABELS = ['Service', 'Dates', 'Details', 'Review', 'Confirm'];

const today = () => new Date().toISOString().split('T')[0]!;

const dayCount = (start: string, end: string) =>
  Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86_400_000);

/**
 * `bare` drops the section wrapper and heading so the dedicated /booking page
 * can drop the wizard straight into its own layout.
 */
export default function BookingWizard({
  bare = false,
  reveal = false,
  preselectId = null,
}: {
  bare?: boolean;
  reveal?: boolean;
  /** Service carried over from a card's "Book Now". See HomeSections. */
  preselectId?: number | null;
}) {
  const [step, setStep] = useState(1);
  const [destination, setDestination] = useState<Destination | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [details, setDetails] = useState('');
  const [reference, setReference] = useState('');

  const days = startDate && endDate ? dayCount(startDate, endDate) : 0;
  const minToday = today();

  /**
   * Picks up the service the customer came from.
   *
   * "Book Now" on a service card used to close the modal and scroll here,
   * dropping them at step 1 with nothing selected - they had just chosen a
   * service and were immediately asked to choose it again. Preselect it and
   * move straight to the dates, the only step left that needs their input.
   *
   * Looks the service up in the full list rather than bookingDestinations,
   * because the wizard's own shortlist is only the first six and most cards
   * open services that fall outside it.
   */
  useEffect(() => {
    if (preselectId === null) return;
    const match = destinations.find((d) => d.id === preselectId);
    if (!match) return;
    setDestination(match);
    setStep(2);
  }, [preselectId]);

  /**
   * Step 1's shortlist plus the carried service when it is not already on it,
   * so a preselected choice outside the six is still visible and highlighted if
   * the customer steps back.
   */
  const options = useMemo(() => {
    if (!destination) return bookingDestinations;
    if (bookingDestinations.some((d) => d.id === destination.id)) {
      return bookingDestinations;
    }
    return [destination, ...bookingDestinations];
  }, [destination]);

  function submit() {
    if (!destination) return;
    const ref = `SP-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const lines = [
      'Hello! I would like to book a production.',
      '',
      `Reference: ${ref}`,
      `Service: ${destination.name}`,
      `Package: ${destination.tier}`,
      `Starting price: ${formatPrice(destination.price)}`,
      `Start date: ${startDate || 'Flexible'}`,
      `End date: ${endDate || 'Flexible'}`,
    ];
    if (details) lines.push('', 'Project details:', details);
    lines.push('', 'Please let me know availability and a quote. Thank you!');

    window.open(whatsappUrl(lines.join('\n')), '_blank', 'noopener');
    setReference(ref);
  }

  function next() {
    if (step === TOTAL_STEPS) {
      // "Book Another Service" — reset back to the start.
      setStep(1);
      setDestination(null);
      return;
    }
    if (step === TOTAL_STEPS - 1) {
      submit();
      setStep((s) => s + 1);
      return;
    }
    setStep((s) => s + 1);
  }

  const nextLabel =
    step === TOTAL_STEPS - 1
      ? 'Confirm Booking'
      : step === TOTAL_STEPS
        ? 'Book Another Service'
        : 'Continue';

  const wizard = (
    <div className={`booking-wizard${reveal ? ' reveal-up' : ''}`}>
          <div className="wizard-steps" role="tablist" aria-label="Booking steps">
            {STEP_LABELS.map((label, i) => {
              const num = i + 1;
              const state =
                num === step ? ' active' : num < step ? ' completed' : '';
              return (
                <Fragment key={label}>
                  {i > 0 && (
                    <div className={`wizard-connector${num <= step ? ' active' : ''}`} />
                  )}
                  <div
                    className={`wizard-step${state}`}
                    role="tab"
                    aria-selected={num === step}
                  >
                    <span className="step-number">{num}</span>
                    <span className="step-label">{label}</span>
                  </div>
                </Fragment>
              );
            })}
          </div>

          <div className="wizard-body">
            <div className={`wizard-panel${step === 1 ? ' active' : ''}`} role="tabpanel">
              <h3>Select a service</h3>
              <div className="booking-services" id="bookingDestinations">
                {options.map((d) => (
                  <div
                    key={d.id}
                    className={`booking-service-card${destination?.id === d.id ? ' selected' : ''}`}
                    data-id={d.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setDestination(d)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setDestination(d);
                      }
                    }}
                  >
                    <img
                      src={thumbUrl(d.image)}
                      srcSet={thumbSrcSet(d.image)}
                      sizes="(max-width: 640px) 45vw, 20vw"
                      alt={d.name}
                      loading="lazy"
                      decoding="async"
                    />
                    <h4>{d.name}</h4>
                    <p>{d.tier}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className={`wizard-panel${step === 2 ? ' active' : ''}`} role="tabpanel">
              <h3>When is your event/project?</h3>
              <div className="date-picker-group">
                <div className="date-field">
                  <label htmlFor="bookingStartDate">Start Date</label>
                  <input
                    type="date"
                    id="bookingStartDate"
                    min={minToday}
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      if (endDate && e.target.value > endDate) setEndDate('');
                    }}
                  />
                </div>
                <div className="date-field">
                  <label htmlFor="bookingEndDate">End Date</label>
                  <input
                    type="date"
                    id="bookingEndDate"
                    min={startDate || minToday}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="date-summary" id="dateSummary">
                {startDate && endDate
                  ? days > 0
                    ? `${days} day${days > 1 ? 's' : ''} production schedule`
                    : 'End date must be after start date'
                  : ''}
              </div>
            </div>

            <div className={`wizard-panel${step === 3 ? ' active' : ''}`} role="tabpanel">
              <h3>Project details</h3>
              <div style={{ maxWidth: 500, margin: '0 auto' }}>
                <label
                  htmlFor="bookingProjectDetails"
                  style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: 'var(--clr-gray-600)',
                    marginBottom: '0.5rem',
                  }}
                >
                  Describe your project
                </label>
                <textarea
                  id="bookingProjectDetails"
                  rows={6}
                  value={details}
                  placeholder="Tell us about your project — what type of production, location, special requirements, number of people involved, etc."
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '2px solid var(--clr-gray-200)',
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'inherit',
                    fontSize: 'var(--fs-base)',
                    resize: 'vertical',
                    outline: 'none',
                  }}
                  onChange={(e) => setDetails(e.target.value)}
                />
              </div>
            </div>

            <div className={`wizard-panel${step === 4 ? ' active' : ''}`} role="tabpanel">
              <h3>Review Your Booking</h3>
              <div className="booking-review" id="bookingReview">
                {!destination ? (
                  <p style={{ textAlign: 'center', color: '#94a3b8' }}>
                    Please select a service first.
                  </p>
                ) : (
                  <>
                    <div className="review-line">
                      <span className="label">Service</span>
                      <span>{destination.name}</span>
                    </div>
                    <div className="review-line">
                      <span className="label">Package</span>
                      <span>{destination.tier}</span>
                    </div>
                    <div className="review-line">
                      <span className="label">Starting price</span>
                      <span>{formatPrice(destination.price)}</span>
                    </div>
                    <div className="review-line">
                      <span className="label">Dates</span>
                      <span>
                        {startDate || 'Flexible'} → {endDate || 'Flexible'}
                      </span>
                    </div>
                    <div className="review-line">
                      <span className="label">Duration</span>
                      <span>
                        {days > 0 ? days : 1} day{days > 1 ? 's' : ''}
                      </span>
                    </div>
                    {details && (
                      <div className="review-line">
                        <span className="label">Project Details</span>
                        <span>
                          {details.slice(0, 100)}
                          {details.length > 100 ? '…' : ''}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className={`wizard-panel${step === 5 ? ' active' : ''}`} role="tabpanel">
              <div className="booking-confirm">
                <div className="confirm-icon">
                  <svg viewBox="0 0 80 80" width="80" height="80" aria-hidden="true">
                    <circle cx="40" cy="40" r="38" fill="none" stroke="#2D6A4F" strokeWidth="3" />
                    <path
                      d="M24 40l10 10 22-22"
                      fill="none"
                      stroke="#2D6A4F"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3>Booking Confirmed!</h3>
                <p>
                  Your production is booked! Check your email for confirmation
                  details, project brief, and next steps.
                </p>
                <p className="booking-ref">
                  Booking Reference: <strong id="bookingRef">{reference || 'SP-2026-XXXXX'}</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="wizard-actions">
            <button
              className="btn btn-outline wizard-prev"
              disabled={step === 1}
              style={step === TOTAL_STEPS ? { display: 'none' } : undefined}
              onClick={() => setStep((s) => Math.max(1, s - 1))}
            >
              Back
            </button>
            <button className="btn btn-primary wizard-next" onClick={next}>
              {nextLabel}
            </button>
          </div>
    </div>
  );

  if (bare) return wizard;

  return (
    <section className="booking section" id="booking">
      <div className="container">
        <SectionHeader section="booking" />
        {wizard}
      </div>
    </section>
  );
}
