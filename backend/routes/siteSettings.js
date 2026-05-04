const router = require('express').Router();
const SiteSettings = require('../models/SiteSettings');
const auth = require('../middleware/auth');

// GET /api/site-settings — Public endpoint (no auth)
router.get('/public', async (req, res) => {
  try {
    const settings = await SiteSettings.getSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load settings' });
  }
});

// GET /api/site-settings — Admin-protected (for admin panel)
router.get('/', auth, async (req, res) => {
  try {
    const settings = await SiteSettings.getSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load settings' });
  }
});

// PUT /api/site-settings — Admin-protected update
router.put('/', auth, async (req, res) => {
  try {
    const settings = await SiteSettings.updateSettings(req.body);
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update settings' });
  }
});

module.exports = router;
