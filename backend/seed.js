require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Destination = require('./models/Destination');
const Review = require('./models/Review');
const Admin = require('./models/Admin');
const Video = require('./models/Video');
const GalleryImage = require('./models/GalleryImage');
const TeamMember = require('./models/TeamMember');

const destinations = [
  {
    id: 1, name: 'Cinematic Wedding Films', tier: 'Premium', category: 'film', featured: true,
    image: 'images/services/DSC_4732.JPG',
    rating: 4.9, reviews: 340, price: 150000,
    description: 'Capture your special day with cinematic storytelling. Our wedding films blend emotion, artistry, and technical excellence to create timeless memories you will cherish forever.',
    highlights: ['4K Cinematic', 'Drone Shots', 'Same-Day Edit', 'Full Ceremony', 'Highlight Reel']
  },
  {
    id: 2, name: 'Corporate Video Production', tier: 'Business', category: 'film',
    image: 'images/services/DSC_4742.JPG',
    rating: 4.8, reviews: 280, price: 120000,
    description: 'Professional corporate videos that communicate your brand story, culture, and values. From company profiles to training videos and product launches.',
    highlights: ['Brand Story', 'Product Launch', 'Training Videos', 'Interviews', 'Motion Graphics']
  },
  {
    id: 3, name: 'Music Video Production', tier: 'Creative', category: 'film', featured: true,
    image: 'images/services/DSC_4762.JPG',
    rating: 4.9, reviews: 210, price: 200000,
    description: 'Bring your music to life with visually stunning music videos. We handle concept development, location scouting, filming, and post-production from start to finish.',
    highlights: ['Concept Design', 'Multi-Location', 'Color Grading', 'VFX', 'Choreography']
  },
  {
    id: 4, name: 'Product Photography', tier: 'Commercial', category: 'photography', featured: true,
    image: 'images/services/IMG_5618.JPG',
    rating: 4.7, reviews: 160, price: 50000,
    description: 'High-quality product photography for e-commerce, catalogues, and advertising. Studio and on-location setups with professional lighting and styling.',
    highlights: ['Studio Setup', 'Lifestyle Shots', 'White Background', '360° Views', 'Retouching']
  },
  {
    id: 5, name: 'Event Coverage', tier: 'Live', category: 'events', featured: true,
    image: 'images/services/IMG_5656.JPG',
    rating: 4.9, reviews: 890, price: 80000,
    description: 'Comprehensive event coverage including conferences, galas, concerts, and ceremonies. Multi-camera setups, live streaming, and rapid turnaround.',
    highlights: ['Multi-Camera', 'Live Stream', 'Same-Day Highlights', 'Drone Coverage', 'Photo + Video']
  },
  {
    id: 6, name: 'Documentary Filmmaking', tier: 'Storytelling', category: 'film',
    image: 'images/services/IMG_5921.JPG',
    rating: 4.8, reviews: 135, price: 250000,
    description: 'Compelling documentary films that tell powerful stories. From concept to distribution, we handle research, interviews, cinematography, and post-production.',
    highlights: ['Research', 'Interviews', 'Narration', 'Archival Footage', 'Festival Ready']
  },
  {
    id: 7, name: 'Portrait & Fashion Photography', tier: 'Creative', category: 'photography',
    image: 'images/services/IMG_7236.JPG',
    rating: 4.7, reviews: 180, price: 40000,
    description: 'Professional portrait and fashion photography sessions. From headshots to editorial spreads, we bring out the best in every subject with expert lighting and direction.',
    highlights: ['Studio Portraits', 'Outdoor Shoots', 'Fashion Editorial', 'Headshots', 'Retouching']
  },
  {
    id: 8, name: 'Social Media Content', tier: 'Digital', category: 'branding',
    image: 'images/services/IMG_7247.JPG',
    rating: 4.6, reviews: 140, price: 35000,
    description: 'Engaging social media content creation — reels, stories, posts, and ad creatives optimized for Instagram, TikTok, YouTube, and Facebook.',
    highlights: ['Reels', 'Stories', 'Ad Creatives', 'Content Calendar', 'Platform Optimization']
  },
  {
    id: 9, name: 'Video Editing & Post-Production', tier: 'Post', category: 'editing',
    image: 'images/services/IMG_7255.JPG',
    rating: 4.8, reviews: 220, price: 30000,
    description: 'Professional video editing, color grading, sound design, and motion graphics. Transform your raw footage into polished, broadcast-ready content.',
    highlights: ['Color Grading', 'Sound Design', 'Motion Graphics', 'VFX', 'Subtitles']
  },
  {
    id: 10, name: 'Real Estate Videography', tier: 'Property', category: 'film',
    image: 'images/services/IMG_8253.JPG',
    rating: 4.7, reviews: 95, price: 60000,
    description: 'Showcase properties with stunning aerial and interior videography. Virtual tours, drone footage, and cinematic walkthroughs for real estate marketing.',
    highlights: ['Drone Footage', 'Virtual Tours', 'Interior Shots', 'Twilight Shoots', '3D Tours']
  },
  {
    id: 11, name: 'Brand Identity & Logo Design', tier: 'Creative', category: 'branding',
    image: 'images/services/IMG_8261.JPG',
    rating: 4.6, reviews: 170, price: 45000,
    description: 'Complete brand identity packages — logo design, color palettes, typography, brand guidelines, and visual assets for a cohesive professional look.',
    highlights: ['Logo Design', 'Brand Guidelines', 'Color Palette', 'Typography', 'Visual Assets']
  },
  {
    id: 12, name: 'Photo & Video Retouching', tier: 'Post', category: 'editing',
    image: 'images/services/IMG_8285.JPG',
    rating: 4.8, reviews: 110, price: 25000,
    description: 'Expert photo and video retouching services. Skin retouching, background removal, color correction, and compositing to make every frame perfect.',
    highlights: ['Skin Retouching', 'Background Removal', 'Color Correction', 'Compositing', 'Batch Processing']
  }
];

const reviews = [
  {
    name: 'Ahmed Raza', city: 'Lahore, Pakistan',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    rating: 5, service: 'Cinematic Wedding Films', verified: true,
    text: "Syed Productions made our wedding absolutely magical! The cinematography was breathtaking and every emotion was perfectly captured. The same-day edit had our guests in tears. Highly recommended!"
  },
  {
    name: 'Sarah Khan', city: 'Islamabad, Pakistan',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
    rating: 5, service: 'Corporate Video Production', verified: true,
    text: 'The corporate video for our company launch was outstanding! Professional crew, amazing equipment, and the final edit exceeded all expectations. Our brand story has never looked better.'
  },
  {
    name: 'Fatima Ali', city: 'Karachi, Pakistan',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    rating: 5, service: 'Event Coverage', verified: true,
    text: "They covered our annual gala and the results were stunning. Multi-camera setup, beautiful lighting, and the highlight reel was delivered the very next day. Absolutely professional team."
  },
  {
    name: 'Omar Sheikh', city: 'Rawalpindi, Pakistan',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
    rating: 5, service: 'Music Video Production', verified: true,
    text: 'Working with Syed Productions on my music video was incredible. They understood my vision perfectly, the locations were stunning, and the color grading gave it a true cinematic feel.'
  },
  {
    name: 'Aisha Malik', city: 'Faisalabad, Pakistan',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80',
    rating: 5, service: 'Product Photography', verified: true,
    text: "The product shots for our online store were phenomenal. Clean, professional, and perfectly lit. Our conversion rate increased by 40% after updating with their photos. Amazing work!"
  },
  {
    name: 'Hassan Ali', city: 'Multan, Pakistan',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
    rating: 5, service: 'Documentary Filmmaking', verified: true,
    text: 'Syed Productions brought our documentary vision to life. From research to final edit, every step was handled with care. The storytelling was powerful and the cinematography was world-class.'
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
  { imageUrl: 'images/gallery/016A5232.JPG', altText: 'Syed Productions shoot', hidden: false, sortOrder: 1 },
  { imageUrl: 'images/gallery/016A5554.JPG', altText: 'Syed Productions shoot', hidden: false, sortOrder: 2 },
  { imageUrl: 'images/gallery/016A5694.JPG', altText: 'Syed Productions shoot', hidden: false, sortOrder: 3 },
  { imageUrl: 'images/gallery/016A6854.JPG', altText: 'Syed Productions shoot', hidden: false, sortOrder: 4 },
  { imageUrl: 'images/gallery/016A7255.JPG', altText: 'Syed Productions shoot', hidden: false, sortOrder: 5 },
  { imageUrl: 'images/gallery/016A7313.JPG', altText: 'Syed Productions shoot', hidden: false, sortOrder: 6 },
  { imageUrl: 'images/gallery/016A7354.JPG', altText: 'Syed Productions shoot', hidden: false, sortOrder: 7 },
  { imageUrl: 'images/gallery/016A7448.JPG', altText: 'Syed Productions shoot', hidden: false, sortOrder: 8 },
  { imageUrl: 'images/gallery/016A7491.JPG', altText: 'Syed Productions shoot', hidden: false, sortOrder: 9 },
  { imageUrl: 'images/gallery/3C4A5309.JPG', altText: 'Syed Productions shoot', hidden: false, sortOrder: 10 },
  { imageUrl: 'images/gallery/3C4A5429.JPG', altText: 'Syed Productions shoot', hidden: false, sortOrder: 11 },
  { imageUrl: 'images/gallery/DSC00440.JPG', altText: 'Syed Productions shoot', hidden: false, sortOrder: 12 },
  { imageUrl: 'images/gallery/DSC00488.JPG', altText: 'Syed Productions shoot', hidden: false, sortOrder: 13 },
  { imageUrl: 'images/gallery/DSC00518.JPG', altText: 'Syed Productions shoot', hidden: false, sortOrder: 14 },
  { imageUrl: 'images/gallery/DSC00542.JPG', altText: 'Syed Productions shoot', hidden: false, sortOrder: 15 },
  { imageUrl: 'images/gallery/DSC00546.JPG', altText: 'Syed Productions shoot', hidden: false, sortOrder: 16 },
  { imageUrl: 'images/gallery/DSC00579.JPG', altText: 'Syed Productions shoot', hidden: false, sortOrder: 17 },
  { imageUrl: 'images/gallery/DSC01185.JPG', altText: 'Syed Productions shoot', hidden: false, sortOrder: 18 },
  { imageUrl: 'images/gallery/DSC01270.JPG', altText: 'Syed Productions shoot', hidden: true, sortOrder: 19 },
  { imageUrl: 'images/gallery/DSC01310.JPG', altText: 'Syed Productions shoot', hidden: true, sortOrder: 20 },
  { imageUrl: 'images/gallery/DSC01418.JPG', altText: 'Syed Productions shoot', hidden: true, sortOrder: 21 },
  { imageUrl: 'images/gallery/DSC01916.JPG', altText: 'Syed Productions shoot', hidden: true, sortOrder: 22 },
  { imageUrl: 'images/gallery/DSC02039.JPG', altText: 'Syed Productions shoot', hidden: true, sortOrder: 23 },
  { imageUrl: 'images/gallery/DSC02069.JPG', altText: 'Syed Productions shoot', hidden: true, sortOrder: 24 },
  { imageUrl: 'images/gallery/DSC02160.JPG', altText: 'Syed Productions shoot', hidden: true, sortOrder: 25 },
  { imageUrl: 'images/gallery/DSC02194.JPG', altText: 'Syed Productions shoot', hidden: true, sortOrder: 26 },
  { imageUrl: 'images/gallery/DSC02227.JPG', altText: 'Syed Productions shoot', hidden: true, sortOrder: 27 },
  { imageUrl: 'images/gallery/DSC02309.JPG', altText: 'Syed Productions shoot', hidden: true, sortOrder: 28 },
  { imageUrl: 'images/gallery/DSC02367.JPG', altText: 'Syed Productions shoot', hidden: true, sortOrder: 29 },
  { imageUrl: 'images/gallery/DSC02419.JPG', altText: 'Syed Productions shoot', hidden: true, sortOrder: 30 },
  { imageUrl: 'images/gallery/DSC04563.JPG', altText: 'Syed Productions shoot', hidden: true, sortOrder: 31 },
  { imageUrl: 'images/gallery/DSC09472.JPG', altText: 'Syed Productions shoot', hidden: true, sortOrder: 32 },
  { imageUrl: 'images/gallery/DSC09537.JPG', altText: 'Syed Productions shoot', hidden: true, sortOrder: 33 },
  { imageUrl: 'images/gallery/IMG_1266.JPG', altText: 'Syed Productions shoot', hidden: true, sortOrder: 34 },
  { imageUrl: 'images/gallery/IMG_4983.JPG', altText: 'Syed Productions shoot', hidden: true, sortOrder: 35 },
  { imageUrl: 'images/gallery/M4M05012.JPG', altText: 'Syed Productions shoot', hidden: true, sortOrder: 36 },
  { imageUrl: 'images/gallery/M4M05048.JPG', altText: 'Syed Productions shoot', hidden: true, sortOrder: 37 }
];

const teamMembers = [
  { name: 'Burhan Uddin Shah', role: 'CEO & Founder', bio: 'Visionary leader driving Syed Productions forward with creative excellence and strategic vision. The driving force behind every project.', image: 'images/team/Burhan.png', facebook: '#', instagram: '#', sortOrder: 1 },
  { name: 'Tehseen Abbas', role: 'Head of Production', bio: 'Manages end-to-end production workflows ensuring every project meets the highest standards of quality and creativity.', image: 'images/team/tehseen.png', facebook: '#', instagram: '#', sortOrder: 2 },
  { name: 'Tashfeen Bin Riaz', role: 'Photographer', bio: 'Talented photographer with a keen eye for capturing stunning visuals and unforgettable moments.', image: 'images/team/Tashfeen Bin Riaz.png', facebook: '#', instagram: '#', sortOrder: 3 },
  { name: 'Hussain', role: 'Media Head', bio: 'Leads media strategy and content creation, delivering impactful visual stories across all platforms.', image: 'images/team/Hussain.jpg', facebook: '#', instagram: '#', sortOrder: 4 }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      Destination.deleteMany({}),
      Review.deleteMany({}),
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
