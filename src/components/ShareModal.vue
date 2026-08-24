<template>
  <transition name="modal-pop">
    <div v-if="isOpen" class="share-modal-overlay" @click.self="$emit('close')">
      <div class="share-modal-card">
        <!-- Close Button -->
        <button class="modal-close-btn" title="Đóng" @click="$emit('close')">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <!-- Header -->
        <div class="share-modal-header">
          <div class="share-icon-halo">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/>
            </svg>
          </div>
          <div>
            <h3 class="share-modal-title">Chia Sẻ Bài Hát</h3>
            <p class="share-modal-subtitle">Gửi bài hát trực tiếp tới bạn bè hoặc mạng xã hội</p>
          </div>
        </div>

        <!-- Track Card Preview -->
        <div v-if="song" class="share-track-preview-box">
          <div class="preview-artwork-wrap">
            <img
              v-if="song.coverImage"
              :src="formatMediaUrl(song.coverImage)"
              :alt="song.title"
              class="preview-cover-img"
            />
            <div v-else class="preview-cover-fallback">🎵</div>
            <div class="preview-vinyl-ring"></div>
          </div>
          <div class="preview-meta">
            <span class="preview-tag">AuraMusic HD • 320Kbps</span>
            <h4 class="preview-song-title" :title="song.title">{{ song.title }}</h4>
            <p class="preview-song-artist">{{ song.artist || 'Nghệ Sĩ' }}</p>
          </div>
        </div>

        <!-- Link Copy Input Box -->
        <div class="share-link-group">
          <label class="share-field-label">Liên kết bài hát:</label>
          <div class="share-input-row">
            <input
              ref="shareInputRef"
              type="text"
              class="share-link-input"
              :value="shareUrl"
              readonly
              @click="handleSelectAll"
            />
            <button
              class="btn-copy-link"
              :class="{ 'is-copied': isCopied }"
              @click="handleCopyLink"
            >
              <svg v-if="!isCopied" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>{{ isCopied ? 'Đã Chép!' : 'Sao Chép' }}</span>
            </button>
          </div>
        </div>

        <!-- Social Quick Share Row -->
        <div class="social-share-section">
          <span class="social-section-title">CHIA SẺ NHANH</span>
          <div class="social-btns-grid">
            <!-- Native Mobile / Web Share -->
            <button
              v-if="canNativeShare"
              class="social-btn btn-native-share"
              @click="handleNativeShare"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/>
              </svg>
              <span>Thiết Bị</span>
            </button>

            <!-- Facebook -->
            <a
              :href="facebookShareUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="social-btn btn-facebook"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Facebook</span>
            </a>

            <!-- Telegram -->
            <a
              :href="telegramShareUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="social-btn btn-telegram"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
              </svg>
              <span>Telegram</span>
            </a>

            <!-- Twitter / X -->
            <a
              :href="twitterShareUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="social-btn btn-twitter"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span>X (Twitter)</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed } from 'vue';
import { showToast } from '../utils/toast.js';
import { API_BASE_URL } from '../config/api.js';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  song: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['close']);

const isCopied = ref(false);
const shareInputRef = ref(null);

const canNativeShare = computed(() => {
  return typeof navigator !== 'undefined' && !!navigator.share;
});

const shareUrl = computed(() => {
  if (!props.song) return window.location.origin;
  const origin = window.location.origin;
  const songId = props.song._id;
  const title = encodeURIComponent(props.song.title || '');
  if (songId && !songId.startsWith('cloud_')) {
    return `${origin}/?play=${songId}`;
  }
  return `${origin}/?song=${title}`;
});

const shareTitle = computed(() => {
  if (!props.song) return 'Nghe nhạc trên AuraMusic';
  return `Nghe bài hát "${props.song.title}" của ${props.song.artist || 'Nghệ Sĩ'} trên AuraMusic 🎧`;
});

const facebookShareUrl = computed(() => {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl.value)}`;
});

const telegramShareUrl = computed(() => {
  return `https://t.me/share/url?url=${encodeURIComponent(shareUrl.value)}&text=${encodeURIComponent(shareTitle.value)}`;
});

const twitterShareUrl = computed(() => {
  return `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl.value)}&text=${encodeURIComponent(shareTitle.value)}`;
});

function formatMediaUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

function handleSelectAll() {
  if (shareInputRef.value) {
    shareInputRef.value.select();
  }
}

async function handleCopyLink() {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(shareUrl.value);
    } else if (shareInputRef.value) {
      shareInputRef.value.select();
      document.execCommand('copy');
    }
    isCopied.value = true;
    showToast('Đã sao chép link bài hát vào bộ nhớ tạm! 🔗', 'success');
    setTimeout(() => {
      isCopied.value = false;
    }, 3000);
  } catch (err) {
    showToast('Không thể sao chép tự động, vui lòng bôi đen link.', 'warning');
  }
}

async function handleNativeShare() {
  if (navigator.share) {
    try {
      await navigator.share({
        title: shareTitle.value,
        text: `Đang nghe bài hát này rất hay trên AuraMusic! 🎵`,
        url: shareUrl.value,
      });
      showToast('Chia sẻ thành công! ✨', 'success');
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.warn('Native share error:', err);
      }
    }
  }
}
</script>

<style scoped>
.share-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(4, 6, 12, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.share-modal-card {
  position: relative;
  width: 100%;
  max-width: 480px;
  background: rgba(14, 18, 28, 0.92);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border: 1px solid rgba(0, 242, 254, 0.25);
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.7), 0 0 35px rgba(0, 242, 254, 0.15);
  color: #ffffff;
  overflow: hidden;
}

.modal-close-btn {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-close-btn:hover {
  background: rgba(255, 255, 255, 0.18);
  color: #ffffff;
  transform: rotate(90deg);
}

.share-modal-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.share-icon-halo {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: rgba(0, 242, 254, 0.15);
  border: 1px solid rgba(0, 242, 254, 0.35);
  color: #00f2fe;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 20px rgba(0, 242, 254, 0.25);
}

.share-modal-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.01em;
}

.share-modal-subtitle {
  font-size: 0.82rem;
  color: #94a3b8;
  margin-top: 2px;
}

/* Track Preview Card */
.share-track-preview-box {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.9rem 1.1rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 1.5rem;
}

.preview-artwork-wrap {
  position: relative;
  width: 54px;
  height: 54px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
}

.preview-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-cover-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: #1e293b;
}

.preview-meta {
  flex: 1;
  min-width: 0;
}

.preview-tag {
  font-size: 0.68rem;
  font-weight: 700;
  color: #00f2fe;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.preview-song-title {
  font-size: 0.96rem;
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 2px 0;
}

.preview-song-artist {
  font-size: 0.8rem;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Link Group */
.share-link-group {
  margin-bottom: 1.5rem;
}

.share-field-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #cbd5e1;
  margin-bottom: 0.5rem;
}

.share-input-row {
  display: flex;
  gap: 0.5rem;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  padding: 0.35rem 0.35rem 0.35rem 0.85rem;
  align-items: center;
  transition: border-color 0.2s;
}

.share-input-row:focus-within {
  border-color: #00f2fe;
  box-shadow: 0 0 16px rgba(0, 242, 254, 0.2);
}

.share-link-input {
  flex: 1;
  background: transparent;
  border: none;
  color: #00f2fe;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  outline: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-copy-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1.1rem;
  border-radius: 10px;
  background: linear-gradient(135deg, #00f2fe, #4facfe);
  color: #08090d;
  font-size: 0.82rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  white-space: nowrap;
}

.btn-copy-link:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(0, 242, 254, 0.4);
}

.btn-copy-link.is-copied {
  background: #10b981;
  color: #ffffff;
}

/* Social Grid */
.social-share-section {
  margin-top: 0.5rem;
}

.social-section-title {
  display: block;
  font-size: 0.72rem;
  font-weight: 800;
  color: #64748b;
  letter-spacing: 0.06em;
  margin-bottom: 0.75rem;
}

.social-btns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 0.65rem;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.65rem 0.85rem;
  border-radius: 12px;
  font-size: 0.82rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #cbd5e1;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.social-btn:hover {
  transform: translateY(-2px);
}

.btn-native-share:hover {
  background: rgba(0, 242, 254, 0.15);
  border-color: #00f2fe;
  color: #00f2fe;
}

.btn-facebook:hover {
  background: rgba(24, 119, 242, 0.2);
  border-color: #1877f2;
  color: #1877f2;
}

.btn-telegram:hover {
  background: rgba(36, 161, 222, 0.2);
  border-color: #24a1de;
  color: #24a1de;
}

.btn-twitter:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: #ffffff;
  color: #ffffff;
}

/* Modal Pop Transitions */
.modal-pop-enter-active,
.modal-pop-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-pop-enter-from,
.modal-pop-leave-to {
  opacity: 0;
  transform: scale(0.92);
}
</style>
