<template>
  <transition name="modal-fade">
    <div v-if="isOpen" class="video-modal-overlay" @click.self="handleClose">
      <div class="video-modal-card" :style="{ borderColor: `${visualizerColor}50` }">
        <!-- Header -->
        <div class="modal-header">
          <div class="header-left">
            <span class="header-icon">🎬</span>
            <div>
              <h3 class="modal-title">Tải Video MP4 Đĩa Than & Sóng Nhạc</h3>
              <p class="modal-subtitle">{{ song?.title || 'Bài Hát' }} • {{ song?.artist || 'AuraMusic' }}</p>
            </div>
          </div>
          <button class="close-btn" :disabled="isRendering" @click="handleClose">✕</button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <!-- Canvas Live Preview Container -->
          <div class="preview-container">
            <div class="canvas-aspect-box" :class="`aspect-${selectedAspect.replace(':', '-')}`">
              <canvas ref="renderCanvasRef" class="export-render-canvas"></canvas>
              <div v-if="isRendering" class="render-overlay">
                <div class="render-spinner"></div>
                <span class="render-percent-txt">{{ renderProgress }}%</span>
                <span class="render-status-txt">{{ renderStatusText }}</span>
              </div>
            </div>
          </div>

          <!-- Export Settings Controls (Hidden while rendering) -->
          <div v-if="!isRendering" class="export-settings-panel">
            <!-- Aspect Ratio Selector -->
            <div class="setting-group">
              <label class="setting-label">TỈ LỆ KHUNG HÌNH (VIDEO FORMAT)</label>
              <div class="format-chips-grid">
                <button
                  v-for="aspect in aspectOptions"
                  :key="aspect.id"
                  class="format-chip-btn"
                  :class="{ active: selectedAspect === aspect.id }"
                  @click="selectedAspect = aspect.id"
                >
                  <span class="chip-icon">{{ aspect.icon }}</span>
                  <div class="chip-text">
                    <strong>{{ aspect.label }}</strong>
                    <small>{{ aspect.desc }}</small>
                  </div>
                </button>
              </div>
            </div>

            <!-- Duration Selector -->
            <div class="setting-group">
              <label class="setting-label">ĐỘ DÀI VIDEO (DURATION)</label>
              <div class="duration-chips-row">
                <button
                  v-for="dur in durationOptions"
                  :key="dur.id"
                  class="dur-chip-btn"
                  :class="{ active: selectedDuration === dur.id }"
                  @click="selectedDuration = dur.id"
                >
                  <span>{{ dur.label }}</span>
                  <small>{{ dur.desc }}</small>
                </button>
              </div>
            </div>
          </div>

          <!-- Progress Bar & Cancel when rendering -->
          <div v-else class="rendering-progress-panel">
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" :style="{ width: `${renderProgress}%`, background: `linear-gradient(90deg, #00f2fe, ${visualizerColor})` }"></div>
            </div>
            <div class="render-time-info">
              <span>Đã xuất: {{ formatTime(renderedSec) }} / {{ formatTime(targetSec) }}</span>
              <span>{{ renderProgress }}% Hoàn tất</span>
            </div>
            <button class="btn-cancel-render" @click="abortRendering">
              Dừng & Hủy Render
            </button>
          </div>
        </div>

        <!-- Footer Actions -->
        <div v-if="!isRendering" class="modal-footer">
          <button class="btn-secondary" @click="handleClose">Đóng</button>
          <button
            class="btn-primary-export"
            :style="{ background: `linear-gradient(135deg, ${visualizerColor}, #00f2fe)` }"
            @click="startVideoExport"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
            </svg>
            <span>Bắt Đầu Tải Video MP4</span>
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { API_BASE_URL } from '../config/api.js';
import { showToast } from '../utils/toast.js';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  song: {
    type: Object,
    default: null,
  },
  visualizerColor: {
    type: String,
    default: '#00f2fe',
  },
});

const emit = defineEmits(['close']);

const renderCanvasRef = ref(null);
const isRendering = ref(false);
const renderProgress = ref(0);
const renderStatusText = ref('Đang chuẩn bị âm thanh & hình ảnh...');
const renderedSec = ref(0);
const targetSec = ref(30);

const selectedAspect = ref('9:16');
const selectedDuration = ref('30s');

const aspectOptions = [
  { id: '9:16', label: '9:16 Dọc', desc: 'TikTok, Reels, Shorts (1080x1920)', icon: '📱' },
  { id: '1:1', label: '1:1 Vuông', desc: 'Instagram, Facebook Post (1080x1080)', icon: '⏹️' },
  { id: '16:9', label: '16:9 Ngang', desc: 'YouTube, Màn Hình PC (1920x1080)', icon: '🖥️' },
];

const durationOptions = [
  { id: '30s', label: '30 Giây', desc: 'Điệp khúc Hot TikTok' },
  { id: '60s', label: '60 Giây', desc: 'Shorts / Reels' },
  { id: 'full', label: 'Toàn Bộ Bài Hát', desc: 'Full Track' },
];

let previewAnimationId = null;
let mediaRecorder = null;
let recordedChunks = [];
let renderAudio = null;
let renderAudioCtx = null;
let isAborted = false;
let loadedCoverImg = null;

function formatMediaUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

function handleClose() {
  if (isRendering.value) return;
  stopPreviewLoop();
  emit('close');
}

function abortRendering() {
  isAborted = true;
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    try {
      mediaRecorder.stop();
    } catch (e) {}
  }
  if (renderAudio) {
    try {
      renderAudio.pause();
      renderAudio.src = '';
    } catch (e) {}
  }
  if (renderAudioCtx) {
    try {
      renderAudioCtx.close();
    } catch (e) {}
  }
  isRendering.value = false;
  showToast('Đã hủy quá trình xuất video.', 'info');
  startPreviewLoop();
}

/**
 * Loads cover art image for Canvas drawing
 */
function preloadCoverImage(url) {
  return new Promise((resolve) => {
    if (!url) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = formatMediaUrl(url);
  });
}

/**
 * Draws high-tech Vinyl Disc, Glowing Waveform & Typography on Canvas
// Visualizer smoothing buffers for preview & export rendering
const smoothedExportBars = new Float32Array(32);
let currentBassPulse = 0;

/**
 * Draws high-tech Vinyl Disc, Glowing Grounded Waveform & Typography on Canvas
 */
function drawVideoFrame(ctx, width, height, time, totalDuration, coverImg, colorHex, fftData = null, sampleRate = 44100) {
  // 1. Dark Cyber Background Gradient
  ctx.fillStyle = '#06080e';
  ctx.fillRect(0, 0, width, height);

  // Calculate real bass energy from FFT or preview
  let bassEnergy = 0;
  if (fftData && fftData.length > 0) {
    let bSum = 0;
    const bCount = Math.min(5, fftData.length);
    for (let b = 0; b < bCount; b++) {
      bSum += fftData[b];
    }
    const instBass = bSum / (bCount * 255);
    if (instBass > currentBassPulse) {
      currentBassPulse += (instBass - currentBassPulse) * 0.6;
    } else {
      currentBassPulse = Math.max(0, currentBassPulse * 0.88 - 0.01);
    }
    bassEnergy = currentBassPulse;
  } else {
    const previewPulse = Math.pow(Math.sin(time * Math.PI * 2.16), 4);
    bassEnergy = 0.15 + previewPulse * 0.45;
  }

  // 2. Ambient Color Glows (reactive to bass energy)
  const bgGlowRadius = width * (0.65 + bassEnergy * 0.12);
  const bgGrad = ctx.createRadialGradient(width / 2, height * 0.38, 30, width / 2, height * 0.38, bgGlowRadius);
  bgGrad.addColorStop(0, `${colorHex}45`);
  bgGrad.addColorStop(0.5, `${colorHex}12`);
  bgGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 3. Cyber Grid Overlay
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
  ctx.lineWidth = 1;
  const gridSize = 42;
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // 4. Header Badge
  ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
  const badgeW = Math.min(width * 0.6, 290);
  const badgeH = 34;
  const badgeX = (width - badgeW) / 2;
  const badgeY = height * 0.065;
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 17);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('✦ AURAMUSIC • HI-RES AUDIO ✦', width / 2, badgeY + badgeH / 2);

  // 5. Rotating Vinyl Disc with Bass Halo
  const baseVinylSize = Math.min(width * 0.62, height * 0.38, 400);
  const vinylScale = 1 + bassEnergy * 0.04;
  const vinylSize = baseVinylSize * vinylScale;
  const vinylX = width / 2;
  const vinylY = height * 0.36;
  const angle = (time * 0.75) % (Math.PI * 2);

  // Glowing Vinyl Halo
  ctx.save();
  ctx.shadowColor = colorHex;
  ctx.shadowBlur = 30 + bassEnergy * 35;
  ctx.strokeStyle = `${colorHex}60`;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(vinylX, vinylY, (vinylSize / 2) + 6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.translate(vinylX, vinylY);
  ctx.rotate(angle);

  // Vinyl Base Body
  ctx.fillStyle = '#0d0e14';
  ctx.beginPath();
  ctx.arc(0, 0, vinylSize / 2, 0, Math.PI * 2);
  ctx.fill();

  // Vinyl Grooves
  for (let r = vinylSize * 0.28; r < vinylSize * 0.48; r += 7) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.045)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Vinyl Center Cover Art
  const centerSize = vinylSize * 0.46;
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, centerSize / 2, 0, Math.PI * 2);
  ctx.clip();

  if (coverImg) {
    ctx.drawImage(coverImg, -centerSize / 2, -centerSize / 2, centerSize, centerSize);
  } else {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-centerSize / 2, -centerSize / 2, centerSize, centerSize);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎵', 0, 0);
  }
  ctx.restore();

  // Spindle Hole
  ctx.fillStyle = '#06080e';
  ctx.beginPath();
  ctx.arc(0, 0, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = colorHex;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.restore();

  // 6. Song Title & Artist Typography
  const titleY = height * 0.60;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const songTitle = (props.song?.title || 'Aura Music Track').slice(0, 36);
  ctx.fillText(songTitle, width / 2, titleY);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 16px system-ui, sans-serif';
  const songArtist = props.song?.artist || 'Nghệ Sĩ';
  ctx.fillText(songArtist, width / 2, titleY + 30);

  // 7. Grounded 32-Bar Real Sound Waveform Visualizer (Grounded Baseline EQ)
  const numBars = 32;
  const baselineY = height * 0.77;
  const maxBarHeight = height * 0.10;
  const gap = 4;
  const totalW = Math.min(width * 0.84, 480);
  const barW = (totalW - (numBars - 1) * gap) / numBars;
  const startX = (width - totalW) / 2;

  const binCount = fftData ? fftData.length : 256;
  const minFreq = 25;
  const maxFreq = 16000;
  const nyquist = sampleRate / 2;

  for (let i = 0; i < numBars; i++) {
    let targetPercent = 0.05;

    if (fftData && fftData.length > 0) {
      // Real FFT Logarithmic Band-Averaging
      const fStart = minFreq * Math.pow(maxFreq / minFreq, i / numBars);
      const fEnd = minFreq * Math.pow(maxFreq / minFreq, (i + 1) / numBars);

      const binStart = Math.min(binCount - 1, Math.max(0, Math.floor((fStart / nyquist) * binCount)));
      const binEnd = Math.min(binCount, Math.max(binStart + 1, Math.ceil((fEnd / nyquist) * binCount)));

      let bSum = 0;
      let count = 0;
      for (let b = binStart; b < binEnd; b++) {
        bSum += fftData[b];
        count++;
      }
      const bAvg = count > 0 ? bSum / count : 0;
      const freqTilt = 1.0 + Math.pow(i / (numBars - 1), 1.1) * 1.35;
      let norm = (bAvg / 255) * freqTilt;
      norm = Math.pow(norm, 1.12);
      targetPercent = Math.min(1.0, Math.max(0.05, norm));
    } else {
      // Natural Acoustic Simulation for live preview
      const slope = Math.pow(1.0 - (i / numBars) * 0.38, 1.1);
      const harmonicWave = Math.sin(time * (4.5 + (i % 6) * 1.8) + i * 0.45) * 0.5 + 0.5;
      const beatPulse = Math.pow(Math.max(0, Math.sin(time * Math.PI * 2.16)), 3.2);

      if (i < 8) {
        targetPercent = (0.2 + 0.7 * beatPulse + 0.15 * harmonicWave) * slope;
      } else if (i < 20) {
        targetPercent = (0.18 + 0.48 * beatPulse + 0.38 * harmonicWave) * slope;
      } else {
        targetPercent = (0.15 + 0.32 * beatPulse + 0.45 * harmonicWave) * slope;
      }
      targetPercent = Math.min(1.0, Math.max(0.05, targetPercent));
    }

    // Physics smoothing
    if (targetPercent > smoothedExportBars[i]) {
      smoothedExportBars[i] += (targetPercent - smoothedExportBars[i]) * 0.58;
    } else {
      smoothedExportBars[i] = Math.max(0.04, smoothedExportBars[i] * 0.84 - 0.005);
    }

    const barH = Math.max(4, smoothedExportBars[i] * maxBarHeight);
    const x = startX + i * (barW + gap);
    const y = baselineY - barH;

    // Grounded glowing vertical gradient
    const grad = ctx.createLinearGradient(0, y, 0, baselineY);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.22, colorHex);
    grad.addColorStop(0.7, `${colorHex}80`);
    grad.addColorStop(1, `${colorHex}15`);

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, barW, barH, [3, 3, 1, 1]);
    ctx.fill();

    // Glowing Neon White Tip
    if (barH > 8) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(x + 0.5, y, barW - 1, 2.5, [1, 1, 0, 0]);
      ctx.fill();
    }
  }

  // Baseline Glow Wire under visualizer
  ctx.strokeStyle = `${colorHex}35`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(startX, baselineY + 2);
  ctx.lineTo(startX + totalW, baselineY + 2);
  ctx.stroke();

  // 8. Progress Timeline Bar & Timestamps
  const timelineY = height * 0.86;
  const timelineW = Math.min(width * 0.84, 480);
  const timelineX = (width - timelineW) / 2;

  // Background track
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.beginPath();
  ctx.roundRect(timelineX, timelineY, timelineW, 5, 3);
  ctx.fill();

  // Active progress
  const progressRatio = totalDuration > 0 ? Math.min(1, time / totalDuration) : 0;
  ctx.fillStyle = colorHex;
  ctx.beginPath();
  ctx.roundRect(timelineX, timelineY, timelineW * progressRatio, 5, 3);
  ctx.fill();

  // Timestamps
  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 12px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(formatTime(time), timelineX, timelineY + 20);
  ctx.textAlign = 'right';
  ctx.fillText(formatTime(totalDuration), timelineX + timelineW, timelineY + 20);

  // 9. Watermark Brand
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.font = '500 12px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Created with AuraMusic', width / 2, height * 0.94);
}

/**
 * Preview Loop on Canvas
 */
async function startPreviewLoop() {
  stopPreviewLoop();
  await nextTick();
  if (!renderCanvasRef.value) return;

  const canvas = renderCanvasRef.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Canvas internal rendering resolution
  canvas.width = 720;
  canvas.height = selectedAspect.value === '9:16' ? 1280 : selectedAspect.value === '1:1' ? 720 : 405;

  loadedCoverImg = await preloadCoverImage(props.song?.coverImage);

  let startTime = Date.now();
  function render() {
    if (isRendering.value) return;
    const elapsed = (Date.now() - startTime) / 1000;
    drawVideoFrame(ctx, canvas.width, canvas.height, elapsed, 180, loadedCoverImg, props.visualizerColor, null, 44100);
    previewAnimationId = requestAnimationFrame(render);
  }
  previewAnimationId = requestAnimationFrame(render);
}

function stopPreviewLoop() {
  if (previewAnimationId) {
    cancelAnimationFrame(previewAnimationId);
    previewAnimationId = null;
  }
}

/**
 * Main Video MP4 / WebM Export Engine with Real Web Audio FFT Analysis
 */
async function startVideoExport() {
  if (!props.song?.audioUrl) {
    showToast('Bài hát không có file âm thanh hợp lệ!', 'error');
    return;
  }

  stopPreviewLoop();
  isRendering.value = true;
  isAborted = false;
  renderProgress.value = 0;
  renderedSec.value = 0;
  renderStatusText.value = 'Đang tải và chuẩn bị luồng âm thanh...';

  const canvas = renderCanvasRef.value;
  if (!canvas) return;

  // Resolution based on selected aspect ratio
  if (selectedAspect.value === '9:16') {
    canvas.width = 1080;
    canvas.height = 1920;
  } else if (selectedAspect.value === '1:1') {
    canvas.width = 1080;
    canvas.height = 1080;
  } else {
    canvas.width = 1920;
    canvas.height = 1080;
  }

  const ctx = canvas.getContext('2d');
  loadedCoverImg = await preloadCoverImage(props.song.coverImage);

  // Setup Web Audio API with real AnalyserNode
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  renderAudioCtx = new AudioCtx();
  const audioDest = renderAudioCtx.createMediaStreamDestination();

  const exportAnalyser = renderAudioCtx.createAnalyser();
  exportAnalyser.fftSize = 512;
  exportAnalyser.smoothingTimeConstant = 0.82;
  const exportFftData = new Uint8Array(exportAnalyser.frequencyBinCount);

  renderAudio = new Audio();
  renderAudio.crossOrigin = 'anonymous';
  renderAudio.src = formatMediaUrl(props.song.audioUrl);
  renderAudio.preload = 'auto';

  try {
    await renderAudio.play();
  } catch (err) {
    console.warn('Audio play notice for export:', err);
  }

  const sourceNode = renderAudioCtx.createMediaElementSource(renderAudio);
  sourceNode.connect(exportAnalyser);
  exportAnalyser.connect(audioDest);
  exportAnalyser.connect(renderAudioCtx.destination); // Let user hear preview during render

  // Target duration
  let exportDuration = 30;
  if (selectedDuration.value === '60s') exportDuration = 60;
  else if (selectedDuration.value === 'full') {
    exportDuration = renderAudio.duration && !isNaN(renderAudio.duration) ? Math.floor(renderAudio.duration) : (props.song.duration || 180);
  }
  targetSec.value = exportDuration;

  // Combine Canvas Stream + Audio Stream
  const canvasStream = canvas.captureStream(60);
  const combinedStream = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...audioDest.stream.getAudioTracks(),
  ]);

  // Determine optimal Video MimeType
  let mimeType = 'video/mp4';
  if (!MediaRecorder.isTypeSupported('video/mp4')) {
    if (MediaRecorder.isTypeSupported('video/webm; codecs=vp9,opus')) {
      mimeType = 'video/webm; codecs=vp9,opus';
    } else if (MediaRecorder.isTypeSupported('video/webm')) {
      mimeType = 'video/webm';
    }
  }

  recordedChunks = [];
  mediaRecorder = new MediaRecorder(combinedStream, {
    mimeType,
    videoBitsPerSecond: 8000000, // 8 Mbps High Quality Video
  });

  mediaRecorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };

  mediaRecorder.onstop = () => {
    if (isAborted) return;
    renderStatusText.value = 'Đang đóng gói file video MP4...';
    renderProgress.value = 100;

    const blob = new Blob(recordedChunks, { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    const safeTitle = (props.song.title || 'AuraMusic').replace(/[\\/:*?"<>|]/g, '_');
    const safeArtist = (props.song.artist || 'Artist').replace(/[\\/:*?"<>|]/g, '_');
    const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
    a.download = `${safeTitle} - ${safeArtist} (AuraMusic Visualizer).${ext}`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 2000);

    showToast('Tải video MP4 thành công! 🎉', 'success');
    isRendering.value = false;
    startPreviewLoop();
  };

  mediaRecorder.start(1000);
  renderStatusText.value = 'Đang quay video đĩa than & sóng nhạc...';

  // Animation render step
  let startTime = Date.now();
  function exportRenderStep() {
    if (isAborted || !isRendering.value) return;

    const curTime = renderAudio.currentTime || (Date.now() - startTime) / 1000;
    renderedSec.value = Math.min(exportDuration, Math.floor(curTime));
    renderProgress.value = Math.min(99, Math.floor((curTime / exportDuration) * 100));

    // Get real FFT frequency data from export analyser
    try {
      exportAnalyser.getByteFrequencyData(exportFftData);
    } catch (e) {}

    drawVideoFrame(ctx, canvas.width, canvas.height, curTime, exportDuration, loadedCoverImg, props.visualizerColor, exportFftData, renderAudioCtx?.sampleRate || 44100);

    if (curTime >= exportDuration || renderAudio.ended) {
      // Done recording
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
      if (renderAudio) {
        renderAudio.pause();
      }
      if (renderAudioCtx) {
        renderAudioCtx.close().catch(() => {});
      }
      return;
    }

    requestAnimationFrame(exportRenderStep);
  }

  requestAnimationFrame(exportRenderStep);
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      isRendering.value = false;
      startPreviewLoop();
    } else {
      stopPreviewLoop();
    }
  }
);

watch(selectedAspect, () => {
  if (props.isOpen && !isRendering.value) {
    startPreviewLoop();
  }
});

onMounted(() => {
  if (props.isOpen) {
    startPreviewLoop();
  }
});

onUnmounted(() => {
  stopPreviewLoop();
  if (renderAudio) {
    renderAudio.pause();
    renderAudio.src = '';
  }
});
</script>

<style scoped>
.video-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(4, 6, 12, 0.88);
  backdrop-filter: blur(16px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.video-modal-card {
  width: 100%;
  max-width: 580px;
  max-height: 92vh;
  background: rgba(14, 18, 28, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 28px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.85);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: cardPop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes cardPop {
  0% { transform: scale(0.92); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.header-left {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}
.header-icon {
  font-size: 1.8rem;
}
.modal-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
}
.modal-subtitle {
  font-size: 0.84rem;
  color: #94a3b8;
  margin: 0.15rem 0 0;
}
.close-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #94a3b8;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}
.close-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
}

.modal-body {
  padding: 1.25rem 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

/* Canvas Preview */
.preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}
.canvas-aspect-box {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 35px rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: #06080e;
  display: flex;
  align-items: center;
  justify-content: center;
}
.canvas-aspect-box.aspect-9-16 {
  width: 180px;
  height: 320px;
}
.canvas-aspect-box.aspect-1-1 {
  width: 240px;
  height: 240px;
}
.canvas-aspect-box.aspect-16-9 {
  width: 320px;
  height: 180px;
}
.export-render-canvas {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

/* Render Overlay */
.render-overlay {
  position: absolute;
  inset: 0;
  background: rgba(6, 8, 14, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  text-align: center;
}
.render-spinner {
  width: 42px;
  height: 42px;
  border: 3px solid rgba(255, 255, 255, 0.15);
  border-top-color: #00f2fe;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.render-percent-txt {
  font-size: 1.4rem;
  font-weight: 900;
  color: #00f2fe;
}
.render-status-txt {
  font-size: 0.78rem;
  color: #94a3b8;
}

/* Settings Panel */
.export-settings-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.setting-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.setting-label {
  font-size: 0.74rem;
  font-weight: 800;
  color: #64748b;
  letter-spacing: 0.08em;
}
.format-chips-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}
.format-chip-btn {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 0.6rem 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  color: #94a3b8;
}
.format-chip-btn .chip-icon {
  font-size: 1.3rem;
}
.format-chip-btn .chip-text strong {
  display: block;
  font-size: 0.8rem;
  color: #e2e8f0;
}
.format-chip-btn .chip-text small {
  display: block;
  font-size: 0.65rem;
  color: #64748b;
}
.format-chip-btn.active {
  background: rgba(0, 242, 254, 0.12);
  border-color: #00f2fe;
  box-shadow: 0 0 15px rgba(0, 242, 254, 0.2);
}
.format-chip-btn.active .chip-text strong {
  color: #00f2fe;
}

.duration-chips-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}
.dur-chip-btn {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 0.55rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #94a3b8;
}
.dur-chip-btn span {
  font-size: 0.82rem;
  font-weight: 700;
  color: #e2e8f0;
}
.dur-chip-btn small {
  font-size: 0.66rem;
  color: #64748b;
}
.dur-chip-btn.active {
  background: rgba(0, 242, 254, 0.12);
  border-color: #00f2fe;
}
.dur-chip-btn.active span {
  color: #00f2fe;
}

/* Rendering Panel */
.rendering-progress-panel {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.progress-bar-bg {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  transition: width 0.2s ease;
}
.render-time-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  font-weight: 600;
  color: #94a3b8;
}
.btn-cancel-render {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.35);
  color: #ef4444;
  padding: 0.5rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.82rem;
  cursor: pointer;
  margin-top: 0.5rem;
}

/* Footer */
.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
}
.btn-secondary {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #94a3b8;
  padding: 0.65rem 1.2rem;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}
.btn-primary-export {
  border: none;
  color: #08090d;
  padding: 0.65rem 1.4rem;
  border-radius: 12px;
  font-weight: 800;
  font-size: 0.88rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  box-shadow: 0 4px 18px rgba(0, 242, 254, 0.35);
  transition: all 0.2s ease;
}
.btn-primary-export:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 242, 254, 0.55);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
