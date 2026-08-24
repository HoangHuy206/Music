<template>
  <transition name="modal-fade">
    <div v-if="isOpen" class="eq-modal-overlay" @click.self="$emit('close')">
      <div class="eq-modal-card" :style="{ borderColor: `${visualizerColor}40` }">
        <!-- Ambient Glowing Flare -->
        <div
          class="eq-ambient-glow"
          :style="{ background: `radial-gradient(circle, ${visualizerColor}20 0%, transparent 70%)` }"
        ></div>

        <!-- Modal Header -->
        <div class="eq-header">
          <div class="eq-title-group">
            <div class="eq-icon-badge" :style="{ backgroundColor: `${visualizerColor}18`, borderColor: `${visualizerColor}40`, color: visualizerColor }">
              🎛️
            </div>
            <div>
              <h3 class="eq-main-title">Bộ Chỉnh Âm Thanh Equalizer</h3>
              <p class="eq-sub-title">10-Band Audio Frequency & Âm Thanh Không Gian 8D</p>
            </div>
          </div>

          <button class="eq-close-btn" @click="$emit('close')">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <!-- Section 1: Presets Bar -->
        <div class="eq-presets-section">
          <span class="section-label">CHẾ ĐỘ TỐI ƯU SẴN (PRESETS)</span>
          <div class="presets-chip-grid">
            <button
              v-for="p in presets"
              :key="p.id"
              class="preset-pill-btn"
              :class="{ active: activePreset === p.id }"
              :style="activePreset === p.id ? { borderColor: visualizerColor, color: '#ffffff', background: `${visualizerColor}25` } : {}"
              @click="$emit('apply-preset', p)"
            >
              <span class="preset-icon">{{ p.icon }}</span>
              <span>{{ p.name }}</span>
            </button>
          </div>
        </div>

        <!-- Section 2: 10-Band Frequency Sliders -->
        <div class="eq-sliders-section">
          <div class="sliders-scale-axis">
            <span>+12dB</span>
            <span>0dB</span>
            <span>-12dB</span>
          </div>

          <div class="sliders-container">
            <div
              v-for="(freq, idx) in frequencies"
              :key="freq"
              class="slider-column"
            >
              <span class="slider-gain-val" :style="{ color: eqGains[idx] > 0 ? visualizerColor : eqGains[idx] < 0 ? '#ff007f' : '#64748b' }">
                {{ eqGains[idx] > 0 ? `+${eqGains[idx]}` : eqGains[idx] }}
              </span>

              <div class="fader-track-wrap">
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="1"
                  :value="eqGains[idx]"
                  class="eq-vertical-fader"
                  :style="{ accentColor: visualizerColor }"
                  @input="$emit('update-gain', idx, $event.target.value)"
                />
              </div>

              <span class="slider-freq-label">{{ formatFreq(freq) }}</span>
            </div>
          </div>
        </div>

        <!-- Section 3: 8D Spatial Audio & Bass Boost Feature -->
        <div class="spatial-8d-section" :class="{ 'is-active': is8DEnabled }">
          <div class="spatial-left">
            <div class="spatial-badge" :style="{ color: is8DEnabled ? visualizerColor : '#94a3b8' }">
              <span class="spatial-pulse-dot" :class="{ pulsing: is8DEnabled }" :style="{ backgroundColor: is8DEnabled ? visualizerColor : '#64748b' }"></span>
              <span>ÂM THANH KHÔNG GIAN 8D (360° SURROUND)</span>
            </div>
            <p class="spatial-desc">Tự động xoay chuyển âm thanh giữa tai nghe Trái / Phải tạo hiệu ứng bay vòng quanh đầu.</p>
          </div>

          <div class="spatial-controls">
            <!-- Speed Selector -->
            <div v-if="is8DEnabled" class="spatial-speed-ctrl">
              <span class="speed-lbl">Tốc độ xoay:</span>
              <button
                v-for="s in [0.5, 1.0, 1.5, 2.0]"
                :key="s"
                class="speed-chip-btn"
                :class="{ active: spatial8DSpeed === s }"
                :style="spatial8DSpeed === s ? { borderColor: visualizerColor, color: visualizerColor, background: `${visualizerColor}20` } : {}"
                @click="$emit('update-8d-speed', s)"
              >
                {{ s }}x
              </button>
            </div>

            <!-- 8D Toggle Switch -->
            <button
              class="spatial-toggle-btn"
              :class="{ active: is8DEnabled }"
              :style="is8DEnabled ? { background: `linear-gradient(135deg, ${visualizerColor}, #9d4edd)`, borderColor: visualizerColor, boxShadow: `0 0 18px ${visualizerColor}60` } : {}"
              :title="is8DEnabled ? 'Bấm để tắt hiệu ứng 8D' : 'Bấm để bật hiệu ứng 8D'"
              @click="$emit('toggle-8d')"
            >
              <span v-if="is8DEnabled" class="toggle-live-dot"></span>
              <svg v-else viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
              <span class="toggle-text">{{ is8DEnabled ? 'TẮT 8D' : 'BẬT 8D' }}</span>
            </button>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="eq-footer">
          <button class="eq-reset-btn" @click="$emit('reset-eq')">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
            <span>Đặt Lại Mặc Định (0dB)</span>
          </button>

          <button class="eq-done-btn" :style="{ background: `linear-gradient(135deg, ${visualizerColor}, #4facfe)` }" @click="$emit('close')">
            Xong & Áp Dụng
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  visualizerColor: {
    type: String,
    default: '#00f2fe',
  },
  eqGains: {
    type: Array,
    default: () => [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  is8DEnabled: {
    type: Boolean,
    default: false,
  },
  spatial8DSpeed: {
    type: Number,
    default: 1.0,
  },
  activePreset: {
    type: String,
    default: 'flat',
  },
});

defineEmits([
  'close',
  'update-gain',
  'apply-preset',
  'toggle-8d',
  'update-8d-speed',
  'reset-eq',
]);

const frequencies = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

const presets = [
  { id: 'flat', name: 'Mặc định', icon: '🎵', gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { id: 'bass', name: 'Bass Booster', icon: '🔥', gains: [9, 7, 5, 2, 0, 0, 0, 0, 1, 2] },
  { id: 'vocal', name: 'Vocal / Acoustic', icon: '🎤', gains: [-2, -1, 0, 3, 6, 5, 3, 1, 0, -1] },
  { id: 'edm', name: 'Electronic / EDM', icon: '⚡', gains: [7, 6, 3, 0, -2, 2, 4, 6, 7, 6] },
  { id: 'rock', name: 'Rock & Metal', icon: '🎸', gains: [5, 4, 2, 0, -1, 1, 3, 5, 6, 5] },
  { id: 'treble', name: 'Treble Boost', icon: '✨', gains: [-3, -2, -1, 0, 1, 2, 4, 7, 9, 10] },
];

function formatFreq(freq) {
  if (freq >= 1000) {
    return `${freq / 1000}k`;
  }
  return `${freq}`;
}
</script>

<style scoped>
.eq-modal-overlay {
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

.eq-modal-card {
  position: relative;
  background: linear-gradient(145deg, rgba(16, 20, 32, 0.95) 0%, rgba(10, 12, 20, 0.98) 100%);
  border: 1px solid rgba(0, 242, 254, 0.3);
  border-radius: 24px;
  width: 100%;
  max-width: 660px;
  padding: 2rem 2.2rem;
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.8), 0 0 45px rgba(0, 242, 254, 0.15);
  overflow: hidden;
}

.eq-ambient-glow {
  position: absolute;
  top: -80px;
  right: -80px;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(80px);
}

/* Header */
.eq-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
}

.eq-title-group {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.eq-icon-badge {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  border: 1px solid;
}

.eq-main-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 0.15rem 0;
  letter-spacing: -0.01em;
}

.eq-sub-title {
  font-size: 0.78rem;
  color: #94a3b8;
  margin: 0;
}

.eq-close-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #94a3b8;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.eq-close-btn:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.15);
}

/* Presets */
.eq-presets-section {
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
}

.section-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #64748b;
  margin-bottom: 0.6rem;
}

.presets-chip-grid {
  display: flex;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.preset-pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #94a3b8;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.preset-pill-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.preset-icon {
  font-size: 0.85rem;
}

/* Sliders Section */
.eq-sliders-section {
  background: rgba(8, 10, 16, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 18px;
  padding: 1.25rem 1rem 1rem;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
  display: flex;
  gap: 0.5rem;
}

.sliders-scale-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-size: 0.68rem;
  color: #475569;
  font-weight: 700;
  padding-bottom: 1.4rem;
  width: 36px;
  text-align: right;
}

.sliders-container {
  display: flex;
  flex: 1;
  justify-content: space-between;
  align-items: stretch;
}

.slider-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  flex: 1;
}

.slider-gain-val {
  font-size: 0.7rem;
  font-weight: 800;
  font-family: monospace;
  height: 14px;
}

.fader-track-wrap {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.eq-vertical-fader {
  appearance: slider-vertical;
  -webkit-appearance: slider-vertical;
  width: 14px;
  height: 110px;
  cursor: pointer;
}

.slider-freq-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: -0.02em;
}

/* 8D Spatial Audio Section */
.spatial-8d-section {
  background: rgba(14, 18, 28, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.1rem 1.3rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.spatial-8d-section.is-active {
  border-color: rgba(0, 242, 254, 0.4);
  box-shadow: 0 0 25px rgba(0, 242, 254, 0.15);
}

.spatial-left {
  flex: 1;
}

.spatial-badge {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  margin-bottom: 0.25rem;
}

.spatial-pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.spatial-pulse-dot.pulsing {
  animation: pulse-dot 1.5s infinite ease-in-out;
}

.spatial-desc {
  font-size: 0.78rem;
  color: #64748b;
  margin: 0;
  line-height: 1.4;
}

.spatial-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.spatial-speed-ctrl {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.speed-lbl {
  font-size: 0.7rem;
  color: #64748b;
}

.speed-chip-btn {
  padding: 0.2rem 0.45rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
}

.spatial-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 1.05rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #f1f5f9;
  font-size: 0.82rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.spatial-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.16);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-1px);
}

.spatial-toggle-btn.active {
  color: #08090d;
}

.toggle-live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #08090d;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.6);
  animation: pulse-dot 1s infinite alternate;
}

/* Footer */
.eq-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
}

.eq-reset-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 0.95rem;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.eq-reset-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.eq-done-btn {
  padding: 0.65rem 1.5rem;
  border-radius: 12px;
  color: #08090d;
  font-size: 0.88rem;
  font-weight: 800;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px rgba(0, 242, 254, 0.3);
}

.eq-done-btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.1);
}

/* Transitions */
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: all 0.25s ease;
}
.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

@keyframes pulse-dot {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.4); opacity: 1; }
}

@media (max-width: 600px) {
  .eq-modal-card {
    padding: 1.5rem;
  }
  .spatial-8d-section {
    flex-direction: column;
    align-items: flex-start;
  }
  .spatial-controls {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
