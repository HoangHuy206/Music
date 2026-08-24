import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import User from '../models/User.js';
import Song from '../models/Song.js';

const JWT_SECRET = process.env.JWT_SECRET || 'aura_music_super_secret_jwt_key_2026_xyz';

function generateToken(id) {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '30d',
  });
}

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export async function registerUser(req, res) {
  try {
    const { username, email, password, displayName } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ Tên đăng nhập, Email và Mật khẩu.',
      });
    }

    // Check if user exists
    const userExists = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message:
          userExists.email === email.toLowerCase()
            ? 'Email này đã được đăng ký! Vui lòng chuyển sang tab Đăng Nhập.'
            : 'Tên đăng nhập này đã có người sử dụng. Vui lòng chọn tên khác.',
      });
    }

    // Create user
    const user = await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password,
      displayName: displayName ? displayName.trim() : username.trim(),
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Tạo tài khoản thành công! Chào mừng bạn đến với AuraMusic 🎵',
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
        bio: user.bio,
        createdAt: user.createdAt,
        token,
      },
    });
  } catch (err) {
    console.error('[Register Error]:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Lỗi hệ thống khi đăng ký tài khoản',
    });
  }
}

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export async function loginUser(req, res) {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập Email/Tên đăng nhập và Mật khẩu.',
      });
    }

    // Find user with password included
    const user = await User.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase().trim() },
        { username: emailOrUsername.trim() },
      ],
    }).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Tài khoản không tồn tại trong hệ thống! Vui lòng chuyển sang tab "Đăng Ký" để tạo tài khoản trước.',
      });
    }

    // If account was created via Google without a password set
    if (!user.password && user.googleId) {
      return res.status(400).json({
        success: false,
        message: 'Tài khoản này được tạo bằng Google! Vui lòng bấm nút "Tiếp tục với Google" bên trên để đăng nhập.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Mật khẩu không chính xác. Vui lòng kiểm tra lại.',
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công! Chào mừng bạn trở lại 🎧',
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
        bio: user.bio,
        createdAt: user.createdAt,
        token,
      },
    });
  } catch (err) {
    console.error('[Login Error]:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Lỗi hệ thống khi đăng nhập',
    });
  }
}

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export async function getMe(req, res) {
  try {
    const user = await User.findById(req.user._id).populate('favoriteSongs');
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.error('[GetMe Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching user profile',
    });
  }
}

/**
 * @desc    Update user profile details
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export async function updateProfile(req, res) {
  try {
    const { displayName, bio, avatar, email } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (email && email.toLowerCase() !== user.email) {
      const existingEmail = await User.findOne({ email: email.toLowerCase() });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email address is already in use',
        });
      }
      user.email = email.toLowerCase();
    }

    if (displayName !== undefined && displayName !== '') user.displayName = displayName.trim();
    if (bio !== undefined) user.bio = bio.trim();

    // Check if new avatar file is uploaded
    if (req.file) {
      const protocol = req.protocol;
      const host = req.get('host');
      user.avatar = `${protocol}://${host}/uploads/${req.file.filename}`;
    } else if (avatar !== undefined && avatar.trim()) {
      user.avatar = avatar.trim();
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully ✨',
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
        bio: user.bio,
        favoriteSongs: user.favoriteSongs,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('[UpdateProfile Error]:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error updating profile',
    });
  }
}

/**
 * @desc    Change user password
 * @route   PUT /api/auth/password
 * @access  Private
 */
export async function updatePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.password) {
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Mật khẩu hiện tại không chính xác',
        });
      }
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully 🔒',
    });
  } catch (err) {
    console.error('[UpdatePassword Error]:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error changing password',
    });
  }
}

/**
 * @desc    Get user library stats & profile summary
 * @route   GET /api/auth/stats
 * @access  Private
 */
export async function getUserStats(req, res) {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    const uploadedCount = await Song.countDocuments({ userId });
    const favoritesCount = user.favoriteSongs ? user.favoriteSongs.length : 0;

    return res.status(200).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          avatar: user.avatar,
          bio: user.bio,
          createdAt: user.createdAt,
        },
        stats: {
          uploadedSongsCount: uploadedCount,
          favoriteSongsCount: favoritesCount,
          memberSince: user.createdAt,
        },
      },
    });
  } catch (err) {
    console.error('[GetUserStats Error]:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error getting user stats',
    });
  }
}

/**
 * @desc    Get all songs uploaded by current user
 * @route   GET /api/auth/my-songs
 * @access  Private
 */
export async function getMySongs(req, res) {
  try {
    const songs = await Song.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: songs.length,
      data: songs,
    });
  } catch (err) {
    console.error('[GetMySongs Error]:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error retrieving your songs',
    });
  }
}

/**
 * @desc    Get all favorite songs of current user
 * @route   GET /api/auth/favorites
 * @access  Private
 */
export async function getFavorites(req, res) {
  try {
    const user = await User.findById(req.user._id).populate('favoriteSongs');
    const validFavorites = (user?.favoriteSongs || []).filter(Boolean);
    return res.status(200).json({
      success: true,
      data: validFavorites,
    });
  } catch (err) {
    console.error('[GetFavorites Error]:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error retrieving favorites',
    });
  }
}

/**
 * @desc    Toggle favorite song
 * @route   POST /api/auth/favorites/:songId
 * @access  Private
 */
export async function toggleFavorite(req, res) {
  try {
    const { songId } = req.params;
    let { title, artist, coverImage, audioUrl, sourceUrl, duration, genre, isRemix } = req.body || {};
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.favoriteSongs) {
      user.favoriteSongs = [];
    }

    // 1. Try finding song by valid MongoDB ObjectId
    let resolvedSongDoc = null;
    if (songId && mongoose.Types.ObjectId.isValid(songId)) {
      resolvedSongDoc = await Song.findById(songId);
    }

    // 2. If not found by ID, try matching by Title
    if (!resolvedSongDoc && (title || req.query.title)) {
      const searchTitle = (title || req.query.title || '').trim();
      const regexPattern = buildVietnameseRegex(searchTitle);
      resolvedSongDoc = await Song.findOne({ title: { $regex: regexPattern, $options: 'i' } });
    }

    // 3. If still not in database, create the Song record with safe fallback audioUrl
    if (!resolvedSongDoc) {
      const safeAudioUrl =
        audioUrl ||
        sourceUrl ||
        (songId && !songId.startsWith('temp') ? `/api/songs/stream/${songId}` : `https://api.soundcloud.com/tracks/mock/stream_${Date.now()}`);
      resolvedSongDoc = await Song.create({
        title: title || 'Bài Hát Yêu Thích',
        artist: artist || 'Nghệ Sĩ',
        coverImage: coverImage || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600',
        audioUrl: safeAudioUrl,
        sourceUrl: sourceUrl || (songId && songId.startsWith('cloud_') ? `https://soundcloud.com/track/${songId}` : null),
        duration: Number(duration) || 200,
        genre: genre || 'Nhạc Trẻ / Pop (Bản Gốc)',
        isRemix: !!isRemix,
        userId: req.user._id,
      });
    }

    if (!resolvedSongDoc) {
      return res.status(400).json({ success: false, message: 'Không tìm thấy thông tin bài hát' });
    }

    const resolvedId = resolvedSongDoc._id;
    const index = user.favoriteSongs.findIndex(
      (id) => id && id.toString() === resolvedId.toString()
    );

    let isFavorite = false;
    if (index > -1) {
      user.favoriteSongs.splice(index, 1);
      isFavorite = false;
    } else {
      user.favoriteSongs.push(resolvedId);
      isFavorite = true;
    }

    await user.save();
    await user.populate('favoriteSongs');

    const validFavorites = (user.favoriteSongs || []).filter(Boolean);

    return res.status(200).json({
      success: true,
      isFavorite,
      songId: String(resolvedId),
      message: isFavorite ? 'Đã thêm vào danh sách Yêu Thích ❤️' : 'Đã xóa khỏi danh sách Yêu Thích 💔',
      data: validFavorites,
    });
  } catch (err) {
    console.error('[ToggleFavorite Error]:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error updating favorites',
    });
  }
}

/**
 * @desc    Get user's custom playlists
 * @route   GET /api/auth/playlists
 * @access  Private
 */
export async function getUserPlaylists(req, res) {
  try {
    const user = await User.findById(req.user._id).populate('customPlaylists.songs');
    return res.status(200).json({
      success: true,
      data: user.customPlaylists || [],
    });
  } catch (err) {
    console.error('[GetUserPlaylists Error]:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error retrieving playlists',
    });
  }
}

/**
 * @desc    Create a new custom playlist
 * @route   POST /api/auth/playlists
 * @access  Private
 */
export async function createPlaylist(req, res) {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập tên danh sách phát',
      });
    }

    const user = await User.findById(req.user._id);
    if (!user.customPlaylists) user.customPlaylists = [];

    const newPlaylist = {
      name: name.trim(),
      description: description ? description.trim() : '',
      songs: [],
      createdAt: new Date(),
    };

    user.customPlaylists.push(newPlaylist);
    await user.save();

    const created = user.customPlaylists[user.customPlaylists.length - 1];

    return res.status(201).json({
      success: true,
      message: `Đã tạo playlist "${name}" thành công! 🎶`,
      data: created,
    });
  } catch (err) {
    console.error('[CreatePlaylist Error]:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error creating playlist',
    });
  }
}

/**
 * @desc    Add song to playlist
 * @route   POST /api/auth/playlists/:playlistId/songs
 * @access  Private
 */
export async function addSongToPlaylist(req, res) {
  try {
    const { playlistId } = req.params;
    const { songId } = req.body;

    if (!songId) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp bài hát cần thêm',
      });
    }

    const user = await User.findById(req.user._id);
    const playlist = user.customPlaylists.id(playlistId);

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy playlist',
      });
    }

    const alreadyExists = playlist.songs.some((id) => id.toString() === songId.toString());
    if (alreadyExists) {
      return res.status(400).json({
        success: false,
        message: 'Bài hát đã có trong playlist này rồi!',
      });
    }

    playlist.songs.push(songId);
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Đã thêm bài hát vào playlist "${playlist.name}"! 🎵`,
      data: playlist,
    });
  } catch (err) {
    console.error('[AddSongToPlaylist Error]:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error adding song to playlist',
    });
  }
}

/**
 * @desc    Remove song from playlist
 * @route   DELETE /api/auth/playlists/:playlistId/songs/:songId
 * @access  Private
 */
export async function removeSongFromPlaylist(req, res) {
  try {
    const { playlistId, songId } = req.params;
    const user = await User.findById(req.user._id);
    const playlist = user.customPlaylists.id(playlistId);

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy playlist',
      });
    }

    playlist.songs = playlist.songs.filter((id) => id.toString() !== songId.toString());
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Đã xóa bài hát khỏi playlist',
      data: playlist,
    });
  } catch (err) {
    console.error('[RemoveSongFromPlaylist Error]:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error removing song from playlist',
    });
  }
}

/**
 * @desc    Delete a custom playlist
 * @route   DELETE /api/auth/playlists/:playlistId
 * @access  Private
 */
export async function deletePlaylist(req, res) {
  try {
    const { playlistId } = req.params;
    const user = await User.findById(req.user._id);

    user.customPlaylists = user.customPlaylists.filter((p) => p._id.toString() !== playlistId.toString());
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Đã xóa playlist thành công',
    });
  } catch (err) {
    console.error('[DeletePlaylist Error]:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error deleting playlist',
    });
  }
}

/**
 * Helper to preserve high-res and animated GIF quality from Google user avatar URLs
 */
function optimizeGoogleAvatarUrl(url) {
  if (!url || typeof url !== 'string') return '';
  // Google avatar URLs end with =s96-c, replace with =s256 to preserve animated GIF & high quality without 429 rate limit
  if (url.includes('googleusercontent.com')) {
    return url.replace(/=s\d+(-c)?$/, '=s256');
  }
  return url;
}

/**
 * @desc    Google OAuth Sign-In / Sign-Up
 * @route   POST /api/auth/google
 * @access  Public
 */
export async function googleAuth(req, res) {
  try {
    const { credential, profile, mode } = req.body;

    let email = '';
    let name = '';
    let picture = '';
    let googleId = '';

    if (credential) {
      // Decode Google ID Token (JWT)
      try {
        // Direct token verification via Google OAuth tokeninfo endpoint
        const googleVerifyRes = await axios.get(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`,
          { timeout: 8000 }
        );
        if (googleVerifyRes.data && googleVerifyRes.data.email) {
          email = googleVerifyRes.data.email.toLowerCase();
          name = googleVerifyRes.data.name || email.split('@')[0];
          picture = googleVerifyRes.data.picture || '';
          googleId = googleVerifyRes.data.sub;
        }
      } catch (verifyErr) {
        console.warn('[Google Token Verify Warning]: Fallback to payload decode -', verifyErr.message);
        // Fallback: decode JWT payload
        const base64Payload = credential.split('.')[1];
        const decoded = JSON.parse(Buffer.from(base64Payload, 'base64').toString('utf-8'));
        email = (decoded.email || '').toLowerCase();
        name = decoded.name || decoded.given_name || email.split('@')[0];
        picture = decoded.picture || '';
        googleId = decoded.sub;
      }
    } else if (profile && profile.email) {
      email = profile.email.toLowerCase();
      name = profile.name || profile.displayName || email.split('@')[0];
      picture = profile.picture || profile.avatar || '';
      googleId = profile.googleId || profile.sub || `google_${Date.now()}`;
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xác thực địa chỉ email từ Google.',
      });
    }

    const optimizedAvatar = optimizeGoogleAvatarUrl(picture);

    // Find user by googleId or email
    let user = await User.findOne({
      $or: [{ googleId }, { email: email.toLowerCase() }],
    });

    // 1. Strict Login Mode Check: Must be registered first!
    if (mode === 'login' && !user) {
      return res.status(404).json({
        success: false,
        message: 'Tài khoản Google này chưa được đăng ký trong hệ thống! Vui lòng chuyển sang tab "Đăng Ký" để tạo tài khoản trước.',
      });
    }

    // 2. Strict Register Mode Check: Already registered
    if (mode === 'register' && user) {
      return res.status(400).json({
        success: false,
        message: 'Tài khoản Google này đã được đăng ký từ trước! Vui lòng chuyển sang tab "Đăng Nhập".',
      });
    }

    if (user) {
      let needsSave = false;
      if (!user.googleId) {
        user.googleId = googleId;
        needsSave = true;
      }
      // Always update avatar from Google account (including animated GIF)
      if (optimizedAvatar && user.avatar !== optimizedAvatar) {
        user.avatar = optimizedAvatar;
        needsSave = true;
      }
      if (needsSave) {
        await user.save();
      }
    } else {
      // Generate clean unique username
      let baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
      if (baseUsername.length < 3) baseUsername = `user_${baseUsername}`;
      let username = baseUsername;
      let counter = 1;

      while (await User.findOne({ username })) {
        username = `${baseUsername}${Math.floor(100 + Math.random() * 900)}`;
        counter++;
        if (counter > 10) break;
      }

      user = await User.create({
        username,
        email: email.toLowerCase(),
        displayName: name || username,
        avatar: optimizedAvatar || '',
        googleId,
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: mode === 'register'
        ? 'Đăng ký tài khoản bằng Google thành công! 🌟'
        : 'Đăng nhập bằng Google thành công! 🌟',
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
        bio: user.bio,
        createdAt: user.createdAt,
        token,
      },
    });
  } catch (err) {
    console.error('[Google Auth Error]:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Lỗi hệ thống khi xác thực Google',
    });
  }
}

const REMIX_KEYWORDS_SERVER = [
  'remix',
  'vinahouse',
  'vina hey',
  'bass boost',
  'nonstop',
  'viet mix',
  'dj ',
  'dj',
  'club mix',
  'house mix',
  'electro',
  'trap mix',
  'speed up',
  'sped up',
  'slowed',
  'mashup',
  'hardstyle',
  'edm',
  'bounce',
  'deep house',
  'future bass',
  'dance mix',
  'phonk',
];

function detectGenreServer(song) {
  if (!song) return { genre: 'Nhạc Trẻ / Pop (Bản Gốc)', isRemix: false, icon: '🎵' };
  const raw = `${song.title || ''} ${song.artist || ''}`.toLowerCase();
  const isRemix = REMIX_KEYWORDS_SERVER.some((kw) => raw.includes(kw));

  if (isRemix) {
    if (['edm', 'dance', 'trap', 'hardstyle', 'future bass'].some((kw) => raw.includes(kw))) {
      return { genre: 'EDM / Dance', isRemix: true, icon: '🔥' };
    }
    return { genre: 'Remix / Vinahouse', isRemix: true, icon: '⚡' };
  }

  if (['ballad', 'pop', 'tinh yeu', 'tam trang', 'acoustic', 'cover', 'official', 'mv', 'sau lang'].some((kw) => raw.includes(kw))) {
    return { genre: 'Ballad / Pop (Bản Gốc)', isRemix: false, icon: '💖' };
  }
  if (['chill', 'lofi', 'lo-fi', 'relax', 'night', 'rain', 'sleep', 'coffee'].some((kw) => raw.includes(kw))) {
    return { genre: 'Chill / Lofi (Bản Gốc)', isRemix: false, icon: '☕' };
  }
  if (['rap', 'hiphop', 'hip hop', 'r&b', 'rnb', 'cypher', 'drill'].some((kw) => raw.includes(kw))) {
    return { genre: 'Rap / Hiphop (Bản Gốc)', isRemix: false, icon: '🎤' };
  }

  return { genre: 'Nhạc Trẻ / Pop (Bản Gốc)', isRemix: false, icon: '🎵' };
}

/**
 * @desc    Record song play event to user account history and recalculate taste scores
 * @route   POST /api/auth/record-play
 * @access  Private
 */
export async function recordPlayEvent(req, res) {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const {
      songId,
      title,
      artist = 'Unknown',
      coverImage = '',
      audioUrl = '',
      duration = 0,
      genre: customGenre,
      isRemix: customIsRemix,
      isOnline = false,
      listenDurationSeconds = 15,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Song title is required' });
    }

    const detected = detectGenreServer({ title, artist });
    const finalGenre = customGenre || detected.genre;
    const finalIsRemix = customIsRemix !== undefined ? !!customIsRemix : detected.isRemix;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.tasteProfile) {
      user.tasteProfile = { genreScores: new Map(), favoriteArtists: new Map(), totalListens: 0 };
    }
    if (!user.tasteProfile.genreScores) user.tasteProfile.genreScores = new Map();
    if (!user.tasteProfile.favoriteArtists) user.tasteProfile.favoriteArtists = new Map();

    const sanitizeMapKey = (str) => String(str || '').replace(/\./g, '_').replace(/\$/g, '_').trim();
    const weight = listenDurationSeconds >= 30 ? 5 : 2;

    // Increment Genre Score (Sanitize key to prevent Mongoose map '.' error)
    const sanitizedGenreKey = sanitizeMapKey(finalGenre);
    if (sanitizedGenreKey) {
      const curGenreScore = user.tasteProfile.genreScores.get(sanitizedGenreKey) || 0;
      user.tasteProfile.genreScores.set(sanitizedGenreKey, curGenreScore + weight);
    }

    // Increment Artist Score (Sanitize key to prevent Mongoose map '.' error with names like "Mr. Sang")
    const cleanArtist = (artist || '').trim();
    if (cleanArtist && cleanArtist !== 'Unknown' && cleanArtist.length > 1) {
      const sanitizedArtistKey = sanitizeMapKey(cleanArtist);
      const curArtistScore = user.tasteProfile.favoriteArtists.get(sanitizedArtistKey) || 0;
      user.tasteProfile.favoriteArtists.set(sanitizedArtistKey, curArtistScore + weight);
    }

    user.tasteProfile.totalListens = (user.tasteProfile.totalListens || 0) + 1;

    // Update listenHistory
    if (!Array.isArray(user.listenHistory)) {
      user.listenHistory = [];
    }

    const cleanTitleLower = title.trim().toLowerCase();
    const existingIdx = user.listenHistory.findIndex((item) => {
      if (songId && item.songId && item.songId === songId) return true;
      return item.title?.trim().toLowerCase() === cleanTitleLower;
    });

    if (existingIdx > -1) {
      const existing = user.listenHistory[existingIdx];
      const newPlayCount = (existing.playCount || 1) + 1;
      user.listenHistory.splice(existingIdx, 1);
      user.listenHistory.unshift({
        songId: songId || existing.songId || '',
        title: title.trim(),
        artist: cleanArtist || existing.artist || 'Unknown',
        coverImage: coverImage || existing.coverImage || '',
        audioUrl: audioUrl || existing.audioUrl || '',
        duration: duration || existing.duration || 0,
        genre: finalGenre,
        isRemix: finalIsRemix,
        isOnline: !!isOnline,
        playedAt: new Date(),
        playCount: newPlayCount,
      });
    } else {
      user.listenHistory.unshift({
        songId: songId || '',
        title: title.trim(),
        artist: cleanArtist || 'Unknown',
        coverImage: coverImage || '',
        audioUrl: audioUrl || '',
        duration: duration || 0,
        genre: finalGenre,
        isRemix: finalIsRemix,
        isOnline: !!isOnline,
        playedAt: new Date(),
        playCount: 1,
      });
    }

    // Keep history capped to last 60 items
    if (user.listenHistory.length > 60) {
      user.listenHistory = user.listenHistory.slice(0, 60);
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Recorded play event',
      totalListens: user.tasteProfile.totalListens,
      genre: finalGenre,
    });
  } catch (err) {
    console.error('[RecordPlayEvent Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to record play event' });
  }
}

// In-memory SoundCloud Client ID Cache
let soundCloudClientIdCache = {
  clientId: 'QUUtl3ZAhuSPgQmsJHdB7KXkYMKsPLXk',
  updatedAt: Date.now(),
};

const getSoundCloudClientId = async () => {
  const now = Date.now();
  if (soundCloudClientIdCache.clientId && now - soundCloudClientIdCache.updatedAt < 3600000) {
    return soundCloudClientIdCache.clientId;
  }

  try {
    const scWeb = await axios.get('https://soundcloud.com', { timeout: 4000 });
    const scriptUrls = [...scWeb.data.matchAll(/src="(https:\/\/[^"]+\.js)"/g)].map((m) => m[1]);
    for (const url of scriptUrls.reverse().slice(0, 5)) {
      try {
        const js = await axios.get(url, { timeout: 4000 });
        const match = js.data.match(/client_id:"([a-zA-Z0-9]{32})"/);
        if (match) {
          soundCloudClientIdCache = { clientId: match[1], updatedAt: now };
          return match[1];
        }
      } catch {}
    }
  } catch {}

  return soundCloudClientIdCache.clientId || 'QUUtl3ZAhuSPgQmsJHdB7KXkYMKsPLXk';
};

let dailySoundCloudCache = {
  dateKey: '',
  tracksByGenre: {},
};

/**
 * Fetch and cache fresh trending tracks from SoundCloud for daily flow rotation
 */
async function getDailySoundCloudTracks(genre, dateKey) {
  if (dailySoundCloudCache.dateKey === dateKey && dailySoundCloudCache.tracksByGenre[genre]) {
    return dailySoundCloudCache.tracksByGenre[genre];
  }

  if (dailySoundCloudCache.dateKey !== dateKey) {
    dailySoundCloudCache = {
      dateKey,
      tracksByGenre: {},
    };
  }

  const GENRE_QUERIES = {
    'Remix / Vinahouse': [
      'top vinahouse remix hot trend 2026',
      'viet mix remix nonstop cuc cang',
    ],
    'Nhạc Trẻ / Pop (Bản Gốc)': [
      'top hit vpop official audio 2026',
      'nhac tre thinh hanh viet nam',
    ],
    'Ballad / Pop (Bản Gốc)': [
      'acoustic ballad viet nam nhe nhang',
    ],
    'Chill / Lofi (Bản Gốc)': [
      'nhac chill lofi viet nam',
    ],
    'Rap / Hiphop (Bản Gốc)': [
      'rap viet underground flow hay nhat',
    ],
  };

  const queries = GENRE_QUERIES[genre] || ['top hit vpop official 2026'];
  const scClientId = await getSoundCloudClientId();
  const tracks = [];

  for (const q of queries) {
    try {
      const res = await axios.get('https://api-v2.soundcloud.com/search/tracks', {
        params: { q, client_id: scClientId, limit: 10 },
        timeout: 4000,
      });
      const SPAM_TITLES_REGEX = /tổng hợp trend|tong hop trend|goddartlct|nonstop|nhạc chế|tập hợp|full album|1 tiếng|1 hour|hot trend tik tok|trend tiktok|nhac tre remix/i;
      const items = (res.data?.collection || []).filter((item) => {
        if (!item || !item.title) return false;
        if (SPAM_TITLES_REGEX.test(item.title) || SPAM_TITLES_REGEX.test(item.user?.username || '')) return false;
        return true;
      });

      // Resolve real playable direct stream URLs in parallel
      const streamPromises = items.map(async (item) => {
        if (!item || !item.title || !item.media?.transcodings?.length) return null;
        const progressiveTrans = item.media.transcodings.find((t) => t.format?.protocol === 'progressive');
        const hlsTrans = item.media.transcodings.find((t) => t.format?.protocol === 'hls');
        const transObj = progressiveTrans || hlsTrans;
        if (!transObj || !transObj.url) return null;

        try {
          const streamRes = await axios.get(transObj.url, {
            params: { client_id: scClientId },
            timeout: 3500,
          });
          if (streamRes.data?.url) {
            const cover = (item.artwork_url || item.user?.avatar_url || '').replace('-large', '-t500x500');
            return {
              _id: `sc_daily_${item.id}`,
              title: item.title,
              artist: item.user?.username || 'Nghệ Sĩ SoundCloud',
              coverImage: cover || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
              audioUrl: streamRes.data.url, // Real direct playable MP3 stream URL
              duration: Math.round((item.duration || 0) / 1000),
              genre: genre,
              isRemix: genre.includes('Remix'),
              isOnline: true,
              matchPercent: 96,
              matchReason: 'Khám phá SoundCloud trong ngày ✨',
            };
          }
        } catch {}
        return null;
      });

      const resolvedTracks = await Promise.allSettled(streamPromises);
      for (const r of resolvedTracks) {
        if (r.status === 'fulfilled' && r.value) {
          tracks.push(r.value);
        }
      }
    } catch (err) {
      console.warn('[SC Daily Discovery Error]:', err.message);
    }
  }

  dailySoundCloudCache.tracksByGenre[genre] = tracks;
  return tracks;
}

/**
 * @desc    Get Personalized Song Recommendations for Home Page
 * @route   GET /api/auth/recommendations
 * @access  Public (Enhanced if authenticated)
 */
export async function getPersonalizedRecommendations(req, res) {
  try {
    const user = req.user;
    const allSongs = await Song.find().populate('userId', 'username displayName avatar');
    const validCatalog = allSongs.filter(
      (s) => s.audioUrl && (s.audioUrl.startsWith('http') || s.audioUrl.startsWith('/uploads') || s.audioUrl.startsWith('blob:'))
    );

    const listenHistory = (user && Array.isArray(user.listenHistory)) ? user.listenHistory : [];
    const hasListeningHistory = listenHistory.length >= 2;

    // Calculate genre affinities and play weights
    const genreScoresMap = {};
    const artistScoresMap = {};
    let totalScoreWeight = 0;

    for (const item of listenHistory) {
      const playCount = Number(item.playCount) || 1;
      const weight = Math.min(playCount, 15);
      if (item.genre) {
        genreScoresMap[item.genre] = (genreScoresMap[item.genre] || 0) + weight;
        totalScoreWeight += weight;
      }
      if (item.artist) {
        artistScoresMap[item.artist] = (artistScoresMap[item.artist] || 0) + weight;
      }
    }

    // Daily Deterministic Salt (YYYY-MM-DD) for smooth 24h consistency
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const userDailySeed = Math.abs(
      (todayStr + String(user?._id || 'guest')).split('').reduce((acc, c) => ((acc << 5) - acc) + c.charCodeAt(0), 0)
    );

    // Calculate user's favorite genres ranked by affinity
    const sortedGenreEntries = Object.entries(genreScoresMap).filter(([, score]) => score > 0).sort((a, b) => b[1] - a[1]);
    const topGenreNames = new Set(sortedGenreEntries.slice(0, 3).map(([g]) => g));

    // Fetch Daily Fresh SoundCloud Discoveries
    let dailyCloudTracks = [];
    try {
      const topGenre = sortedGenreEntries.length > 0 ? sortedGenreEntries[0][0] : 'Nhạc Trẻ / Pop (Bản Gốc)';
      dailyCloudTracks = await getDailySoundCloudTracks(topGenre, todayStr);
    } catch (scErr) {
      console.warn('[SC Daily Flow Notice]:', scErr.message);
    }

    // NEW USER / NO LISTENING HISTORY:
    if (!hasListeningHistory) {
      const genresList = [
        'Nhạc Trẻ / Pop (Bản Gốc)',
        'Ballad / Pop (Bản Gốc)',
        'Chill / Lofi (Bản Gốc)',
        'Rap / Hiphop (Bản Gốc)',
        'Remix / Vinahouse',
      ];
      let diverseStarterTracks = [];
      for (const g of genresList) {
        const gSongs = validCatalog.filter((s) => s.genre === g);
        const dailyOffset = userDailySeed % Math.max(1, gSongs.length);
        const rotatedGroup = [...gSongs.slice(dailyOffset), ...gSongs.slice(0, dailyOffset)];
        diverseStarterTracks.push(...rotatedGroup.slice(0, 3));
      }
      for (const s of validCatalog) {
        if (!diverseStarterTracks.some((st) => String(st._id) === String(s._id))) {
          diverseStarterTracks.push(s);
        }
      }

      // Append fresh SoundCloud daily discoveries at the end
      if (dailyCloudTracks.length > 0) {
        diverseStarterTracks.push(...dailyCloudTracks.slice(0, 4));
      }

      // Filter out any unwanted spam compilation tracks
      const SPAM_FILTER = /tổng hợp trend|tong hop trend|goddartlct|nonstop/i;
      diverseStarterTracks = diverseStarterTracks.filter(
        (t) => !SPAM_FILTER.test(t.title) && !SPAM_FILTER.test(t.artist)
      );

      return res.status(200).json({
        success: true,
        isPersonalized: false,
        hasListeningHistory: false,
        totalListens: 0,
        todayCycle: todayStr,
        username: user?.displayName || user?.username || 'Bạn',
        starterTracks: diverseStarterTracks.slice(0, 16),
        forYouMix: [],
        genrePlaylists: [],
        frequentlyPlayed: [],
        recentlyPlayed: [],
        tasteSummary: {
          dominantGenre: '',
          genreDistribution: [],
          topArtists: [],
        },
      });
    }

    const genreScoreValues = Object.values(genreScoresMap);
    const maxGenreScore = genreScoreValues.length > 0 ? Math.max(...genreScoreValues, 10) : 10;
    const latestListenedGenre = listenHistory[0]?.genre;

    // Score all catalog songs for user with strict taste filtering & 24h daily consistency
    const scoredSongs = validCatalog.map((song, idx) => {
      const songObj = song.toObject ? song.toObject() : song;
      const { genre, isRemix, icon } = detectGenreServer(songObj);
      let score = 20;
      let reasons = [];
      let hasAffinity = false;

      // 1. Genre score match
      const userGScore = genreScoresMap[genre] || 0;
      if (userGScore > 0) {
        const genreAffinity = (userGScore / maxGenreScore) * 60;
        score += genreAffinity;
        if (topGenreNames.has(genre)) {
          hasAffinity = true;
          reasons.push(`Gu ${genre} của bạn`);
        }
      }

      // 2. Recency boost: If this matches the most recently played genre
      if (latestListenedGenre && genre === latestListenedGenre) {
        score += 20;
        hasAffinity = true;
        if (!reasons.length) reasons.push(`Gợi ý theo bài vừa nghe`);
      }

      // 3. Artist score match
      const artist = (songObj.artist || '').trim();
      const sanitizedArtistKey = artist.replace(/\./g, '_').replace(/\$/g, '_');
      const artistScore = favoriteArtistsMap[artist] || favoriteArtistsMap[sanitizedArtistKey] || 0;
      if (artist && artistScore > 0) {
        score += Math.min(45, artistScore * 5);
        hasAffinity = true;
        reasons.push(`Ca sĩ bạn hay nghe (${artist})`);
      }

      // 4. Favorite match
      if (favoriteSongIds.has(String(songObj._id))) {
        score += 35;
        hasAffinity = true;
        reasons.push('Trong danh sách Yêu Thích ❤️');
      }

      // 5. Play count in listen history
      const historyItem = listenHistory.find((h) => h.songId === String(songObj._id) || h.title?.toLowerCase() === songObj.title?.toLowerCase());
      if (historyItem) {
        score += Math.min(30, (historyItem.playCount || 1) * 4);
        hasAffinity = true;
        reasons.push(`Đã nghe ${historyItem.playCount || 1} lần`);
      }

      // 6. 24-Hour Daily Deterministic Seed (changes every 24h at midnight)
      const dailyTrackJitter = ((userDailySeed + idx * 13) % 25);
      score += dailyTrackJitter;

      const matchPercent = Math.min(99, Math.max(75, Math.round(60 + (score / 170) * 38)));

      return {
        ...songObj,
        genre,
        isRemix,
        genreIcon: icon,
        recommendScore: score,
        hasAffinity,
        matchPercent,
        matchReason: reasons[0] || (isRemix ? 'Remix sôi động theo gu bạn' : 'Bản Gốc được đề xuất cho bạn'),
      };
    });

    // Strictly filter songs with genuine affinity for "Dành Riêng Cho Bạn"
    let qualifiedSongs = scoredSongs.filter((s) => s.hasAffinity);
    if (qualifiedSongs.length === 0) {
      qualifiedSongs = scoredSongs;
    }

    qualifiedSongs.sort((a, b) => b.recommendScore - a.recommendScore);

    // Merge fresh SoundCloud daily discoveries matching user's top taste
    const matchingCloudTracks = dailyCloudTracks.slice(0, 4);
    const combinedForYou = [...matchingCloudTracks, ...qualifiedSongs];

    // Top For You Mix (broad diverse stream tailored to user's taste, up to 40 tracks)
    const forYouMix = combinedForYou.slice(0, 40);

    // Frequently Played Songs (sorted by play count)
    const sortedHistory = [...listenHistory].sort((a, b) => (b.playCount || 1) - (a.playCount || 1));
    const frequentlyPlayed = sortedHistory.slice(0, 12).map((item) => ({
      _id: item.songId || `hist_${item._id || item.title}`,
      title: item.title,
      artist: item.artist,
      coverImage: item.coverImage,
      audioUrl: item.audioUrl,
      duration: item.duration,
      genre: item.genre,
      isRemix: item.isRemix,
      isOnline: item.isOnline,
      playCount: item.playCount || 1,
      playedAt: item.playedAt,
    }));

    // Recently Played Songs
    const recentlyPlayed = listenHistory.slice(0, 10).map((item) => ({
      _id: item.songId || `recent_${item._id || item.title}`,
      title: item.title,
      artist: item.artist,
      coverImage: item.coverImage,
      audioUrl: item.audioUrl,
      duration: item.duration,
      genre: item.genre,
      isRemix: item.isRemix,
      isOnline: item.isOnline,
      playCount: item.playCount || 1,
      playedAt: item.playedAt,
    }));

    // Dynamic Genre Playlists grouped by styles
    const GENRE_CATEGORIES = [
      {
        id: 'ballad',
        title: 'Mix Ballad Sâu Lắng & Pop Gốc',
        description: 'Giai điệu acoustic nhẹ nhàng, cảm xúc và sâu lắng nhất',
        genreMatch: 'Ballad / Pop (Bản Gốc)',
        icon: '💖',
        gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
      },
      {
        id: 'vinahouse',
        title: 'Nonstop Vinahouse & Bay Phòng',
        description: 'Bass cực căng, năng lượng bùng nổ cho tiệc tùng',
        genreMatch: 'Remix / Vinahouse',
        icon: '⚡',
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
      },
      {
        id: 'chill',
        title: 'Chill Đêm Khuya & Lofi Vibe',
        description: 'Thư giãn, tập trung làm việc và học tập về đêm',
        genreMatch: 'Chill / Lofi (Bản Gốc)',
        icon: '☕',
        gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
      },
      {
        id: 'edm',
        title: 'EDM & Electronic Dance Flow',
        description: 'Âm thanh điện tử đỉnh cao với visualizer 60FPS',
        genreMatch: 'EDM / Dance',
        icon: '🔥',
        gradient: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
      },
      {
        id: 'rap',
        title: 'Rap & HipHop Đi Đỉnh Cao',
        description: 'Flow mượt mà, punchline chất lượng từ các rapper hàng đầu',
        genreMatch: 'Rap / Hiphop (Bản Gốc)',
        icon: '🎤',
        gradient: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
      },
      {
        id: 'pop',
        title: 'Nhạc Trẻ Thịnh Hành & V-Pop',
        description: 'Những bản hit đình đám nhất bảng xếp hạng âm nhạc',
        genreMatch: 'Nhạc Trẻ / Pop (Bản Gốc)',
        icon: '✨',
        gradient: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
      },
    ];

    // Populate tracks for each genre category, sorted by user preference score
    const genrePlaylists = GENRE_CATEGORIES.map((cat) => {
      const matchingSongs = scoredSongs.filter((s) => s.genre === cat.genreMatch || (cat.id === 'pop' && !s.isRemix));
      const userScoreForCat = genreScoresMap[cat.genreMatch] || 0;
      return {
        ...cat,
        songsCount: matchingSongs.length,
        userAffinityScore: userScoreForCat,
        songs: matchingSongs.slice(0, 12),
      };
    })
      .filter((pl) => pl.songs.length > 0)
      .sort((a, b) => b.userAffinityScore - a.userAffinityScore);

    // Taste summary metrics
    const topGenreName = sortedGenreEntries.length > 0 ? sortedGenreEntries[0][0] : '';
    const totalTastePoints = sortedGenreEntries.reduce((sum, [, score]) => sum + score, 0) || 1;

    const genreDistribution = sortedGenreEntries.slice(0, 4).map(([genreName, score]) => ({
      genre: genreName,
      score,
      percentage: Math.round((score / totalTastePoints) * 100),
    }));

    const topArtistsList = Object.entries(favoriteArtistsMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
    return res.status(200).json({
      success: true,
      isPersonalized: true,
      hasListeningHistory: true,
      totalListens,
      todayCycle: todayStr,
      username: user?.displayName || user?.username || 'Bạn',
      forYouMix,
      genrePlaylists,
      frequentlyPlayed,
      recentlyPlayed,
      customPlaylists: user?.customPlaylists || [],
      tasteSummary: {
        dominantGenre: topGenreName,
        genreDistribution,
        topArtists: topArtistsList,
      },
    });
  } catch (err) {
    console.error('[GetPersonalizedRecommendations Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate recommendations',
      data: null,
    });
  }
}



