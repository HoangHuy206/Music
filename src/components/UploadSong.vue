<template>
  <div class="minimal-upload-wrapper">
    <div class="upload-modal-card">
      <!-- Title Header -->
      <div class="header-section">
        <div class="upload-badge">
          <span class="badge-dot"></span>
          <span>AURA STUDIO v2.5 • AI AUDIO PIPELINE</span>
        </div>
        <h2 class="title">Tải Lên Bài Hát Của Bạn</h2>
        <p class="subtitle">
          Tải lên bản nhạc của bạn để phân tích tự động, lưu vào kho bài hát cá nhân và chia sẻ cho cộng đồng cùng tìm kiếm.
        </p>
      </div>

      <!-- Account Binding Status Banner -->
      <div v-if="currentUser" class="user-account-banner">
        <div class="uab-left">
          <div class="uab-avatar">
            <img
              v-if="currentUser.avatar"
              :src="formatMediaUrl(currentUser.avatar)"
              :alt="currentUser.displayName || currentUser.username"
              class="uab-img"
              referrerpolicy="no-referrer"
            />
            <span v-else class="uab-initial">{{ (currentUser.displayName || currentUser.username || 'U')[0].toUpperCase() }}</span>
          </div>
          <div class="uab-info">
            <span class="uab-status-txt">Đang tải lên bằng tài khoản:</span>
            <h4 class="uab-name">{{ currentUser.displayName || currentUser.username }} <span class="uab-tag">Kho Cá Nhân</span></h4>
          </div>
        </div>
        <div class="uab-badge-right">
          <span>Tự động lưu vào Hồ Sơ & Tìm kiếm công khai ✓</span>
        </div>
      </div>
      <div v-else class="guest-warning-banner">
        <span class="gwb-icon">⚠️</span>
        <div class="gwb-content">
          <strong>Bạn chưa đăng nhập:</strong> Hãy đăng nhập để bài hát được lưu vào <em>Kho Bài Hát Của Tôi</em> và quản lý bất kỳ lúc nào.
        </div>
      </div>

      <!-- Success Alert -->
      <div v-if="successMessage" class="alert alert-success">
        <span class="alert-icon">✓</span>
        <div class="alert-body">
          <p class="alert-title">Tải Lên Thành Công!</p>
          <p class="alert-desc">{{ successMessage }}</p>
          <div class="alert-actions">
            <button type="button" class="alert-btn-action" @click="$emit('navigate', 'profile')">
              <span>Xem Trong Kho Bài Hát</span>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Error Alert -->
      <div v-if="errorMessage" class="alert alert-error">
        <span class="alert-icon">✕</span>
        <div class="alert-body">
          <p class="alert-title">Tải Lên Thất Bại</p>
          <p class="alert-desc">{{ errorMessage }}</p>
        </div>
      </div>

      <form class="drop-zones-form" @submit.prevent="submitForm">
        <!-- 1. Two Drag & Drop Zones (Audio & Cover) -->
        <div class="drop-zones-grid">
          <!-- Audio Drop Zone -->
          <div
            class="drop-zone"
            :class="{ 'is-active': isAudioDragging, 'has-file': audioFile }"
            @dragover.prevent="isAudioDragging = true"
            @dragleave.prevent="isAudioDragging = false"
            @drop.prevent="handleAudioDrop"
          >
            <input
              type="file"
              class="hidden-input"
              accept="audio/*,video/mp4"
              @change="handleAudioChange"
            />

            <div class="zone-content">
              <div class="icon-circle audio-icon">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 18V5l12-2v13"></path>
                  <circle cx="6" cy="18" r="3"></circle>
                  <circle cx="18" cy="16" r="3"></circle>
                </svg>
              </div>

              <div class="zone-info">
                <h3 class="zone-title">
                  {{ audioFile ? audioFile.name : 'Tệp Âm Thanh / Video' }}
                </h3>
                <p class="zone-desc">
                  {{ audioFile ? `${(audioFile.size / (1024 * 1024)).toFixed(2)} MB • Sẵn sàng tải lên` : 'Thả MP3 / MP4 / WAV hoặc bấm để chọn' }}
                </p>
              </div>

              <span v-if="audioFile" class="status-pill ready">Đã chọn ✓</span>
              <span v-else class="status-pill required">Bắt buộc</span>
            </div>
          </div>

          <!-- Cover Image Drop Zone -->
          <div
            class="drop-zone"
            :class="{ 'is-active': isImageDragging, 'has-file': coverImage }"
            @dragover.prevent="isImageDragging = true"
            @dragleave.prevent="isImageDragging = false"
            @drop.prevent="handleImageDrop"
          >
            <input
              type="file"
              class="hidden-input"
              accept="image/*"
              @change="handleImageChange"
            />

            <div class="zone-content">
              <div v-if="coverImagePreview" class="image-preview-container">
                <img :src="coverImagePreview" alt="Cover Preview" class="preview-img" />
              </div>
              <div v-else class="icon-circle image-icon">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
              </div>

              <div class="zone-info">
                <h3 class="zone-title">
                  {{ coverImage ? coverImage.name : 'Ảnh Bìa Album / Track' }}
                </h3>
                <p class="zone-desc">
                  {{ coverImage ? 'Đã nạp ảnh bìa' : 'Thả ảnh JPG/PNG/WEBP hoặc để trống dùng đĩa Vinyl mặc định' }}
                </p>
              </div>

              <span v-if="coverImage" class="status-pill ready">Đã chọn ✓</span>
              <span v-else class="status-pill optional">Tùy chọn</span>
            </div>
          </div>
        </div>

        <!-- 2. Song Metadata: Title, Artist / Author & Genre -->
        <div class="metadata-form-grid">
          <!-- Song Title Field -->
          <div class="form-group-field">
            <label class="field-label" for="song-title-input">
              <span>Tên Bài Hát</span>
              <span class="required-star">*</span>
            </label>
            <div class="input-with-icon">
              <span class="input-icon">🎵</span>
              <input
                id="song-title-input"
                v-model="songTitle"
                type="text"
                class="form-text-input"
                placeholder="Nhập tên bài hát (VD: Cắt Đôi Nỗi Sầu, Bước Qua Nhau...)"
                required
              />
            </div>
          </div>

          <!-- Song Artist / Author Field -->
          <div class="form-group-field">
            <label class="field-label" for="song-artist-input">
              <span>Tên Tác Giả / Ca Sĩ / Producer</span>
              <span class="required-star">*</span>
            </label>
            <div class="input-with-icon">
              <span class="input-icon">🎤</span>
              <input
                id="song-artist-input"
                v-model="songArtist"
                type="text"
                class="form-text-input"
                placeholder="Nhập tên ca sĩ, tác giả (VD: Sơn Tùng M-TP, Vũ., Đen Vâu...)"
                required
              />
            </div>
          </div>

          <!-- Genre Selection Field -->
          <div class="form-group-field full-width-field">
            <label class="field-label" for="song-genre-select">
              <span>Thể Loại Âm Nhạc</span>
              <span class="optional-tag">Đề xuất tự động</span>
            </label>
            <div class="input-with-icon">
              <span class="input-icon">🎧</span>
              <select id="song-genre-select" v-model="songGenre" class="form-text-input form-select-input">
                <option value="Nhạc Trẻ / Pop (Bản Gốc)">✨ Nhạc Trẻ / Pop (Bản Gốc)</option>
                <option value="Ballad / Pop (Bản Gốc)">💖 Ballad / Pop (Bản Gốc)</option>
                <option value="Chill / Lofi (Bản Gốc)">☕ Chill / Lofi (Bản Gốc)</option>
                <option value="Rap / Hiphop (Bản Gốc)">🎤 Rap / Hiphop (Bản Gốc)</option>
                <option value="Remix / Vinahouse">⚡ Remix / Vinahouse</option>
                <option value="EDM / Dance">🔥 EDM / Electronic Dance</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 3. Optional Lyrics Textarea -->
        <div class="lyrics-input-group">
          <div class="lyrics-label-bar">
            <label for="lyrics-field" class="lyrics-label">
              <span>Lời Bài Hát Đồng Bộ Realtime (JSON Array)</span>
              <span class="optional-tag">Tự động nhận diện qua Groq AI Whisper</span>
            </label>
            <button
              type="button"
              class="template-helper-btn"
              @click="insertSampleLyrics"
            >
              Dán Mẫu Lời Nhạc
            </button>
          </div>

          <textarea
            id="lyrics-field"
            v-model="lyricsInput"
            rows="3"
            class="lyrics-textarea"
            placeholder='[
  { "time": 0.0, "text": "♪ (Giai điệu mở đầu) ♪" },
  { "time": 8.5, "text": "Dòng lời bài hát đầu tiên..." }
]'
          ></textarea>
          <span class="lyrics-hint">
            💡 Để trống nếu muốn hệ thống AI Whisper tự động phân tích và tạo lời khớp từng giây từ tệp âm thanh.
          </span>
        </div>

        <!-- 4. Submit Button -->
        <button
          type="submit"
          class="upload-submit-btn"
          :disabled="isSubmitting || !audioFile || !songTitle.trim() || !songArtist.trim()"
        >
          <span v-if="isSubmitting" class="btn-spinner"></span>
          <span>{{ isSubmitting ? 'Đang Tải Lên & Xử Lý AI...' : 'Tải Lên Bài Hát Ngay' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { currentUser, getAuthHeaders } from '../utils/auth.js';
import { showToast } from '../utils/toast.js';
import { API_BASE_URL } from '../config/api.js';

const emit = defineEmits(['songUploaded', 'navigate']);

const API_URL = `${API_BASE_URL}/api/songs`;

function formatMediaUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

// Form Fields
const songTitle = ref('');
const songArtist = ref('');
const songGenre = ref('Nhạc Trẻ / Pop (Bản Gốc)');

// Files
const audioFile = ref(null);
const coverImage = ref(null);
const coverImagePreview = ref(null);

// Optional Lyrics input
const lyricsInput = ref('');

// Drag states
const isAudioDragging = ref(false);
const isImageDragging = ref(false);

// Status states
const isSubmitting = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

/**
 * Intelligently parse Title, Artist and Genre from raw file name
 */
function extractMetadataFromFilename(filename) {
  if (!filename) return;
  const cleanName = filename.replace(/\.[^/.]+$/, '').trim();

  // Check if filename has "Artist - Title" or "Title - Artist"
  if (cleanName.includes(' - ')) {
    const parts = cleanName.split(' - ');
    if (parts.length >= 2) {
      songArtist.value = parts[0].trim();
      songTitle.value = parts.slice(1).join(' - ').trim();
    } else {
      songTitle.value = cleanName;
    }
  } else if (cleanName.includes('_-_')) {
    const parts = cleanName.split('_-_');
    songArtist.value = parts[0].replace(/_/g, ' ').trim();
    songTitle.value = parts.slice(1).join(' - ').replace(/_/g, ' ').trim();
  } else {
    songTitle.value = cleanName;
    if (!songArtist.value && currentUser.value) {
      songArtist.value = currentUser.value.displayName || currentUser.value.username;
    }
  }

  // Auto-detect genre from keywords
  const lower = cleanName.toLowerCase();
  if (lower.includes('remix') || lower.includes('vinahouse') || lower.includes('nonstop') || lower.includes('viet mix')) {
    songGenre.value = 'Remix / Vinahouse';
  } else if (lower.includes('edm') || lower.includes('dance') || lower.includes('bounce')) {
    songGenre.value = 'EDM / Dance';
  } else if (lower.includes('ballad') || lower.includes('acoustic') || lower.includes('cover')) {
    songGenre.value = 'Ballad / Pop (Bản Gốc)';
  } else if (lower.includes('lofi') || lower.includes('chill') || lower.includes('suy')) {
    songGenre.value = 'Chill / Lofi (Bản Gốc)';
  } else if (lower.includes('rap') || lower.includes('hiphop') || lower.includes('cypher')) {
    songGenre.value = 'Rap / Hiphop (Bản Gốc)';
  } else {
    songGenre.value = 'Nhạc Trẻ / Pop (Bản Gốc)';
  }
}

// Audio selection
function handleAudioChange(event) {
  const file = event.target.files?.[0];
  if (file) {
    audioFile.value = file;
    extractMetadataFromFilename(file.name);
  }
}

function handleAudioDrop(event) {
  isAudioDragging.value = false;
  const file = event.dataTransfer?.files?.[0];
  if (file && (file.type.startsWith('audio/') || file.type === 'video/mp4')) {
    audioFile.value = file;
    extractMetadataFromFilename(file.name);
  }
}

// Image selection
function handleImageChange(event) {
  const file = event.target.files?.[0];
  if (file) {
    coverImage.value = file;
    coverImagePreview.value = URL.createObjectURL(file);
  }
}

function handleImageDrop(event) {
  isImageDragging.value = false;
  const file = event.dataTransfer?.files?.[0];
  if (file && file.type.startsWith('image/')) {
    coverImage.value = file;
    coverImagePreview.value = URL.createObjectURL(file);
  }
}

// Quick sample template
function insertSampleLyrics() {
  lyricsInput.value = JSON.stringify(
    [
      { time: 0.0, text: '♪ (Giai điệu mở đầu) ♪' },
      { time: 6.5, text: 'Từng hàng cây nghiêng bóng đón đưa em về' },
      { time: 12.0, text: 'Giai điệu êm ái xua tan hết những bộn bề' },
      { time: 18.5, text: 'Nụ cười em luôn thắp sáng trong tim anh' },
      { time: 25.0, text: 'Giữ trọn phút giây này mãi bên nhau' },
    ],
    null,
    2
  );
}

function resetForm() {
  audioFile.value = null;
  coverImage.value = null;
  coverImagePreview.value = null;
  songTitle.value = '';
  songArtist.value = '';
  songGenre.value = 'Nhạc Trẻ / Pop (Bản Gốc)';
  lyricsInput.value = '';
}

async function submitForm() {
  errorMessage.value = '';
  successMessage.value = '';

  if (!audioFile.value) {
    errorMessage.value = 'Vui lòng chọn tệp âm thanh hoặc video (.mp3 / .mp4 / .wav).';
    return;
  }

  const finalTitle = (songTitle.value || '').trim();
  const finalArtist = (songArtist.value || '').trim() || 'Nghệ Sĩ';

  if (!finalTitle) {
    errorMessage.value = 'Vui lòng nhập tên bài hát.';
    return;
  }

  // Process Lyrics
  let finalLyrics = [];
  const trimmedLyrics = lyricsInput.value.trim();

  if (trimmedLyrics) {
    try {
      const parsed = JSON.parse(trimmedLyrics);
      if (!Array.isArray(parsed)) {
        throw new Error('Lời bài hát phải là một mảng JSON: [{ "time": 0, "text": "..." }]');
      }
      finalLyrics = parsed;
    } catch (err) {
      errorMessage.value = `Định dạng JSON lời bài hát không hợp lệ: ${err.message}`;
      return;
    }
  }

  // Construct FormData
  const formData = new FormData();
  formData.append('title', finalTitle);
  formData.append('artist', finalArtist);
  formData.append('genre', songGenre.value);
  formData.append('audioFile', audioFile.value);
  if (coverImage.value) {
    formData.append('coverImage', coverImage.value);
  }
  if (finalLyrics.length > 0) {
    formData.append('lyricsData', JSON.stringify(finalLyrics));
  }
  formData.append(
    'visualizerSettings',
    JSON.stringify({
      type: 'circle',
      color: '#00e5ff',
    })
  );

  isSubmitting.value = true;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || `Lỗi tải lên máy chủ: HTTP ${response.status}`);
    }

    successMessage.value = `Bài hát "${result.data.title}" của ${result.data.artist} đã được lưu vào kho bài hát của bạn và có thể tìm kiếm công khai! ✨`;
    showToast(`Đã tải lên thành công bài hát "${result.data.title}"! 🚀`, 'success');

    // Real-time Event broadcast to update Profile, Home, and Player libraries
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auramusic:song-uploaded', { detail: result.data }));
      window.dispatchEvent(new CustomEvent('auramusic:play-recorded', { detail: result.data }));
    }

    emit('songUploaded', result.data);
    resetForm();
  } catch (err) {
    console.error('[Upload Error]:', err);
    errorMessage.value = err.message || 'Đã có lỗi xảy ra trong quá trình tải lên bài hát.';
    showToast(errorMessage.value, 'error');
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.minimal-upload-wrapper {
  width: 100%;
  max-width: 880px;
  margin: 0 auto;
  padding: 2rem 1.5rem 5rem;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
}

.upload-modal-card {
  background: rgba(14, 18, 28, 0.88);
  backdrop-filter: blur(32px);
  -webkit-backdrop-filter: blur(32px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 28px;
  padding: 2.5rem;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.7), 0 0 40px rgba(0, 242, 254, 0.06);
  color: #ffffff;
}

.header-section {
  text-align: center;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.upload-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.85rem;
  border-radius: 20px;
  background: rgba(0, 242, 254, 0.1);
  border: 1px solid rgba(0, 242, 254, 0.3);
  color: #00f2fe;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.06em;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #00f2fe;
  box-shadow: 0 0 8px #00f2fe;
}

.title {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 1.9rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0;
  color: #ffffff;
}

.subtitle {
  font-size: 0.92rem;
  color: #94a3b8;
  max-width: 620px;
  margin: 0;
  line-height: 1.5;
}

/* User Account Banner */
.user-account-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, rgba(0, 242, 254, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%);
  border: 1px solid rgba(0, 242, 254, 0.25);
  border-radius: 16px;
  padding: 0.85rem 1.25rem;
  margin-bottom: 1.8rem;
  flex-wrap: wrap;
  gap: 0.8rem;
}

.uab-left {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.uab-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  overflow: hidden;
  background: #00f2fe;
  color: #08090d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  box-shadow: 0 0 12px rgba(0, 242, 254, 0.4);
}

.uab-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.uab-status-txt {
  font-size: 0.72rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.uab-name {
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.uab-tag {
  font-size: 0.68rem;
  padding: 0.1rem 0.45rem;
  border-radius: 10px;
  background: rgba(0, 242, 254, 0.2);
  color: #00f2fe;
}

.uab-badge-right {
  font-size: 0.82rem;
  font-weight: 600;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.12);
  padding: 0.35rem 0.8rem;
  border-radius: 20px;
}

.guest-warning-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 14px;
  padding: 0.85rem 1.2rem;
  margin-bottom: 1.8rem;
  color: #fcd34d;
  font-size: 0.88rem;
}

/* Alerts */
.alert {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 1.1rem 1.3rem;
  border-radius: 16px;
  margin-bottom: 1.6rem;
  font-size: 0.92rem;
}

.alert-success {
  background: rgba(16, 185, 129, 0.14);
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: #34d399;
}

.alert-error {
  background: rgba(239, 68, 68, 0.14);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #f87171;
}

.alert-icon {
  font-weight: bold;
  font-size: 1.1rem;
}

.alert-title {
  font-weight: 700;
  margin: 0 0 0.25rem 0;
}

.alert-desc {
  margin: 0;
  opacity: 0.95;
  line-height: 1.4;
}

.alert-actions {
  margin-top: 0.75rem;
}

.alert-btn-action {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(16, 185, 129, 0.25);
  border: 1px solid rgba(16, 185, 129, 0.5);
  color: #fff;
  padding: 0.4rem 0.85rem;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.alert-btn-action:hover {
  background: rgba(16, 185, 129, 0.4);
  transform: translateX(2px);
}

/* Form Styles */
.drop-zones-form {
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
}

.drop-zones-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.3rem;
}

.drop-zone {
  position: relative;
  border: 2px dashed rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  background: rgba(8, 9, 13, 0.6);
  padding: 2rem 1.2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drop-zone:hover,
.drop-zone.is-active {
  border-color: #00f2fe;
  background: rgba(0, 242, 254, 0.06);
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 242, 254, 0.15);
}

.drop-zone.has-file {
  border-color: rgba(0, 242, 254, 0.6);
  background: rgba(0, 242, 254, 0.04);
}

.hidden-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 10;
}

.zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  pointer-events: none;
  width: 100%;
}

.icon-circle {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  color: #00f2fe;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.image-preview-container {
  width: 58px;
  height: 58px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.6);
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.zone-info {
  max-width: 90%;
}

.zone-title {
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0 0 0.2rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #ffffff;
}

.zone-desc {
  font-size: 0.78rem;
  color: #94a3b8;
  margin: 0;
}

.status-pill {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0.2rem 0.65rem;
  border-radius: 20px;
}

.status-pill.required {
  background: rgba(255, 255, 255, 0.06);
  color: #64748b;
}

.status-pill.optional {
  background: rgba(255, 255, 255, 0.04);
  color: #64748b;
  border: 1px dashed rgba(255, 255, 255, 0.15);
}

.status-pill.ready {
  background: rgba(0, 242, 254, 0.15);
  color: #00f2fe;
  border: 1px solid rgba(0, 242, 254, 0.35);
}

/* Metadata Form Inputs */
.metadata-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.2rem;
  background: rgba(8, 9, 13, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 1.4rem;
}

.form-group-field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.full-width-field {
  grid-column: span 2;
}

.field-label {
  font-size: 0.86rem;
  font-weight: 700;
  color: #cbd5e1;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.required-star {
  color: #ef4444;
  font-weight: 900;
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  pointer-events: none;
  font-size: 1rem;
}

.form-text-input {
  width: 100%;
  background: rgba(14, 18, 28, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 14px;
  color: #ffffff;
  padding: 0.8rem 1rem 0.8rem 2.7rem;
  font-size: 0.92rem;
  font-family: inherit;
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-text-input:focus {
  border-color: #00f2fe;
  background: rgba(14, 18, 28, 0.95);
  box-shadow: 0 0 0 3px rgba(0, 242, 254, 0.15);
}

.form-select-input {
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%2300f2fe' viewBox='0 0 24 24'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
}

/* Optional Lyrics Input */
.lyrics-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.lyrics-label-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.lyrics-label {
  font-size: 0.86rem;
  font-weight: 700;
  color: #cbd5e1;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.optional-tag {
  font-size: 0.72rem;
  font-weight: 700;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.1);
  border: 1px solid rgba(56, 189, 248, 0.2);
  padding: 0.15rem 0.55rem;
  border-radius: 6px;
}

.template-helper-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #94a3b8;
  padding: 0.3rem 0.75rem;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.template-helper-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.25);
}

.lyrics-textarea {
  background: rgba(8, 9, 13, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  color: #7dd3fc;
  padding: 0.85rem 1.1rem;
  font-family: 'Fira Code', 'Courier New', monospace;
  font-size: 0.84rem;
  line-height: 1.5;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.lyrics-textarea:focus {
  border-color: #00f2fe;
  box-shadow: 0 0 0 3px rgba(0, 242, 254, 0.15);
}

.lyrics-hint {
  font-size: 0.78rem;
  color: #64748b;
}

/* Upload Submit Button */
.upload-submit-btn {
  background: linear-gradient(135deg, #00f2fe 0%, #3b82f6 100%);
  color: #08090d;
  border: none;
  padding: 1rem 2.2rem;
  border-radius: 16px;
  font-weight: 800;
  font-size: 1.05rem;
  font-family: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease, opacity 0.2s;
  box-shadow: 0 10px 35px rgba(0, 242, 254, 0.35);
  width: 100%;
}

.upload-submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 14px 45px rgba(0, 242, 254, 0.55);
}

.upload-submit-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #08090d;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .minimal-upload-wrapper {
    padding: 0.5rem 0.5rem 6.5rem !important;
    width: 100% !important;
    max-width: 100vw !important;
    overflow-x: hidden !important;
    box-sizing: border-box !important;
  }
  .upload-modal-card {
    padding: 1.25rem 0.85rem !important;
    border-radius: 20px !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }
  .title {
    font-size: 1.35rem !important;
    text-align: center !important;
    word-break: break-word !important;
  }
  .subtitle {
    font-size: 0.78rem !important;
    text-align: center !important;
  }
  .user-account-banner {
    flex-direction: column !important;
    align-items: flex-start !important;
    padding: 0.75rem !important;
    gap: 0.6rem !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }
  .uab-badge-right {
    font-size: 0.72rem !important;
  }
  .drop-zones-grid,
  .metadata-form-grid {
    grid-template-columns: 1fr !important;
    gap: 0.75rem !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }
  .drop-zone {
    padding: 1.5rem 1rem !important;
    min-height: auto !important;
  }
  .full-width-field {
    grid-column: span 1 !important;
  }
  .upload-submit-btn {
    padding: 0.85rem 1.5rem !important;
    font-size: 0.95rem !important;
    border-radius: 14px !important;
  }
}
</style>
