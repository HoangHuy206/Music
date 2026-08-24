/**
 * Smart Music Recommendation & Taste Profile Engine (SoundCloud-Style Autoplay)
 * Supports strict separation between Original Beats (Bản Gốc) vs Remix/Vinahouse,
 * and per-user account taste profile isolation.
 */

import { API_BASE_URL } from '../config/api.js';
import { getAuthHeaders, currentUser } from './auth.js';

// Remix detection keywords
const REMIX_KEYWORDS = [
  'remix',
  'vinahouse',
  'vina hey',
  'vinahey',
  'bass boost',
  'nonstop',
  'viet mix',
  'vietmix',
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
  'cuc cang',
  'cực căng',
  'bay phong',
  'bay phòng',
  'mk remix',
  'nhac bay',
  ' re',
  '( re',
  're...',
];

// Supported Genre Rules
const GENRE_RULES = [
  {
    genre: 'Remix / Vinahouse',
    keywords: REMIX_KEYWORDS,
    vibe: 'energetic',
    icon: '⚡',
    isRemix: true,
  },
  {
    genre: 'EDM / Dance',
    keywords: ['edm', 'dance', 'trap', 'dubstep', 'bounce', 'hardstyle', 'future bass'],
    vibe: 'energetic',
    icon: '🔥',
    isRemix: true,
  },
  {
    genre: 'Ballad / Pop (Bản Gốc)',
    keywords: ['ballad', 'pop', 'tinh yeu', 'tam trang', 'acoustic', 'cover', 'sau lang', 'nhe nhang', 'em oi', 'anh oi', 'official', 'mv'],
    vibe: 'emotional',
    icon: '💖',
    isRemix: false,
  },
  {
    genre: 'Chill / Lofi (Bản Gốc)',
    keywords: ['chill', 'lofi', 'lo-fi', 'relax', 'night', 'rain', 'study', 'sleep', 'coffee', 'instrumental'],
    vibe: 'relaxing',
    icon: '☕',
    isRemix: false,
  },
  {
    genre: 'Rap / Hiphop (Bản Gốc)',
    keywords: ['rap', 'hiphop', 'hip hop', 'freestyle', 'flow', 'cypher', 'drill', 'r&b', 'rnb'],
    vibe: 'groove',
    icon: '🎤',
    isRemix: false,
  },
];

/**
 * Checks if a track is a Remix / Vinahouse / DJ edit
 * @param {Object} song
 * @returns {boolean}
 */
export function isSongRemix(song) {
  if (!song) return false;
  const rawText = `${song.title || ''} ${song.artist || ''}`.toLowerCase();
  return REMIX_KEYWORDS.some((kw) => rawText.includes(kw));
}

/**
 * Detects genre, vibe and remix status from song metadata
 * @param {Object} song
 * @returns {{ genre: string, vibe: string, icon: string, isRemix: boolean, isOriginal: boolean, tags: string[] }}
 */
export function detectSongGenre(song) {
  if (!song) {
    return { genre: 'Nhạc Trẻ (Bản Gốc)', vibe: 'general', icon: '🎵', isRemix: false, isOriginal: true, tags: ['Bản Gốc'] };
  }

  const rawText = `${song.title || ''} ${song.artist || ''}`.toLowerCase();
  const isRemixTrack = isSongRemix(song);

  if (isRemixTrack) {
    for (const rule of GENRE_RULES) {
      if (rule.isRemix && rule.keywords.some((kw) => rawText.includes(kw))) {
        return {
          genre: rule.genre,
          vibe: rule.vibe,
          icon: rule.icon,
          isRemix: true,
          isOriginal: false,
          tags: [rule.genre],
        };
      }
    }
    return { genre: 'Remix / Vinahouse', vibe: 'energetic', icon: '⚡', isRemix: true, isOriginal: false, tags: ['Remix'] };
  }

  // Original Beat Detection
  for (const rule of GENRE_RULES) {
    if (!rule.isRemix && rule.keywords.some((kw) => rawText.includes(kw))) {
      return {
        genre: rule.genre,
        vibe: rule.vibe,
        icon: rule.icon,
        isRemix: false,
        isOriginal: true,
        tags: [rule.genre],
      };
    }
  }

  return { genre: 'Nhạc Trẻ / Pop (Bản Gốc)', vibe: 'general', icon: '🎵', isRemix: false, isOriginal: true, tags: ['Bản Gốc'] };
}

/**
 * Returns isolated storage key for current user account
 * @param {string|null} userId
 */
export function getStorageKeyForUser(userId = null) {
  if (userId && typeof userId === 'string' && userId.trim()) {
    return `aura_taste_profile_u_${userId.trim()}`;
  }
  return `aura_taste_profile_guest`;
}

/**
 * Gets user taste profile from localStorage isolated per account
 * @param {string|null} userId
 */
export function getUserTasteProfile(userId = null) {
  const storageKey = getStorageKeyForUser(userId);
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[Taste Profile] Error parsing profile:', err);
  }

  return {
    genreScores: {
      'Ballad / Pop (Bản Gốc)': 10,
      'Nhạc Trẻ / Pop (Bản Gốc)': 10,
      'Chill / Lofi (Bản Gốc)': 5,
      'Remix / Vinahouse': 5,
      'EDM / Dance': 5,
      'Rap / Hiphop (Bản Gốc)': 5,
    },
    favoriteArtists: {},
    recentHistory: [],
    totalTracksPlayed: 0,
  };
}

/**
 * Saves user taste profile
 * @param {Object} profile
 * @param {string|null} userId
 */
export function saveUserTasteProfile(profile, userId = null) {
  const storageKey = getStorageKeyForUser(userId);
  try {
    localStorage.setItem(storageKey, JSON.stringify(profile));
  } catch (err) {
    console.warn('[Taste Profile] Error saving profile:', err);
  }
}

/**
 * Records a listening event (isolated per user account and synced to backend)
 * @param {Object} song
 * @param {number} listenDurationSeconds
 * @param {string|null} userId
 */
export function recordSongPlayEvent(song, listenDurationSeconds = 15, userId = null) {
  if (!song || (!song._id && !song.title)) return;

  const profile = getUserTasteProfile(userId);
  const { genre, isRemix } = detectSongGenre(song);
  const songIdentifier = song._id || song.title;

  const weight = listenDurationSeconds >= 30 ? 5 : 2;

  // Increment genre score
  profile.genreScores[genre] = (profile.genreScores[genre] || 0) + weight;

  // Increment artist score
  const artist = (song.artist || 'Unknown').trim();
  if (artist && artist !== 'Unknown') {
    profile.favoriteArtists[artist] = (profile.favoriteArtists[artist] || 0) + weight;
  }

  // Update recent history
  profile.recentHistory = [songIdentifier, ...profile.recentHistory.filter((id) => id !== songIdentifier)].slice(0, 20);
  profile.totalTracksPlayed = (profile.totalTracksPlayed || 0) + 1;

  saveUserTasteProfile(profile, userId);

  // Sync to Backend if authenticated & notify UI components
  try {
    const authHeaders = getAuthHeaders();
    if (authHeaders && authHeaders.Authorization) {
      fetch(`${API_BASE_URL}/api/auth/record-play`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({
          songId: song._id || '',
          title: song.title,
          artist: song.artist || 'Unknown',
          coverImage: song.coverImage || '',
          audioUrl: song.audioUrl || '',
          duration: song.duration || 0,
          genre,
          isRemix,
          isOnline: !!song.isOnline,
          listenDurationSeconds,
        }),
      }).then(() => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auramusic:play-recorded', {
            detail: { songId: song._id, title: song.title, genre, artist }
          }));
        }
      }).catch((err) => {
        console.warn('[Sync Play Event Notice]:', err.message);
      });
    } else {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auramusic:play-recorded', {
          detail: { songId: song._id, title: song.title, genre, artist }
        }));
      }
    }
  } catch (syncErr) {
    // Non-blocking
  }
}

/**
 * Fetches comprehensive personalized recommendations for the current account from backend
 * @param {string} apiBaseUrl
 * @returns {Promise<Object>}
 */
export async function fetchPersonalizedRecommendations(apiBaseUrl = API_BASE_URL) {
  try {
    const authHeaders = getAuthHeaders();
    const headers = {
      'Content-Type': 'application/json',
      ...authHeaders,
    };

    const res = await fetch(`${apiBaseUrl}/api/auth/recommendations`, { headers });
    if (!res.ok) throw new Error('Failed to fetch recommendations');
    const result = await res.json();
    if (result.success) {
      const data = result.data || result;
      return {
        isPersonalized: data.isPersonalized ?? false,
        hasListeningHistory: data.hasListeningHistory ?? (data.totalListens > 0 || (data.forYouMix && data.forYouMix.length > 0)),
        totalListens: data.totalListens || 0,
        username: data.username || (currentUser.value?.displayName || currentUser.value?.username || 'Bạn'),
        forYouMix: data.forYouMix || [],
        genrePlaylists: data.genrePlaylists || [],
        frequentlyPlayed: data.frequentlyPlayed || [],
        recentlyPlayed: data.recentlyPlayed || [],
        customPlaylists: data.customPlaylists || [],
        tasteSummary: data.tasteSummary || { dominantGenre: '', genreDistribution: [], topArtists: [] },
        starterTracks: data.starterTracks || [],
      };
    }
  } catch (err) {
    console.warn('[Fetch Personalized Recommendations Notice]:', err.message);
  }

  return {
    isPersonalized: false,
    hasListeningHistory: false,
    totalListens: 0,
    forYouMix: [],
    genrePlaylists: [],
    frequentlyPlayed: [],
    recentlyPlayed: [],
    customPlaylists: [],
    tasteSummary: { dominantGenre: '', genreDistribution: [], topArtists: [] },
    starterTracks: [],
  };
}

/**
 * Scores candidate songs with STRICT Beat Gốc vs Remix continuity check
 * @param {Object} currentSong
 * @param {Array} allSongs
 * @param {string|null} userId
 * @returns {Array<{ song: Object, score: number, matchReason: string, matchPercent: number, genreInfo: Object, isCloud: boolean }>}
 */
export function getRecommendedSongs(currentSong, allSongs, userId = null) {
  if (!Array.isArray(allSongs) || allSongs.length === 0) return [];

  const profile = getUserTasteProfile(userId);
  const currentGenreInfo = currentSong ? detectSongGenre(currentSong) : null;
  const currentIdentifier = currentSong ? (currentSong._id || currentSong.title) : null;
  const isCurrentRemix = currentSong ? isSongRemix(currentSong) : false;

  const maxGenreScore = Math.max(...Object.values(profile.genreScores), 10);

  const scored = allSongs.map((song) => {
    const songId = song._id || song.title;
    const isCurrent = songId === currentIdentifier;
    const songGenreInfo = detectSongGenre(song);
    const isCandidateRemix = isSongRemix(song);

    if (isCurrent) {
      return {
        song,
        score: -9999,
        matchReason: 'Đang phát',
        matchPercent: 0,
        genreInfo: songGenreInfo,
        isCloud: !!song.isOnline,
      };
    }

    let score = 0;
    let reasons = [];

    // CRITICAL: STRICT BEAT GỐC vs REMIX CONTINUITY
    if (!isCurrentRemix && isCandidateRemix) {
      // User is listening to Original Beat -> NEVER jump into Remix/Vinahouse!
      score -= 800;
      reasons.push('Khác phong cách (Bản Remix)');
    } else if (isCurrentRemix && !isCandidateRemix) {
      // User is listening to Remix party -> penalize slow/quiet original tracks
      score -= 300;
      reasons.push('Khác phong cách (Bản Gốc)');
    } else if (!isCurrentRemix && !isCandidateRemix) {
      // Both are Original Beats -> High continuity match!
      score += 55;
      reasons.push(`Cùng phong cách Bản Gốc (${songGenreInfo.genre})`);
    } else if (isCurrentRemix && isCandidateRemix) {
      // Both are Remixes -> High continuity match!
      score += 55;
      reasons.push(`Cùng phong cách Remix sôi động`);
    }

    // 1. Genre Specific Affinity
    if (currentGenreInfo && songGenreInfo.genre === currentGenreInfo.genre) {
      score += 35;
      reasons.push(`Cùng thể loại ${songGenreInfo.genre}`);
    }

    // 2. User Account Historical Taste Affinity
    const userGenreScore = profile.genreScores[songGenreInfo.genre] || 0;
    const normalizedTasteAffinity = (userGenreScore / maxGenreScore) * 30;
    score += normalizedTasteAffinity;
    if (userGenreScore >= maxGenreScore * 0.7) {
      reasons.push(`Khớp gu nghe của bạn`);
    }

    // 3. Artist Affinity
    const artist = (song.artist || '').trim();
    if (artist && profile.favoriteArtists[artist]) {
      score += 25;
      reasons.push(`Cùng ca sĩ / DJ bạn thích (${artist})`);
    }

    // 4. Anti-Repeat Penalty (within last 5 tracks)
    const recentIndex = profile.recentHistory.indexOf(songId);
    if (recentIndex !== -1) {
      const penalty = (15 - recentIndex) * 8;
      score -= penalty;
    }

    const matchPercent = Math.min(99, Math.max(50, Math.round(50 + (score / 150) * 45)));

    return {
      song,
      score,
      matchReason: reasons.length > 0 ? reasons[0] : 'Đề xuất tương tự',
      matchPercent,
      genreInfo: songGenreInfo,
      isCloud: !!song.isOnline,
    };
  });

  return scored
    .filter((item) => item.score > -200)
    .sort((a, b) => b.score - a.score);
}

/**
 * Returns the single best next song to autoplay (strictly adhering to Beat Gốc vs Remix)
 * @param {Object} currentSong
 * @param {Array} allSongs
 * @param {string|null} userId
 * @returns {{ song: Object, index: number, reason: string, matchPercent: number, genreInfo: Object } | null}
 */
export function getNextAutoplaySong(currentSong, allSongs, userId = null) {
  if (!Array.isArray(allSongs) || allSongs.length === 0) return null;

  const recommendations = getRecommendedSongs(currentSong, allSongs, userId);
  if (recommendations.length === 0) return null;

  const best = recommendations[0];
  const foundIdx = allSongs.findIndex((s) => (s._id && best.song._id ? s._id === best.song._id : s.title === best.song.title));

  return {
    song: best.song,
    index: foundIdx !== -1 ? foundIdx : 0,
    reason: best.matchReason,
    matchPercent: best.matchPercent,
    genreInfo: best.genreInfo,
  };
}

/**
 * Fetches real related cloud tracks with strict Beat Gốc / Remix filter
 * @param {Object} currentSong
 * @param {string} apiBaseUrl
 * @returns {Promise<Array<Object>>}
 */
export async function fetchOnlineRelatedTracks(currentSong, apiBaseUrl = API_BASE_URL) {
  try {
    const title = currentSong?.title || '';
    const artist = currentSong?.artist || '';
    const songId = currentSong?._id || '';
    const detected = detectSongGenre(currentSong);
    const genre = currentSong?.genre || detected.genre;
    const isRemix = currentSong?.isRemix !== undefined ? currentSong.isRemix : detected.isRemix;

    const url = `${apiBaseUrl}/api/songs/related?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}&genre=${encodeURIComponent(genre)}&isRemix=${isRemix}&songId=${encodeURIComponent(songId)}`;
    const res = await fetch(url);
    if (!res.ok) return [];

    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      return data.data;
    }
  } catch (err) {
    console.warn('[Online Related Discovery Error]:', err.message);
  }
  return [];
}
