type Partner = { src: string; alt: string };

const collaborators: Partner[] = [
  { src: '/logos/araya-international.png', alt: 'Araya International Diagnostic Centre logo' },
  { src: '/logos/binary-hub.jpeg', alt: 'Binary Hub logo' },
  { src: '/logos/fatima-fertilizer.jpeg', alt: 'Fatima Fertilizer Company logo' },
  { src: '/logos/frozen-khalti-lake-festival.jpeg', alt: 'Frozen Khalti Lake Festival logo' },
  { src: '/logos/hashoo-foundation.jpeg', alt: 'Hashoo Foundation logo' },
  { src: '/logos/hpl-season-14.jpeg', alt: 'HPL Season 14 logo' },
  { src: '/logos/it-dept-gb.jpeg', alt: 'IT Department Gilgit Baltistan logo' },
  { src: '/logos/js-bank.jpeg', alt: 'JS Bank logo' },
  { src: '/logos/karakorum-expedition.jpeg', alt: 'Karakorum Expedition logo' },
  { src: '/logos/kashrote-youth-summit.jpeg', alt: 'Kashrote Youth Summit logo' },
  { src: '/logos/sco.jpeg', alt: 'Shanghai Cooperation Organisation logo' },
  { src: '/logos/seven-days.jpg', alt: 'Seven Days Frozen Fairy Tale logo' },
];

const partners: Partner[] = [
  { src: '/logos/shan-e-tajalli.jpeg', alt: 'Shan-e-Tajalli Mega Event logo' },
  { src: '/logos/telenor.jpeg', alt: 'Telenor logo' },
  { src: '/logos/partner-01.png', alt: 'Partner logo' },
  { src: '/logos/partner-02.jpeg', alt: 'Partner logo' },
  { src: '/logos/partner-03.jpeg', alt: 'Partner logo' },
  { src: '/logos/partner-04.jpeg', alt: 'Partner logo' },
  { src: '/logos/partner-05.jpeg', alt: 'Partner logo' },
  { src: '/logos/partner-06.jpeg', alt: 'Partner logo' },
  { src: '/logos/partner-07.jpeg', alt: 'Partner logo' },
  { src: '/logos/partner-08.jpeg', alt: 'Partner logo' },
  { src: '/logos/partner-09.jpeg', alt: 'Partner logo' },
  { src: '/logos/akrsp.jpeg', alt: 'AKRSP logo' },
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
