'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { videos } from '@/lib/data';
import { getVideoEmbed } from '@/lib/video';
import SectionHeader from '@/components/SectionHeader';
import ReelsViewer from './ReelsViewer';

/**
 * Filter tabs + card grid + reels viewer, without a section wrapper, so the
 * gallery page can drop it inside its own Photos/Videos tabs.
 */
export function VideoGrid({ reveal = false }: { reveal?: boolean }) {
  const [filter, setFilter] = useState('all');
  const [reelsIndex, setReelsIndex] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  // Tabs are derived from the data. The original hardcoded tab values
  // (advertisements, weddings, ...) against a `category` field the video
  // records never had, so every tab but "All" came back empty.
  const tags = useMemo(() => {
    const seen = new Map<string, string>();
    for (const v of videos) {
      const key = v.tag.toLowerCase().replace(/\s+/g, '-');
      if (!seen.has(key)) seen.set(key, v.tag);
    }
    return Array.from(seen, ([key, label]) => ({ key, label }));
  }, []);

  const filtered = useMemo(
    () =>
      filter === 'all'
        ? videos
        : videos.filter((v) => v.tag.toLowerCase().replace(/\s+/g, '-') === filter),
    [filter]
  );

  return (
    <>
      <div
        className={`filter-tabs${reveal ? ' reveal-up' : ''}`}
        id="videoFilterTabs"
        role="tablist"
        aria-label="Video categories"
      >
        <button
          className={`filter-tab${filter === 'all' ? ' active' : ''}`}
          role="tab"
          aria-selected={filter === 'all'}
          onClick={() => setFilter('all')}
        >
          All Videos
        </button>
        {tags.map((t) => (
          <button
            key={t.key}
            className={`filter-tab${filter === t.key ? ' active' : ''}`}
            role="tab"
            aria-selected={filter === t.key}
            onClick={() => setFilter(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div
        className={`video-grid${reveal ? ' reveal-up' : ''}`}
        id="videoGrid"
        ref={gridRef}
      >
        {filtered.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--clr-gray-500)', padding: '2rem' }}>
            No videos in this category yet.
          </p>
        )}
        {filtered.map((v) => {
          const index = videos.indexOf(v);
          const embed = getVideoEmbed(v.videoUrl);
          const tagClass =
            v.tag === 'Client Story'
              ? 'video-card-tag video-card-tag--client'
              : 'video-card-tag';

          return (
            <div
              key={`${v.videoUrl}-${index}`}
              className="video-card"
              role="button"
              tabIndex={0}
              data-video={encodeURI(v.videoUrl)}
              data-video-type={embed.type}
              onClick={() => setReelsIndex(index)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setReelsIndex(index);
                }
              }}
            >
              {embed.type === 'youtube' && embed.videoId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${embed.videoId}?autoplay=1&mute=1&loop=1&playlist=${embed.videoId}&controls=0&showinfo=0&modestbranding=1`}
                  title={v.title}
                  frameBorder="0"
                  allow="autoplay; encrypted-media"
                  loading="lazy"
                />
              ) : embed.type === 'instagram' ? (
                <iframe
                  src={embed.embedUrl}
                  title={v.title}
                  frameBorder="0"
                  allow="autoplay; encrypted-media"
                  loading="lazy"
                />
              ) : embed.type === 'facebook' ? (
                <iframe
                  src={`${embed.embedUrl}&mute=1`}
                  title={v.title}
                  frameBorder="0"
                  allow="autoplay; encrypted-media"
                  loading="lazy"
                />
              ) : (
                <VideoPreview src={encodeURI(v.videoUrl)} title={v.title} />
              )}
              <div className="video-card-overlay">
                <span className={tagClass}>{v.tag}</span>
                <h3 className="video-card-title">{v.title}</h3>
                <p className="video-card-desc">{v.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <ReelsViewer
        items={videos}
        startIndex={reelsIndex}
        onClose={() => setReelsIndex(null)}
      />
    </>
  );
}

export default function VideoShowcase() {
  return (
    <section className="video-showcase section" id="videos">
      <div className="container">
        <SectionHeader section="videos" />
        <VideoGrid reveal />
      </div>
    </section>
  );
}

/** Autoplaying muted preview; playback only starts once the card is in view. */
function VideoPreview({ src, title }: { src: string; title: string }) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      el.play().catch(() => {});
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) el.play().catch(() => {});
          else el.pause();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return <video ref={ref} muted loop playsInline preload="metadata" src={src} title={title} />;
}
