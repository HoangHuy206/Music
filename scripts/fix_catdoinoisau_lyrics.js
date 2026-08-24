import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const Song = (await import('../models/Song.js')).default;
  
  const catDoiNoiSauLyrics = [
    { time: 0.0, text: 'Giai điệu mở đầu...' },
    { time: 13.5, text: 'Cắt đôi nỗi sầu anh buông tay cắt đôi nỗi sầu' },
    { time: 17.2, text: 'Để anh không còn thao thức đêm thâu' },
    { time: 20.8, text: 'Bao nhiêu nước mắt tuôn rơi bấy lâu' },
    { time: 24.5, text: 'Gói trọn lại đem chôn thật sâu' },
    { time: 28.0, text: 'Cắt đôi nỗi sầu anh buông tay cắt đôi nỗi sầu' },
    { time: 31.8, text: 'Để anh không còn phải nhớ thương em' },
    { time: 35.5, text: 'Bao nhiêu ký ức trong đêm tối đen' },
    { time: 39.0, text: 'Đem thả vào trong cõi hư không' },
    { time: 42.5, text: 'Từ nay thôi mơ mộng' },
    { time: 46.0, text: 'Đoạn đường xưa một mình anh bước đi' },
    { time: 50.0, text: 'Dẫu cho lệ rơi ướt bờ mi' },
    { time: 53.5, text: 'Cũng chẳng mong em quay về đây' },
    { time: 57.0, text: 'Duyên tình ta đành buông từ đây' },
    { time: 61.0, text: 'Cắt đôi nỗi sầu anh buông tay cắt đôi nỗi sầu' },
  ];

  await Song.updateOne({ title: 'Cắt Đôi Nỗi Sầu (Bản Gốc)' }, { $set: { lyricsData: catDoiNoiSauLyrics } });
  console.log('Updated Cắt Đôi Nỗi Sầu lyrics successfully!');
  process.exit(0);
}

run();
