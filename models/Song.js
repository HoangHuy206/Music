import mongoose from 'mongoose';

/**
 * Sub-schema for time-synchronized lyrics entries.
 * `time` is represented in seconds (with decimal support for milliseconds, e.g. 12.45).
 */
const lyricItemSchema = new mongoose.Schema(
  {
    time: {
      type: Number,
      required: [true, 'Timestamp in seconds is required for lyric sync'],
      min: [0, 'Timestamp cannot be negative'],
    },
    text: {
      type: String,
      required: [true, 'Lyric line text is required'],
      trim: true,
    },
  },
  { _id: false }
);

/**
 * Sub-schema for audio visualizer rendering preferences.
 */
const visualizerSettingsSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: {
        values: ['circle', 'bottom_bars'],
        message: '{VALUE} is not a valid visualizer type',
      },
      default: 'circle',
    },
    color: {
      type: String,
      default: '#ffffff',
      trim: true,
    },
  },
  { _id: false }
);

/**
 * Song Schema
 */
const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Song title is required'],
      trim: true,
    },
    artist: {
      type: String,
      default: 'Unknown',
      trim: true,
    },
    sourceUrl: {
      type: String,
      trim: true,
      default: null,
    },
    audioUrl: {
      type: String,
      required: [true, 'Audio MP3 URL is required'],
      trim: true,
    },
    coverImage: {
      type: String,
      default: null,
      trim: true,
    },
    lyricsData: {
      type: [lyricItemSchema],
      default: [],
    },
    visualizerSettings: {
      type: visualizerSettingsSchema,
      default: () => ({}),
    },
    genre: {
      type: String,
      default: 'Nhạc Trẻ / Pop (Bản Gốc)',
      trim: true,
    },
    isRemix: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

// Optional index to speed up title and artist search queries
songSchema.index({ title: 'text', artist: 'text' });

const Song = mongoose.model('Song', songSchema);

export default Song;
