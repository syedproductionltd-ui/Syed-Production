const STAR_PATH =
  'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z';

/**
 * Full / half / empty stars, matching generateStars() in js/main.js.
 *
 * Renders bare svgs with no wrapper so callers can supply their own container
 * (`.stars` on service cards, `.review-stars` on review cards).
 */
export default function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = Math.max(0, 5 - full - half);

  return (
    <>
      {Array.from({ length: full }, (_, i) => (
        <svg
          key={`f${i}`}
          viewBox="0 0 24 24"
          width="16"
          height="16"
          aria-hidden="true"
        >
          <path d={STAR_PATH} fill="currentColor" />
        </svg>
      ))}
      {half === 1 && (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path d={STAR_PATH} fill="currentColor" opacity="0.4" />
        </svg>
      )}
      {Array.from({ length: empty }, (_, i) => (
        <svg
          key={`e${i}`}
          viewBox="0 0 24 24"
          width="16"
          height="16"
          aria-hidden="true"
        >
          <path d={STAR_PATH} fill="currentColor" opacity="0.15" />
        </svg>
      ))}
      <span className="sr-only">{rating} out of 5</span>
    </>
  );
}
