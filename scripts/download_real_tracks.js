import fs from 'fs';
import path from 'path';
import axios from 'axios';
import mongoose from 'mongoose';
import Song from '../models/Song.js';

const scClientId = 'QUUtl3ZAhuSPgQmsJHdB7KXkYMKsPLXk';

const queries = [
  {
    key: '50namvesau',
    query: '50 Năm Về Sau Hoàng tử quạ Ctri Remix',
    title: '50 Năm Về Sau (Ctrl Remix)',
    artist: 'Hoàng tử quạ, Why, Anh Vũ',
    genre: 'Remix / Vinahouse',
    isRemix: true,
  },
  {
    key: 'saothaydoimiembuon',
    query: 'sao thay doi mi em buon ngong',
    title: 'sao thay doi mi em buon',
    artist: 'ngong, kezjuein, dgkhoi',
    genre: 'Chill / Lofi (Bản Gốc)',
    isRemix: false,
  },
  {
    key: 'henhonhungkhongyeu',
    query: 'HEN HO NHUNG KHONG YEU dvs Le An Thai',
    title: '(1/3) HEN HO NHUNG KHONG YEU',
    artist: '*dvs, Lê An Thái, QThang',
    genre: 'Nhạc Trẻ / Pop (Bản Gốc)',
    isRemix: false,
  },
  {
    key: 'xaoxuyen',
    query: 'XAO XUYEN HZ REMIX Dang Hoang Anh',
    title: 'XAO XUYEN - HZ REMIX',
    artist: 'Đặng Hoàng Anh, ViTH',
    genre: 'Remix / Vinahouse',
    isRemix: true,
  },
  {
    key: 'emoilenpho',
    query: 'Em Oi Len Pho minhnhat',
    title: 'Em Oi Len Pho (Lofi Vibe)',
    artist: 'minhnhat, lofi sound',
    genre: 'Chill / Lofi (Bản Gốc)',
    isRemix: false,
  },
  {
    key: 'emchangsao',
    query: 'Em Chang Sao Ma Duy Hieu Teejay',
    title: 'Em Chẳng Sao Mà Remix',
    artist: 'Duy Hiếu Official, Teejay x Duy Hiếu',
    genre: 'Remix / Vinahouse',
    isRemix: true,
  },
  {
    key: 'thuongthithoi',
    query: 'Thuong Thi Thoi MK Remix Vu Minh Phong',
    title: 'Thương Thì Thôi MK Remix',
    artist: 'Vu Minh Phong, Mk prdc',
    genre: 'Remix / Vinahouse',
    isRemix: true,
  },
  {
    key: 'chantinh',
    query: 'Chan Tinh Remix Lemon 2k Iris Music',
    title: 'Chân Tình Remix Lemon 2k',
    artist: 'Iris Music, Như Chưa Từng Có',
    genre: 'EDM / Dance',
    isRemix: true,
  },
  {
    key: 'cokhinoroi',
    query: 'Co Khi Nao Roi Xa remix Duong Edward',
    title: 'Có Khi Nào Rời Xa (Remix 2020)',
    artist: 'Mr. Sang, Dương Edward ft Vũ Kem',
    genre: 'Remix / Vinahouse',
    isRemix: true,
  },
  {
    key: 'chiconnhungmuanho',
    query: 'Chi Con Nhung Mua Nho Tung Nguyen Remix',
    title: 'Chỉ Còn Những Mùa Nhớ (Tùng Nguyen Remix)',
    artist: 'neva, Neva Fix',
    genre: 'Remix / Vinahouse',
    isRemix: true,
  },
  {
    key: 'kieugichangmat',
    query: 'Kieu Gi Chang Mat Firistist',
    title: 'Kiểu Gì Chẳng Mất (Huy PT x NVT Remix)',
    artist: 'Firistist',
    genre: 'Remix / Vinahouse',
    isRemix: true,
  },
  {
    key: 'thudocypher',
    query: 'Thu Do Cypher Quang Tung',
    title: 'Thủ Đô Cypher',
    artist: 'Quang Tùng, My Neighbor',
    genre: 'Rap / Hiphop (Bản Gốc)',
    isRemix: false,
  },
];

async function run() {
  const mongoUri = process.env.MONGO_URI;
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB Atlas');

  const uploadsDir = path.resolve('uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  for (const item of queries) {
    console.log(`\nSearching for: "${item.query}"...`);
    try {
      const res = await axios.get('https://api-v2.soundcloud.com/search/tracks', {
        params: { q: item.query, client_id: scClientId, limit: 5 }
      });
      const collection = res.data.collection || [];
      if (collection.length === 0) {
        console.log(`No track found for ${item.query}`);
        continue;
      }

      const track = collection[0];
      const progressive = track.media?.transcodings?.find(tc => tc.format?.protocol === 'progressive');
      if (!progressive) {
        console.log(`No progressive mp3 found for ${item.title}`);
        continue;
      }

      const streamRes = await axios.get(progressive.url, { params: { client_id: scClientId } });
      const streamUrl = streamRes.data?.url;
      if (!streamUrl) {
        console.log(`Could not get stream URL for ${item.title}`);
        continue;
      }

      const outFileName = `sc_${item.key}.mp3`;
      const outFilePath = path.join(uploadsDir, outFileName);

      console.log(`Downloading audio to ${outFileName}...`);
      const audioDown = await axios.get(streamUrl, { responseType: 'stream' });
      const writer = fs.createWriteStream(outFilePath);
      audioDown.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      console.log(`Saved audio: ${outFileName} (${fs.statSync(outFilePath).size} bytes)`);

      // Artwork
      let artworkUrl = track.artwork_url ? track.artwork_url.replace('large', 't500x500') : (track.user?.avatar_url || '');

      // Upsert in database
      const audioUrl = `/uploads/${outFileName}`;
      const existing = await Song.findOne({ title: item.title });
      if (existing) {
        existing.audioUrl = audioUrl;
        existing.artist = item.artist;
        if (artworkUrl) existing.coverImage = artworkUrl;
        existing.genre = item.genre;
        existing.isRemix = item.isRemix;
        existing.duration = Math.round((track.duration || 200000) / 1000);
        await existing.save();
        console.log(`Updated DB for: ${item.title}`);
      } else {
        await Song.create({
          title: item.title,
          artist: item.artist,
          genre: item.genre,
          isRemix: item.isRemix,
          audioUrl,
          coverImage: artworkUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600',
          duration: Math.round((track.duration || 200000) / 1000),
          userId: '6a8669e46a78280f55cfeb69',
          lyricsData: [
            { time: 0, text: 'Giai điệu mở đầu...' },
            { time: 5, text: item.title },
            { time: 10, text: item.artist },
          ]
        });
        console.log(`Created DB for: ${item.title}`);
      }
    } catch (err) {
      console.error(`Error processing ${item.title}:`, err.message);
    }
  }

  const all = await Song.find().select('title artist audioUrl coverImage duration');
  console.log('\n=======================================');
  console.log(`DONE! TOTAL UNIQUE SONGS IN DB: ${all.length}`);
  all.forEach(s => console.log(`- ${s.title} -> ${s.audioUrl} (${s.duration}s)`));
  process.exit(0);
}

run();
