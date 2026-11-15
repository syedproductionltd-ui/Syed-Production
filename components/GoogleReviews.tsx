import Script from 'next/script';

const ELFSIGHT_APP_CLASS = 'elfsight-app-4a08ff9c-7a93-4fa1-b0d3-efd480c7cc33';

/**
 * Live Google Reviews widget from Elfsight.
 *
 * `platform.js` scans the page for `.elfsight-app-*` containers and renders
 * the reviews into them. The container is present in the initial HTML, so the
 * lazy-loaded script can pick it up as soon as it runs.
 */
export default function GoogleReviews() {
  return (
    <>
      <Script src="https://elfsightcdn.com/platform.js" strategy="lazyOnload" />
      <div className={ELFSIGHT_APP_CLASS} data-elfsight-app-lazy="" />
    </>
  );
}
