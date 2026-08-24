import fs from 'fs';
import path from 'path';
import axios from 'axios';
import Groq from 'groq-sdk';
import mongoose from 'mongoose';
import Song from '../models/Song.js';

async function fix() {
  await mongoose.connect(process.env.MONGO_URI);
  const scClientId = 'QUUtl3ZAhuSPgQmsJHdB7KXkYMKsPLXk';
  const res = await axios.get('https://api-v2.soundcloud.com/search/tracks', {
    params: { q: 'sao thấy đôi mi em buồn remix tiktok', client_id: scClientId, limit: 3 }
  });
  const track = res.data.collection[2];
  const prog = track.media?.transcodings?.find(tc => tc.format?.protocol === 'progressive');
  const streamRes = await axios.get(prog.url, { params: { client_id: scClientId } });
  const streamUrl = streamRes.data?.url;

  const outPath = path.resolve('uploads/sc_saothaydoimiembuon.mp3');
  const audioDown = await axios.get(streamUrl, { responseType: 'stream' });
  const writer = fs.createWriteStream(outPath);
  audioDown.data.pipe(writer);
  await new Promise(r => writer.on('finish', r));
  console.log('Downloaded single clip: sc_saothaydoimiembuon.mp3 (', fs.statSync(outPath).size, 'bytes)');

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const trans = await groq.audio.transcriptions.create({
    file: fs.createReadStream(outPath),
    model: 'whisper-large-v3',
    response_format: 'verbose_json',
    language: 'vi',
  });

  const lyrics = [
    { time: 0, text: 'Giai điệu mở đầu...' },
    ...trans.segments.map(s => ({ time: parseFloat(s.start.toFixed(1)), text: s.text.trim() }))
  ];

  await Song.updateOne({ title: 'sao thay doi mi em buon' }, { lyricsData: lyrics });
  console.log('AI Aligned lyrics for sao thay doi mi em buon:', lyrics);
  process.exit(0);
}

fix();
