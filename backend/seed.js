require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Destination = require('./models/Destination');
const Review = require('./models/Review');
const Deal = require('./models/Deal');
const Admin = require('./models/Admin');
const Video = require('./models/Video');
const GalleryImage = require('./models/GalleryImage');
const TeamMember = require('./models/TeamMember');

const destinations = [
  {
    id: 1, name: 'Cinematic Wedding Films', country: 'Premium', category: 'film', featured: true,
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80',
    rating: 4.9, reviews: 340, price: 150000,
    description: 'Capture your special day with cinematic storytelling. Our wedding films blend emotion, artistry, and technical excellence to create timeless memories you will cherish forever.',
    highlights: ['4K Cinematic', 'Drone Shots', 'Same-Day Edit', 'Full Ceremony', 'Highlight Reel'],
    mapX: 700, mapY: 158
  },
  {
    id: 2, name: 'Corporate Video Production', country: 'Business', category: 'film',
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&q=80',
    rating: 4.8, reviews: 280, price: 120000,
    description: 'Professional corporate videos that communicate your brand story, culture, and values. From company profiles to training videos and product launches.',
    highlights: ['Brand Story', 'Product Launch', 'Training Videos', 'Interviews', 'Motion Graphics'],
    mapX: 725, mapY: 172
  },
  {
    id: 3, name: 'Music Video Production', country: 'Creative', category: 'film', featured: true,
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80',
    rating: 4.9, reviews: 210, price: 200000,
    description: 'Bring your music to life with visually stunning music videos. We handle concept development, location scouting, filming, and post-production from start to finish.',
    highlights: ['Concept Design', 'Multi-Location', 'Color Grading', 'VFX', 'Choreography'],
    mapX: 688, mapY: 178
  },
  {
    id: 4, name: 'Product Photography', country: 'Commercial', category: 'photography', featured: true,
    image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=600&q=80',
    rating: 4.7, reviews: 160, price: 50000,
    description: 'High-quality product photography for e-commerce, catalogues, and advertising. Studio and on-location setups with professional lighting and styling.',
    highlights: ['Studio Setup', 'Lifestyle Shots', 'White Background', '360° Views', 'Retouching'],
    mapX: 682, mapY: 152
  },
  {
    id: 5, name: 'Event Coverage', country: 'Live', category: 'events', featured: true,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',
    rating: 4.9, reviews: 890, price: 80000,
    description: 'Comprehensive event coverage including conferences, galas, concerts, and ceremonies. Multi-camera setups, live streaming, and rapid turnaround.',
    highlights: ['Multi-Camera', 'Live Stream', 'Same-Day Highlights', 'Drone Coverage', 'Photo + Video'],
    mapX: 738, mapY: 162
  },
  {
    id: 6, name: 'Documentary Filmmaking', country: 'Storytelling', category: 'film',
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&q=80',
    rating: 4.8, reviews: 135, price: 250000,
    description: 'Compelling documentary films that tell powerful stories. From concept to distribution, we handle research, interviews, cinematography, and post-production.',
    highlights: ['Research', 'Interviews', 'Narration', 'Archival Footage', 'Festival Ready'],
    mapX: 722, mapY: 185
  },
  {
    id: 7, name: 'Portrait & Fashion Photography', country: 'Creative', category: 'photography',
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80',
    rating: 4.7, reviews: 180, price: 40000,
    description: 'Professional portrait and fashion photography sessions. From headshots to editorial spreads, we bring out the best in every subject with expert lighting and direction.',
    highlights: ['Studio Portraits', 'Outdoor Shoots', 'Fashion Editorial', 'Headshots', 'Retouching'],
    mapX: 706, mapY: 142
  },
  {
    id: 8, name: 'Social Media Content', country: 'Digital', category: 'branding',
    image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&q=80',
    rating: 4.6, reviews: 140, price: 35000,
    description: 'Engaging social media content creation — reels, stories, posts, and ad creatives optimized for Instagram, TikTok, YouTube, and Facebook.',
    highlights: ['Reels', 'Stories', 'Ad Creatives', 'Content Calendar', 'Platform Optimization'],
    mapX: 714, mapY: 132
  },
  {
    id: 9, name: 'Video Editing & Post-Production', country: 'Post', category: 'editing',
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&q=80',
    rating: 4.8, reviews: 220, price: 30000,
    description: 'Professional video editing, color grading, sound design, and motion graphics. Transform your raw footage into polished, broadcast-ready content.',
    highlights: ['Color Grading', 'Sound Design', 'Motion Graphics', 'VFX', 'Subtitles'],
    mapX: 695, mapY: 146
  },
  {
    id: 10, name: 'Real Estate Videography', country: 'Property', category: 'film',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80',
    rating: 4.7, reviews: 95, price: 60000,
    description: 'Showcase properties with stunning aerial and interior videography. Virtual tours, drone footage, and cinematic walkthroughs for real estate marketing.',
    highlights: ['Drone Footage', 'Virtual Tours', 'Interior Shots', 'Twilight Shoots', '3D Tours'],
    mapX: 672, mapY: 168
  },
  {
    id: 11, name: 'Brand Identity & Logo Design', country: 'Creative', category: 'branding',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80',
    rating: 4.6, reviews: 170, price: 45000,
    description: 'Complete brand identity packages — logo design, color palettes, typography, brand guidelines, and visual assets for a cohesive professional look.',
    highlights: ['Logo Design', 'Brand Guidelines', 'Color Palette', 'Typography', 'Visual Assets'],
    mapX: 698, mapY: 165
  },
  {
    id: 12, name: 'Photo & Video Retouching', country: 'Post', category: 'editing',
    image: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=600&q=80',
    rating: 4.8, reviews: 110, price: 25000,
    description: 'Expert photo and video retouching services. Skin retouching, background removal, color correction, and compositing to make every frame perfect.',
    highlights: ['Skin Retouching', 'Background Removal', 'Color Correction', 'Compositing', 'Batch Processing'],
    mapX: 690, mapY: 170
  }
];

const reviews = [
  {
    name: 'Ahmed Raza', location: 'Lahore, Pakistan',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    rating: 5, destination: 'Cinematic Wedding Films', verified: true,
    text: "Syed Productions made our wedding absolutely magical! The cinematography was breathtaking and every emotion was perfectly captured. The same-day edit had our guests in tears. Highly recommended!"
  },
  {
    name: 'Sarah Khan', location: 'Islamabad, Pakistan',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
    rating: 5, destination: 'Corporate Video Production', verified: true,
    text: 'The corporate video for our company launch was outstanding! Professional crew, amazing equipment, and the final edit exceeded all expectations. Our brand story has never looked better.'
  },
  {
    name: 'Fatima Ali', location: 'Karachi, Pakistan',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    rating: 5, destination: 'Event Coverage', verified: true,
    text: "They covered our annual gala and the results were stunning. Multi-camera setup, beautiful lighting, and the highlight reel was delivered the very next day. Absolutely professional team."
  },
  {
    name: 'Omar Sheikh', location: 'Rawalpindi, Pakistan',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
    rating: 5, destination: 'Music Video Production', verified: true,
    text: 'Working with Syed Productions on my music video was incredible. They understood my vision perfectly, the locations were stunning, and the color grading gave it a true cinematic feel.'
  },
  {
    name: 'Aisha Malik', location: 'Faisalabad, Pakistan',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80',
    rating: 5, destination: 'Product Photography', verified: true,
    text: "The product shots for our online store were phenomenal. Clean, professional, and perfectly lit. Our conversion rate increased by 40% after updating with their photos. Amazing work!"
  },
  {
    name: 'Hassan Ali', location: 'Multan, Pakistan',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
    rating: 5, destination: 'Documentary Filmmaking', verified: true,
    text: 'Syed Productions brought our documentary vision to life. From research to final edit, every step was handled with care. The storytelling was powerful and the cinematography was world-class.'
  }
];

const now = Date.now();
const deals = [
  {
    name: 'Wedding Film Package', destination: 'Cinematic Wedding Films',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80',
    oldPrice: 200000, newPrice: 150000, badge: 'Hot Deal',
    description: 'Complete wedding coverage — 2 cinematographers, drone, same-day edit, 10-min highlight film, full ceremony edit.',
    expiresAt: new Date(now + 47 * 3600000)
  },
  {
    name: 'Corporate Starter Package', destination: 'Corporate Video Production',
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&q=80',
    oldPrice: 150000, newPrice: 99000, badge: 'Trending',
    description: 'Brand story video + 3 social media cuts. Includes scripting, filming, editing, and motion graphics.',
    expiresAt: new Date(now + 23 * 3600000)
  },
  {
    name: 'Event Coverage Bundle', destination: 'Event Coverage',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',
    oldPrice: 120000, newPrice: 80000, badge: 'Best Seller',
    description: 'Full event photo + video coverage, live streaming, same-day highlight reel, and social media package.',
    expiresAt: new Date(now + 71 * 3600000)
  },
  {
    name: 'Complete Branding Suite', destination: 'Brand Identity & Logo Design',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80',
    oldPrice: 180000, newPrice: 120000, badge: 'Save 33%',
    description: 'Logo + brand guidelines + social media templates + product photography + promotional video.',
    expiresAt: new Date(now + 35 * 3600000)
  }
];

const videos = [
  { title: 'Syed Productions Showreel', description: 'A showcase of our best cinematic work across all categories', tag: 'Cinematic', videoUrl: 'videos/Syed Productions-1.mp4', sortOrder: 1 },
  { title: 'Wedding Highlights', description: 'Beautiful wedding films that capture every emotion', tag: 'Client Story', videoUrl: 'videos/Syed Productions-2.mp4', sortOrder: 2 },
  { title: 'Corporate Reel', description: 'Professional corporate videos for leading brands', tag: 'Corporate', videoUrl: 'videos/Syed Productions-3.mp4', sortOrder: 3 },
  { title: 'Behind the Scenes', description: 'See how we bring creative visions to life on set', tag: 'Cinematic', videoUrl: 'videos/Syed Productions-4.mp4', sortOrder: 4 },
  { title: 'Event Coverage Reel', description: 'Conferences, galas, and live events captured beautifully', tag: 'Client Story', videoUrl: 'videos/Syed Productions-5.mp4', sortOrder: 5 },
  { title: 'Music Video Showcase', description: 'Creative music videos with stunning visuals', tag: 'Creative', videoUrl: 'videos/Syed Productions-6.mp4', sortOrder: 6 },
  { title: 'Documentary Preview', description: 'Powerful stories told through compelling documentary films', tag: 'Cinematic', videoUrl: 'videos/Syed Productions-7.mp4', sortOrder: 7 },
  { title: 'Client Testimonials', description: 'Hear what our clients have to say about working with us', tag: 'Client Story', videoUrl: 'videos/Syed Productions-8.mp4', sortOrder: 8 },
  { title: 'Product Showcase', description: 'Product photography and videography highlights', tag: 'Commercial', videoUrl: 'videos/Syed Productions-9.mp4', sortOrder: 9 },
  { title: 'Aerial Cinematography', description: 'Stunning drone footage from our productions', tag: 'Cinematic', videoUrl: 'videos/Syed Productions-10.mp4', sortOrder: 10 }
];

const galleryImages = [
  { imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80', altText: 'Wedding cinematography', hidden: false, sortOrder: 1 },
  { imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80', altText: 'Music video production', hidden: false, sortOrder: 2 },
  { imageUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&q=80', altText: 'Corporate shoot', hidden: false, sortOrder: 3 },
  { imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80', altText: 'Event coverage', hidden: false, sortOrder: 4 },
  { imageUrl: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&q=80', altText: 'Product photography', hidden: false, sortOrder: 5 },
  { imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&q=80', altText: 'Documentary filming', hidden: false, sortOrder: 6 },
  { imageUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80', altText: 'Fashion photography', hidden: false, sortOrder: 7 },
  { imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=80', altText: 'Real estate shoot', hidden: false, sortOrder: 8 },
  { imageUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&q=80', altText: 'Social media content', hidden: false, sortOrder: 9 },
  { imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=80', altText: 'Branding project', hidden: false, sortOrder: 10 },
  { imageUrl: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=400&q=80', altText: 'Photo retouching', hidden: false, sortOrder: 11 },
  { imageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&q=80', altText: 'Conference coverage', hidden: true, sortOrder: 12 },
  { imageUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&q=80', altText: 'On-set filming', hidden: true, sortOrder: 13 },
  { imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80', altText: 'Camera setup', hidden: true, sortOrder: 14 },
  { imageUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&q=80', altText: 'Film production', hidden: true, sortOrder: 15 },
  { imageUrl: 'https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=400&q=80', altText: 'Studio session', hidden: true, sortOrder: 16 },
  { imageUrl: 'https://images.unsplash.com/photo-1533488765986-dfa2a9939acd?w=400&q=80', altText: 'Editing suite', hidden: true, sortOrder: 17 }
];

const teamMembers = [
  { name: 'Syed Ahmed', role: 'Director & Founder', bio: 'Visionary filmmaker with 10+ years of experience in cinematic storytelling. Leads every production with passion and precision.', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80', facebook: '#', instagram: '#', sortOrder: 1 },
  { name: 'Maria Khan', role: 'Lead Cinematographer', bio: 'Expert in visual composition and camera work. Specializes in wedding films, music videos, and commercial productions.', image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80', facebook: '#', instagram: '#', sortOrder: 2 },
  { name: 'Ali Hassan', role: 'Senior Editor & Colorist', bio: 'Master of post-production with expertise in color grading, VFX, and motion graphics. Brings raw footage to cinematic life.', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80', facebook: '#', instagram: '#', sortOrder: 3 },
  { name: 'Zara Batool', role: 'Producer & Client Relations', bio: 'Manages projects from concept to delivery. Ensures every client vision is executed flawlessly and on schedule.', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80', facebook: '#', instagram: '#', sortOrder: 4 }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      Destination.deleteMany({}),
      Review.deleteMany({}),
      Deal.deleteMany({}),
      Admin.deleteMany({}),
      Video.deleteMany({}),
      GalleryImage.deleteMany({}),
      TeamMember.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Seed data
    await Destination.insertMany(destinations);
    console.log(`Seeded ${destinations.length} services`);

    await Review.insertMany(reviews);
    console.log(`Seeded ${reviews.length} reviews`);

    await Deal.insertMany(deals);
    console.log(`Seeded ${deals.length} deals`);

    await Video.insertMany(videos);
    console.log(`Seeded ${videos.length} videos`);

    await GalleryImage.insertMany(galleryImages);
    console.log(`Seeded ${galleryImages.length} gallery images`);

    await TeamMember.insertMany(teamMembers);
    console.log(`Seeded ${teamMembers.length} team members`);

    // Create default admin
    const password = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';
    await Admin.create({ username: 'admin', password });
    console.log('Seeded admin user (admin / ' + password + ')');

    console.log('\nSeed complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
