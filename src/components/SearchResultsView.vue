<template>
  <div class="search-results-page">
    <!-- Ambient Background Glows -->
    <div class="search-ambient-glow glow-1"></div>
    <div class="search-ambient-glow glow-2"></div>

    <div class="search-results-wrapper">
      <!-- 1. Hero Search Header Banner -->
      <section class="search-hero-banner">
        <div class="search-hero-content">
          <div class="search-badge-row">
            <span class="search-type-badge">
              <span class="pulse-dot"></span>
              KHÁM PHÁ ÂM NHẠC TOÀN DIỆN
            </span>
            <span class="results-count-pill">{{ searchTracks.length }} Bài Hát Liên Quan</span>
          </div>

          <h1 class="search-hero-title">
            Kết quả tìm kiếm: <span class="highlight-txt">“{{ query }}”</span>
          </h1>
          <p class="search-hero-desc">
            Danh sách tất cả các bài hát gốc, bản phối Remix, Acoustic, Lofi và các ca khúc liên quan từ SoundCloud, YouTube & Thư viện AuraMusic.
          </p>

          <!-- Action Bar: Play All + Filter Pills -->
          <div class="search-toolbar">
            <button
              class="btn-play-all-search"
              :disabled="!searchTracks || searchTracks.length === 0"
              @click="handlePlayAll"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>Phát Tất Cả ({{ searchTracks.length }} Bài)</span>
            </button>

            <!-- Filter Pills -->
            <div class="filter-pills-scroll">
              <button
                v-for="filter in filterOptions"
                :key="filter.id"
                class="filter-chip-btn"
                :class="{ active: selectedFilter === filter.id }"
                @click="selectedFilter = filter.id"
              >
                <span>{{ filter.icon }}</span>
                <span>{{ filter.label }}</span>
                <span v-if="filter.id === 'all'" class="chip-count">{{ searchTracks.length }}</span>
                <span v-else-if="getFilteredCount(filter.id)" class="chip-count">{{ getFilteredCount(filter.id) }}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. Loading State -->
      <div v-if="isLoading" class="search-loading-box">
        <div class="loading-spinner-ring"></div>
        <p class="loading-title">Đang quét tìm tất cả bài hát liên quan...</p>
        <span class="loading-sub">Tổng hợp dữ liệu âm nhạc từ SoundCloud, YouTube Music & Kho bài hát cá nhân</span>
      </div>

      <!-- 3. Empty State -->
      <div v-else-if="filteredTracks.length === 0" class="search-empty-box">
        <div class="empty-glow-icon">🔍</div>
        <h3 class="empty-title">Không tìm thấy bài hát nào cho "{{ query }}"</h3>
        <p class="empty-desc">
          Hãy thử tìm kiếm với từ khóa khác như tên ca sĩ, tên bài hát hoặc bản phối (Remix, Lofi, Acoustic).
        </p>
      </div>

      <!-- 4. Modern High-Tech Search Track Cards List -->
      <div v-else class="search-track-grid">
        <div
          v-for="(track, idx) in filteredTracks"
          :key="track._id || idx"
          class="track-card-row"
          :class="{ 'is-active-playing': track._id === currentSongId && isPlaying }"
          :style="{ animationDelay: `${Math.min(idx * 30, 300)}ms` }"
          @click="handlePlayTrack(track)"
        >
          <!-- Left: Cover Artwork with Hover Play Pulse -->
          <div class="track-artwork-box">
            <img
              v-if="track.coverImage"
              :src="formatMediaUrl(track.coverImage)"
              :alt="track.title"
              class="track-cover-img"
              @error="handleImgFallback"
            />
            <div v-else class="track-cover-fallback">🎵</div>

            <div class="track-hover-overlay" :class="{ 'is-playing-overlay': track._id === currentSongId && isPlaying }">
              <div class="play-circle-btn">
                <svg v-if="track._id === currentSongId && isPlaying" viewBox="0 0 24 24" width="22" height="22" fill="#090b10">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" width="22" height="22" fill="#090b10">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>

            <!-- Rank index indicator -->
            <span class="track-rank-badge">#{{ idx + 1 }}</span>
          </div>

          <!-- Middle: Track Details & Sound Waveform -->
          <div class="track-content-col">
            <div class="track-header-meta">
              <div class="title-and-artist">
                <h3 class="track-main-title" :title="track.title">{{ track.title }}</h3>
                <div class="artist-badge-row">
                  <span class="artist-name-txt">{{ track.artist || 'Nghệ Sĩ' }}</span>
                  <span v-if="isRemixTrack(track.title)" class="genre-tag tag-remix">REMIX / EDM 🔥</span>
                  <span v-else-if="isAcousticTrack(track.title)" class="genre-tag tag-acoustic">ACOUSTIC 🍃</span>
                  <span v-else class="genre-tag tag-official">OFFICIAL ✦</span>
                  <span v-if="track.isLocal" class="source-tag source-local">Local DB</span>
                  <span v-else class="source-tag source-cloud">SoundCloud HD</span>
                </div>
              </div>

              <!-- Time Uploaded -->
              <span class="track-upload-time">{{ track.timeAgo || 'Gần đây' }}</span>
            </div>

            <!-- SoundCloud-Style High-Tech Waveform Audio Bars -->
            <div class="track-waveform-bar-wrapper">
              <div class="waveform-bars-flex">
                <span
                  v-for="(height, bIdx) in (track.waveform || defaultWaveform)"
                  :key="bIdx"
                  class="single-wave-bar"
                  :style="{ height: `${height}%` }"
                ></span>
              </div>
              <span class="waveform-duration-badge">{{ formatDuration(track.duration) }}</span>
            </div>

            <!-- Social Metrics Row -->
            <div class="track-metrics-bar">
              <div class="metrics-left">
                <span class="metric-item" title="Lượt nghe">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  {{ track.playbackCount || '2.4M' }} lượt nghe
                </span>
                <span class="metric-item" title="Lượt thích">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  {{ track.likeCount || '18.5K' }}
                </span>
                <span class="metric-item" title="Lượt chia sẻ">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                  </svg>
                  {{ track.repostCount || '420' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Right: Direct Action Buttons -->
          <div class="track-actions-col" @click.stop>
            <button
              class="action-pill-btn btn-play-now"
              title="Phát bài này ngay lập tức"
              @click="handlePlayTrack(track)"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>Phát Ngay</span>
            </button>

            <button
              class="action-icon-btn btn-like-track"
              :class="{ 'is-liked': isTrackLiked(track._id) }"
              :title="isTrackLiked(track._id) ? 'Bỏ thích' : 'Thêm vào yêu thích'"
              @click="handleToggleLike(track)"
            >
              <svg viewBox="0 0 24 24" width="17" height="17" :fill="isTrackLiked(track._id) ? '#ff007f' : 'currentColor'">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </button>

            <button
              class="action-icon-btn btn-add-pl"
              title="Thêm vào Playlist riêng"
              @click="$emit('add-to-playlist', track)"
            >
              <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
                <path d="M14 10H2v2h12v-2zm0-4H2v2h12V6zm4 8v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM2 16h8v-2H2v2z"/>
              </svg>
            </button>

            <button
              class="action-icon-btn btn-share-track"
              title="Chia sẻ bài hát 🔗"
              @click="$emit('share-song', track)"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { API_BASE_URL } from '../config/api.js';

const props = defineProps({
  query: {
    type: String,
    default: '',
  },
  searchTracks: {
    type: Array,
    default: () => [],
  },
  searchPlaylists: {
    type: Array,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  favoriteSongIds: {
    type: Set,
    default: () => new Set(),
  },
  currentSongId: {
    type: String,
    default: '',
  },
  isPlaying: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['play-track', 'open-player-track', 'toggle-favorite', 'add-to-playlist', 'share-song']);

const selectedFilter = ref('all');

const filterOptions = [
  { id: 'all', label: 'Tất Cả', icon: '🎧' },
  { id: 'remix', label: 'Remix / Vinahouse', icon: '⚡' },
  { id: 'mix', label: 'Viet Mix / Nonstop', icon: '🔥' },
  { id: 'acoustic', label: 'Acoustic / Chill', icon: '🍃' },
  { id: 'local', label: 'Kho Nhạc Local', icon: '💾' },
  { id: 'cloud', label: 'Cloud HD', icon: '☁️' },
];

const defaultWaveform = [
  30, 45, 60, 80, 50, 40, 75, 90, 100, 85, 70, 60, 40, 30, 50, 80, 95, 85, 60, 40,
  35, 60, 75, 90, 80, 65, 50, 70, 85, 90, 60, 45, 55, 70, 85, 75, 60, 40, 50, 65,
  80, 95, 70, 55, 40, 30, 20, 15, 30, 50, 70, 85
];

function isMixTrack(title = '', duration = 0) {
  return duration > 600 || /viet mix|nonstop|dj set|club mix|full \d+h|tổng hợp \d+|liên khúc/i.test(title);
}

function isRemixTrack(title = '') {
  return /remix|vinahouse|club|edm|dj|bass/i.test(title);
}

function isAcousticTrack(title = '') {
  return /acoustic|chill|lofi|piano|guitar|ballad|cover/i.test(title);
}

function getFilteredCount(filterId) {
  if (!props.searchTracks) return 0;
  if (filterId === 'remix') return props.searchTracks.filter((t) => isRemixTrack(t.title)).length;
  if (filterId === 'mix') return props.searchTracks.filter((t) => isMixTrack(t.title, t.duration)).length;
  if (filterId === 'acoustic') return props.searchTracks.filter((t) => isAcousticTrack(t.title)).length;
  if (filterId === 'local') return props.searchTracks.filter((t) => t.isLocal).length;
  if (filterId === 'cloud') return props.searchTracks.filter((t) => !t.isLocal).length;
  return props.searchTracks.length;
}

const filteredTracks = computed(() => {
  if (!props.searchTracks) return [];
  if (selectedFilter.value === 'all') return props.searchTracks;
  if (selectedFilter.value === 'remix') return props.searchTracks.filter((t) => isRemixTrack(t.title));
  if (selectedFilter.value === 'mix') return props.searchTracks.filter((t) => isMixTrack(t.title, t.duration));
  if (selectedFilter.value === 'acoustic') return props.searchTracks.filter((t) => isAcousticTrack(t.title));
  if (selectedFilter.value === 'local') return props.searchTracks.filter((t) => t.isLocal);
  if (selectedFilter.value === 'cloud') return props.searchTracks.filter((t) => !t.isLocal);
  return props.searchTracks;
});

function formatMediaUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

function handleImgFallback(e) {
  e.target.style.display = 'none';
}

function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '03:45';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

function isTrackLiked(trackId) {
  return props.favoriteSongIds ? props.favoriteSongIds.has(trackId) : false;
}

function handlePlayTrack(track) {
  emit('play-track', track, filteredTracks.value);
}

function handlePlayAll() {
  if (filteredTracks.value.length > 0) {
    emit('play-track', filteredTracks.value[0], filteredTracks.value);
  }
}

function handleToggleLike(track) {
  emit('toggle-favorite', track);
}
</script>

<style scoped>
.search-results-page {
  position: relative;
  width: 100%;
  min-height: calc(100vh - 72px);
  background: #080a10;
  color: #ffffff;
  padding: 2rem 2rem 6rem;
  box-sizing: border-box;
  overflow: hidden;
}

/* Ambient Glows */
.search-ambient-glow {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(120px);
  z-index: 0;
}

.glow-1 {
  top: 5%;
  left: 10%;
  width: 450px;
  height: 450px;
  background: rgba(0, 242, 254, 0.08);
}

.glow-2 {
  top: 30%;
  right: 5%;
  width: 500px;
  height: 500px;
  background: rgba(157, 78, 221, 0.07);
}

.search-results-wrapper {
  position: relative;
  z-index: 1;
  max-width: 1280px;
  margin: 0 auto;
}

/* Hero Search Header Banner */
.search-hero-banner {
  background: linear-gradient(135deg, rgba(16, 22, 38, 0.8) 0%, rgba(10, 14, 24, 0.9) 100%);
  border: 1px solid rgba(0, 242, 254, 0.2);
  border-radius: 24px;
  padding: 2.2rem 2.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), inset 0 0 30px rgba(0, 242, 254, 0.04);
  backdrop-filter: blur(20px);
}

.search-badge-row {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 0.85rem;
}

.search-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  background: rgba(0, 242, 254, 0.12);
  border: 1px solid rgba(0, 242, 254, 0.3);
  color: #00f2fe;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.06em;
}

.pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #00f2fe;
  box-shadow: 0 0 8px #00f2fe;
  animation: pulse-glow 1.5s infinite;
}

.results-count-pill {
  font-size: 0.75rem;
  font-weight: 700;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
}

.search-hero-title {
  font-size: 2.2rem;
  font-weight: 900;
  color: #ffffff;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.02em;
  line-height: 1.25;
}

.highlight-txt {
  background: linear-gradient(135deg, #00f2fe 0%, #a855f7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.search-hero-desc {
  font-size: 0.92rem;
  color: #94a3b8;
  margin: 0 0 1.5rem 0;
  max-width: 800px;
  line-height: 1.5;
}

.search-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
  flex-wrap: wrap;
  padding-top: 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.btn-play-all-search {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.75rem 1.6rem;
  border-radius: 14px;
  background: linear-gradient(135deg, #00f2fe 0%, #3b82f6 100%);
  color: #08090d;
  font-size: 0.92rem;
  font-weight: 900;
  border: none;
  cursor: pointer;
  box-shadow: 0 6px 25px rgba(0, 242, 254, 0.35);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-play-all-search:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.02);
  filter: brightness(1.15);
  box-shadow: 0 10px 35px rgba(0, 242, 254, 0.5);
}

.filter-pills-scroll {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-chip-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 0.95rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.09);
  color: #cbd5e1;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.filter-chip-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.2);
}

.filter-chip-btn.active {
  background: rgba(0, 242, 254, 0.15);
  border-color: #00f2fe;
  color: #00f2fe;
}

.chip-count {
  font-size: 0.72rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.1rem 0.45rem;
  border-radius: 999px;
}

/* Track Grid / Rows */
.search-track-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.track-card-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: rgba(14, 18, 28, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 20px;
  padding: 1.15rem 1.4rem;
  backdrop-filter: blur(16px);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  animation: slide-up 0.4s ease forwards;
}

.track-card-row:hover {
  background: rgba(20, 26, 42, 0.95);
  border-color: rgba(0, 242, 254, 0.4);
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.6), 0 0 25px rgba(0, 242, 254, 0.12);
}

/* Cover Artwork */
.track-artwork-box {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 16px;
  overflow: hidden;
  background: #181d2c;
  flex-shrink: 0;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
}

.track-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.track-card-row:hover .track-cover-img {
  transform: scale(1.08);
}

.track-cover-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
}

.track-hover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.track-card-row:hover .track-hover-overlay {
  opacity: 1;
}

.play-circle-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #00f2fe;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0, 242, 254, 0.6);
  transform: scale(0.85);
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.track-card-row:hover .play-circle-btn {
  transform: scale(1);
}

.track-rank-badge {
  position: absolute;
  top: 6px;
  left: 6px;
  font-size: 0.65rem;
  font-weight: 800;
  background: rgba(0, 0, 0, 0.7);
  color: #00f2fe;
  padding: 2px 6px;
  border-radius: 6px;
}

/* Middle Content */
.track-content-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.track-header-meta {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.title-and-artist {
  flex: 1;
  min-width: 0;
}

.track-main-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.01em;
  transition: color 0.2s;
}

.track-card-row:hover .track-main-title {
  color: #00f2fe;
}

.artist-badge-row {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  flex-wrap: wrap;
}

.artist-name-txt {
  font-size: 0.85rem;
  font-weight: 600;
  color: #94a3b8;
}

.genre-tag {
  font-size: 0.68rem;
  font-weight: 800;
  padding: 0.15rem 0.55rem;
  border-radius: 6px;
}

.tag-remix {
  background: rgba(255, 85, 0, 0.15);
  color: #ff5500;
  border: 1px solid rgba(255, 85, 0, 0.35);
}

.tag-acoustic {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.35);
}

.tag-official {
  background: rgba(0, 242, 254, 0.12);
  color: #00f2fe;
  border: 1px solid rgba(0, 242, 254, 0.3);
}

.source-tag {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.06);
  color: #cbd5e1;
}

.track-upload-time {
  font-size: 0.75rem;
  color: #64748b;
  white-space: nowrap;
}

/* Audio Waveform */
.track-waveform-bar-wrapper {
  position: relative;
  height: 38px;
  background: rgba(6, 8, 14, 0.6);
  border-radius: 10px;
  padding: 0 0.6rem;
  display: flex;
  align-items: center;
}

.waveform-bars-flex {
  display: flex;
  align-items: center;
  gap: 2px;
  height: 100%;
  flex: 1;
}

.single-wave-bar {
  flex: 1;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  min-height: 4px;
  transition: all 0.2s ease;
}

.track-card-row:hover .single-wave-bar {
  background: linear-gradient(180deg, #00f2fe 0%, #3b82f6 100%);
}

.waveform-duration-badge {
  position: absolute;
  right: 8px;
  bottom: 4px;
  font-size: 0.7rem;
  font-weight: 800;
  color: #94a3b8;
  background: rgba(0, 0, 0, 0.7);
  padding: 1px 5px;
  border-radius: 4px;
  font-family: monospace;
}

/* Metrics */
.track-metrics-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.metrics-left {
  display: flex;
  align-items: center;
  gap: 1.15rem;
}

.metric-item {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.76rem;
  color: #64748b;
  font-weight: 600;
}

/* Right Actions Column */
.track-actions-col {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.btn-play-now {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.6rem 1.1rem;
  border-radius: 12px;
  background: rgba(0, 242, 254, 0.12);
  border: 1px solid rgba(0, 242, 254, 0.35);
  color: #00f2fe;
  font-size: 0.84rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-play-now:hover {
  background: #00f2fe;
  color: #08090d;
  box-shadow: 0 4px 18px rgba(0, 242, 254, 0.45);
  transform: translateY(-1px);
}

.action-icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.action-icon-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  transform: scale(1.08);
}

.btn-like-track.is-liked {
  color: #ff007f;
  background: rgba(255, 0, 127, 0.15);
  border-color: rgba(255, 0, 127, 0.4);
}

/* Loading & Empty States */
.search-loading-box, .search-empty-box {
  background: rgba(14, 18, 28, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 5rem 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.loading-spinner-ring {
  width: 46px;
  height: 46px;
  border: 4px solid rgba(0, 242, 254, 0.15);
  border-top-color: #00f2fe;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1.25rem;
}

.loading-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 0.35rem 0;
}

.loading-sub {
  font-size: 0.85rem;
  color: #64748b;
}

.empty-glow-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.3rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 0.5rem 0;
}

.empty-desc {
  font-size: 0.88rem;
  color: #94a3b8;
  max-width: 500px;
  margin: 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse-glow {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.4); opacity: 1; }
}

@media (max-width: 768px) {
  .search-hero-banner {
    padding: 1.5rem;
  }
  .track-card-row {
    flex-direction: column;
    align-items: flex-start;
    padding: 1.2rem;
  }
  .track-actions-col {
    width: 100%;
    justify-content: flex-end;
  }
  .track-artwork-box {
    width: 100%;
    height: 180px;
  }
}
</style>
