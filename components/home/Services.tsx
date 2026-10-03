'use client';

import { useCallback, useState } from 'react';
import {
destinationsByCategory,
    featuredDestinations,
    serviceCategories,
    thumbSrcSet,
    thumbUrl,
  } from '@/lib/data';
import type { Destination } from '@/lib/types';
import SectionHeader from '@/components/SectionHeader';
import DestinationModal from '@/components/DestinationModal';
import Stars from '@/components/Stars';

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All',
  film: 'Film',
  photography: 'Photography',
  events: 'Events',
  editing: 'Editing',
  branding: 'Branding',
};

function ServiceCard({
  dest,
  onOpen,
}: {
  dest: Destination;
  onOpen: () => void;
}) {
  const [favorite, setFavorite] = useState(false);

  return (
    <div className="service-card" role="listitem" data-id={dest.id} onClick={onOpen}>
      <div className="service-card-img">
        <img
          src={thumbUrl(dest.image)}
          srcSet={thumbSrcSet(dest.image)}
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 30vw"
          alt={dest.name}
          loading="lazy"
          decoding="async"
        />
        <span className="service-card-badge">{dest.category}</span>
        {dest.featured && <span className="service-card-top-badge">Top Pick</span>}
        <button
          className={`service-card-favorite${favorite ? ' active' : ''}`}
          aria-label={`Add ${dest.name} to favorites`}
          onClick={(e) => {
            e.stopPropagation();
            setFavorite((f) => !f);
          }}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
      <div className="service-card-body">
        <span className="service-card-tier">
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
            <path
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
              fill="currentColor"
            />
          </svg>
          {dest.tier}
        </span>
        <h3 className="service-card-name">{dest.name}</h3>
        <div className="service-card-rating">
          <span className="stars">
            <Stars rating={dest.rating} />
          </span>
          <span className="rating-text">
            {dest.rating} ({dest.reviews.toLocaleString()})
          </span>
        </div>
        <div className="service-card-footer">
          <button
            className="service-card-btn"
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
          >
            Explore
          </button>
        </div>
      </div>
    </div>
  );
}

export function FeaturedServices({ onOpen }: { onOpen: (id: number) => void }) {
  return (
    <section className="featured-services section" id="featured-services">
      <div className="container">
        <SectionHeader section="featuredServices" />
        <div className="featured-grid reveal-up" id="topDestGrid">
          {featuredDestinations.map((dest) => (
            <div
              key={dest.id}
              className="featured-card"
              role="button"
              tabIndex={0}
              onClick={() => onOpen(dest.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onOpen(dest.id);
                }
              }}
            >
              <img
                src={thumbUrl(dest.image)}
                srcSet={thumbSrcSet(dest.image)}
                sizes="(max-width: 768px) 92vw, 46vw"
                alt={dest.name}
                loading="lazy"
                decoding="async"
              />
              <div className="featured-overlay">
                <span className="featured-tag">Featured Service</span>
                <h3 className="featured-name">{dest.name}</h3>
                <p className="featured-region">{dest.tier}</p>
                <div className="featured-meta">
                  <span className="featured-rating">
                    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                      <path
                        d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                        fill="currentColor"
                      />
                    </svg>
                    {dest.rating}
                  </span>
                </div>
                <button className="featured-btn" onClick={() => onOpen(dest.id)}>
                  Explore
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ServicesGrid({ onOpen }: { onOpen: (id: number) => void }) {
  const [filter, setFilter] = useState('all');
  const filtered = destinationsByCategory(filter);
  const select = useCallback((cat: string) => setFilter(cat), []);

  return (
    <section className="services section" id="services">
      <div className="container">
        <SectionHeader section="services" />
        <div className="filter-tabs reveal-up" role="tablist" aria-label="Service categories">
          {['all', ...serviceCategories].map((cat) => (
            <button
              key={cat}
              className={`filter-tab${filter === cat ? ' active' : ''}`}
              role="tab"
              aria-selected={filter === cat}
              onClick={() => select(cat)}
            >
              {CATEGORY_LABELS[cat] ?? cat}
            </button>
          ))}
        </div>
        <div className="services-grid" id="destinationsGrid" role="list">
          {filtered.map((dest) => (
            <ServiceCard key={dest.id} dest={dest} onOpen={() => onOpen(dest.id)} />
          ))}
        </div>
      </div>
    </section>
  );
}

export { DestinationModal };
