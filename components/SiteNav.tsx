'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import DarkModeToggle from './DarkModeToggle';
import { useScrollLock } from '@/lib/useScrollLock';
import { brandName } from '@/lib/whatsapp';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/booking', label: 'Book Now' },
  { href: '/reviews', label: 'Reviews' },
  { href: '/contact', label: 'Contact Us', cta: true },
];

export default function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(pathname !== '/');
  const { lock, unlock } = useScrollLock();

  // Only add the sticky treatment once the user leaves the hero. On the home
  // page the navbar starts transparent, so seed from the route and let the
  // listener take over.
  useEffect(() => {
    setScrolled(pathname !== '/');
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // The drawer is a full-height overlay, so freeze the page behind it and let
  // Escape dismiss it. Closing anywhere releases the lock via the cleanup.
  useEffect(() => {
    if (!open) return;
    lock();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      unlock();
    };
  }, [open, lock, unlock]);

  // Widening past the mobile breakpoint reveals the desktop bar, so the drawer
  // state must not survive the resize.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 769px)');
    const onChange = () => {
      if (mq.matches) setOpen(false);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return (
    <nav
      className={`navbar${scrolled ? ' scrolled' : ''}`}
      id="navbar"
      aria-label="Main navigation"
    >
      <div className="nav-container">
        <Link href="/" className="nav-logo" aria-label={`${brandName} Home`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/Syed-production.png"
            alt={brandName}
            className="logo-img"
          />
          <span className="brand-swap-a">Syed</span>
          <span className="brand-swap-b">Production</span>
        </Link>

        <button
          className={`nav-toggle${open ? ' active' : ''}`}
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation menu"
          aria-expanded={open}
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>

        <ul className={`nav-links${open ? ' open' : ''}`} role="list">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`nav-link${link.cta ? ' nav-link--cta' : ''}`}
                aria-current={pathname === link.href ? 'page' : undefined}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <DarkModeToggle />
          </li>
        </ul>
      </div>

      {/* Backdrop lives outside .nav-container on purpose: the container sets
          `backdrop-filter`, which would make it the containing block and clip
          a `position: fixed` overlay to the navbar pill. */}
      <button
        type="button"
        className={`nav-overlay${open ? ' open' : ''}`}
        aria-hidden="true"
        tabIndex={-1}
        onClick={() => setOpen(false)}
      />
    </nav>
  );
}
