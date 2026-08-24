import mongoose from 'mongoose';
import Song from '../models/Song.js';

async function resetLyrics() {
  const mongoUri = process.env.MONGO_URI;
  await mongoose.connect(mongoUri);
  const res = await Song.updateMany({}, { $set: { lyricsData: [] } });
  console.log('Reset placeholder lyrics on', res.modifiedCount, 'songs in MongoDB');
  process.exit(0);
}

resetLyrics();
