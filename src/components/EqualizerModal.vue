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
  background: rgba(4, 6, 12, 0.85);
  backdrop-filter: blur(16px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  box-sizing: border-box;
}

.eq-modal-card {
  position: relative;
  background: linear-gradient(145deg, rgba(16, 20, 32, 0.96) 0%, rgba(10, 12, 20, 0.98) 100%);
  border: 1px solid rgba(0, 242, 254, 0.3);
  border-radius: 24px;
  width: 100%;
  max-width: 640px;
  max-height: 92vh;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1.8rem 2rem;
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.8), 0 0 45px rgba(0, 242, 254, 0.15);
  box-sizing: border-box;
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
  margin-bottom: 1.2rem;
  position: relative;
  z-index: 1;
}

.eq-title-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.eq-icon-badge {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  border: 1px solid;
  flex-shrink: 0;
}

.eq-main-title {
  font-size: 1.18rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 0.15rem 0;
  letter-spacing: -0.01em;
}

.eq-sub-title {
  font-size: 0.75rem;
  color: #94a3b8;
  margin: 0;
}

.eq-close-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #94a3b8;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.eq-close-btn:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.15);
}

/* Presets */
.eq-presets-section {
  margin-bottom: 1.2rem;
  position: relative;
  z-index: 1;
}

.section-label {
  display: block;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.presets-chip-grid {
  display: flex;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.preset-pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.32rem 0.7rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #94a3b8;
  font-size: 0.76rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
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
  padding: 1rem 0.75rem 0.85rem;
  margin-bottom: 1.2rem;
  position: relative;
  z-index: 1;
  display: flex;
  gap: 0.35rem;
  box-sizing: border-box;
}

.sliders-scale-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-size: 0.65rem;
  color: #475569;
  font-weight: 700;
  padding-bottom: 1.3rem;
  width: 32px;
  text-align: right;
  flex-shrink: 0;
}

.sliders-container {
  display: flex;
  flex: 1;
  justify-content: space-between;
  align-items: stretch;
  gap: 2px;
  overflow: hidden;
}

.slider-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  flex: 1;
  min-width: 0;
}

.slider-gain-val {
  font-size: 0.65rem;
  font-weight: 800;
  font-family: monospace;
  height: 14px;
  line-height: 14px;
}

.fader-track-wrap {
  height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
}

.eq-vertical-fader {
  appearance: slider-vertical;
  -webkit-appearance: slider-vertical;
  width: 14px;
  height: 100px;
  cursor: pointer;
}

.slider-freq-label {
  font-size: 0.68rem;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: -0.02em;
  white-space: nowrap;
  text-align: center;
  width: 100%;
  overflow: hidden;
  text-overflow: clip;
}

/* 8D Spatial Audio Section */
.spatial-8d-section {
  background: rgba(14, 18, 28, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1rem 1.1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.2rem;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
  box-sizing: border-box;
}

.spatial-8d-section.is-active {
  border-color: rgba(0, 242, 254, 0.4);
  box-shadow: 0 0 25px rgba(0, 242, 254, 0.15);
}

.spatial-left {
  flex: 1;
  min-width: 0;
}

.spatial-badge {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  margin-bottom: 0.25rem;
}

.spatial-pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.spatial-pulse-dot.pulsing {
  animation: pulse-dot 1.5s infinite ease-in-out;
}

.spatial-desc {
  font-size: 0.76rem;
  color: #64748b;
  margin: 0;
  line-height: 1.35;
}

.spatial-controls {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-shrink: 0;
}

.spatial-speed-ctrl {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  white-space: nowrap;
}

.speed-lbl {
  font-size: 0.7rem;
  color: #64748b;
  white-space: nowrap;
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
  white-space: nowrap;
}

.spatial-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 1rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #f1f5f9;
  font-size: 0.78rem;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
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
  gap: 0.6rem;
}

.eq-reset-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 0.9rem;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.eq-reset-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.eq-done-btn {
  padding: 0.6rem 1.4rem;
  border-radius: 12px;
  color: #08090d;
  font-size: 0.84rem;
  font-weight: 800;
  border: none;
  cursor: pointer;
  white-space: nowrap;
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

/* Mobile & Small Screens (<= 640px) */
@media (max-width: 640px) {
  .eq-modal-overlay {
    padding: 0.6rem;
  }
  .eq-modal-card {
    padding: 1.1rem 0.9rem;
    border-radius: 20px;
    max-height: 94vh;
  }
  .eq-header {
    margin-bottom: 0.85rem;
  }
  .eq-icon-badge {
    width: 36px;
    height: 36px;
    font-size: 1.1rem;
    border-radius: 10px;
  }
  .eq-main-title {
    font-size: 1.02rem;
  }
  .eq-sub-title {
    font-size: 0.68rem;
  }
  .eq-presets-section {
    margin-bottom: 0.85rem;
  }
  .presets-chip-grid {
    gap: 0.35rem;
  }
  .preset-pill-btn {
    padding: 0.26rem 0.55rem;
    font-size: 0.72rem;
  }
  .eq-sliders-section {
    padding: 0.75rem 0.35rem 0.55rem;
    gap: 0.15rem;
    margin-bottom: 0.85rem;
    border-radius: 14px;
  }
  .sliders-scale-axis {
    width: 25px;
    font-size: 0.56rem;
    padding-bottom: 1rem;
  }
  .slider-gain-val {
    font-size: 0.56rem;
    height: 12px;
    line-height: 12px;
  }
  .fader-track-wrap {
    height: 80px;
  }
  .eq-vertical-fader {
    height: 72px;
    width: 10px;
  }
  .slider-freq-label {
    font-size: 0.56rem;
    letter-spacing: -0.04em;
  }
  .spatial-8d-section {
    flex-direction: column;
    align-items: stretch;
    gap: 0.65rem;
    padding: 0.8rem 0.85rem;
    margin-bottom: 0.85rem;
    border-radius: 14px;
  }
  .spatial-badge {
    font-size: 0.68rem;
  }
  .spatial-desc {
    font-size: 0.72rem;
  }
  .spatial-controls {
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.45rem;
  }
  .spatial-speed-ctrl {
    gap: 0.2rem;
  }
  .speed-chip-btn {
    padding: 0.18rem 0.38rem;
    font-size: 0.68rem;
  }
  .spatial-toggle-btn {
    padding: 0.36rem 0.8rem;
    font-size: 0.72rem;
    margin-left: auto;
  }
  .eq-footer {
    gap: 0.45rem;
  }
  .eq-reset-btn {
    padding: 0.45rem 0.65rem;
    font-size: 0.7rem;
  }
  .eq-done-btn {
    padding: 0.48rem 1rem;
    font-size: 0.76rem;
  }
}
</style>
