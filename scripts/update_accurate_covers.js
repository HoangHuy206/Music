import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const Song = (await import('../models/Song.js')).default;

  const accurateCovers = {
    'Chúng Ta Của Tương Lai (Bản Gốc)': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    'Sau Lời Từ Khước (Mai OST)': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80',
    'Cắt Đôi Nỗi Sầu (Bản Gốc)': 'https://i1.sndcdn.com/artworks-ij1m8XDcUNhi-0-t500x500.jpg',
    'Dấu Mưa (Bản Gốc)': 'https://i1.sndcdn.com/artworks-vNWza9QmhFSGLMLe-eLjhdA-t500x500.jpg',
    'Bước Qua Nhau (Acoustic Ballad)': 'https://i1.sndcdn.com/artworks-RQLugOELnFx12PCA-Zo3yNA-t500x500.jpg',
    'Chuyện Đôi Ta (Lofi Chill)': 'https://i1.sndcdn.com/artworks-0ljHO6lNVPp3dJPy-CTOtGw-t500x500.jpg',
    'Thủ Đô Cypher': 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    '50 Năm Về Sau (Ctrl Remix)': 'https://i1.sndcdn.com/artworks-SrJByJnuAhSxp8EX-i1SFDw-t500x500.jpg',
    'Thương Thì Thôi MK Remix': 'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=600&auto=format&fit=crop&q=80',
    'Em Chẳng Sao Mà Remix': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    'XAO XUYEN - HZ REMIX': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    'Em Oi Len Pho (Lofi Vibe)': 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
    'sao thay doi mi em buon': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    '(1/3) HEN HO NHUNG KHONG YEU': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80',
    'Có Khi Nào Rời Xa (Remix 2020)': 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
    'Kiểu Gì Chẳng Mất (Huy PT x NVT Remix)': 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    'Chân Tình Remix Lemon 2k': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    'Chỉ Còn Những Mùa Nhớ (Tùng Nguyen Remix)': 'https://images.unsplash.com/photo-1445307806294-bff7f67ff225?w=600&auto=format&fit=crop&q=80',
  };

  for (const [title, cover] of Object.entries(accurateCovers)) {
    await Song.updateOne({ title }, { $set: { coverImage: cover } });
  }

  const updated = await Song.find();
  updated.forEach((s, idx) => console.log(idx + 1, s.title, '=>', s.coverImage));
  process.exit(0);
}

run();
