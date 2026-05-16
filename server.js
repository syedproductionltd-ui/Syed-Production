require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./backend/config/db');

const localTeamImageMap = {
  'burhan uddin shah': 'images/team/Burhan.png',
  'tehseen abbas': 'images/team/tehseen.png',
  'tashfeen bin riaz': 'images/team/Tashfeen Bin Riaz.png',
  'hussain': 'images/team/Hussain.jpg'
};

function normalizeTeamMember(member) {
  if (!member) return member;
  const teamMember = typeof member.toObject === 'function' ? member.toObject() : { ...member };
  const normalizedName = String(teamMember.name || '').trim().toLowerCase();
  const localImage = localTeamImageMap[normalizedName];
  const shouldReplaceRemoteImage = typeof teamMember.image === 'string' && teamMember.image.includes('images.unsplash.com');
  if (localImage && (shouldReplaceRemoteImage || !teamMember.image || teamMember.image.startsWith('http'))) {
    teamMember.image = localImage;
  }
  return teamMember;
}

const app = express();

let localFallbackData = null;
try {
  localFallbackData = require(path.join(__dirname, 'data', 'local-data.json'));
  console.log('Loaded local fallback data successfully');
} catch (err) {
  console.error('Failed to load local fallback data at startup:', err.message);
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// SEO & Security Headers Middleware
app.use((req, res, next) => {
  // Cache headers for static content
  if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|webp|svg|woff|woff2|ttf|eot)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (req.path.match(/\.(html)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
  }
  
  // SEO Headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
});
app.use(express.static(path.join(__dirname)));

// Team images - serve with optimized headers
app.use('/images/team', (req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.setHeader('Content-Type', 'image/png');
  next();
}, express.static(path.join(__dirname, 'images', 'team')));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve admin panel
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// Check if MongoDB is available
let mongoAvailable = false;
connectDB().then(() => {
  mongoAvailable = true;
  console.log('MongoDB connected');
}).catch(() => {
  console.log('MongoDB unavailable — using local data');
});

// Combined public data endpoint — single request instead of 6 + site settings
app.get('/api/public-data', async (req, res) => {
  try {
    if (mongoAvailable) {
      const SiteSettings = require('./backend/models/SiteSettings');
      const [destinations, reviews, videos, gallery, team, settings] = await Promise.all([
        require('./backend/models/Destination').find().sort({ id: 1 }),
        require('./backend/models/Review').find({ $or: [{ status: 'approved' }, { status: { $exists: false } }] }).sort({ createdAt: -1 }),
        require('./backend/models/Video').find().sort({ sortOrder: 1 }),
        require('./backend/models/GalleryImage').find().sort({ sortOrder: 1 }),
        require('./backend/models/TeamMember').find().sort({ sortOrder: 1 }).lean(),
        SiteSettings.getSettings()
      ]);
      const normalizedTeam = team.map(normalizeTeamMember);
      return res.json({ destinations, reviews, videos, gallery, team: normalizedTeam, settings });
    }
  } catch (err) {
    console.warn('MongoDB query failed, falling back to local data:', err.message);
  }

  // Fallback to local JSON data
  if (localFallbackData) {
    return res.json({
      destinations: localFallbackData.destinations || [],
      reviews: localFallbackData.reviews || [],
      videos: localFallbackData.videos || [],
      gallery: localFallbackData.gallery || [],
      team: localFallbackData.team || [],
      settings: localFallbackData.settings || {}
    });
  }

  console.error('Local fallback data is not available');
  res.status(500).json({ error: 'Failed to load data', message: 'Local fallback data is missing' });
});

// API Routes
app.use('/api/users', require('./backend/routes/userAuth'));
app.use('/api/auth', require('./backend/routes/auth'));
app.use('/api/destinations', require('./backend/routes/destinations'));
app.use('/api/reviews', require('./backend/routes/reviews'));
app.use('/api/bookings', require('./backend/routes/bookings'));
app.use('/api/subscribers', require('./backend/routes/subscribers'));
app.use('/api/videos', require('./backend/routes/videos'));
app.use('/api/gallery', require('./backend/routes/gallery'));
app.use('/api/team', require('./backend/routes/team'));

// Chat AI route
app.use('/api/chat', require('./backend/routes/chat'));

// Site settings routes
app.use('/api/site-settings', require('./backend/routes/siteSettings'));

app.get('/api/debug-fallback', (req, res) => {
  if (localFallbackData) {
    return res.json({ status: 'ok', hasFallbackData: true, items: {
      destinations: localFallbackData.destinations?.length,
      reviews: localFallbackData.reviews?.length,
      videos: localFallbackData.videos?.length,
      gallery: localFallbackData.gallery?.length,
      team: localFallbackData.team?.length
    }});
  }
  res.status(500).json({ status: 'error', message: 'Local fallback data not loaded' });
});

const PORT = process.env.PORT || 3000;

// Start server only during local development or node hosting.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel serverless
module.exports = app;
