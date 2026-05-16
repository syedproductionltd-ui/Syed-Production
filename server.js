require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./backend/config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Serve static files — public site
app.use(express.static(path.join(__dirname)));

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
        require('./backend/models/TeamMember').find().sort({ sortOrder: 1 }),
        SiteSettings.getSettings()
      ]);
      return res.json({ destinations, reviews, videos, gallery, team, settings });
    }
  } catch (err) {
    console.warn('MongoDB query failed, falling back to local data:', err.message);
  }

  // Fallback to local JSON data
  try {
    const localData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'local-data.json'), 'utf8'));
    res.json({
      destinations: localData.destinations,
      reviews: localData.reviews,
      videos: localData.videos,
      gallery: localData.gallery,
      team: localData.team,
      settings: localData.settings
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load data', message: err.message });
  }
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

const PORT = process.env.PORT || 3000;

// Start server (needed for Render and local dev)
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export for Vercel serverless
module.exports = app;
