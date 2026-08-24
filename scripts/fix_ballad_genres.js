import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const Song = (await import('../models/Song.js')).default;
  const balladTitles = ['Bước Qua Nhau (Acoustic Ballad)', 'Dấu Mưa (Bản Gốc)', 'Sau Lời Từ Khước (Mai OST)'];
  for (const t of balladTitles) {
    await Song.updateOne({ title: t }, { $set: { genre: 'Ballad / Pop (Bản Gốc)' } });
  }

  const all = await Song.find();
  all.forEach((s, idx) => console.log(idx + 1, s.title, '|', s.genre, '| isRemix:', s.isRemix));
  process.exit(0);
}
run();
