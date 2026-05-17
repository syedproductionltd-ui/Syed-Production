require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Video = require('../models/Video');

const videosDir = path.join(__dirname, '../../videos');

function cleanTitle(filename) {
  const title = filename.replace(/\.[^/.]+$/, '')
    .replace(/_+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s*[\-–—]\s*/g, ' ')
    .replace(/\s*\.{2,}\s*/g, ' ')
    .trim();
  return title;
}

function buildTag(title) {
  const lower = title.toLowerCase();
  if (/wedding|story|shahrukh|sehrish|client/i.test(lower)) return 'Client Story';
  if (/commercial|mark x|shoot|team|brand/i.test(lower)) return 'Commercial';
  if (/attabad|gilgit|hunza|naltar|travel|lake|snow/i.test(lower)) return 'Travel';
  if (/women|empowering/i.test(lower)) return 'Story';
  return 'Cinematic';
}

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('Missing MONGODB_URI in environment.');
    process.exit(1);
  }

  if (!fs.existsSync(videosDir)) {
    console.error('Videos directory not found:', videosDir);
    process.exit(1);
  }

  const files = fs.readdirSync(videosDir)
    .filter((name) => /\.(mp4|mov|avi|mkv|webm)$/i.test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

  if (!files.length) {
    console.error('No video files found in', videosDir);
    process.exit(1);
  }

  const videos = files.map((filename, index) => {
    const title = cleanTitle(filename);
    return {
      title,
      description: `Watch ${title} from Syed Productions portfolio.`,
      tag: buildTag(title),
      videoUrl: `videos/${filename}`,
      sortOrder: index + 1
    };
  });

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  await Video.deleteMany({});
  console.log('Deleted existing video records');

  await Video.insertMany(videos);
  console.log(`Added ${videos.length} videos from local videos folder`);

  mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
