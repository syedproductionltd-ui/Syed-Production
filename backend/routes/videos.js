const router = require('express').Router();
const Video = require('../models/Video');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads/videos');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E6) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max
  fileFilter: (req, file, cb) => {
    const allowed = /mp4|mov|avi|mkv|webm/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype.split('/')[1]) || file.mimetype.startsWith('video/');
    if (ext || mime) return cb(null, true);
    cb(new Error('Only video files are allowed'));
  }
});

// POST /api/videos/upload (auth) — upload video file
router.post('/upload', auth, (req, res) => {
  upload.single('video')(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err.message);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Maximum 100MB allowed.' });
      }
      return res.status(400).json({ message: err.message || 'Upload failed' });
    }
    if (!req.file) return res.status(400).json({ message: 'No video file uploaded' });
    console.log('Video uploaded:', req.file.filename, '(' + (req.file.size / 1024 / 1024).toFixed(1) + 'MB)');
    const videoUrl = 'uploads/videos/' + req.file.filename;
    res.json({ videoUrl });
  });
});

// GET /api/videos (public)
router.get('/', async (req, res) => {
  try {
    const videos = await Video.find().sort({ sortOrder: 1 });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/videos (auth)
router.post('/', auth, async (req, res) => {
  try {
    const video = await Video.create(req.body);
    res.status(201).json(video);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/videos/:id (auth)
router.put('/:id', auth, async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!video) return res.status(404).json({ message: 'Video not found' });
    res.json(video);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/videos/:id (auth)
router.delete('/:id', auth, async (req, res) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });
    res.json({ message: 'Video deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
