import { settings } from '@/lib/data';
import type { SiteSettings } from '@/lib/types';

type HeaderKey = keyof SiteSettings['sectionHeaders'];

/**
 * Section headings are driven by settings.sectionHeaders, which the original
 * applySiteSettings() wrote over the hardcoded markup on load. Rendering them
 * from data keeps the page editable from site-data alone.
 */
export default function SectionHeader({ section }: { section: HeaderKey }) {
  const { tag, title, description } = settings.sectionHeaders[section];
  return (
    <div className="section-header reveal-up">
      <span className="section-tag">{tag}</span>
      <h2 className="section-title">{title}</h2>
      <p className="section-description">{description}</p>
    </div>
  );
}
