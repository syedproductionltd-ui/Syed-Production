/** Shapes mirroring lib/__data.json, which was extracted from the original data/site-data.js. */

export interface Destination {
  id: number;
  name: string;
  tier: string;
  category: string;
  /** null on records that were never flagged. */
  featured: boolean | null;
  image: string;
  rating: number;
  reviews: number;
  /** Base price in PKR. */
  price: number;
  description: string;
  highlights: string[];
}

export interface Review {
  name: string;
  city: string;
  avatar: string;
  rating: number;
  service: string;
  verified: boolean;
  text: string;
}

export interface Video {
  title: string;
  description: string;
  tag: string;
  videoUrl: string;
  sortOrder: number;
}

export interface GalleryImage {
  imageUrl: string;
  altText: string;
  /** Hidden tiles are only rendered once the grid is expanded. */
  hidden: boolean;
  sortOrder: number;
}

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
  facebook: string;
  instagram: string;
  sortOrder: number;
}

export interface SectionHeader {
  tag: string;
  title: string;
  description: string;
}

export interface SiteSettings {
  branding: {
    logoUrl: string;
    logoSize: number;
    logoBorderRadius: number;
    companyName: string;
    companyShortName: string;
    faviconUrl: string;
    faviconBorderRadius: number;
  };
  hero: {
    subtitle: string;
    /** May contain a <br> tag. */
    title: string;
    description: string;
  };
  sectionHeaders: Record<
    | 'gallery'
    | 'videos'
    | 'reviews'
    | 'team'
    | 'featuredServices'
    | 'services'
    | 'projectPlanner'
    | 'booking',
    SectionHeader
  >;
  footer: {
    description: string;
    /** May contain HTML entities such as &copy;. */
    copyrightText: string;
  };
  contact: ContactDetails;
  contactInfo: ContactInfo;
  socialLinks: Partial<Record<SocialNetwork, string>>;
  bookingConfig: {
    serviceFee: number;
  };
  aiProjectPlanner: {
    /** May contain inline HTML such as <strong>. */
    welcomeMessage: string;
  };
}

export type SocialNetwork = 'facebook' | 'instagram' | 'whatsapp' | 'tiktok';

export interface ContactDetails {
  email: string;
  phone: string;
  address: string;
  whatsappNumber: string;
  whatsappUrl: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  whatsappNumber: string;
  whatsapp: string;
}

export interface SiteData {
  destinations: Destination[];
  reviews: Review[];
  videos: Video[];
  gallery: GalleryImage[];
  team: TeamMember[];
  settings: SiteSettings;
}
