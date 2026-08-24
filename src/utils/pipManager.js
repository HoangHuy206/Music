/**
 * AuraMusic Picture-in-Picture (PiP) Floating Mini-Player Engine
 * Renders live album art, audio progress, spectrum visualizer, and 60FPS synced lyrics onto a canvas
 * and opens it in a native OS Picture-in-Picture floating window.
 */

let pipVideo = null;
let pipCanvas = null;
let pipCtx = null;
let animFrameId = null;
let cachedCoverImg = null;
let lastCoverUrl = null;
let discAngle = 0;
let isPiPActive = false;

let state = {
  title: 'AuraMusic',
  artist: 'Next-Gen Audio Player',
  coverUrl: '',
  currentTime: 0,
  duration: 0,
  isPlaying: false,
  visualizerColor: '#00f2fe',
  currentLyric: '',
  nextLyric: '',
  onTogglePlay: null,
  onNext: null,
  onPrev: null,
  onClose: null,
};

function initElements() {
  if (pipCanvas && pipVideo) return;

  pipCanvas = document.createElement('canvas');
  pipCanvas.width = 640;
  pipCanvas.height = 640;
  pipCtx = pipCanvas.getContext('2d');

  pipVideo = document.createElement('video');
  pipVideo.muted = true;
  pipVideo.autoplay = true;
  pipVideo.playsInline = true;
  pipVideo.style.position = 'fixed';
  pipVideo.style.bottom = '-9999px';
  pipVideo.style.left = '-9999px';
  pipVideo.style.width = '1px';
  pipVideo.style.height = '1px';
  pipVideo.style.opacity = '0';
  pipVideo.style.pointerEvents = 'none';

  document.body.appendChild(pipVideo);

  pipVideo.addEventListener('leavepictureinpicture', () => {
    isPiPActive = false;
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
    if (state.onClose) state.onClose();
  });
}

function loadCoverImage(url) {
  if (!url || url === lastCoverUrl) return;
  lastCoverUrl = url;
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    cachedCoverImg = img;
  };
  img.onerror = () => {
    cachedCoverImg = null;
  };
  img.src = url;
}

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

function drawFrame() {
  if (!pipCtx || !pipCanvas) return;

  const w = pipCanvas.width;
  const h = pipCanvas.height;
  const ctx = pipCtx;
  const themeColor = state.visualizerColor || '#00f2fe';

  // 1. Background Gradient
  const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w * 0.7);
  bgGrad.addColorStop(0, '#151928');
  bgGrad.addColorStop(0.5, '#0c0e15');
  bgGrad.addColorStop(1, '#050608');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // 2. Ambient Color Glow
  const glowGrad = ctx.createRadialGradient(w / 2, 230, 20, w / 2, 230, 240);
  glowGrad.addColorStop(0, `${themeColor}40`);
  glowGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, w, h);

  // 3. Album Cover / Spinning Vinyl
  const centerX = w / 2;
  const centerY = 220;
  const radius = 130;

  if (state.isPlaying) {
    discAngle = (discAngle + 0.015) % (Math.PI * 2);
  }

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(discAngle);

  // Outer Vinyl Ring
  ctx.beginPath();
  ctx.arc(0, 0, radius + 8, 0, Math.PI * 2);
  ctx.fillStyle = '#08090d';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = themeColor;
  ctx.shadowColor = themeColor;
  ctx.shadowBlur = state.isPlaying ? 20 : 8;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Clip Image into Circle
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.clip();

  if (cachedCoverImg) {
    ctx.drawImage(cachedCoverImg, -radius, -radius, radius * 2, radius * 2);
  } else {
    // Default disc gradient
    const discGrad = ctx.createLinearGradient(-radius, -radius, radius, radius);
    discGrad.addColorStop(0, '#1e293b');
    discGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = discGrad;
    ctx.fillRect(-radius, -radius, radius * 2, radius * 2);

    ctx.fillStyle = themeColor;
    ctx.font = 'bold 50px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎵', 0, 0);
  }

  // Center Hole
  ctx.beginPath();
  ctx.arc(0, 0, 22, 0, Math.PI * 2);
  ctx.fillStyle = '#050608';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = themeColor;
  ctx.stroke();

  ctx.restore();

  // 4. Song Title & Artist
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px "Be Vietnam Pro", sans-serif';
  const displayTitle = state.title.length > 28 ? state.title.substring(0, 28) + '...' : state.title;
  ctx.fillText(displayTitle, w / 2, 400);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.font = '500 20px "Be Vietnam Pro", sans-serif';
  const displayArtist = state.artist.length > 34 ? state.artist.substring(0, 34) + '...' : state.artist;
  ctx.fillText(displayArtist, w / 2, 435);

  // 5. Live Synced Lyrics (Current & Next)
  const lyricBoxY = 465;
  if (state.currentLyric) {
    ctx.fillStyle = themeColor;
    ctx.font = 'bold 22px "Be Vietnam Pro", sans-serif';
    ctx.shadowColor = themeColor;
    ctx.shadowBlur = 10;
    const curLyricTxt = state.currentLyric.length > 40 ? state.currentLyric.substring(0, 40) + '...' : state.currentLyric;
    ctx.fillText(`🎤 ${curLyricTxt}`, w / 2, lyricBoxY);
    ctx.shadowBlur = 0;

    if (state.nextLyric) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '400 16px "Be Vietnam Pro", sans-serif';
      const nxtLyricTxt = state.nextLyric.length > 46 ? state.nextLyric.substring(0, 46) + '...' : state.nextLyric;
      ctx.fillText(nxtLyricTxt, w / 2, lyricBoxY + 32);
    }
  } else {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.font = 'italic 18px "Be Vietnam Pro", sans-serif';
    ctx.fillText('AuraMusic • Floating Mini Player', w / 2, lyricBoxY + 15);
  }

  // 6. Progress Bar & Time
  const barY = 570;
  const barMargin = 60;
  const barW = w - barMargin * 2;
  const progress = state.duration > 0 ? Math.min(1, state.currentTime / state.duration) : 0;

  // Background Bar
  ctx.beginPath();
  ctx.roundRect(barMargin, barY, barW, 8, 4);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fill();

  // Fill Bar
  if (progress > 0) {
    ctx.beginPath();
    ctx.roundRect(barMargin, barY, barW * progress, 8, 4);
    ctx.fillStyle = themeColor;
    ctx.shadowColor = themeColor;
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Timestamps
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = '14px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(formatTime(state.currentTime), barMargin, barY + 28);

  ctx.textAlign = 'right';
  ctx.fillText(formatTime(state.duration), w - barMargin, barY + 28);

  // Loop rendering while PiP is active
  if (isPiPActive) {
    animFrameId = requestAnimationFrame(drawFrame);
  }
}

/**
 * Setup MediaSession API handlers for OS / PiP media controls
 */
function updateMediaSession() {
  if (!('mediaSession' in navigator)) return;

  navigator.mediaSession.metadata = new MediaMetadata({
    title: state.title,
    artist: state.artist,
    album: 'AuraMusic Hi-Res',
    artwork: state.coverUrl
      ? [{ src: state.coverUrl, sizes: '512x512', type: 'image/png' }]
      : [],
  });

  navigator.mediaSession.setActionHandler('play', () => {
    if (state.onTogglePlay) state.onTogglePlay();
  });
  navigator.mediaSession.setActionHandler('pause', () => {
    if (state.onTogglePlay) state.onTogglePlay();
  });
  navigator.mediaSession.setActionHandler('previoustrack', () => {
    if (state.onPrev) state.onPrev();
  });
  navigator.mediaSession.setActionHandler('nexttrack', () => {
    if (state.onNext) state.onNext();
  });
}

/**
 * Update state for the PiP player
 */
export function updatePiPState(newState) {
  Object.assign(state, newState);
  if (newState.coverUrl) {
    loadCoverImage(newState.coverUrl);
  }
  updateMediaSession();
}

/**
 * Toggle Picture-in-Picture floating window
 * @returns {Promise<boolean>} True if now open, false if closed
 */
export async function togglePictureInPicture(opts = {}) {
  if (typeof document === 'undefined') return false;

  initElements();
  if (opts) Object.assign(state, opts);
  if (state.coverUrl) loadCoverImage(state.coverUrl);

  // If already in PiP, exit
  if (document.pictureInPictureElement) {
    await document.exitPictureInPicture();
    isPiPActive = false;
    if (animFrameId) cancelAnimationFrame(animFrameId);
    return false;
  }

  // Draw initial frame
  drawFrame();

  try {
    const stream = pipCanvas.captureStream(30);
    pipVideo.srcObject = stream;
    await pipVideo.play();
    await pipVideo.requestPictureInPicture();
    isPiPActive = true;

    // Start continuous render loop
    if (!animFrameId) {
      animFrameId = requestAnimationFrame(drawFrame);
    }

    updateMediaSession();
    return true;
  } catch (err) {
    console.error('[PiP Error]:', err);
    isPiPActive = false;
    throw err;
  }
}

/**
 * Check if PiP is currently active
 */
export function isPictureInPictureActive() {
  return isPiPActive || !!document.pictureInPictureElement;
}
