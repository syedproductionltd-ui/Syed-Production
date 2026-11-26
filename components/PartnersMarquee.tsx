type Partner = { src: string; alt: string };

const collaborators: Partner[] = [
  { src: '/logos/araya-international.png', alt: 'Araya International logo' },
  { src: '/logos/binary-hub.png', alt: 'Binary Hub logo' },
  { src: '/logos/fatima-fertilizer-company-ltd.png', alt: 'Fatima Fertilizer Company Ltd logo' },
  { src: '/logos/frozen-khalti-lake-festival-season-6.png', alt: 'Frozen Khalti Lake Festival Season 6 logo' },
  { src: '/logos/hashoo-foundation-activity-coverage.png', alt: 'Hashoo Foundation logo' },
  { src: '/logos/hpl-season-14.png', alt: 'HPL Season 14 logo' },
  { src: '/logos/js-bank-commercial-and-promotional-coverage.png', alt: 'JS Bank logo' },
  { src: '/logos/karakorum-expedition.png', alt: 'Karakorum Expedition logo' },
  { src: '/logos/kashrote-youth-summit.png', alt: 'Kashrote Youth Summit logo' },
  { src: '/logos/seven-days-frozen-fairy-tale.png', alt: 'Seven Days Frozen Fairy Tale logo' },
  { src: '/logos/telenor-franchise-gb.png', alt: 'Telenor Franchise GB logo' },
  { src: '/logos/women-convention-16-days-of-activism-akrsp.png', alt: 'Women Convention AKRSP logo' },
];

const partners: Partner[] = [
  { src: '/logos/dd.png', alt: 'Partner logo' },
  { src: '/logos/def.png', alt: 'Partner logo' },
  { src: '/logos/xcvfd.png', alt: 'Partner logo' },
  { src: '/logos/gemini-generated-image-s694ns694ns694ns.png', alt: 'Partner logo' },
  { src: '/logos/gemini-generated-image-s694ns694ns694ns-1.png', alt: 'Partner logo' },
  { src: '/logos/whatsapp-image-2026-11-26-at-2-01-18-am.png', alt: 'Partner logo' },
  { src: '/logos/whatsapp-image-2026-11-26-at-2-01-19-am.png', alt: 'Partner logo' },
  { src: '/logos/whatsapp-image-2026-11-26-at-8-26-24-pm.png', alt: 'Partner logo' },
  { src: '/logos/whatsapp-image-2026-zzzxxz11-16-at-12-03-48-am.png', alt: 'Partner logo' },
  { src: '/logos/whatsapp-image-20zzzz26-11-16-at-12-03-48-am.png', alt: 'Partner logo' },
  { src: '/logos/whatsapp-image-2zzzz026-11-16-at-12-03-48-am.png', alt: 'Partner logo' },
  { src: '/logos/whatsazxzpp-image-2026-11-16-at-12-03-49-am.png', alt: 'Partner logo' },
];

function MarqueeRow({ items, reverse }: { items: Partner[]; reverse?: boolean }) {
  const group = (duplicate = false) => (
    <div className="marquee-group" aria-hidden={duplicate || undefined}>
      {items.map((item) => (
        <span className="marquee-logo" key={item.src}>
          <img src={item.src} alt={duplicate ? '' : item.alt} loading="lazy" decoding="async" />
        </span>
      ))}
    </div>
  );

  return (
    <div className={`marquee-row${reverse ? ' marquee-row--reverse' : ''}`}>
      <div className="marquee">
        <div className="marquee-track">
          {group()}
          {group(true)}
        </div>
      </div>
    </div>
  );
}

export default function PartnersMarquee() {
  return (
    <section className="partners section" id="partners" aria-labelledby="partners-title">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Who We Work With</span>
          <h2 className="section-title" id="partners-title">
            Collaborators &amp; Partners
          </h2>
          <p className="section-description">
            Trusted by brands, organisations and creative teams across Pakistan and beyond.
          </p>
        </div>
      </div>
      <MarqueeRow items={collaborators} />
      <MarqueeRow items={partners} reverse />
    </section>
  );
}
