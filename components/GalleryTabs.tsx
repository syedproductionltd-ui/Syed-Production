'use client';

import { useState } from 'react';
import { galleryImages } from '@/lib/data';
import GalleryGrid from '@/components/GalleryGrid';
import { VideoGrid } from '@/components/home/VideoShowcase';

const TABS = [
  { key: 'photos', label: 'Photos', id: 'tabPhotos' },
  { key: 'videos', label: 'Videos', id: 'tabVideos' },
] as const;

export default function GalleryTabs() {
  const [active, setActive] = useState<(typeof TABS)[number]['key']>('photos');

  return (
    <>
      <div className="gallery-tabs" id="galleryTabs" role="tablist" aria-label="Gallery type">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`gallery-tab${active === t.key ? ' active' : ''}`}
            role="tab"
            aria-selected={active === t.key}
            onClick={() => setActive(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/*
        The inactive panel stays mounted: unmounting the photos grid would
        throw away every painted tile and re-lazy-load them on each switch.
        CSS `.gallery-tab-content` hides it, which also stops its
        IntersectionObservers from doing any work.
      */}
      <div
        className={`gallery-tab-content${active === 'photos' ? ' active' : ''}`}
        id="tabPhotos"
        role="tabpanel"
        hidden={active !== 'photos'}
      >
        <GalleryGrid images={galleryImages} />
      </div>

      <div
        className={`gallery-tab-content${active === 'videos' ? ' active' : ''}`}
        id="tabVideos"
        role="tabpanel"
        hidden={active !== 'videos'}
      >
        <VideoGrid />
      </div>
    </>
  );
}
