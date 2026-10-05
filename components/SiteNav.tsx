'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import DarkModeToggle from './DarkModeToggle';
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
    </nav>
  );
}