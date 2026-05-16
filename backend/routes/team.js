const router = require('express').Router();
const TeamMember = require('../models/TeamMember');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const teamLocalImageMap = {
  'burhan uddin shah': 'images/team/Burhan.png',
  'tehseen abbas': 'images/team/tehseen.png',
  'tashfeen bin riaz': 'images/team/Tashfeen Bin Riaz.png',
  'hussain': 'images/team/Hussain.jpg'
};

function normalizeTeamMember(member) {
  if (!member) return member;
  const normalizedName = String(member.name || '').trim().toLowerCase();
  const localImage = teamLocalImageMap[normalizedName];
  if (localImage && (typeof member.image !== 'string' || member.image.includes('images.unsplash.com') || member.image.startsWith('http'))) {
    return { ...member, image: localImage };
  }
  return member;
}

// Ensure team uploads directory exists and handle serverless (Vercel) environments
const teamUploadDir = path.join(__dirname, '../../uploads/team');
let uploadsEnabled = true;
try {
  if (!fs.existsSync(teamUploadDir)) {
    fs.mkdirSync(teamUploadDir, { recursive: true });
  }
  console.log('Team upload directory ready:', teamUploadDir);
} catch (err) {
  uploadsEnabled = false;
  console.error('Uploads disabled: cannot create upload directory:', err.message);
}

// Multer config for team image uploads (only enabled when directory is writable)
let upload;
if (uploadsEnabled) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, teamUploadDir),
    filename: (req, file, cb) => {
      const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E6) + path.extname(file.originalname);
      cb(null, uniqueName);
    }
  });

  upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter: (req, file, cb) => {
      const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic'];
      if (allowed.includes(file.mimetype) || file.originalname.match(/\.(jpg|jpeg|png|gif|webp|heic)$/i)) {
        cb(null, true);
      } else {
        cb(new Error('Only image files (JPG, PNG, GIF, WEBP, HEIC) are allowed'));
      }
    }
  });
} else {
  // Provide a compatible interface so calls to upload.single() don't crash
  upload = {
    single: () => (req, res) => {
      return res.status(503).json({ message: 'File uploads are disabled on this deployment. Use local development or configure external storage (S3, Cloud Storage).' });
    }
  };
}

// POST /api/team/upload — upload team member photo
router.post('/upload', auth, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'Upload failed' });
    }
    if (!req.file) return res.status(400).json({ message: 'No image file uploaded' });
    const imageUrl = 'uploads/team/' + req.file.filename;
    res.json({ imageUrl });
  });
});

// GET /api/team (public)
router.get('/', async (req, res) => {
  try {
    const teamMembers = await TeamMember.find().sort({ sortOrder: 1 }).lean();
    const normalised = await Promise.all(teamMembers.map(async member => {
      const normalized = normalizeTeamMember(member);
      if (normalized.image !== member.image && member._id) {
        await TeamMember.updateOne({ _id: member._id }, { $set: { image: normalized.image } });
      }
      return normalized;
    }));
    res.json(normalised);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/team (auth)
router.post('/', auth, async (req, res) => {
  try {
    const member = await TeamMember.create(req.body);
    res.status(201).json(member);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/team/:id (auth)
router.put('/:id', auth, async (req, res) => {
  try {
    const member = await TeamMember.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!member) return res.status(404).json({ message: 'Team member not found' });
    res.json(member);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/team/:id (auth)
router.delete('/:id', auth, async (req, res) => {
  try {
    const member = await TeamMember.findByIdAndDelete(req.params.id);
    if (!member) return res.status(404).json({ message: 'Team member not found' });
    res.json({ message: 'Team member deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
