import type { Metadata } from 'next';
import Link from 'next/link';
import SiteFooter from '@/components/SiteFooter';
import TeamSection from '@/components/home/TeamSection';
import JsonLd from '@/components/JsonLd';
import { pageBreadcrumb } from '@/utils/seo';
import { siteUrl } from '@/utils/whatsapp';

const description =
  'Official Company Profile of Syed Production — Registered creative production company specializing in videography, cinematography, drone operations, event coverage, and post-production in Gilgit-Baltistan and across Pakistan.';

export const metadata: Metadata = {
  title: 'Company Profile',
  description,
  alternates: { canonical: '/profile' },
  openGraph: {
    type: 'website',
    url: `${siteUrl}/profile`,
    title: 'Company Profile | Syed Production',
    description,
    images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'Syed Production Company Profile' }],
  },
};

const PROJECTS = [
  {
    title: '1. Seven Days Frozen Fairy Tale',
    desc: 'One of our notable completed projects includes the Seven Days Frozen Fairy Tale, Hunza Ice Hockey Event, where Syed Production was responsible for full coverage, documentation, drone filming, and final production delivery. This project required filming in extreme weather conditions, high-altitude locations, and dynamic sporting environments, demonstrating our team’s adaptability, technical skill, and operational efficiency.',
    status: 'Completed',
  },
  {
    title: '2. Frozen Khalti Lake Festival, Season 6',
    desc: 'Among our completed work, two of the most significant projects include the Seven Days Frozen Fairy Tale, Hunza Ice Hockey Event and the Frozen Khalti Lake Festival – Season 6. Our role covered complete event coverage, drone cinematography, and full production delivery, capturing the energy of competitive winter sports, cultural expression, and breathtaking natural surroundings.',
    status: 'Completed',
  },
  {
    title: '3. HPL Season 14',
    desc: 'Another key project in our portfolio is HPL Season 14, where Syed Production handled full event coverage and drone cinematography, capturing dynamic sports action, audience engagement, and the overall atmosphere of the tournament with precision and impact.',
    status: 'Completed',
  },
  {
    title: '4. Shan-e-Tajalli Mega Event',
    desc: 'Another remarkable milestone for Syed Production is the Shan-e-Tajalli Universal Soul Mega Event, presented by Alyas Nasiri and powered by Syed Production. This event showcased a unique blend of artistic expression, cultural identity, and spiritual reflection.',
    status: 'Completed',
  },
  {
    title: '5. IT DEPT – 1st NOV, Independence Day Of GB Coverage Project',
    desc: 'Syed Production successfully managed the 1st November Independence Day Event Coverage, capturing official proceedings, cultural performances, audience participation, and key ceremonial moments with precision and creativity.',
    status: 'Completed',
  },
  {
    title: '6. SCO – Sponsored, GB Liberation Day Song Project',
    desc: 'Syed Production successfully managed the GB Liberation Day Song, sponsored by SCO, providing full event and performance coverage with creative filming and drone cinematography alongside impactful documentaries.',
    status: 'Completed',
  },
  {
    title: '7. Women Convention, 16 Days Of Activism – AKRSP',
    desc: 'Covered the Women Convention organized by AKRSP, held at Serena Hunza as part of the global 16 Days of Activism campaign supporting women empowerment, leadership, and advocacy.',
    status: 'Completed',
  },
  {
    title: '8. FATIMA FERTILIZER COMPANY LTD',
    desc: 'Successfully executed a professional commercial shoot for Fatima Fertilizer Company Ltd, covering their products, facilities, and promotional campaigns with comprehensive photography, videography, and post-production editing.',
    status: 'Completed',
  },
  {
    title: '9. KASHROTE YOUTH SUMMIT',
    desc: 'Provided professional media coverage for the Kashrote Youth Summit, capturing key sessions, speakers, youth participation, and overall event highlights through high-quality photography and videography.',
    status: 'Completed',
  },
  {
    title: '10. JS BANK – COMMERCIAL AND PROMOTIONAL COVERAGE',
    desc: 'Carried out a professional media project for JS Bank Gilgit, including photography and videography of their branch, staff activities, and promotional campaigns for corporate presentations and digital media.',
    status: 'Completed',
  },
  {
    title: '11. Trade Mylist',
    desc: 'Executed a professional videography project for Trade MyList, focusing on promotional content for their mobile application, usability, and brand identity.',
    status: 'Completed',
  },
  {
    title: '1. Hashoo Foundation – Activity Coverage',
    desc: 'Currently providing full media coverage services for Hashoo Foundation’s ongoing community development activities across multiple valleys in Gilgit-Baltistan, including videography, photography, and advanced drone cinematography.',
    status: 'Ongoing',
  },
  {
    title: '2. SCO – Project Coverage',
    desc: 'Actively engaged in documenting multiple SCO initiatives across Gilgit-Baltistan, including community outreach programs, ICT development activities, digital literacy trainings, and SCO Freelancing Hubs.',
    status: 'Ongoing',
  },
  {
    title: '3. Amna Wazir – Clothing Brand Shoots',
    desc: 'Proudly executed creative and high-end fashion shoots for the Amna Wazir clothing brand, showcasing premium cultural, bridal, and contemporary apparel with concept development and model direction.',
    status: 'Ongoing',
  },
  {
    title: '4. KARAKORUM EXPEDITION',
    desc: 'Providing professional media coverage for the Karakorum Expedition, capturing expedition activities, participant engagement, and scenic highlights through high-quality photography and videography.',
    status: 'Ongoing',
  },
  {
    title: '5. Binary Hub',
    desc: 'Delivering high-quality videography, photography, and drone cinematography to showcase ongoing infrastructure developments, technological solutions, and community engagement initiatives.',
    status: 'Ongoing',
  },
  {
    title: '6. Telenor Franchise – GB',
    desc: 'Providing media coverage for Telenor Franchise operations across Gilgit-Baltistan, including branch activities, customer engagement, and promotional campaigns.',
    status: 'Ongoing',
  },
  {
    title: '7. Mobile Mart – Product Shoots',
    desc: 'Handling professional product shoots for Mobile Mart across Gilgit, showcasing mobile devices and accessories with creative concept planning and professional lighting.',
    status: 'Ongoing',
  },
  {
    title: '8. ARAYA INTERNATIONAL DIAGNOSTIC CENTRE',
    desc: 'Providing professional media services for Araya International Diagnostic Center, Gilgit, covering facilities, staff activities, and operational highlights with high-quality post-production editing.',
    status: 'Ongoing',
  },
];

const PROJECT_IMAGES = [
  '/images/projects/seven-days-frozen-fairy-tale.jpg',
  '/images/projects/frozen-khalti-lake-festival-season-6.jpeg',
  '/images/projects/hpl-season-14.jpeg',
  '/images/projects/shan-e-tajalli-mega-event.jpeg',
  '/images/projects/it-dept-independence-day-gb.jpeg',
  '/images/projects/sco-gb-liberation-day-song.jpeg',
  '/images/projects/women-convention-akrsp.jpeg',
  '/images/projects/fatima-fertilizer-company.jpeg',
  '/images/projects/kashrote-youth-summit.jpeg',
  '/images/projects/js-bank-commercial-coverage.jpeg',
  '/images/projects/trade-mylist.jpeg',
  '/images/projects/hashoo-foundation-activity-coverage.jpeg',
  '/images/projects/sco-project-coverage.jpeg',
  '/images/projects/amna-wazir-clothing-brand.png',
  '/images/projects/karakorum-expedition.jpeg',
  '/images/projects/binary-hub.jpeg',
  '/images/projects/telenor-franchise-gb.jpeg',
  '/images/projects/mobile-mart-product-shoots.jpeg',
  '/images/projects/araya-international-diagnostic-centre.png',
];

export default function CompanyProfilePage() {
  return (
    <>
      <JsonLd data={pageBreadcrumb('Company Profile', '/profile')} />

      <section className="page-hero">
        <div className="container">
          <h1 className="page-hero-title">Company Profile</h1>
          <p className="page-hero-subtitle">
            Syed Production — Transforming ideas into high-quality visual stories since 2014
          </p>
        </div>
      </section>

      <main>
        {/* About / Intro Section */}
        <section className="section" id="about">
          <div className="container intro-grid">
            <div className="intro-photo" style={{ minHeight: '420px', height: '100%', borderRadius: '16px', overflow: 'hidden', position: 'relative', boxShadow: '0 8px 30px rgba(27, 67, 50, 0.12)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                loading="lazy"
                src="/images/IMG_7239.JPG"
                alt="Professional film production camera on set"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div className="photo-label" style={{ position: 'absolute', bottom: '20px', left: '20px', background: 'rgba(11, 38, 24, 0.9)', color: 'white', padding: '14px 18px', borderRadius: '12px', fontSize: '12px', border: '1px solid rgba(212, 160, 60, 0.35)' }}>
                Ideas. Frames. Stories. Impact.
              </div>
            </div>
            <div className="intro-copy">
              <div className="eyebrow" style={{ color: 'var(--clr-accent)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase' }}>Who we are</div>
              <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', letterSpacing: '-0.02em', margin: '14px 0 22px', color: 'var(--clr-primary-dark)' }}>
                Creative vision.<br />Professional execution.
              </h2>
              <p style={{ color: 'var(--clr-gray-600)', marginBottom: '16px', lineHeight: '1.7' }}>
                Syed Production is a registered production company dedicated to transforming ideas into high-quality visual stories. With expertise in videography, cinematography, editing and drone operations, we combine creativity, precision and technical excellence to deliver content that meets our clients’ objectives.
              </p>
              <p style={{ color: 'var(--clr-gray-600)', lineHeight: '1.7' }}>
                Based in Gilgit-Baltistan and working beyond the region, we produce corporate videos, promotional campaigns, event coverage and documentaries. Every assignment begins with understanding the story, audience and purpose behind it.
              </p>
              <div className="stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginTop: '30px' }}>
                <div className="stat" style={{ borderTop: '2px solid var(--clr-accent)', paddingTop: '13px' }}>
                  <strong style={{ display: 'block', fontSize: '28px', fontFamily: 'serif', color: 'var(--clr-primary)' }}>2014</strong>
                  <span style={{ fontSize: '12px', color: 'var(--clr-gray-500)' }}>Established</span>
                </div>
                <div className="stat" style={{ borderTop: '2px solid var(--clr-accent)', paddingTop: '13px' }}>
                  <strong style={{ display: 'block', fontSize: '28px', fontFamily: 'serif', color: 'var(--clr-primary)' }}>GB</strong>
                  <span style={{ fontSize: '12px', color: 'var(--clr-gray-500)' }}>Our home base</span>
                </div>
                <div className="stat" style={{ borderTop: '2px solid var(--clr-accent)', paddingTop: '13px' }}>
                  <strong style={{ display: 'block', fontSize: '28px', fontFamily: 'serif', color: 'var(--clr-primary)' }}>End-to-end</strong>
                  <span style={{ fontSize: '12px', color: 'var(--clr-gray-500)' }}>Production support</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="section dark-section" id="services" style={{ background: 'linear-gradient(160deg, #0b2618, #1b4332)', color: 'white' }}>
          <div className="container">
            <div className="section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '25px', marginBottom: '42px' }}>
              <div>
                <div className="eyebrow" style={{ color: 'var(--clr-accent-light)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase' }}>What we do</div>
                <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', letterSpacing: '-0.02em', marginTop: '12px', color: '#fff' }}>Our services</h2>
              </div>
              <p style={{ maxWidth: '430px', color: 'rgba(255, 255, 255, 0.7)', margin: 0, lineHeight: '1.6' }}>
                From the first creative conversation to the final frame, we bring the people, planning and production expertise together.
              </p>
            </div>
            <div className="services services-grid-profile">
              {[
                { num: '01 / FILM', title: 'Videography & Cinematography', desc: 'Event films, promotional projects, corporate content and cinematic visual storytelling.' },
                { num: '02 / AERIAL', title: 'Drone & Aerial Filming', desc: 'Aerial visuals for landscapes, tourism, development documentation and events.' },
                { num: '03 / POST', title: 'Editing & Post-production', desc: 'Editing, sound design, colour correction, motion graphics and final formatting.' },
                { num: '04 / EVENTS', title: 'Event Coverage', desc: 'Conferences, weddings, corporate gatherings, workshops and public programmes.' },
                { num: '05 / STORIES', title: 'Documentaries', desc: 'Documentary and message-based content for organizations, communities and initiatives.' },
                { num: '06 / PHOTO', title: 'Photography', desc: 'Professional photography for brands, events, campaigns and organizational communication.' },
              ].map((s, idx) => (
                <div key={idx} className="service" style={{ padding: '28px', background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '16px', minHeight: '215px' }}>
                  <span className="num" style={{ color: 'var(--clr-accent-light)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em' }}>{s.num}</span>
                  <h3 style={{ fontSize: '21px', margin: '28px 0 10px', color: '#fff' }}>{s.title}</h3>
                  <p style={{ color: 'rgba(255, 255, 255, 0.72)', fontSize: '14px', margin: 0, lineHeight: '1.6' }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Vision, Mission & Values */}
        <section className="section">
          <div className="container">
            <div className="section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '25px', marginBottom: '42px' }}>
              <div>
                <div className="eyebrow" style={{ color: 'var(--clr-accent)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase' }}>What guides us</div>
                <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', letterSpacing: '-0.02em', marginTop: '12px', color: 'var(--clr-primary-dark)' }}>Vision, mission & values</h2>
              </div>
              <p style={{ maxWidth: '430px', color: 'var(--clr-gray-500)', margin: 0, lineHeight: '1.6' }}>
                We aim to create visual content that engages audiences, preserves cultural heritage and communicates meaningful narratives.
              </p>
            </div>
            <div className="values-grid values-grid-profile">
              {[
                { title: 'Our vision', text: 'To become a trusted creative production company in Gilgit-Baltistan and across Pakistan, recognized for quality and impactful storytelling.' },
                { title: 'Our mission', text: 'To deliver comprehensive, high-quality visual production tailored to each client’s vision, objectives and audience.' },
                { title: 'Integrity', text: 'Honesty, transparency and accountability in every project and relationship.' },
                { title: 'Creativity', text: 'Fresh ideas and thoughtful approaches that make every story distinctive.' },
                { title: 'Excellence', text: 'High standards in technical quality, storytelling and client service.' },
                { title: 'Collaboration', text: 'Working closely with clients and teammates to achieve shared goals.' },
                { title: 'Reliability', text: 'Clear communication, careful planning and dependable delivery.' },
                { title: 'Growth', text: 'Continually learning and adopting tools and technologies that improve our work.' },
              ].map((v, idx) => (
                <div key={idx} className="value" style={{ background: 'var(--clr-surface)', border: '1px solid rgba(45, 106, 79, 0.12)', padding: '23px', borderRadius: '14px' }}>
                  <b style={{ fontSize: '16px', color: 'var(--clr-primary-dark)' }}>{v.title}</b>
                  <p style={{ fontSize: '13px', color: 'var(--clr-gray-600)', margin: '10px 0 0', lineHeight: '1.5' }}>{v.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Selected Engagements / Work */}
        <section className="section work-section" id="work" style={{ background: 'var(--clr-surface)' }}>
          <div className="container">
            <div className="section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '25px', marginBottom: '42px' }}>
              <div>
                <div className="eyebrow" style={{ color: 'var(--clr-accent)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase' }}>Selected engagements</div>
                <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', letterSpacing: '-0.02em', marginTop: '12px', color: 'var(--clr-primary-dark)' }}>Work that tells a story.</h2>
              </div>
              <p style={{ maxWidth: '430px', color: 'var(--clr-gray-500)', margin: 0, lineHeight: '1.6' }}>
                A selection of completed and ongoing assignments across events, corporate communication, culture, community development and more.
              </p>
            </div>
            <div className="project-grid project-grid-profile">
              {PROJECTS.map((p, idx) => (
                <article key={idx} className="project" style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 18px rgba(27, 67, 50, 0.08)', border: '1px solid rgba(45, 106, 79, 0.08)' }}>
                  <div className="project-image" style={{ height: '205px', position: 'relative', overflow: 'hidden', background: '#fff' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      loading="lazy"
                      src={PROJECT_IMAGES[idx]}
                      alt={p.title}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '22px' }}
                    />
                    <span className="project-tag" style={{ position: 'absolute', top: '14px', left: '14px', background: 'rgba(11, 38, 24, 0.9)', color: 'white', borderRadius: '999px', padding: '6px 10px', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', border: '1px solid rgba(212, 160, 60, 0.4)' }}>
                      {p.status}
                    </span>
                  </div>
                  <div className="project-body" style={{ padding: '21px' }}>
                    <h3 style={{ fontSize: '17px', marginBottom: '10px', color: 'var(--clr-primary-dark)' }}>{p.title}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--clr-gray-600)', margin: 0, lineHeight: '1.6' }}>{p.desc}</p>
                  </div>
                </article>
              ))}
            </div>
            <div className="project-count" style={{ marginTop: '25px', color: 'var(--clr-gray-500)', fontSize: '13px' }}>
              Showing all {PROJECTS.length} featured projects
            </div>
          </div>
        </section>

        {/* How we work */}
        <section className="section" id="process">
          <div className="container">
            <div className="section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '25px', marginBottom: '42px' }}>
              <div>
                <div className="eyebrow" style={{ color: 'var(--clr-accent)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase' }}>A clear creative process</div>
                <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', letterSpacing: '-0.02em', marginTop: '12px', color: 'var(--clr-primary-dark)' }}>How we work</h2>
              </div>
              <p style={{ maxWidth: '430px', color: 'var(--clr-gray-500)', margin: 0, lineHeight: '1.6' }}>
                We keep the process collaborative, transparent and focused on the outcome you need.
              </p>
            </div>
            <div className="process process-grid-profile">
              {[
                { num: '01', title: 'Discover & plan', desc: 'We understand your objectives, audience and expectations, develop the concept and finalize the creative direction before production begins.' },
                { num: '02', title: 'Produce & capture', desc: 'Our team films with professional equipment, lighting and drone operations where required, focusing on accuracy, creativity and quality.' },
                { num: '03', title: 'Edit & deliver', desc: 'We complete editing, sound design, colour grading and final adjustments, then share the work for review and delivery.' },
              ].map((s, idx) => (
                <div key={idx} className="step" style={{ borderTop: '2px solid var(--clr-accent)', paddingTop: '20px' }}>
                  <div style={{ fontSize: '34px', fontFamily: 'serif', fontWeight: 700, color: 'var(--clr-primary)' }}>{s.num}</div>
                  <h3 style={{ fontSize: '21px', margin: '20px 0 10px', color: 'var(--clr-primary-dark)' }}>{s.title}</h3>
                  <p style={{ fontSize: '14px', color: 'var(--clr-gray-600)', margin: 0, lineHeight: '1.6' }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CEO Message */}
        <section className="section ceo" style={{ background: 'linear-gradient(180deg, #fff, var(--clr-surface))' }}>
          <div className="container ceo-wrap">
            <div className="ceo-image" style={{ height: '450px', borderRadius: '16px', overflow: 'hidden', background: 'var(--clr-gray-200)', boxShadow: '0 8px 30px rgba(27, 67, 50, 0.12)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
               <img
                 loading="lazy"
                 src="/images/team/IMG_8545.PNG"
                 alt="Syed Burhan Uddin Shah"
                 style={{ width: '100%', height: '100%', objectFit: 'cover' }}
               />
            </div>
            <div className="ceo-copy">
              <div className="eyebrow" style={{ color: 'var(--clr-accent)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase' }}>A message from our CEO</div>
              <div className="quote-mark" style={{ fontSize: '70px', fontFamily: 'serif', fontWeight: 700, color: 'var(--clr-accent)', height: '55px', lineHeight: 1 }}>“</div>
              <blockquote style={{ margin: 0, fontSize: 'clamp(18px, 2vw, 24px)', lineHeight: '1.55', fontFamily: 'serif', letterSpacing: '-0.01em', color: 'var(--clr-primary-dark)' }}>
                Every story carries value and deserves to be shared with creativity, clarity and purpose. Our vision has always been to offer high-quality media production with professionalism, innovation and dedication. I am proud to lead a passionate team focused on understanding each client’s objectives and transforming them into impactful visual content. Thank you for trusting Syed Production — we look forward to creating visuals that leave a lasting impression.
              </blockquote>
              <div className="ceo-name" style={{ marginTop: '28px', fontWeight: 700, color: 'var(--clr-primary)' }}>
                Syed Burhan Uddin Shah
                <span style={{ display: 'block', color: 'var(--clr-gray-500)', fontSize: '12px', fontWeight: 400 }}>Chief Executive Officer · Syed Production</span>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <TeamSection />

        {/* Contact Section */}
        <section className="section contact-section" id="contact" style={{ background: 'var(--clr-navy-deep)', color: 'white' }}>
          <div className="container">
            <div className="contact-panel" style={{ border: '1px solid rgba(212, 160, 60, 0.28)', borderRadius: '20px', padding: 'clamp(28px, 5vw, 60px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '30px', background: 'linear-gradient(120deg, var(--clr-primary-dark), var(--clr-navy-deep))' }}>
              <div>
                <div className="eyebrow" style={{ color: 'var(--clr-accent-light)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase' }}>Have a story to tell?</div>
                <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', margin: '12px 0', color: '#fff' }}>Let’s make<br />something meaningful.</h2>
                <p style={{ color: 'rgba(255, 255, 255, 0.75)', maxWidth: '490px', lineHeight: '1.6' }}>
                  Tell us about your next film, event, campaign or creative project. We’d be glad to discuss how we can bring it to life.
                </p>
                <Link className="btn btn-gold" href="mailto:syed.production.ltd@gmail.com" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '12px 20px', borderRadius: '999px', background: 'linear-gradient(135deg, var(--clr-accent), var(--clr-accent-light))', color: 'var(--clr-navy-deep)', fontWeight: 700, fontSize: '13px', marginTop: '20px' }}>
                  Discuss a project ↗
                </Link>
              </div>
              <div className="contact-links" style={{ display: 'grid', gap: '13px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.88)' }}>
                <div>☎ &nbsp; <a href="tel:03555551555">03555551555</a></div>
                <div>✉ &nbsp; <a href="mailto:syed.production.ltd@gmail.com">syed.production.ltd@gmail.com</a></div>
                <div>◎ &nbsp; @syed_.production</div>
                <div>⌖ &nbsp; Gilgit-Baltistan, Pakistan</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
