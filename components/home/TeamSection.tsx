'use client';

import { useCallback, useEffect, useState } from 'react';
import { teamMembers } from '@/lib/data';
import { useScrollLock } from '@/lib/useScrollLock';
import type { TeamMember } from '@/lib/types';
import SectionHeader from '@/components/SectionHeader';

function TeamPopup({
  member,
  onClose,
}: {
  member: TeamMember | null;
  onClose: () => void;
}) {
  // `shown` holds the last non-null member so the overlay can fade out over
  // 300ms instead of vanishing the frame `member` goes null.
  const [shown, setShown] = useState<TeamMember | null>(null);
  const [open, setOpen] = useState(false);
  const { lock, unlock } = useScrollLock();

  // Fade out over 300ms rather than vanishing the frame `member` goes null.
  useEffect(() => {
    if (member) return;
    setOpen(false);
    const timer = setTimeout(() => setShown(null), 300);
    return () => clearTimeout(timer);
  }, [member]);

  // Lock lifecycle, kept symmetric: lock on open, release on close *and* on
  // unmount. The two concerns must stay in separate effects, otherwise a
  // member -> null transition would unlock once from the cleanup and again
  // from the body, and a direct A -> B switch would leak a lock.
  useEffect(() => {
    if (!member) return;
    setShown(member);
    lock();
    const id = requestAnimationFrame(() => setOpen(true));
    return () => {
      cancelAnimationFrame(id);
      unlock();
    };
  }, [member, lock, unlock]);

  useEffect(() => {
    if (!member) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [member, onClose]);

  if (!shown) return null;

  return (
    <div
      className={`team-popup-overlay${open ? ' open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="teamPopupName"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="team-popup">
        <button className="team-popup-close" onClick={onClose} aria-label="Close profile">
          &times;
        </button>
        <img className="team-popup-img" src={`/${shown.image}`} alt={shown.name} />
        <div className="team-popup-body">
          <h2 className="team-popup-name" id="teamPopupName">
            {shown.name}
          </h2>
          <span className="team-popup-role">{shown.role}</span>
          <p className="team-popup-bio">{shown.bio}</p>
        </div>
      </div>
    </div>
  );
}

export default function TeamSection() {
  const [selected, setSelected] = useState<TeamMember | null>(null);
  const close = useCallback(() => setSelected(null), []);

  return (
    <section className="team section" id="team">
      <div className="container">
        <SectionHeader section="team" />
        <div className="team-grid reveal-up" id="teamGrid">
          {teamMembers.map((m) => (
            <div
              key={m.name}
              className="team-card"
              itemScope
              itemType="https://schema.org/Person"
              data-team-name={m.name.toLowerCase().replace(/\s+/g, '-')}
            >
              <div className="team-card-img">
                <img
                  src={`/${m.image}`}
                  alt={`${m.name} — ${m.role} at Syed Production`}
                  loading="lazy"
                  itemProp="image"
                />
              </div>
              <div className="team-card-body">
                <h3 className="team-card-name" itemProp="name">
                  {m.name}
                </h3>
                <span className="team-card-role" itemProp="jobTitle">
                  {m.role}
                </span>
                <p className="team-card-bio" itemProp="description">
                  {m.bio}
                </p>
                <div itemProp="affiliation" itemScope itemType="https://schema.org/Organization">
                  <meta itemProp="name" content="Syed Production" />
                </div>
                <button
                  className="team-card-btn"
                  data-member-name={m.name}
                  aria-label={`View ${m.name} profile`}
                  onClick={() => setSelected(m)}
                >
                  View Profile
                  <svg
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <TeamPopup member={selected} onClose={close} />
    </section>
  );
}
