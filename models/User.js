import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    googleId: {
      type: String,
      default: null,
      sparse: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId; // Password is required only if not authenticated via Google
      },
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default
    },
    displayName: {
      type: String,
      trim: true,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [250, 'Bio cannot exceed 250 characters'],
      default: 'AuraMusic lover & Audiophile 🎧',
    },
    favoriteSongs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song',
      },
    ],
    customPlaylists: [
      {
        name: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
        createdAt: { type: Date, default: Date.now },
      },
    ],
    listenHistory: [
      {
        songId: { type: String, default: '' },
        title: { type: String, required: true, trim: true },
        artist: { type: String, default: 'Unknown', trim: true },
        coverImage: { type: String, default: '' },
        audioUrl: { type: String, default: '' },
        duration: { type: Number, default: 0 },
        genre: { type: String, default: 'Nhạc Trẻ / Pop (Bản Gốc)' },
        isRemix: { type: Boolean, default: false },
        isOnline: { type: Boolean, default: false },
        playedAt: { type: Date, default: Date.now },
        playCount: { type: Number, default: 1 },
      },
    ],
    tasteProfile: {
      genreScores: {
        type: Map,
        of: Number,
        default: () => new Map(),
      },
      favoriteArtists: {
        type: Map,
        of: Number,
        default: () => new Map(),
      },
      totalListens: {
        type: Number,
        default: 0,
      },
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

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.password || !this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to match password
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password || !enteredPassword) {
    return false;
  }
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (err) {
    return false;
  }
};

const User = mongoose.model('User', userSchema);

export default User;
