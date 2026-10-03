'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'dark_mode';

export function isDarkMode(): boolean {
  return document.documentElement.classList.contains('dark-mode');
}

/** Persists the choice and toggles the class the stylesheet keys off. */
export function setDarkMode(enabled: boolean) {
  document.documentElement.classList.toggle('dark-mode', enabled);
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
  } catch {
    // Private mode / storage disabled — the class still applies for this page.
  }
}

export default function DarkModeToggle() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    setEnabled(isDarkMode());
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      setDarkMode(!prev);
      return !prev;
    });
  }, []);

  return (
    <button
      className="dark-mode-toggle"
      onClick={toggle}
      aria-label="Toggle dark mode"
      aria-pressed={enabled}
      title="Toggle dark mode"
    >
      <svg
        className="dm-icon dm-icon--moon"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
      </svg>
      <svg
        className="dm-icon dm-icon--sun"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    </button>
  );
}