import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Song from '../models/Song.js';
import User from '../models/User.js';

const initDatabase = async () => {
  try {
    console.log('[Connecting to MongoDB Atlas]...');
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error('MONGO_URI is missing in .env');
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`[Connected successfully]: Host -> ${conn.connection.host}, Database -> ${conn.connection.name}`);

    // Clean existing records if any (fresh setup)
    console.log('[Clearing old collections]...');
    await Song.deleteMany({});
    await User.deleteMany({});

    console.log('[Inserting sample Songs with synchronized lyrics and visualizer settings]...');
    const createdSongs = await Song.insertMany([
      {
        title: 'Midnight City Lights',
        artist: 'Lofi Chillwave',
        sourceUrl: 'https://soundcloud.com/chillwave/midnight-city',
        audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
        coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800',
        lyricsData: [
          { time: 0.0, text: '♪ (Smooth Lo-fi Vinyl Intro) ♪' },
          { time: 5.2, text: 'City lights shimmering through midnight rain' },
          { time: 10.8, text: 'Quiet thoughts wash away the day again' },
          { time: 16.5, text: 'Coffee cup cooling on the window sill' },
          { time: 22.0, text: 'Time stands calm, world is standing still' },
          { time: 28.5, text: 'Deep breaths in the neon glow' },
          { time: 35.0, text: 'Let the ambient frequencies flow' },
        ],
        visualizerSettings: {
          type: 'circle',
          color: '#00e5ff',
        },
      },
      {
        title: 'Golden Sunset Horizons',
        artist: 'Aetherial Beats',
        sourceUrl: 'https://soundcloud.com/aetherial/sunset-horizons',
        audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3',
        coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800',
        lyricsData: [
          { time: 0.0, text: '♪ (Acoustic Guitar Harmony) ♪' },
          { time: 6.0, text: 'Golden skies melting into twilight hue' },
          { time: 12.4, text: 'Chasing the horizon under ocean blue' },
          { time: 18.2, text: 'Every wave whispers melodies of peace' },
          { time: 25.0, text: 'Where the noise and worries all release' },
        ],
        visualizerSettings: {
          type: 'bottom_bars',
          color: '#ff9100',
        },
      },
    ]);

    console.log(`[Inserted ${createdSongs.length} Songs successfully]`);

    console.log('[Creating sample User with library references]...');
    const sampleUser = await User.create({
      username: 'huyhoangzz',
      email: 'huyhoang@example.com',
      passwordHash: '$2b$10$w8uF2hU71J7E10b8gL2sQ.e8xYn6K3w6qP6h7S2D8Z1C4V9B0N1M2', // Mock hashed password
      myLibrary: createdSongs.map((song) => song._id),
    });

    console.log(`[User created successfully]: ${sampleUser.username} with ${sampleUser.myLibrary.length} saved songs.`);

    // Verify populated query
    const populatedUser = await User.findById(sampleUser._id).populate('myLibrary');
    console.log('\n--- VERIFICATION POPULATED DATA ---');
    console.log(`User: ${populatedUser.username} (${populatedUser.email})`);
    console.log('Songs in Library:');
    populatedUser.myLibrary.forEach((s, idx) => {
      console.log(`  ${idx + 1}. "${s.title}" by ${s.artist} [Visualizer: ${s.visualizerSettings.type} (${s.visualizerSettings.color})]`);
      console.log(`     Lyrics entries: ${s.lyricsData.length}`);
    });

    console.log('\n[Database initialization completed successfully!]');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n[Database Initialization Failed]:', error.message);
    if (error.reason) {
      console.error('Details:', error.reason);
    }
    process.exit(1);
  }
};

initDatabase();
