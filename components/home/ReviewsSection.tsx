import Link from 'next/link';
import SectionHeader from '@/components/SectionHeader';
import GoogleReviews from '@/components/GoogleReviews';

export default function ReviewsSection() {
  return (
    <section className="reviews section" id="reviews">
      <div className="container">
        <SectionHeader section="reviews" />
        <div className="reviews-widget reveal-up">
          <GoogleReviews />
        </div>
        <div className="reviews-cta reveal-up">
          <Link href="/reviews" className="btn btn-outline">
            Read Genuine Client Reviews
          </Link>
        </div>
      </div>
    </section>
  );
}
