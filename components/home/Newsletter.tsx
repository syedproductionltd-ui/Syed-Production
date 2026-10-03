import { whatsappUrl } from '@/lib/whatsapp';

export default function Newsletter() {
  return (
    <section className="newsletter" id="contact">
      <div className="container">
        <div className="newsletter-content reveal-up">
          <h2>Ready to Create Something Cinematic?</h2>
          <p>Tell us about your project and get a custom quote. We reply within 24 hours.</p>
          <div
            className="newsletter-form"
            style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <a
              href={whatsappUrl('Hello! I would like to discuss a project.')}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link btn btn-primary"
              aria-label="WhatsApp"
              style={{
                width: 'auto',
                height: 'auto',
                padding: '0.85rem 2rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.95rem',
                fontWeight: 600,
              }}
            >
              Chat on WhatsApp
            </a>
            <a
              href="/booking"
              className="btn btn-outline"
              style={{ padding: '0.85rem 2rem' }}
            >
              Start Booking
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
