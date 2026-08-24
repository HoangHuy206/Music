import mongoose from 'mongoose';
import Song from '../models/Song.js';
import User from '../models/User.js';

async function cleanAndSeed() {
  try {
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Atlas');

    // 1. Clear out demo and duplicate entries
    await Song.deleteMany({
      title: {
        $in: [
          'Nơi Này Có Anh',
          'Golden Sunset Horizons',
          'Sao Thay Đổi Mi Em Buồn',
          'Xao Xuyến (HZ Remix)',
          'Thương Thì Thôi (MK Remix)',
          'Em Ơi Lên Phố (Lofi Chill)',
          'Chân Tình (Lemon 2k Remix)',
          'Thủ Đô Cypher (Flow Real)',
          'Có Khi Nào Rời Xa (Deep Vocal)',
          'Hẹn Hò Nhưng Không Yêu',
          'Chỉ Còn Những Mùa Nhớ',
          /^download/i
        ]
      }
    });

    // 2. Exact distinct tracks matching the user's SoundCloud library with authentic artwork
    const distinctTracks = [
      {
        title: 'sao thay doi mi em buon',
        artist: 'ngong, kezjuein, dgkhoi',
        genre: 'Chill / Lofi (Bản Gốc)',
        isRemix: false,
        audioUrl: '/uploads/audioFile-1787198490544-828356209.mp3',
        coverImage: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&auto=format&fit=crop&q=80',
        duration: 215,
      },
      {
        title: '50 Năm Về Sau (Ctrl Remix)',
        artist: 'Hoàng tử quạ, Why, Anh Vũ',
        genre: 'Remix / Vinahouse',
        isRemix: true,
        audioUrl: '/uploads/audioFile-1787198353978-104278531.mp3',
        coverImage: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=600&auto=format&fit=crop&q=80',
        duration: 240,
      },
      {
        title: '(1/3) HEN HO NHUNG KHONG YEU',
        artist: '*dvs, Lê An Thái, QThang',
        genre: 'Nhạc Trẻ / Pop (Bản Gốc)',
        isRemix: false,
        audioUrl: '/uploads/audioFile-1787207474735-73897040.mp3',
        coverImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
        duration: 198,
      },
      {
        title: 'XAO XUYEN - HZ REMIX',
        artist: 'Đặng Hoàng Anh, ViTH',
        genre: 'Remix / Vinahouse',
        isRemix: true,
        audioUrl: '/uploads/audioFile-1787207027855-695460526.mp3',
        coverImage: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&auto=format&fit=crop&q=80',
        duration: 228,
      },
      {
        title: 'Em Oi Len Pho (Lofi Vibe)',
        artist: 'minhnhat, lofi sound',
        genre: 'Chill / Lofi (Bản Gốc)',
        isRemix: false,
        audioUrl: '/uploads/audioFile-1787207808556-55965816.mp3',
        coverImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
        duration: 185,
      },
      {
        title: 'Em Chẳng Sao Mà Remix',
        artist: 'Duy Hiếu Official, Teejay x Duy Hiếu',
        genre: 'Remix / Vinahouse',
        isRemix: true,
        audioUrl: '/uploads/audioFile-1787209117271-515290790.mp3',
        coverImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
        duration: 250,
      },
      {
        title: 'Thương Thì Thôi MK Remix',
        artist: 'Vu Minh Phong, Mk prdc',
        genre: 'Remix / Vinahouse',
        isRemix: true,
        audioUrl: '/uploads/audioFile-1787209117271-515290790.mp3',
        coverImage: 'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=600&auto=format&fit=crop&q=80',
        duration: 250,
      },
      {
        title: 'Chân Tình Remix Lemon 2k',
        artist: 'Iris Music, Như Chưa Từng Có',
        genre: 'EDM / Dance',
        isRemix: true,
        audioUrl: '/uploads/audioFile-1787209362089-450078555.mp3',
        coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
        duration: 232,
      },
      {
        title: 'Có Khi Nào Rời Xa (Remix 2020)',
        artist: 'Mr. Sang, Dương Edward ft Vũ Kem',
        genre: 'Remix / Vinahouse',
        isRemix: true,
        audioUrl: '/uploads/audioFile-1787209709256-555615317.mp3',
        coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
        duration: 260,
      },
      {
        title: 'Chỉ Còn Những Mùa Nhớ (Tùng Nguyen Remix)',
        artist: 'neva, Neva Fix',
        genre: 'Remix / Vinahouse',
        isRemix: true,
        audioUrl: '/uploads/audioFile-1787210173041-636192450.mp3',
        coverImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80',
        duration: 245,
      },
      {
        title: 'Kiểu Gì Chẳng Mất (Huy PT x NVT Remix)',
        artist: 'Firistist',
        genre: 'Remix / Vinahouse',
        isRemix: true,
        audioUrl: '/uploads/audioFile-1787210856966-68793738.mp3',
        coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
        duration: 235,
      },
      {
        title: 'Thủ Đô Cypher',
        artist: 'Quang Tùng, My Neighbor',
        genre: 'Rap / Hiphop (Bản Gốc)',
        isRemix: false,
        audioUrl: '/uploads/audioFile-1787213720577-398225101.mp3',
        coverImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
        duration: 210,
      }
    ];

    for (const s of distinctTracks) {
      const existing = await Song.findOne({ title: s.title });
      if (!existing) {
        await Song.create({
          ...s,
          userId: '6a8669e46a78280f55cfeb69',
          lyricsData: [
            { time: 0, text: 'Giai điệu mở đầu...' },
            { time: 5, text: s.title },
            { time: 10, text: 'Nghệ sĩ: ' + s.artist },
          ]
        });
      } else {
        existing.artist = s.artist;
        existing.coverImage = s.coverImage;
        existing.audioUrl = s.audioUrl;
        existing.genre = s.genre;
        existing.isRemix = s.isRemix;
        await existing.save();
      }
    }

    // Clean up listenHistory of demo tracks for all users
    const users = await User.find();
    for (const u of users) {
      if (Array.isArray(u.listenHistory)) {
        u.listenHistory = u.listenHistory.filter(h => h.title !== 'Nơi Này Có Anh' && h.title !== 'Golden Sunset Horizons');
        await u.save();
      }
    }

    const all = await Song.find().select('title artist coverImage');
    console.log('FINAL REAL SOUNDCLOUD SONGS (' + all.length + '):');
    all.forEach(s => console.log(`- ${s.title} (${s.artist})`));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

cleanAndSeed();
