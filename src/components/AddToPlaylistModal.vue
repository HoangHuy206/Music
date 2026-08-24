<template>
  <transition name="modal-fade">
    <div v-if="isOpen" class="playlist-modal-overlay" @click.self="$emit('close')">
      <div class="playlist-modal-card" :style="{ borderColor: `${visualizerColor}40` }">
        <div class="modal-header">
          <div class="header-left">
            <span class="header-icon">📑</span>
            <div>
              <h3 class="modal-title">Thêm Vào Playlist</h3>
              <p class="modal-subtitle">Bài hát: <strong>{{ song?.title }}</strong></p>
            </div>
          </div>
          <button class="close-btn" @click="$emit('close')">✕</button>
        </div>

        <!-- Create New Playlist Form Toggle -->
        <div class="create-playlist-box">
          <div v-if="!isCreating" class="create-trigger-row" @click="isCreating = true">
            <span class="plus-circ">+</span>
            <span>Tạo danh sách phát mới...</span>
          </div>

          <form v-else class="create-form" @submit.prevent="handleCreate">
            <input
              v-model="newPlaylistName"
              type="text"
              class="create-input"
              placeholder="Nhập tên playlist (ví dụ: Chill Đêm, Gym...)"
              maxlength="40"
              required
              autofocus
            />
            <div class="create-actions">
              <button type="button" class="btn-cancel" @click="isCreating = false">Hủy</button>
              <button type="submit" class="btn-create" :style="{ background: `linear-gradient(135deg, ${visualizerColor}, #4facfe)` }">
                Tạo & Thêm
              </button>
            </div>
          </form>
        </div>

        <!-- Existing Playlists List -->
        <div class="existing-playlists-section">
          <span class="section-tag">CHỌN PLAYLIST CÓ SẴN</span>

          <div v-if="!playlists || playlists.length === 0" class="empty-playlists-msg">
            <span>Bạn chưa có playlist nào. Hãy tạo playlist đầu tiên ở trên nhé! 🎵</span>
          </div>

          <div v-else class="playlists-list">
            <div
              v-for="pl in playlists"
              :key="pl._id"
              class="playlist-pick-item"
              @click="$emit('add-to-playlist', pl._id)"
            >
              <div class="playlist-icon-thumb">
                <span>🎵</span>
              </div>
              <div class="playlist-info">
                <h4 class="playlist-name">{{ pl.name }}</h4>
                <span class="playlist-count">{{ pl.songs?.length || 0 }} bài hát</span>
              </div>
              <button class="add-action-btn" :style="{ borderColor: `${visualizerColor}40`, color: visualizerColor }">
                + Thêm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  song: {
    type: Object,
    default: null,
  },
  playlists: {
    type: Array,
    default: () => [],
  },
  visualizerColor: {
    type: String,
    default: '#00f2fe',
  },
});

const emit = defineEmits(['close', 'add-to-playlist', 'create-and-add']);

const isCreating = ref(false);
const newPlaylistName = ref('');

function handleCreate() {
  if (!newPlaylistName.value.trim()) return;
  emit('create-and-add', newPlaylistName.value.trim());
  newPlaylistName.value = '';
  isCreating.value = false;
}
</script>

<style scoped>
.playlist-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(4, 6, 12, 0.82);
  backdrop-filter: blur(16px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.playlist-modal-card {
  background: linear-gradient(145deg, rgba(16, 20, 32, 0.95) 0%, rgba(10, 12, 20, 0.98) 100%);
  border: 1px solid rgba(0, 242, 254, 0.3);
  border-radius: 24px;
  width: 100%;
  max-width: 440px;
  padding: 1.8rem;
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.8), 0 0 45px rgba(0, 242, 254, 0.15);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-icon {
  font-size: 1.4rem;
}

.modal-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 0.15rem 0;
}

.modal-subtitle {
  font-size: 0.78rem;
  color: #94a3b8;
  margin: 0;
}

.close-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
}

.create-playlist-box {
  background: rgba(255, 255, 255, 0.04);
  border: 1px dashed rgba(255, 255, 255, 0.15);
  border-radius: 14px;
  padding: 0.85rem;
  margin-bottom: 1.25rem;
}

.create-trigger-row {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  color: #00f2fe;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
}

.plus-circ {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0, 242, 254, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.create-input {
  width: 100%;
  background: rgba(8, 10, 16, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  color: #ffffff;
  padding: 0.65rem 0.85rem;
  font-size: 0.86rem;
  margin-bottom: 0.75rem;
  box-sizing: border-box;
  outline: none;
}

.create-input:focus {
  border-color: #00f2fe;
}

.create-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.btn-cancel {
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  font-size: 0.78rem;
  cursor: pointer;
}

.btn-create {
  padding: 0.4rem 0.95rem;
  border-radius: 8px;
  color: #08090d;
  font-size: 0.82rem;
  font-weight: 800;
  border: none;
  cursor: pointer;
}

.existing-playlists-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.section-tag {
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #64748b;
}

.empty-playlists-msg {
  padding: 1rem;
  text-align: center;
  font-size: 0.8rem;
  color: #64748b;
}

.playlists-list {
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.playlist-pick-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.85rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  cursor: pointer;
  transition: all 0.2s;
}

.playlist-pick-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(3px);
}

.playlist-icon-thumb {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
}

.playlist-info {
  flex: 1;
}

.playlist-name {
  font-size: 0.86rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 0.1rem 0;
}

.playlist-count {
  font-size: 0.72rem;
  color: #64748b;
}

.add-action-btn {
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid;
  font-size: 0.75rem;
  font-weight: 700;
}

.modal-fade-enter-active, .modal-fade-leave-active {
  transition: all 0.2s ease;
}
.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
