'use client';

import React, { useEffect } from 'react';

export default function SplashScreen() {
  useEffect(() => {
    const splashScreen = (id: string) => document.getElementById(id);
    const screen = splashScreen('splash-screen');

    if (!screen) return;

    // Total display hold time before exit sequence begins (1.4s)
    const timer1 = setTimeout(() => {
      // PHASE 1: Trigger text fade-out and upward drift (600ms)
      screen.classList.add('text-exiting');

      // PHASE 2: Exactly after text finishes (600ms), trigger background fade (1000ms)
      const timer2 = setTimeout(() => {
        screen.classList.add('bg-exiting');

        // PHASE 3: Exactly after background fade finishes (1000ms), apply hidden
        const timer3 = setTimeout(() => {
          screen.classList.add('hidden');
        }, 1000);

        return () => clearTimeout(timer3);
      }, 600);

      return () => clearTimeout(timer2);
    }, 1400);

    return () => clearTimeout(timer1);
  }, []);

  return (
    <div id="splash-screen">
      <div className="splash-content">
        <img
          src="/Stylised White Film Play Logo.png"
          alt="Syed Production Logo"
          className="splash-logo"
        />
        <h1 className="splash-title">SYED PRODUCTION</h1>
        <p className="splash-slogan">Stories That Matter</p>
      </div>
    </div>
  );
}
