import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const Song = (await import('../models/Song.js')).default;

  const originalArtworks = {
    'Chúng Ta Của Tương Lai (Bản Gốc)': 'https://i1.sndcdn.com/artworks-p2KLY0hEDEL3VszR-jAfXXQ-t500x500.jpg',
    'Cắt Đôi Nỗi Sầu (Bản Gốc)': 'https://i1.sndcdn.com/artworks-ij1m8XDcUNhi-0-t500x500.jpg',
    'Bước Qua Nhau (Acoustic Ballad)': 'https://i1.sndcdn.com/artworks-RQLugOELnFx12PCA-Zo3yNA-t500x500.jpg',
    'Sau Lời Từ Khước (Mai OST)': 'https://i1.sndcdn.com/artworks-Ba2UL6kdDDeKJbDN-OtjU6Q-t500x500.jpg',
    'Dấu Mưa (Bản Gốc)': 'https://i1.sndcdn.com/artworks-vNWza9QmhFSGLMLe-eLjhdA-t500x500.jpg',
    'Chuyện Đôi Ta (Lofi Chill)': 'https://i1.sndcdn.com/artworks-0ljHO6lNVPp3dJPy-CTOtGw-t500x500.jpg',
    'Thủ Đô Cypher': 'https://i1.sndcdn.com/artworks-boUbSWZLWhl68BIU-3IYi7w-t500x500.jpg',
    '50 Năm Về Sau (Ctrl Remix)': 'https://i1.sndcdn.com/artworks-SrJByJnuAhSxp8EX-i1SFDw-t500x500.jpg',
    'sao thay doi mi em buon': 'https://i1.sndcdn.com/artworks-8JyIJUskqOMahV8I-cw4KUA-t500x500.jpg',
    '(1/3) HEN HO NHUNG KHONG YEU': 'https://i1.sndcdn.com/artworks-kItbng1pUE9ZVYRk-LzXDNw-t500x500.jpg',
    'XAO XUYEN - HZ REMIX': 'https://i1.sndcdn.com/artworks-joVTDz7LFaBGZYIr-4M3gEg-t500x500.jpg',
    'Em Oi Len Pho (Lofi Vibe)': 'https://i1.sndcdn.com/artworks-gvM67bwqb8e5fxtf-P4i5xw-t500x500.jpg',
    'Em Chẳng Sao Mà Remix': 'https://i1.sndcdn.com/artworks-npG6sKcoAb3s5ZaR-nl6S3g-t500x500.jpg',
    'Thương Thì Thôi MK Remix': 'https://i1.sndcdn.com/artworks-7xm4yS43FW04mz1b-7vbMlA-t500x500.jpg',
    'Chân Tình Remix Lemon 2k': 'https://i1.sndcdn.com/artworks-1D1SGzVB7f1vTOry-iyJgEw-t500x500.jpg',
    'Có Khi Nào Rời Xa (Remix 2020)': 'https://i1.sndcdn.com/artworks-Bfdlyg4S9Ts7jpVv-VnKVKA-t500x500.jpg',
    'Chỉ Còn Những Mùa Nhớ (Tùng Nguyen Remix)': 'https://i1.sndcdn.com/artworks-u20pEPgWcGer4MxK-7NyyHQ-t500x500.jpg',
    'Kiểu Gì Chẳng Mất (Huy PT x NVT Remix)': 'https://i1.sndcdn.com/artworks-lTI3p7dmcPXl670t-e9xA9g-t500x500.jpg',
  };

  for (const [title, cover] of Object.entries(originalArtworks)) {
    await Song.updateOne({ title }, { $set: { coverImage: cover } });
  }

  console.log('Updated 18 songs with 100% original artworks:');
  const all = await Song.find();
  all.forEach((s, idx) => console.log(idx + 1, s.title, '=>', s.coverImage));
  process.exit(0);
}

run();
