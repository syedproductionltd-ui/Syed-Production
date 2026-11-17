import Image from 'next/image';
import { settings } from '@/lib/data';

const HERO_IMAGE = '/images/IMG_8245.webp';

export default function Hero() {
  const hero = settings.hero;

  return (
    <section className="hero" id="hero">
      <div className="hero-carousel" aria-hidden="true">
        <div className="hero-slide active">
          <Image
            src={HERO_IMAGE}
            alt=""
            fill
            priority
            sizes="100vw"
            style={{ objectFit: 'cover' }}
          />
        </div>
      </div>

      <div className="hero-overlay" />
      <div className="hero-content">
        <p className="hero-subtitle reveal-up">{hero.subtitle}</p>
        <h1 className="hero-title reveal-up" dangerouslySetInnerHTML={{ __html: hero.title }} />
        <p className="hero-description reveal-up">{hero.description}</p>
      </div>

      <div className="hero-scroll-indicator" aria-hidden="true">
        <span>Scroll to explore</span>
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path d="M12 16l-6-6h12z" fill="currentColor" />
        </svg>
      </div>
    </section>
  );
}
