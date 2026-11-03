import type { Metadata } from 'next';
import SiteFooter from '@/components/SiteFooter';
import JsonLd from '@/components/JsonLd';
import { pageBreadcrumb } from '@/lib/seo';
import { siteUrl } from '@/lib/whatsapp';

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

const COMPLETED_PROJECTS = [
  {
    title: '1. Seven Days Frozen Fairy Tale (Hunza Ice Hockey Event)',
    desc: 'Full event coverage, documentation, drone filming, and final production delivery in extreme weather conditions and high-altitude dynamic sporting environments.',
    image: '/images/gallery/IMG_0196@600.webp',
  },
  {
    title: '2. Frozen Khalti Lake Festival, Season 6',
    desc: 'Complete event coverage and drone cinematography capturing winter sports, cultural expression, and the breathtaking natural surroundings of Hunza and Khalti.',
    image: '/images/gallery/016A5232@600.webp',
  },
  {
    title: '3. HPL Season 14',
    desc: 'Full event coverage and drone cinematography capturing dynamic sports action, audience engagement, and the high-speed atmosphere of the tournament.',
    image: '/images/gallery/3C4A5309@600.webp',
  },
  {
    title: '4. Shan-e-Tajalli Mega Event',
    desc: 'Managed full event coverage and drone cinematography for the Universal Soul Mega Event, highlighting artistic expression, cultural identity, and spiritual reflection.',
    image: '/images/gallery/DSC00440@600.webp',
  },
  {
    title: '5. IT Dept - 1st Nov, Independence Day of GB Coverage',
    desc: 'Captured official proceedings, cultural performances, audience participation, and ceremonial moments with precision and creative storytelling.',
    image: '/images/gallery/DSC00542@600.webp',
  },
  {
    title: '6. SCO - Sponsored, GB Liberation Day Song Project',
    desc: 'Full event and performance coverage with creative filming and drone cinematography for the GB Liberation Day Song sponsored by SCO.',
    image: '/images/gallery/IMG_8099@600.webp',
  },
  {
    title: '7. Women Convention, 16 Days Of Activism - AKRSP',
    desc: 'Covered stage sessions, keynote speeches, and participant interactions at Serena Hunza for the global 16 Days of Activism campaign supporting women empowerment.',
    image: '/images/services/IMG_5656@800.webp',
  },
  {
    title: '8. Fatima Fertilizer Company Ltd',
    desc: 'Professional commercial shoot covering products, facilities, and promotional campaigns with comprehensive photography, videography, and post-production editing.',
    image: '/images/services/IMG_5618@800.webp',
  },
  {
    title: '9. Kashrote Youth Summit',
    desc: 'Professional media coverage capturing key sessions, speakers, youth participation, and event highlights through high-quality photography and videography.',
    image: '/images/services/DSC_4742@800.webp',
  },
  {
    title: '10. JS Bank - Commercial and Promotional Coverage',
    desc: 'Professional media project for JS Bank Gilgit including branch and staff activity coverage, promotional campaigns, and marketing visuals.',
    image: '/images/services/DSC_4732@800.webp',
  },
  {
    title: '11. Trade Mylist',
    desc: 'Professional videography project focusing on promotional content, mobile app features, usability, and brand identity for Trade MyList.',
    image: '/images/services/IMG_7247@800.webp',
  },
];

const ONGOING_PROJECTS = [
  {
    title: '1. Hashoo Foundation - Activity Coverage',
    desc: 'Full media coverage services for ongoing community development activities across multiple valleys in Gilgit-Baltistan, including drone cinematography and photography.',
  },
  {
    title: '2. SCO - Project Coverage',
    desc: 'Actively documenting SCO initiatives across GB including community outreach, ICT development, digital literacy trainings, and SCO Freelancing Hubs.',
  },
  {
    title: '3. Amna Wazir - Clothing Brand Shoots',
    desc: 'Creative and high-end fashion shoots showcasing premium cultural, bridal, and contemporary apparel with concept development and model direction.',
  },
  {
    title: '4. Karakorum Expedition',
    desc: 'Professional media coverage capturing expedition activities, participant engagement, and scenic highlights through high-quality photography and videography.',
  },
  {
    title: '5. Binary Hub',
    desc: 'Media coverage of ongoing projects, field activities, and community engagement initiatives for the freelancing IT company across Gilgit-Baltistan.',
  },
  {
    title: '6. Telenor Franchise - GB',
    desc: 'Media coverage for Telenor Franchise operations across Gilgit-Baltistan, including branch activities, customer engagement, and promotional campaigns.',
  },
  {
    title: '7. Mobile Mart - Product Shoots',
    desc: 'Professional product shoots across Gilgit showcasing mobile devices and accessories with creative concept planning and professional lighting.',
  },
  {
    title: '8. Araya International Diagnostic Centre',
    desc: 'Professional media services for Araya International Diagnostic Center, Gilgit, covering facilities, staff activities, and operational highlights.',
  },
];

const EQUIPMENT_LIST = [
  'Canon R5 Mark II',
  'Blackmagic Cinema Camera',
  'Canon R6 Mark II',
  'Sony A7MIII',
  'Sony A7IV',
  'Sony FX3',
  'Trigger X3',
  'Soft Box & Reflectors',
  'Defusers & Bardoor LC 500 Godox',
  'MacBook Pro 17"',
  'DJI Drone Air 3',
  'DJI FPV Avata 2',
  'DJI Air 2S',
  'DJI Mic 3 & Boya Wireless',
  'DJI Ronin RS4 Gimbal',
  'Godox AD600 ProII',
  'SmallRig Professional Rigging',
];

const TEAM_MEMBERS = [
  { name: 'Saeed Akbar', qual: 'MS / M.Phil', desig: 'HR Manager' },
  { name: 'Riaz', qual: 'MS / M.Phil', desig: 'Admin Manager' },
  { name: 'Sheraman', qual: 'BS', desig: 'Project Manager' },
  { name: 'Hasnain', qual: 'BS', desig: 'Operations Manager' },
  { name: 'Arsalan', qual: 'BS', desig: 'Graphic Designer' },
  { name: 'Sohail', qual: 'BS', desig: 'Creative Director' },
  { name: 'Israr', qual: 'BA', desig: 'Technician' },
  { name: 'Mehran', qual: 'BS', desig: 'Technician' },
  { name: 'Akash', qual: 'BS', desig: 'Helper-Videographer' },
  { name: 'Shehryar', qual: 'BS', desig: 'Helper-Cinematographer' },
  { name: 'Waqar', qual: 'Diploma', desig: 'Helper-Photographer' },
  { name: 'Deedar', qual: 'FSc', desig: 'Helper-Editor' },
  { name: 'Mujeeba', qual: 'FSc', desig: 'Helper-Lighting' },
  { name: 'Hasnain', qual: 'FSc', desig: 'Helper-Videographer' },
  { name: 'Asim', qual: 'FSc', desig: 'Helper-Video Editor' },
];

const CLIENTS = [
  'AKRSP (Aga Khan Rural Support Programme)',
  'SCO (Special Communications Organization)',
  'ISPR (Inter-Services Public Relations)',
  'Hashoo Foundation',
  'Telenor Franchise GB',
  'Water & Irrigation Management Department',
  'Educational Institutions & Universities',
  'Corporate Clients & Brands',
  'Private Initiatives & Fashion Houses',
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

      <div className="section">
        <div className="container" style={{ maxWidth: '1000px' }}>
          
          {/* Welcome & About with Image Showcase */}
          <div className="grid grid-2" style={{ gap: 'var(--space-8)', alignItems: 'center', marginBottom: 'var(--space-10)' }}>
            <div>
              <h2 style={{ fontSize: 'var(--fs-2xl)', marginBottom: 'var(--space-4)', color: 'var(--clr-heading)' }}>
                Welcome to Syed Production
              </h2>
              <p style={{ color: 'var(--clr-gray-600)', lineHeight: '1.8', marginBottom: 'var(--space-4)' }}>
                Welcome to Syed Production, a registered production company dedicated to transforming ideas into high-quality visual stories. With expertise in videography, cinematography, editing, and drone operations, we combine creativity, precision, and technical excellence to deliver content that exceeds client expectations.
              </p>
              <p style={{ color: 'var(--clr-gray-600)', lineHeight: '1.8' }}>
                From corporate videos and promotional campaigns to event coverage and documentaries, our team approaches every assignment with meticulous planning and innovative solutions across Gilgit-Baltistan and beyond.
              </p>
            </div>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/services/DSC_4762@800.webp"
                alt="Syed Production Shoot"
                style={{ width: '100%', height: '320px', objectFit: 'cover', borderRadius: 'var(--radius-md)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
              />
            </div>
          </div>

          {/* CEO Message with Chairman Photo */}
          <div style={{ background: 'var(--clr-card-bg)', padding: 'var(--space-6)', borderRadius: 'var(--radius-md)', border: '1px solid var(--clr-border)', marginBottom: 'var(--space-10)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-6)', alignItems: 'center' }}>
            <div style={{ flex: '0 0 160px', textAlign: 'center' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/team/Syed Burhan Uddin Shah.jpeg"
                alt="Syed Burhan Uddin Shah"
                style={{ width: '130px', height: '130px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--clr-primary)', margin: '0 auto var(--space-2)' }}
              />
              <h4 style={{ fontSize: 'var(--fs-sm)', color: 'var(--clr-heading)' }}>Syed Burhan Uddin Shah</h4>
              <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--clr-primary)' }}>CEO & Chairman</p>
            </div>
            <div style={{ flex: '1', minWidth: '280px' }}>
              <h3 style={{ fontSize: 'var(--fs-xl)', marginBottom: 'var(--space-3)', color: 'var(--clr-heading)' }}>
                CEO Message
              </h3>
              <p style={{ fontStyle: 'italic', color: 'var(--clr-gray-700)', lineHeight: '1.8', marginBottom: 'var(--space-3)' }}>
                &ldquo;At Syed Production, we work with a firm belief that every story carries value and deserves to be shared with creativity, clarity, and purpose. Whether it is a corporate documentary, promotional film, event coverage, or aerial drone project, we remain committed to delivering work that reflects precision and meaningful storytelling.&rdquo;
              </p>
            </div>
          </div>

          {/* Vision & Mission */}
          <div className="grid grid-2" style={{ gap: 'var(--space-6)', marginBottom: 'var(--space-10)' }}>
            <div style={{ background: 'var(--clr-card-bg)', padding: 'var(--space-6)', borderRadius: 'var(--radius-md)', border: '1px solid var(--clr-border)' }}>
              <h3 style={{ fontSize: 'var(--fs-lg)', marginBottom: 'var(--space-3)', color: 'var(--clr-heading)' }}>Our Vision</h3>
              <p style={{ color: 'var(--clr-gray-600)', lineHeight: '1.7', fontSize: 'var(--fs-sm)' }}>
                To establish Syed Production as a leading and trusted creative production company in Gilgit-Baltistan and across Pakistan, recognized for its commitment to innovation, quality, and impactful storytelling that preserves cultural heritage and inspires communities.
              </p>
            </div>
            <div style={{ background: 'var(--clr-card-bg)', padding: 'var(--space-6)', borderRadius: 'var(--radius-md)', border: '1px solid var(--clr-border)' }}>
              <h3 style={{ fontSize: 'var(--fs-lg)', marginBottom: 'var(--space-3)', color: 'var(--clr-heading)' }}>Our Mission</h3>
              <p style={{ color: 'var(--clr-gray-600)', lineHeight: '1.7', fontSize: 'var(--fs-sm)' }}>
                To provide comprehensive and high-quality services in videography, cinematography, drone filming, photography, and post-production, delivering creative, professional, and impactful content tailored to each client&apos;s unique vision.
              </p>
            </div>
          </div>

          {/* Core Values */}
          <div style={{ marginBottom: 'var(--space-10)' }}>
            <h3 style={{ fontSize: 'var(--fs-xl)', marginBottom: 'var(--space-4)', color: 'var(--clr-heading)' }}>
              Core Company Values
            </h3>
            <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)', listStyle: 'none', padding: 0 }}>
              {[
                { title: 'Integrity', desc: 'Honesty, transparency, and accountability in every project.' },
                { title: 'Creativity', desc: 'Constant exploration of innovative approaches and fresh ideas.' },
                { title: 'Excellence', desc: 'Maintaining the highest standards in technical quality and storytelling.' },
                { title: 'Collaboration', desc: 'Working closely with clients and team members to achieve shared goals.' },
                { title: 'Reliability', desc: 'Delivering projects on time and meeting expectations consistently.' },
                { title: 'Continuous Growth', desc: 'Keeping up with the latest tools, technologies, and industry trends.' },
              ].map((v) => (
                <li key={v.title} style={{ background: 'var(--clr-card-bg)', padding: 'var(--space-4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--clr-border)' }}>
                  <h4 style={{ color: 'var(--clr-primary)', marginBottom: 'var(--space-2)', fontSize: 'var(--fs-md)' }}>{v.title}</h4>
                  <p style={{ color: 'var(--clr-gray-600)', fontSize: 'var(--fs-sm)' }}>{v.desc}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Operational Workflow */}
          <div style={{ marginBottom: 'var(--space-10)' }}>
            <h3 style={{ fontSize: 'var(--fs-xl)', marginBottom: 'var(--space-4)', color: 'var(--clr-heading)' }}>
              Operational Workflow
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {[
                { step: '1. Client Consultation', desc: 'Understanding objectives, project requirements, target audience, and creative expectations.' },
                { step: '2. Pre-Production Planning', desc: 'Script/storyboard development, location scouting, equipment setup, crew allocation, and scheduling.' },
                { step: '3. Production', desc: 'On-site videography, photography, and drone filming with real-time coordination and quality checks.' },
                { step: '4. Post-Production', desc: 'Editing, color grading, motion graphics, sound design, and review for polished, high-quality output.' },
                { step: '5. Delivery & Feedback', desc: 'Final delivery to client, revisions if necessary, and client approval for completion.' },
                { step: '6. Project Archiving & Reporting', desc: 'Storing project files, documentation, and lessons learned for future reference.' },
              ].map((wf) => (
                <div key={wf.step} style={{ background: 'var(--clr-card-bg)', padding: 'var(--space-4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--clr-border)', display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: 'var(--clr-primary)', minWidth: '180px' }}>{wf.step}</span>
                  <span style={{ color: 'var(--clr-gray-600)', fontSize: 'var(--fs-sm)' }}>{wf.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Completed Projects with Images */}
          <div style={{ marginBottom: 'var(--space-10)' }}>
            <h3 style={{ fontSize: 'var(--fs-xl)', marginBottom: 'var(--space-4)', color: 'var(--clr-heading)' }}>
              Completed Projects
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
              {COMPLETED_PROJECTS.map((p) => (
                <div key={p.title} style={{ background: 'var(--clr-card-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--clr-border)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  {p.image && (
                    <div style={{ height: '180px', overflow: 'hidden' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div style={{ padding: 'var(--space-5)', flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <h4 style={{ fontSize: 'var(--fs-md)', marginBottom: 'var(--space-2)', color: 'var(--clr-heading)' }}>{p.title}</h4>
                    <p style={{ color: 'var(--clr-gray-600)', fontSize: 'var(--fs-sm)', lineHeight: '1.6' }}>{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ongoing Projects */}
          <div style={{ marginBottom: 'var(--space-10)' }}>
            <h3 style={{ fontSize: 'var(--fs-xl)', marginBottom: 'var(--space-4)', color: 'var(--clr-heading)' }}>
              Ongoing Projects
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
              {ONGOING_PROJECTS.map((p) => (
                <div key={p.title} style={{ background: 'var(--clr-card-bg)', padding: 'var(--space-5)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--clr-border)' }}>
                  <h4 style={{ fontSize: 'var(--fs-md)', marginBottom: 'var(--space-2)', color: 'var(--clr-heading)' }}>{p.title}</h4>
                  <p style={{ color: 'var(--clr-gray-600)', fontSize: 'var(--fs-sm)', lineHeight: '1.6' }}>{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Capabilities & Equipment */}
          <div style={{ marginBottom: 'var(--space-10)' }}>
            <h3 style={{ fontSize: 'var(--fs-xl)', marginBottom: 'var(--space-4)', color: 'var(--clr-heading)' }}>
              Technical Capabilities & Equipment
            </h3>
            <p style={{ color: 'var(--clr-gray-600)', lineHeight: '1.8', marginBottom: 'var(--space-4)' }}>
              Syed Production is equipped with industry-leading technology including high-resolution cinema cameras, aerial drone filming systems, stabilized gimbals, professional lighting setups, and advanced post-production suites.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {EQUIPMENT_LIST.map((eq) => (
                <span key={eq} style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--clr-primary)', padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-full)', fontSize: 'var(--fs-xs)', fontWeight: 600 }}>
                  {eq}
                </span>
              ))}
            </div>
          </div>

          {/* Clients & Strategic Partnerships */}
          <div style={{ marginBottom: 'var(--space-10)' }}>
            <h3 style={{ fontSize: 'var(--fs-xl)', marginBottom: 'var(--space-4)', color: 'var(--clr-heading)' }}>
              Clients & Strategic Partnerships
            </h3>
            <ul style={{ listStyle: 'disc', paddingLeft: '20px', color: 'var(--clr-gray-600)', lineHeight: '1.8' }}>
              {CLIENTS.map((client) => (
                <li key={client}>{client}</li>
              ))}
            </ul>
          </div>

          {/* Team Structure */}
          <div style={{ marginBottom: 'var(--space-10)' }}>
            <h3 style={{ fontSize: 'var(--fs-xl)', marginBottom: 'var(--space-4)', color: 'var(--clr-heading)' }}>
              Human Resource & Team Structure
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--fs-sm)' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--clr-border)', color: 'var(--clr-heading)' }}>
                    <th style={{ padding: 'var(--space-3)' }}>Name</th>
                    <th style={{ padding: 'var(--space-3)' }}>Qualification</th>
                    <th style={{ padding: 'var(--space-3)' }}>Designation</th>
                  </tr>
                </thead>
                <tbody>
                  {TEAM_MEMBERS.map((t) => (
                    <tr key={t.name} style={{ borderBottom: '1px solid var(--clr-border)' }}>
                      <td style={{ padding: 'var(--space-3)', fontWeight: 600 }}>{t.name}</td>
                      <td style={{ padding: 'var(--space-3)', color: 'var(--clr-gray-600)' }}>{t.qual}</td>
                      <td style={{ padding: 'var(--space-3)', color: 'var(--clr-primary)' }}>{t.desig}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Terms & Compliance */}
          <div style={{ background: 'var(--clr-card-bg)', padding: 'var(--space-6)', borderRadius: 'var(--radius-md)', border: '1px solid var(--clr-border)', marginBottom: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--fs-xl)', marginBottom: 'var(--space-3)', color: 'var(--clr-heading)' }}>
              Terms & Compliance
            </h3>
            <ul style={{ listStyle: 'disc', paddingLeft: '20px', color: 'var(--clr-gray-600)', lineHeight: '1.8', fontSize: 'var(--fs-sm)' }}>
              <li>All projects executed under formal contracts detailing scope, timeline, and deliverables.</li>
              <li>Adherence to intellectual property rights, copyright, and data protection standards.</li>
              <li>Strict compliance with safety protocols during drone operations and field shoots.</li>
              <li>Commitment to confidentiality and integrity of client content.</li>
            </ul>
          </div>

        </div>
      </div>

      <SiteFooter />
    </>
  );
}
