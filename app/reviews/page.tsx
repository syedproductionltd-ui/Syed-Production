import type { Metadata } from 'next';
import { siteUrl } from '@/utils/whatsapp';
import { settings } from '@/lib/data';
import ReviewsPageBody from '@/components/ReviewsPageBody';
import PartnersMarquee from '@/components/PartnersMarquee';
import SiteFooter from '@/components/SiteFooter';
import JsonLd from '@/components/JsonLd';
import {
  faqSchema,
  pageBreadcrumb,
  reviewsServiceSchema,
  type FaqItem,
} from '@/utils/seo';

const description =
  'Read genuine client reviews of Syed Productions, a trusted production company in Islamabad, Pakistan. Discover real customer experiences, honest feedback, and why clients choose our professional production services.';

const reviewsFaqs: FaqItem[] = [
  {
    question: 'Are the reviews on Syed Productions genuine?',
    answer:
      'Yes. The reviews displayed on this page are collected from Google Reviews through our embedded review widget. They reflect real feedback from clients who have worked with Syed Productions on weddings, corporate videos, events and photography projects.',
  },
  {
    question: 'Where is Syed Productions based, and which areas do you serve?',
    answer:
      'Syed Productions is based in Lahore and serves clients in Islamabad, Lahore and across Pakistan. Our team travels for weddings, corporate productions, event coverage and photography assignments.',
  },
  {
    question: 'What services can clients review?',
    answer:
      'Clients review our wedding films, corporate videos, event coverage, commercial photography and creative production services. Feedback covers the full experience, from planning and filming to editing and final delivery.',
  },
  {
    question: 'How can I leave a review for Syed Productions?',
    answer: `Use the "Write a Review" button on this page to share your experience, or leave a review on our Google Business Profile. For project-specific feedback, contact us on WhatsApp at ${settings.contact.phone}.`,
  },
  {
    question: 'Why choose Syed Productions as a production company in Islamabad or Lahore?',
    answer:
      'Clients choose Syed Productions for cinematic storytelling, professional production standards, clear communication and end-to-end support. We handle planning, filming, editing and delivery for weddings, businesses and events.',
  },
  {
    question: 'Can I book Syed Productions outside Islamabad and Lahore?',
    answer:
      'Yes. While Islamabad and Lahore are our main service areas, we accept production projects across Pakistan. Contact us with your event date, location and requirements to check availability.',
  },
];

export const metadata: Metadata = {
  title: 'Client Reviews',
  description,
  alternates: { canonical: '/reviews' },
  openGraph: {
    type: 'website',
    url: `${siteUrl}/reviews`,
    title: 'Client Reviews | Syed Production',
    description,
    images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'Syed Production reviews' }],
  },
};

export default function ReviewsPage() {
  return (
    <>
      <JsonLd data={pageBreadcrumb('Client Reviews', '/reviews')} />
      <JsonLd data={reviewsServiceSchema} />
      <JsonLd data={faqSchema(reviewsFaqs)} />
      <section className="page-hero">
        <div className="container">
          <span className="section-tag page-hero-tag">What People Say About Syed Productions</span>
          <h1 className="page-hero-title">Looking for a Trusted Production Company</h1>
          <p className="page-hero-subtitle">
            Read genuine client reviews of Syed Productions, a trusted production company in
            Islamabad, Pakistan. Discover real customer experiences, honest feedback, and why
            clients choose our professional production services for their important events and
            projects.
          </p>
        </div>
      </section>

      <PartnersMarquee />

      <div className="section">
        <div className="container">
          <ReviewsPageBody />
        </div>
      </div>

      <section
        className="reviews-faq section"
        id="reviews-faq"
        aria-labelledby="reviews-faq-title"
      >
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Reviews &amp; Answers</span>
            <h2 className="section-title" id="reviews-faq-title">
              Frequently Asked Questions
            </h2>
            <p className="section-description">
              Quick answers about Syed Productions reviews, service areas and our production
              services in Islamabad, Lahore and across Pakistan.
            </p>
          </div>
          <div className="faq-list">
            {reviewsFaqs.map((faq) => (
              <article className="faq-item" key={faq.question}>
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
