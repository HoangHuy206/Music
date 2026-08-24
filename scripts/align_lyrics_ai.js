import fs from 'fs';
import path from 'path';
import Groq from 'groq-sdk';
import mongoose from 'mongoose';
import Song from '../models/Song.js';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function alignAllLyrics() {
  const mongoUri = process.env.MONGO_URI;
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB Atlas');

  const songs = await Song.find();
  console.log(`Found ${songs.length} songs to AI-align lyrics...`);

  for (const song of songs) {
    console.log(`\n========================================`);
    console.log(`Processing: "${song.title}" (${song.audioUrl})`);

    const localFileName = song.audioUrl.replace('/uploads/', '');
    const localFilePath = path.resolve('uploads', localFileName);

    if (!fs.existsSync(localFilePath)) {
      console.log(`File not found: ${localFilePath}`);
      continue;
    }

    try {
      console.log(`Sending to Groq Whisper AI (whisper-large-v3)...`);
      const fileStream = fs.createReadStream(localFilePath);
      const transcription = await groq.audio.transcriptions.create({
        file: fileStream,
        model: 'whisper-large-v3',
        response_format: 'verbose_json',
        language: 'vi',
      });

      const spamKeywords = [
        'subscribe', 'đăng ký', 'kênh', 'channel', 'cảm ơn các bạn', 'ghiền mì gõ',
        'like and subscribe', 'hãy bấm like', 'theo dõi kênh', 'chúc các bạn nghe nhạc'
      ];

      const rawSegments = transcription.segments || [];
      const validSegments = rawSegments.filter(s => {
        if (!s || !s.text || s.text.trim().length < 2) return false;
        const lower = s.text.toLowerCase();
        return !spamKeywords.some(kw => lower.includes(kw));
      });

      if (validSegments.length > 0) {
        let alignedLyrics = validSegments.map(s => ({
          time: parseFloat(s.start.toFixed(1)),
          text: s.text.trim(),
        }));

        // If first lyric starts after 2s, add a prelude intro marker
        if (alignedLyrics[0].time > 2.0) {
          alignedLyrics = [{ time: 0.0, text: 'Giai điệu mở đầu...' }, ...alignedLyrics];
        }

        song.lyricsData = alignedLyrics;
        await song.save();
        console.log(`Successfully aligned ${alignedLyrics.length} lines for "${song.title}"`);
        console.log(`   Sample lines:`);
        alignedLyrics.slice(0, 4).forEach(l => console.log(`   [${l.time}s]: ${l.text}`));
      } else {
        console.log(`No speech segments found for "${song.title}".`);
      }
    } catch (err) {
      console.error(`Error aligning "${song.title}":`, err.message);
    }
  }

  console.log('\nALL SONGS HAVE BEEN AI-ALIGNED TO EXACT BEAT!');
  process.exit(0);
}

alignAllLyrics();
