<template>
  <transition name="splash-fade">
    <div v-if="isVisible" class="intro-splash-overlay" @click="handleSkip">
      <!-- Ambient Dynamic Glowing Orbs -->
      <div class="splash-orb orb-cyan"></div>
      <div class="splash-orb orb-purple"></div>
      <div class="splash-orb orb-pink"></div>

      <!-- Skip Button -->
      

      <!-- Center Logo & Branding Stage -->
      <div class="splash-stage">
        <!-- Glowing Audio Waveform Ring -->
        <div class="splash-logo-container">
          <div class="splash-halo-ring"></div>
          <div class="splash-halo-pulse"></div>

          <!-- Animated Equalizer Wave -->
          <div class="splash-equalizer-bars">
            <span class="seq-bar sb1"></span>
            <span class="seq-bar sb2"></span>
            <span class="seq-bar sb3"></span>
            <span class="seq-bar sb4"></span>
            <span class="seq-bar sb5"></span>
            <span class="seq-bar sb6"></span>
            <span class="seq-bar sb7"></span>
          </div>
        </div>

        <!-- Brand Name with Cinematic Shine -->
        <div class="splash-brand-title">
          <span class="brand-text-aura">Aura</span><span class="brand-text-music">Music</span>

        </div>

        <!-- Tagline -->
        <p class="splash-tagline">
          NEXT-GEN AI WEB AUDIO ENGINE
        </p>

        <!-- Progress Loading Bar -->
        <div class="splash-progress-wrapper">
          <div class="splash-progress-track">
            <div class="splash-progress-bar" :style="{ width: `${progress}%` }"></div>
          </div>
          <div class="splash-status-text">
            <span class="status-indicator-dot"></span>
            <span>{{ statusMessage }}</span>
            <span class="status-percent">{{ progress }}%</span>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const emit = defineEmits(['finish']);

const isVisible = ref(true);
const progress = ref(0);
const statusMessage = ref('Đang kết nối Web Audio Engine...');

onMounted(() => {
  startLoadingSequence();
});

function startLoadingSequence() {
  const interval = setInterval(() => {
    if (progress.value < 40) {
      progress.value += 6;
      statusMessage.value = 'Đang nạp bộ xử lý tần số 60FPS...';
    } else if (progress.value < 75) {
      progress.value += 7;
      statusMessage.value = 'Đồng bộ AI Synced Lyrics & Vinyl 3D...';
    } else if (progress.value < 100) {
      progress.value += 9;
      statusMessage.value = 'Khởi tạo hoàn tất! Chào mừng bạn 🎧';
    } else {
      progress.value = 100;
      clearInterval(interval);
      setTimeout(() => {
        finishSplash();
      }, 400);
    }
  }, 70);
}

function handleSkip() {
  finishSplash();
}

function finishSplash() {
  isVisible.value = false;
  setTimeout(() => {
    emit('finish');
  }, 600);
}
</script>

<style scoped>
.intro-splash-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: #06070b;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
}

/* Ambient Glowing Orbs */
.splash-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(140px);
  pointer-events: none;
  opacity: 0.6;
  animation: orb-float 6s ease-in-out infinite alternate;
}
.orb-cyan {
  width: 500px;
  height: 500px;
  top: 15%;
  left: 20%;
  background: radial-gradient(circle, rgba(0, 242, 254, 0.35) 0%, transparent 70%);
}
.orb-purple {
  width: 550px;
  height: 550px;
  bottom: 15%;
  right: 20%;
  background: radial-gradient(circle, rgba(157, 78, 221, 0.35) 0%, transparent 70%);
}
.orb-pink {
  width: 400px;
  height: 400px;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(255, 0, 127, 0.2) 0%, transparent 70%);
}

/* Skip Button */
.splash-skip-btn {
  position: absolute;
  top: 2rem;
  right: 2rem;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #94a3b8;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(12px);
  transition: all 0.2s ease;
  z-index: 10;
}
.splash-skip-btn:hover {
  background: rgba(0, 242, 254, 0.15);
  border-color: rgba(0, 242, 254, 0.4);
  color: #00f2fe;
  transform: translateX(2px);
}

/* Stage */
.splash-stage {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
}

/* Logo container with audio equalizer */
.splash-logo-container {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 28px;
  background: linear-gradient(135deg, rgba(14, 18, 30, 0.9), rgba(8, 10, 18, 0.95));
  border: 1.5px solid rgba(0, 242, 254, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.8rem;
  box-shadow: 0 15px 45px rgba(0, 0, 0, 0.7), 0 0 35px rgba(0, 242, 254, 0.25);
  animation: logo-entrance 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.splash-halo-ring {
  position: absolute;
  inset: -12px;
  border-radius: 36px;
  border: 1px dashed rgba(0, 242, 254, 0.3);
  animation: ring-rotate 12s linear infinite;
}

.splash-halo-pulse {
  position: absolute;
  inset: -2px;
  border-radius: 28px;
  background: radial-gradient(circle, rgba(0, 242, 254, 0.2), transparent 70%);
  animation: halo-pulse 2s infinite ease-in-out;
}

.splash-equalizer-bars {
  display: flex;
  align-items: center;
  gap: 5px;
  height: 48px;
  z-index: 2;
}

.seq-bar {
  width: 5px;
  background: linear-gradient(180deg, #00f2fe 0%, #4facfe 50%, #ff007f 100%);
  border-radius: 999px;
  animation: eq-bounce 1s ease-in-out infinite alternate;
}
.sb1 { height: 16px; animation-delay: 0.1s; }
.sb2 { height: 32px; animation-delay: 0.3s; }
.sb3 { height: 44px; animation-delay: 0.5s; }
.sb4 { height: 26px; animation-delay: 0.2s; }
.sb5 { height: 40px; animation-delay: 0.4s; }
.sb6 { height: 22px; animation-delay: 0.6s; }
.sb7 { height: 14px; animation-delay: 0.15s; }

/* Brand Name */
.splash-brand-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.15rem;
  font-family: var(--font-display, 'Lexend', 'Be Vietnam Pro', sans-serif);
  font-size: clamp(2.6rem, 6vw, 3.6rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  margin-bottom: 0.6rem;
  position: relative;
  animation: title-entrance 1s cubic-bezier(0.16, 1, 0.3, 1) 0.15s backwards;
}

.brand-text-aura {
  color: #ffffff;
  text-shadow: 0 0 30px rgba(255, 255, 255, 0.3);
}

.brand-text-music {
  background: linear-gradient(135deg, #00f2fe 0%, #4facfe 50%, #c77dff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 35px rgba(0, 242, 254, 0.4);
}

.splash-version-tag {
  font-size: 0.75rem;
  font-weight: 800;
  color: #00f2fe;
  background: rgba(0, 242, 254, 0.12);
  border: 1px solid rgba(0, 242, 254, 0.3);
  padding: 0.15rem 0.5rem;
  border-radius: 8px;
  margin-left: 0.5rem;
  align-self: flex-start;
}

.splash-tagline {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.24em;
  color: #94a3b8;
  text-transform: uppercase;
  margin-bottom: 2.2rem;
  animation: tagline-entrance 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s backwards;
}

/* Progress Bar */
.splash-progress-wrapper {
  width: 100%;
  max-width: 340px;
  animation: progress-entrance 1s cubic-bezier(0.16, 1, 0.3, 1) 0.4s backwards;
}

.splash-progress-track {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 0.85rem;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.5);
}

.splash-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #00f2fe, #4facfe, #9d4edd);
  border-radius: 999px;
  transition: width 0.15s ease-out;
  box-shadow: 0 0 12px rgba(0, 242, 254, 0.6);
}

.splash-status-text {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.76rem;
  color: #64748b;
  font-weight: 500;
}

.status-indicator-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #00f2fe;
  box-shadow: 0 0 8px #00f2fe;
  margin-right: 0.4rem;
}

.status-percent {
  color: #00f2fe;
  font-weight: 700;
  font-family: monospace;
}

/* Animations Keyframes */
@keyframes logo-entrance {
  from { opacity: 0; transform: scale(0.6) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes title-entrance {
  from { opacity: 0; transform: translateY(18px); filter: blur(8px); }
  to { opacity: 1; transform: translateY(0); filter: blur(0); }
}

@keyframes tagline-entrance {
  from { opacity: 0; letter-spacing: 0.4em; }
  to { opacity: 1; letter-spacing: 0.24em; }
}

@keyframes progress-entrance {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes eq-bounce {
  0% { transform: scaleY(0.3); }
  100% { transform: scaleY(1); }
}

@keyframes ring-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes halo-pulse {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
}

@keyframes orb-float {
  0% { transform: translateY(0) scale(1); }
  100% { transform: translateY(-30px) scale(1.08); }
}

/* Transition Out of Splash Screen */
.splash-fade-leave-active {
  transition: all 0.75s cubic-bezier(0.16, 1, 0.3, 1);
}
.splash-fade-leave-to {
  opacity: 0;
  transform: scale(1.06);
  filter: blur(14px);
}
</style>
