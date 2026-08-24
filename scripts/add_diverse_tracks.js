import fs from 'fs';
import path from 'path';
import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const scClientId = 'QUUtl3ZAhuSPgQmsJHdB7KXkYMKsPLXk';
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const newTracks = [
  {
    key: 'buocquanhau',
    query: 'Buoc Qua Nhau Vu Live Session Cat Linh',
    title: 'Bước Qua Nhau (Acoustic Ballad)',
    artist: 'Vũ.',
    genre: 'Ballad / Pop (Bản Gốc)',
    isRemix: false,
    coverFallback: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
  },
  {
    key: 'catdoinoisau',
    query: 'Cat Doi Noi Sau Tang Duy Tan',
    title: 'Cắt Đôi Nỗi Sầu (Bản Gốc)',
    artist: 'Tăng Duy Tân, Drum7',
    genre: 'Nhạc Trẻ / Pop (Bản Gốc)',
    isRemix: false,
    coverFallback: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
  },
  {
    key: 'chuyendoita',
    query: 'Chuyen Doi Ta Emcee L Ft Muoii lofi ver',
    title: 'Chuyện Đôi Ta (Lofi Chill)',
    artist: 'Emcee L (Da LAB) ft. Muộii',
    genre: 'Chill / Lofi (Bản Gốc)',
    isRemix: false,
    coverFallback: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
  },
  {
    key: 'daumua',
    query: 'Dau Mua Trung Quan Idol',
    title: 'Dấu Mưa (Bản Gốc)',
    artist: 'Trung Quân Idol',
    genre: 'Ballad / Pop (Bản Gốc)',
    isRemix: false,
    coverFallback: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
  },
  {
    key: 'sauloitukhuoc',
    query: 'Sau loi tu khuoc Phan Manh Quynh live',
    title: 'Sau Lời Từ Khước (Mai OST)',
    artist: 'Phan Mạnh Quỳnh',
    genre: 'Ballad / Pop (Bản Gốc)',
    isRemix: false,
    coverFallback: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80',
  },
  {
    key: 'chungtacuatuonglai',
    query: 'Chung Ta Cua Tuong Lai Son Tung MTP',
    title: 'Chúng Ta Của Tương Lai (Bản Gốc)',
    artist: 'Sơn Tùng M-TP',
    genre: 'Nhạc Trẻ / Pop (Bản Gốc)',
    isRemix: false,
    coverFallback: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop&q=80',
  },
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const Song = (await import('../models/Song.js')).default;
  const User = (await import('../models/User.js')).default;
  const adminUser = await User.findOne();

  for (const item of newTracks) {
    try {
      console.log(`\nSearching for: ${item.query}`);
      const searchRes = await axios.get('https://api-v2.soundcloud.com/search/tracks', {
        params: { q: item.query, client_id: scClientId, limit: 3 },
      });

      const track = searchRes.data.collection[0];
      if (!track) {
        console.warn(`No result for ${item.query}`);
        continue;
      }

      console.log(`Found track: "${track.title}" by ${track.user?.username}`);
      const transcodings = track.media?.transcodings || [];
      const prog = transcodings.find((t) => t.format?.protocol === 'progressive') || transcodings[0];

      if (!prog) {
        console.warn(`No media transcodings for ${item.query}`);
        continue;
      }

      const streamInfo = await axios.get(prog.url, { params: { client_id: scClientId } });
      const audioUrl = streamInfo.data.url;

      const fileName = `sc_${item.key}.mp3`;
      const filePath = path.join(uploadsDir, fileName);

      console.log(`Downloading audio to ${filePath}...`);
      const audioRes = await axios.get(audioUrl, { responseType: 'arraybuffer' });
      fs.writeFileSync(filePath, audioRes.data);
      console.log(`Downloaded ${audioRes.data.length} bytes`);

      const coverImg = track.artwork_url ? track.artwork_url.replace('-large', '-t500x500') : (track.user?.avatar_url ? track.user.avatar_url.replace('-large', '-t500x500') : item.coverFallback);

      // Check if song already exists
      let existing = await Song.findOne({ title: item.title });
      if (existing) {
        existing.artist = item.artist;
        existing.coverImage = coverImg;
        existing.audioUrl = `/uploads/${fileName}`;
        existing.duration = Math.round((track.duration || 240000) / 1000);
        existing.genre = item.genre;
        existing.isRemix = item.isRemix;
        await existing.save();
        console.log(`Updated song in DB: ${item.title}`);
      } else {
        await Song.create({
          title: item.title,
          artist: item.artist,
          coverImage: coverImg,
          audioUrl: `/uploads/${fileName}`,
          duration: Math.round((track.duration || 240000) / 1000),
          genre: item.genre,
          isRemix: item.isRemix,
          userId: adminUser?._id,
          isPublic: true,
          lyricsData: [
            { time: 10, text: `Giai điệu ${item.title}` },
            { time: 25, text: `Trình bày: ${item.artist}` },
            { time: 45, text: `Thể loại: ${item.genre}` },
          ],
        });
        console.log(`Created new song in DB: ${item.title}`);
      }
    } catch (err) {
      console.error(`Error processing ${item.title}:`, err.message);
    }
  }

  // Update existing 12 songs to make sure their genre fields are explicitly set
  const allSongs = await Song.find();
  for (const s of allSongs) {
    if (!s.genre || s.genre === 'undefined') {
      const lower = (s.title + ' ' + (s.artist || '')).toLowerCase();
      if (lower.includes('remix') || lower.includes('vinahouse') || lower.includes('lemon 2k')) {
        s.genre = 'Remix / Vinahouse';
        s.isRemix = true;
      } else if (lower.includes('lofi') || lower.includes('chill') || lower.includes('ngong')) {
        s.genre = 'Chill / Lofi (Bản Gốc)';
        s.isRemix = false;
      } else if (lower.includes('cypher') || lower.includes('rap') || lower.includes('hiphop')) {
        s.genre = 'Rap / Hiphop (Bản Gốc)';
        s.isRemix = false;
      } else {
        s.genre = 'Nhạc Trẻ / Pop (Bản Gốc)';
        s.isRemix = false;
      }
      await s.save();
    }
  }

  console.log('All diverse tracks populated successfully!');
  process.exit(0);
}

run();
