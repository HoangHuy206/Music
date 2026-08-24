<template>
  <div class="music-app-container">
    <!-- SoundCloud Smart Taste Autoplay Toast Notification -->
    <transition name="toast-fade">
      <div v-if="recommendationToast" class="taste-toast-notification" :style="{ borderColor: `${visualizerColor}80` }">
        <span class="taste-toast-icon">📻</span>
        <div class="taste-toast-body">
          <span class="taste-toast-badge" :style="{ color: visualizerColor }">SoundCloud Autoplay</span>
          <span class="taste-toast-msg">{{ recommendationToast }}</span>
        </div>
      </div>
    </transition>

    <!-- Background Ambient Glow dynamically reactive to song beat and visualizer color -->
    <div
      class="ambient-glow"
      :style="{
        background: `radial-gradient(circle at 40% 40%, ${visualizerColor}${Math.floor(25 + bassEnergy * 35).toString(16)} 0%, rgba(10, 12, 18, 0.95) 75%)`,
        transform: `scale(${1 + bassEnergy * 0.08})`,
      }"
    ></div>

    <!-- Floating Background Cyber Particle Grid -->
    <div class="cyber-grid-overlay"></div>

    <!-- Loading State -->
    <div v-if="loading" class="state-container">
      <div class="loader-spinner" :style="{ borderTopColor: visualizerColor }"></div>
      <p class="state-text">Loading audio track and lyrics...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="state-container error-state">
      <div class="error-icon">⚠️</div>
      <p class="state-text">{{ error }}</p>
      <button class="retry-btn" @click="fetchSongs">Retry Connection</button>
    </div>

    <!-- Main Player Layout -->
    <main v-else class="player-layout">
      <!-- Mobile View Switcher (Visible only on mobile <= 768px) -->
      <div class="mobile-player-tab-switch">
        <button
          class="m-tab-btn"
          :class="{ active: mobilePlayerTab === 'vinyl' }"
          :style="mobilePlayerTab === 'vinyl' ? { borderColor: visualizerColor, color: visualizerColor, background: `${visualizerColor}20` } : {}"
          @click="mobilePlayerTab = 'vinyl'"
        >
          <span>🎧 Đĩa Than</span>
        </button>
        <button
          class="m-tab-btn"
          :class="{ active: mobilePlayerTab === 'lyrics' }"
          :style="mobilePlayerTab === 'lyrics' ? { borderColor: visualizerColor, color: visualizerColor, background: `${visualizerColor}20` } : {}"
          @click="mobilePlayerTab = 'lyrics'"
        >
          <span>🎤 Lời Bài Hát</span>
        </button>
      </div>

      <!-- Left Panel: Vinyl Player & Controls -->
      <section class="player-left" :class="{ 'm-hidden': mobilePlayerTab !== 'vinyl' }">
        <!-- Audio Badges & Top Utilities -->
        <div class="audio-badges-bar">
          <div class="badge-group-left">
            <span class="audio-badge hi-res-badge">
              <span class="badge-dot" :style="{ backgroundColor: visualizerColor }"></span>
              {{ currentSong ? 'HI-RES AUDIO' : 'STANDBY' }}
            </span>
            <span class="audio-badge spec-badge">{{ currentSong ? '320 KBPS • 44.1KHZ' : 'NO TRACK' }}</span>
          </div>

          <div class="header-tools-group">
            <!-- 📺 PiP Floating Mini-Player with Live Lyrics -->
            <button
              class="top-tool-btn pip-tool-btn"
              :class="{ active: isPiPFloating }"
              :style="isPiPFloating ? { borderColor: visualizerColor, color: visualizerColor } : {}"
              title="Mở Mini Player nổi ngoài màn hình kèm Lời bài hát trực tiếp (Picture-in-Picture)"
              @click="handleTogglePiP"
            >
              <span class="pip-mini-icon">📺</span>
              <span>Mini Player</span>
              <span v-if="isPiPFloating" class="eq-active-dot" :style="{ backgroundColor: visualizerColor }"></span>
            </button>

            <!-- 🎛️ 10-Band EQ & 8D Spatial Audio Modal Toggle -->
            <button
              class="top-tool-btn eq-tool-btn"
              :class="{ active: isEqModalOpen, 'eq-active': is8DEnabled || hasCustomEq }"
              :style="isEqModalOpen ? { borderColor: visualizerColor, color: visualizerColor } : {}"
              title="Bộ Chỉnh Âm Thanh Equalizer 10-Band & Hiệu Ứng 8D Audio"
              @click="isEqModalOpen = !isEqModalOpen"
            >
              <span class="eq-mini-icon">🎛️</span>
              <span>Equalizer & 8D</span>
              <span v-if="is8DEnabled" class="eq-active-dot" :style="{ backgroundColor: visualizerColor }"></span>
            </button>

            <!-- 📑 Custom Playlists & Favorites Drawer Toggle -->
            <button
              class="top-tool-btn playlist-tool-btn"
              :class="{ active: isQueueOpen }"
              :style="isQueueOpen ? { borderColor: visualizerColor, color: visualizerColor } : {}"
              title="Danh Sách Bài Hát, Yêu Thích & Playlists"
              @click="isQueueOpen = !isQueueOpen"
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
              </svg>
              <span>Danh Sách ({{ songList.length }})</span>
            </button>
          </div>
        </div>

        <!-- Vinyl Record Disc Container with Realistic Tonearm -->
        <div class="vinyl-wrapper">
          <!-- Ambient disc shadow / halo reactive to bass energy -->
          <div
            class="vinyl-halo"
            :class="{ 'halo-pulsing': isPlaying }"
            :style="{
              borderColor: visualizerColor,
              boxShadow: isPlaying ? `0 0 ${40 + bassEnergy * 45}px ${visualizerColor}55` : 'none',
              transform: `scale(${1 + bassEnergy * 0.04})`,
            }"
          ></div>

          <!-- Vinyl Record Disc -->
          <div
            class="vinyl-disc"
            :class="{ 'is-spinning': isPlaying, 'is-paused': !isPlaying }"
          >
            <!-- Grooves -->
            <div class="vinyl-groove groove-outer"></div>
            <div class="vinyl-groove groove-middle"></div>
            <div class="vinyl-groove groove-inner"></div>

            <!-- Realistic Vinyl Light Reflection Sheens -->
            <div class="vinyl-sheen sheen-1"></div>
            <div class="vinyl-sheen sheen-2"></div>

            <!-- Cover Art Centerpiece / Default Vinyl Label -->
            <div class="vinyl-center" :class="{ 'is-default-vinyl': !hasValidCoverImage }">
              <img
                v-if="hasValidCoverImage && currentSong"
                :src="formatMediaUrl(currentSong?.coverImage)"
                :alt="currentSong?.title || 'Song cover'"
                class="cover-art-img"
                @error="handleImageFallback"
              />
              <div v-else class="vinyl-default-label" :style="{ borderColor: `${visualizerColor}55` }">
                <div class="label-inner-ring" :style="{ borderColor: `${visualizerColor}25` }"></div>
                <div class="label-top-curve">LP STEREO</div>
                <span class="label-music-symbol" :style="{ color: visualizerColor }">✦</span>
                <div class="label-bottom-curve">33⅓ RPM</div>
              </div>
              <div class="spindle-hole"></div>
            </div>
          </div>

          <!-- Realistic Metallic Tonearm (Kim quay đĩa than) -->
          <div class="tonearm-assembly" :class="{ 'is-playing': isPlaying }">
            <div class="tonearm-base"></div>
            <div class="tonearm-pivot"></div>
            <div class="tonearm-arm">
              <div class="tonearm-cartridge" :style="{ borderColor: visualizerColor }">
                <div class="tonearm-stylus"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Song Metadata with Favorite Heart ❤️ & Add to Playlist 📑 -->
        <div class="song-meta">
          <div class="song-meta-main">
            <div class="meta-text-col">
              <h1 class="song-title" :title="currentSong?.title || 'Chưa có bài hát nào'">
                {{ currentSong ? currentSong.title : 'Chưa có bài hát nào' }}
              </h1>
              <h2 class="song-artist">
                {{ currentSong ? currentSong.artist : 'Vui lòng chọn bài từ Queue hoặc tải lên' }}
              </h2>
            </div>

            <!-- Action buttons -->
            <div v-if="currentSong" class="song-actions-row">
              <button
                class="song-fav-btn"
                :class="{ 'is-fav': isCurrentSongFavorite }"
                :style="isCurrentSongFavorite ? { color: '#ff007f', borderColor: 'rgba(255,0,127,0.4)', background: 'rgba(255,0,127,0.15)', boxShadow: '0 0 15px rgba(255,0,127,0.3)' } : {}"
                :title="isCurrentSongFavorite ? 'Bỏ thích bài hát' : 'Thêm vào Bài Hát Yêu Thích ❤️'"
                @click="handleToggleFavorite(currentSong)"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" :fill="isCurrentSongFavorite ? '#ff007f' : 'currentColor'">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </button>

              <!-- Offline Download Toggle Button -->
              <button
                class="song-fav-btn song-offline-btn"
                :class="{ 'is-offline-saved': isCurrentSongOffline }"
                :style="isCurrentSongOffline ? { color: '#10b981', borderColor: 'rgba(16,185,129,0.4)', background: 'rgba(16,185,129,0.15)', boxShadow: '0 0 15px rgba(16,185,129,0.3)' } : {}"
                :title="isCurrentSongOffline ? 'Đã lưu nghe Offline (Bấm để xóa)' : 'Tải về để nghe Offline khi mất mạng 💾'"
                :disabled="isDownloadingOffline"
                @click="handleToggleOffline(currentSong)"
              >
                <svg v-if="isDownloadingOffline" viewBox="0 0 24 24" width="16" height="16" class="spin-icon" fill="currentColor">
                  <path d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8z"/>
                </svg>
                <svg v-else-if="isCurrentSongOffline" viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
                  <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z"/>
                </svg>
              </button>

              <button
                class="song-playlist-btn"
                title="Thêm bài hát này vào Playlist"
                @click="openAddToPlaylistModal(currentSong)"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M14 10H2v2h12v-2zm0-4H2v2h12V6zm4 8v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM2 16h8v-2H2v2z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Audio Progress Bar -->
        <div class="playback-timeline">
          <span class="time-display">{{ formatTime(currentTime) }}</span>
          <div
            class="progress-bar-container"
            :style="{ cursor: currentSong ? 'pointer' : 'not-allowed' }"
            @click="handleSeek"
          >
            <div class="progress-bar-bg">
              <div
                class="progress-bar-fill"
                :style="{ width: `${progressPercentage}%`, backgroundColor: visualizerColor }"
              ></div>
            </div>
          </div>
          <span class="time-display">{{ formatTime(duration) }}</span>
        </div>

        <!-- Playback Controls Toolbar -->
        <div class="controls-toolbar">
          <!-- Prev Song -->
          <button
            class="control-btn nav-btn"
            :disabled="!currentSong || songList.length <= 1"
            :title="!currentSong ? 'Chưa chọn bài hát' : 'Previous track'"
            @click="switchSong(-1)"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
            </svg>
          </button>

          <!-- Play / Pause Primary Button -->
          <button
            class="control-btn play-pause-btn"
            :disabled="!currentSong"
            :style="{
              backgroundColor: currentSong ? visualizerColor : '#1e293b',
              opacity: currentSong ? 1 : 0.45,
              cursor: currentSong ? 'pointer' : 'not-allowed',
              boxShadow: isPlaying ? `0 0 ${20 + bassEnergy * 25}px ${getColorWithAlpha(visualizerColor, 0.65)}` : `0 8px 25px rgba(0,0,0,0.5)`,
              transform: currentSong ? `scale(${1 + bassEnergy * 0.05})` : 'none'
            }"
            :title="!currentSong ? 'Chưa chọn bài hát' : isPlaying ? 'Pause' : 'Play'"
            @click="togglePlay"
          >
            <!-- Pause Icon -->
            <svg v-if="isPlaying" viewBox="0 0 24 24" width="28" height="28" fill="#0b0c10">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
            <!-- Play Icon -->
            <svg v-else viewBox="0 0 24 24" width="28" height="28" :fill="currentSong ? '#0b0c10' : '#64748b'">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>

          <!-- Next Song -->
          <button
            class="control-btn nav-btn"
            :disabled="!currentSong || songList.length <= 1"
            :title="!currentSong ? 'Chưa chọn bài hát' : 'Next track'"
            @click="switchSong(1)"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="m6 18 8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>
        </div>

        <!-- Volume Control & Theme Mood Bar -->
        <div class="bottom-tools-bar">
          <div class="volume-slider-group">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" class="volume-icon">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
            </svg>
            <input
              v-model.number="volume"
              type="range"
              min="0"
              max="1"
              step="0.01"
              class="volume-range"
              :style="{ accentColor: visualizerColor }"
              @input="updateVolume"
            />
          </div>

          <!-- Quick Theme Mood Color Selector & Auto Chroma Flow -->
          <div class="theme-mood-selector">
            <!-- Auto Flow Button -->
            <button
              class="theme-auto-btn"
              :class="{ active: isAutoColorMode }"
              title="Chế độ màu tự động chuyển đổi liên tục không ngừng (Auto Chroma Flow)"
              @click="toggleAutoColorMode"
            >
              <span class="auto-rainbow-ring"></span>
              <span class="auto-btn-txt">Auto</span>
            </button>

            <!-- Color Presets -->
            <button
              v-for="theme in themePresets"
              :key="theme.color"
              class="theme-dot-btn"
              :class="{ active: !isAutoColorMode && userCustomColor === theme.color }"
              :style="{ backgroundColor: theme.color, boxShadow: (!isAutoColorMode && visualizerColor === theme.color) ? `0 0 12px ${theme.color}` : 'none' }"
              :title="theme.name"
              @click="selectThemeColor(theme.color)"
            ></button>

            <!-- Custom Color Picker Tool -->
            <div class="custom-color-picker-wrapper" title="Bảng chọn màu tùy thích theo ý muốn">
              <label class="custom-picker-label" :style="{ borderColor: !isAutoColorMode && userCustomColor ? visualizerColor : 'rgba(255,255,255,0.25)' }">
                <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor">
                  <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19.4c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.9-1.9C9.28 19.59 10.58 20 12 20c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 15c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
                </svg>
                <input
                  type="color"
                  class="hidden-color-input"
                  :value="visualizerColor.startsWith('#') ? visualizerColor : '#00e5ff'"
                  @input="onCustomColorInput"
                />
              </label>
            </div>
          </div>
        </div>

        <!-- Real-Time Dynamic Audio Frequency Visualizer -->
        <div class="visualizer-container" :style="{ borderColor: `${visualizerColor}25` }">
          <canvas ref="canvasRef" class="visualizer-canvas" width="280" height="36"></canvas>
        </div>
      </section>

      <!-- Right Panel: Synchronized Scrolling Lyrics & Editor -->
      <section class="player-right" :class="{ 'm-hidden': mobilePlayerTab !== 'lyrics' }">
        <div class="lyrics-header">
          <div class="lyrics-header-left">
            <span class="lyrics-badge">
              <span class="badge-dot pulse" :style="{ backgroundColor: visualizerColor }"></span>
              Synchronized Lyrics
            </span>
            <span v-if="!isEditingLyrics && currentSong?.lyricsData?.length" class="lyrics-hint">
              Click any line to jump audio
            </span>
          </div>

          <div class="lyrics-header-actions">
            <!-- Lyrics Sync Offset Quick Tuner -->
            <div v-if="!isEditingLyrics && currentSong" class="sync-offset-tuner" title="Căn chỉnh độ trễ lời bài hát (Bấm +/- 0.5s để khớp nhịp ca sĩ)">
              <button class="offset-btn" @click="adjustSyncOffset(-0.5)" title="Chạy lời sớm hơn (-0.5s)">-0.5s</button>
              <span
                class="offset-label"
                :class="{ 'has-offset': lyricSyncOffset !== 0 }"
                :title="lyricSyncOffset !== 0 ? 'Bấm để đặt lại 0.0s' : 'Độ trễ lời bài hát'"
                @click="adjustSyncOffset(-lyricSyncOffset)"
              >
                {{ lyricSyncOffset > 0 ? `+${lyricSyncOffset}s` : lyricSyncOffset < 0 ? `${lyricSyncOffset}s` : '±0.0s' }}
              </span>
              <button class="offset-btn" @click="adjustSyncOffset(0.5)" title="Chạy lời trễ hơn (+0.5s)">+0.5s</button>
            </div>

            <!-- Edit Lyrics Toggle Button -->
            <button
              class="edit-lyrics-btn"
              :class="{ 'is-editing': isEditingLyrics }"
              :style="isEditingLyrics ? { borderColor: visualizerColor, color: visualizerColor } : {}"
              :title="isEditingLyrics ? 'Close Lyrics Editor' : 'Edit Lyrics (JSON)'"
              @click="toggleEditLyrics"
            >
              <svg v-if="!isEditingLyrics" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
              </svg>
              <svg v-else viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
              <span>{{ isEditingLyrics ? 'Close' : 'Edit' }}</span>
            </button>
          </div>
        </div>

        <!-- Lyrics JSON Editor Mode -->
        <div v-if="isEditingLyrics" class="lyrics-editor-container">
          <div class="editor-subhead">
            <span class="editor-tip">
              Format: <code>[{ "time": 12.3, "text": "..." }]</code>
            </span>
            <button class="editor-util-btn" type="button" @click="formatLyricsJsonHelper">
              Beautify JSON
            </button>
          </div>

          <textarea
            v-model="lyricsJsonInput"
            class="lyrics-json-textarea"
            placeholder='[\n  { "time": 0.0, "text": "Lời bài hát..." }\n]'
            spellcheck="false"
          ></textarea>

          <div v-if="lyricsJsonError" class="editor-error-msg">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <span>{{ lyricsJsonError }}</span>
          </div>

          <div class="editor-actions">
            <button
              class="save-lyrics-btn"
              :style="{ backgroundColor: visualizerColor }"
              :disabled="isSavingLyrics"
              @click="saveLyricsChanges"
            >
              <svg v-if="!isSavingLyrics" viewBox="0 0 24 24" width="16" height="16" fill="#0b0c10">
                <path d="M17 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
              </svg>
              <span>{{ isSavingLyrics ? 'Saving...' : lyricsSaveSuccess ? 'Saved!' : 'Save Changes' }}</span>
            </button>

            <button
              class="cancel-edit-btn"
              :disabled="isSavingLyrics"
              @click="toggleEditLyrics"
            >
              Cancel
            </button>
          </div>
        </div>

        <!-- Normal Lyrics Display Mode -->
        <div v-else ref="lyricsContainerRef" class="lyrics-scroll-container">
          <!-- Lyrics List -->
          <template v-if="currentSong && displayLyrics && displayLyrics.length > 0">
            <div
              v-for="(lyric, index) in displayLyrics"
              :id="`lyric-line-${index}`"
              :key="index"
              class="lyric-line"
              :class="{
                'is-active': index === activeLyricIndex,
                'is-passed': index < activeLyricIndex,
                'is-intro-dots': lyric.isIntro || lyric.isInterlude || lyric.text === '...',
              }"
              @click="seekToTimestamp(lyric.time)"
            >
              <p
                class="lyric-text"
                :class="{
                  'karaoke-active-line': index === activeLyricIndex,
                  'dots-text': lyric.isIntro || lyric.isInterlude || lyric.text === '...',
                }"
              >
                <!-- Intro or Interlude 3 dots (...) -->
                <template v-if="lyric.isIntro || lyric.isInterlude || lyric.text === '...'">
                  <span class="dots-pulse" :style="{ color: visualizerColor }">...</span>
                </template>

                <!-- Normal Lyric Line with Real-Time Word-by-Word karaoke fill -->
                <template v-else>
                  <!-- Active Line: 60 FPS real-time progressive word fill -->
                  <template v-if="index === activeLyricIndex">
                    <span
                      v-for="(wordObj, wIdx) in getLyricWords(lyric)"
                      :key="wIdx"
                      class="karaoke-word is-active-word"
                      :style="getActiveWordStyle(lyric, wIdx)"
                    >{{ wordObj.word }}</span>
                  </template>

                  <!-- Inactive Lines: lightweight static render with 0 overhead -->
                  <template v-else>
                    <span
                      v-for="(wordObj, wIdx) in getLyricWords(lyric)"
                      :key="wIdx"
                      class="karaoke-word"
                      :class="{
                        'is-passed-word': index < activeLyricIndex,
                        'is-future-word': index > activeLyricIndex,
                      }"
                    >{{ wordObj.word }}</span>
                  </template>
                </template>
              </p>
            </div>
          </template>

          <!-- Standby state when no song is selected yet -->
          <div v-else-if="!currentSong" class="empty-player-banner">
            <div class="empty-banner-disc">💿</div>
            <h3 class="empty-banner-title">Chưa Có Bài Hát Nào Được Chọn</h3>
            <p class="empty-banner-desc">
              Hãy chọn bài hát từ ô tìm kiếm hoặc tải lên bài hát mới để bắt đầu phát nhạc và trải nghiệm hiệu ứng đồng bộ lời bài hát.
            </p>
          </div>

          <!-- Fallback when song has no lyrics -->
          <div v-else class="empty-lyrics-notice">
            <p>Instrumental track or lyrics not available for this song.</p>
          </div>
        </div>
      </section>
    </main>

    <!-- 1. Equalizer 10-Band & 8D Spatial Audio Modal -->
    <EqualizerModal
      :is-open="isEqModalOpen"
      :visualizer-color="visualizerColor"
      :eq-gains="eqGains"
      :is8-d-enabled="is8DEnabled"
      :spatial8-d-speed="spatial8DSpeed"
      :active-preset="activeEqPreset"
      @close="isEqModalOpen = false"
      @update-gain="updateEqGain"
      @apply-preset="applyEqPreset"
      @toggle-8d="toggle8D"
      @update-8d-speed="spatial8DSpeed = $event"
      @reset-eq="resetEq"
    />

    <!-- 2. Add to Playlist Modal -->
    <AddToPlaylistModal
      :is-open="isAddToPlaylistModalOpen"
      :song="songToAddToPlaylist"
      :playlists="userPlaylists"
      :visualizer-color="visualizerColor"
      @close="isAddToPlaylistModalOpen = false"
      @add-to-playlist="handleAddSongToPlaylist"
      @create-and-add="handleCreateAndAddPlaylist"
    />

    <!-- 3. Queue / Favorites / Playlists Side Drawer -->
    <transition name="drawer-slide">
      <div v-if="isQueueOpen" class="queue-drawer-backdrop" @click.self="isQueueOpen = false">
        <div class="queue-drawer-panel" :style="{ borderColor: `${visualizerColor}35` }">
          <!-- Drawer Header -->
          <div class="drawer-header">
            <div class="drawer-tabs-nav">
              <button
                class="drawer-tab-btn"
                :class="{ active: queueActiveTab === 'queue' }"
                :style="queueActiveTab === 'queue' ? { borderColor: visualizerColor, color: visualizerColor, background: `${visualizerColor}15` } : {}"
                @click="queueActiveTab = 'queue'"
              >
                <span>Hàng Đợi ({{ songList.length }})</span>
              </button>

              <button
                class="drawer-tab-btn"
                :class="{ active: queueActiveTab === 'favorites' }"
                :style="queueActiveTab === 'favorites' ? { borderColor: '#ff007f', color: '#ff007f', background: 'rgba(255,0,127,0.15)' } : {}"
                @click="queueActiveTab = 'favorites'"
              >
                <span>Yêu Thích ❤️ ({{ favoriteSongsList.length }})</span>
              </button>

              <button
                class="drawer-tab-btn"
                :class="{ active: queueActiveTab === 'playlists' }"
                :style="queueActiveTab === 'playlists' ? { borderColor: visualizerColor, color: visualizerColor, background: `${visualizerColor}15` } : {}"
                @click="queueActiveTab = 'playlists'"
              >
                <span>Playlists 📑 ({{ userPlaylists.length }})</span>
              </button>

              <button
                class="drawer-tab-btn"
                :class="{ active: queueActiveTab === 'offline' }"
                :style="queueActiveTab === 'offline' ? { borderColor: '#10b981', color: '#10b981', background: 'rgba(16,185,129,0.15)' } : {}"
                @click="loadAndSwitchToOfflineTab"
              >
                <span>Offline 💾 ({{ offlineTracksList.length }})</span>
              </button>
            </div>

            <button class="drawer-close-btn" @click="isQueueOpen = false">✕</button>
          </div>

          <!-- Tab 1: Current Queue -->
          <div v-if="queueActiveTab === 'queue'" class="drawer-tab-content">
            <div class="queue-list-items">
              <div
                v-for="(song, index) in songList"
                :key="song._id || index"
                class="queue-item-row"
                :class="{ 'is-current-playing': index === currentSongIndex }"
                @click="selectSongFromQueue(index)"
              >
                <div class="queue-thumb-box">
                  <img v-if="song.coverImage" :src="formatMediaUrl(song.coverImage)" class="queue-thumb-img" />
                  <span v-else class="queue-thumb-fallback">🎵</span>
                  <div v-if="index === currentSongIndex && isPlaying" class="queue-playing-waves">
                    <span></span><span></span><span></span>
                  </div>
                </div>

                <div class="queue-info-box">
                  <span class="queue-song-title">{{ song.title }}</span>
                  <span class="queue-song-artist">{{ song.artist }}</span>
                </div>

                <div class="queue-actions-box" @click.stop>
                  <!-- Offline toggle -->
                  <button
                    class="q-action-btn"
                    :style="savedOfflineIds.has(song._id) ? { color: '#10b981' } : {}"
                    :title="savedOfflineIds.has(song._id) ? 'Đã lưu offline' : 'Lưu nghe offline'"
                    @click="handleToggleOffline(song)"
                  >
                    {{ savedOfflineIds.has(song._id) ? '💾' : '⬇️' }}
                  </button>

                  <!-- Heart Favorite button -->
                  <button
                    class="q-action-btn"
                    :class="{ 'is-fav': isSongInFavorites(song._id) }"
                    :style="isSongInFavorites(song._id) ? { color: '#ff007f' } : {}"
                    title="Thả tim yêu thích"
                    @click="handleToggleFavorite(song)"
                  >
                    ❤️
                  </button>

                  <!-- Add to playlist -->
                  <button
                    class="q-action-btn"
                    title="Thêm vào playlist"
                    @click="openAddToPlaylistModal(song)"
                  >
                    +📑
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab 2: Favorites List -->
          <div v-else-if="queueActiveTab === 'favorites'" class="drawer-tab-content">
            <div class="drawer-quick-bar">
              <button
                v-if="favoriteSongsList.length > 0"
                class="play-all-btn"
                :style="{ background: `linear-gradient(135deg, #ff007f, ${visualizerColor})` }"
                @click="playAllFavorites"
              >
                ▶ Phát Tất Cả Bài Hát Yêu Thích ({{ favoriteSongsList.length }})
              </button>
            </div>

            <div v-if="favoriteSongsList.length === 0" class="drawer-empty-state">
              <span class="empty-icon">💔</span>
              <p class="empty-title">Bạn chưa thả tim bài hát nào.</p>
              <span class="empty-sub">Hãy bấm icon ❤️ trên bài hát để thêm vào danh sách yêu thích!</span>
            </div>

            <div v-else class="queue-list-items">
              <div
                v-for="song in favoriteSongsList"
                :key="song._id"
                class="queue-item-row"
                @click="playSong(song)"
              >
                <div class="queue-thumb-box">
                  <img v-if="song.coverImage" :src="formatMediaUrl(song.coverImage)" class="queue-thumb-img" />
                  <span v-else class="queue-thumb-fallback">🎵</span>
                </div>
                <div class="queue-info-box">
                  <span class="queue-song-title">{{ song.title }}</span>
                  <span class="queue-song-artist">{{ song.artist }}</span>
                </div>
                <button class="q-action-btn" style="color: #ff007f" @click.stop="handleToggleFavorite(song)">
                  ❤️
                </button>
              </div>
            </div>
          </div>

          <!-- Tab 3: Playlists List -->
          <div v-else-if="queueActiveTab === 'playlists'" class="drawer-tab-content">
            <div class="drawer-quick-bar">
              <button
                class="play-all-btn"
                :style="{ background: `linear-gradient(135deg, ${visualizerColor}, #4facfe)` }"
                @click="openAddToPlaylistModal(currentSong)"
              >
                + Tạo Playlist Mới
              </button>
            </div>

            <div v-if="userPlaylists.length === 0" class="drawer-empty-state">
              <span class="empty-icon">📑</span>
              <p class="empty-title">Chưa có Playlist nào được tạo.</p>
              <span class="empty-sub">Tạo danh sách phát riêng theo tâm trạng (Chill, Gym, v.v.)!</span>
            </div>

            <div v-else class="playlists-accordion-list">
              <div
                v-for="pl in userPlaylists"
                :key="pl._id"
                class="playlist-drawer-card"
              >
                <div class="pl-card-header">
                  <div class="pl-header-info">
                    <span class="pl-card-icon">📁</span>
                    <div>
                      <h4 class="pl-card-name">{{ pl.name }}</h4>
                      <span class="pl-card-meta">{{ pl.songs?.length || 0 }} bài hát</span>
                    </div>
                  </div>

                  <div class="pl-card-actions">
                    <button
                      v-if="pl.songs && pl.songs.length > 0"
                      class="pl-play-btn"
                      :style="{ background: visualizerColor, color: '#000' }"
                      title="Phát Playlist này"
                      @click="playEntirePlaylist(pl)"
                    >
                      ▶ Phát
                    </button>

                    <button
                      class="pl-del-btn"
                      title="Xóa Playlist"
                      @click="handleDeletePlaylist(pl._id, pl.name)"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab 4: Offline Tracks List (IndexedDB) -->
          <div v-else-if="queueActiveTab === 'offline'" class="drawer-tab-content">
            <div class="drawer-quick-bar">
              <button
                v-if="offlineTracksList.length > 0"
                class="play-all-btn"
                :style="{ background: 'linear-gradient(135deg, #10b981, #00f2fe)', color: '#08090d' }"
                @click="playAllOfflineTracks"
              >
                ▶ Phát Toàn Bộ Nhạc Offline ({{ offlineTracksList.length }})
              </button>
            </div>

            <div v-if="offlineTracksList.length === 0" class="drawer-empty-state">
              <span class="empty-icon">💾</span>
              <p class="empty-title">Chưa có bài hát nào lưu Offline.</p>
              <span class="empty-sub">Hãy bấm nút 💾 trên bài hát để tải về máy và nghe mọi lúc ngay cả khi không có mạng!</span>
            </div>

            <div v-else class="queue-list-items">
              <div
                v-for="(song, oIdx) in offlineTracksList"
                :key="song._id || oIdx"
                class="queue-item-row"
                :class="{ 'is-current-playing': currentSong?._id === song._id }"
                @click="playOfflineTrack(song)"
              >
                <div class="queue-thumb-box">
                  <img v-if="song.coverImage" :src="song.coverImage" class="queue-thumb-img" />
                  <span v-else class="queue-thumb-fallback">💾</span>
                </div>
                <div class="queue-info-box">
                  <span class="queue-song-title">{{ song.title }}</span>
                  <span class="queue-song-artist">{{ song.artist }} • {{ (song.size / (1024 * 1024)).toFixed(1) }} MB</span>
                </div>
                <div class="queue-actions-box" @click.stop>
                  <button
                    class="q-action-btn"
                    style="color: #ef4444"
                    title="Xóa khỏi bộ nhớ Offline"
                    @click="handleRemoveOffline(song)"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Hidden HTML5 Audio Element -->
    <audio
      ref="audioRef"
      :src="audioSourceUrl"
      crossorigin="anonymous"
      preload="metadata"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
      @ended="onTrackEnded"
      @error="onAudioError"
    ></audio>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import EqualizerModal from './EqualizerModal.vue';
import AddToPlaylistModal from './AddToPlaylistModal.vue';
import { currentUser, getAuthHeaders } from '../utils/auth.js';
import { detectSongGenre, isSongRemix, fetchOnlineRelatedTracks, recordSongPlayEvent } from '../utils/recommendation.js';
import { showToast } from '../utils/toast.js';
import { updatePiPState, togglePictureInPicture, isPictureInPictureActive } from '../utils/pipManager.js';
import {
  saveTrackOffline,
  removeTrackOffline,
  getOfflineTracks,
  isTrackSavedOffline,
  getOfflineAudioUrl,
} from '../utils/offlineStorage.js';
import { API_BASE_URL } from '../config/api.js';

const props = defineProps({
  initialSongIndex: {
    type: Number,
    default: -1,
  },
});

const emit = defineEmits(['open-auth']);

// Mobile Player Tab Switch (Vinyl vs Lyrics)
const mobilePlayerTab = ref('vinyl');

// PiP Floating Mini-Player State
const isPiPFloating = ref(false);

// Offline Storage State (IndexedDB)
const offlineTracksList = ref([]);
const savedOfflineIds = ref(new Set());
const isDownloadingOffline = ref(false);
const offlineAudioBlobUrl = ref(null);

// Equalizer 10-Band EQ & 8D Spatial Audio State
const isEqModalOpen = ref(false);
const EQ_FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
const eqGains = ref([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
const activeEqPreset = ref('flat');
let eqNodes = [];
let pannerNode = null;
const is8DEnabled = ref(false);
const spatial8DSpeed = ref(1.0);
let spatial8DAngle = 0;

const hasCustomEq = computed(() => {
  return eqGains.value.some((g) => g !== 0);
});

// Favorites & Custom Playlists State
const favoriteSongIds = ref(new Set());
const favoriteSongsList = ref([]);
const userPlaylists = ref([]);
const queueActiveTab = ref('queue'); // 'queue' | 'favorites' | 'playlists' | 'offline'
const isAddToPlaylistModalOpen = ref(false);
const songToAddToPlaylist = ref(null);

const isCurrentSongFavorite = computed(() => {
  return !!(currentSong.value && favoriteSongIds.value.has(currentSong.value._id));
});

const isCurrentSongOffline = computed(() => {
  if (!currentSong.value) return false;
  const id = currentSong.value._id || currentSong.value.id;
  return !!(id && savedOfflineIds.value.has(String(id)));
});

function isSongInFavorites(songId) {
  return !!(songId && favoriteSongIds.value.has(songId));
}

// Reactive States
const songList = ref([]);
const currentSongIndex = ref(props.initialSongIndex !== undefined ? props.initialSongIndex : -1);
const playedHistory = ref([]); // Tracks normalized titles of recently played songs
const loading = ref(true);
const error = ref(null);

const recommendationToast = ref(null);
let toastTimer = null;

function showRecommendationToast(msg) {
  recommendationToast.value = msg;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    recommendationToast.value = null;
  }, 4000);
}

// Authentication gate for playback
function ensureAuth() {
  if (!currentUser.value) {
    if (isPlaying.value && audioRef.value) {
      audioRef.value.pause();
      isPlaying.value = false;
    }
    showRecommendationToast('Vui lòng đăng nhập để nghe nhạc');
    emit('open-auth');
    return false;
  }
  return true;
}

const audioRef = ref(null);
const canvasRef = ref(null);
const lyricsContainerRef = ref(null);

// Web Audio API State
let audioContext = null;
let analyserNode = null;
let sourceNode = null;
let animationFrameId = null;
let dataArray = null;

const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const imageErrorOccurred = ref(false);
// Persistent Volume Management (Always preserve user volume across songs and sessions)
const SAVED_VOLUME_KEY = 'auramusic_persistent_volume';
const initialVolume = (() => {
  try {
    const saved = localStorage.getItem(SAVED_VOLUME_KEY);
    if (saved !== null) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
        return parsed;
      }
    }
  } catch (e) {}
  return 0.85;
})();

const volume = ref(initialVolume);

watch(volume, (newVol) => {
  if (audioRef.value) {
    audioRef.value.volume = newVol;
  }
  try {
    localStorage.setItem(SAVED_VOLUME_KEY, String(newVol));
  } catch (e) {}
});

const isQueueOpen = ref(false);
const bassEnergy = ref(0);
const userCustomColor = ref(null);
const dynamicFetchedLyrics = ref([]);
const hasRecordedCurrentTrackPlay = ref(false);

// Color Utilities for robust Canvas & CSS rendering
function hslToHex(h, s, l) {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function getColorWithAlpha(color, alpha = 0.5) {
  if (!color) return `rgba(0, 242, 254, ${alpha})`;
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    let r = 0, g = 0, b = 0;
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length >= 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (color.startsWith('hsl')) {
    return color.replace('hsl', 'hsla').replace(')', `, ${alpha})`);
  }
  return color;
}

// Auto Continuous Rainbow Chroma Mode (Defaults to true on open)
const isAutoColorMode = ref(true);
const autoColor = ref('#00e5ff');
let autoHue = 180;
let autoColorTimer = null;

function startAutoColorCycle() {
  if (autoColorTimer) cancelAnimationFrame(autoColorTimer);
  const cycleStep = () => {
    if (isAutoColorMode.value) {
      autoHue = (autoHue + 0.4) % 360;
      autoColor.value = hslToHex(autoHue, 100, 52);
    }
    autoColorTimer = requestAnimationFrame(cycleStep);
  };
  autoColorTimer = requestAnimationFrame(cycleStep);
}

function toggleAutoColorMode() {
  isAutoColorMode.value = !isAutoColorMode.value;
  if (!isAutoColorMode.value && !userCustomColor.value) {
    userCustomColor.value = '#00e5ff';
  }
}

const themePresets = [
  { name: 'Cyber Cyan', color: '#00e5ff' },
  { name: 'Neon Violet', color: '#d946ef' },
  { name: 'Solar Amber', color: '#f59e0b' },
  { name: 'Emerald Aurora', color: '#10b981' },
  { name: 'Crimson Rose', color: '#f43f5e' },
  { name: 'Electric Blue', color: '#3b82f6' },
  { name: 'Neon Lime', color: '#84cc16' },
];

function selectThemeColor(color) {
  isAutoColorMode.value = false;
  userCustomColor.value = color;
}

function onCustomColorInput(e) {
  isAutoColorMode.value = false;
  userCustomColor.value = e.target.value;
}

const cloudDiscoveredTracks = ref([]);

// Computed Properties
const currentSong = computed(() => {
  return songList.value[currentSongIndex.value] || null;
});

const currentSongGenre = computed(() => {
  return currentSong.value ? detectSongGenre(currentSong.value) : null;
});

const hasValidCoverImage = computed(() => {
  const img = currentSong.value?.coverImage;
  return !!(img && typeof img === 'string' && img.trim().length > 0 && !imageErrorOccurred.value);
});

const audioSourceUrl = computed(() => {
  if (offlineAudioBlobUrl.value) {
    return offlineAudioBlobUrl.value;
  }
  if (!currentSong.value?.audioUrl) return '';
  return formatMediaUrl(currentSong.value.audioUrl);
});

const visualizerColor = computed(() => {
  if (isAutoColorMode.value) return autoColor.value;
  if (userCustomColor.value) return userCustomColor.value;
  return currentSong.value?.visualizerSettings?.color || '#00e5ff';
});

const progressPercentage = computed(() => {
  if (!duration.value) return 0;
  return Math.min(100, Math.max(0, (currentTime.value / duration.value) * 100));
});

// Real-Time Vocal Frequency Analysis
const vocalEnergy = ref(0);

// Real-Time Dynamic Lyrics Sync Offset
const lyricSyncOffset = ref(0);

function adjustSyncOffset(delta) {
  lyricSyncOffset.value = parseFloat((lyricSyncOffset.value + delta).toFixed(1));
  if (currentSong.value) {
    const key = `sync_offset_${currentSong.value._id || currentSong.value.title}`;
    try {
      localStorage.setItem(key, lyricSyncOffset.value.toString());
    } catch (e) {}
  }
}

function loadSavedOffsetForSong(song) {
  if (!song) {
    lyricSyncOffset.value = 0;
    return;
  }
  const key = `sync_offset_${song._id || song.title}`;
  try {
    const saved = localStorage.getItem(key);
    if (saved !== null) {
      lyricSyncOffset.value = parseFloat(saved) || 0;
      return;
    }
  } catch (e) {}
  lyricSyncOffset.value = 0;
}


/**
 * Display lyrics with automatic intro dots (...) and long solo breaks (...)
 */
const displayLyrics = computed(() => {
  const raw = (currentSong.value?.lyricsData && Array.isArray(currentSong.value.lyricsData) && currentSong.value.lyricsData.length > 0)
    ? currentSong.value.lyricsData
    : dynamicFetchedLyrics.value;
  if (!raw || !Array.isArray(raw) || raw.length === 0) return [];

  const offset = lyricSyncOffset.value || 0;

  const validItems = raw
    .filter((item) => item && typeof item.time === 'number' && !isNaN(item.time) && typeof item.text === 'string' && item.text.trim().length > 0)
    .map((item) => ({
      ...item,
      time: Math.max(0, parseFloat((item.time + offset).toFixed(2))),
    }))
    .sort((a, b) => a.time - b.time);

  if (validItems.length === 0) return [];

  const rawLines = [];

  // If first lyric starts after 1.5s, keep the musical intro dots until the singer actually enters!
  if (validItems[0].time > 1.5 && validItems[0].text !== '...' && !validItems[0].text.includes('...')) {
    rawLines.push({ time: 0.0, text: '...', isIntro: true, endTime: validItems[0].time });
  }

  for (let i = 0; i < validItems.length; i++) {
    rawLines.push(validItems[i]);

    // Only check if there is a long instrumental solo break >= 18.0s between lines
    if (i < validItems.length - 1) {
      const nextItem = validItems[i + 1];
      const gap = nextItem.time - validItems[i].time;
      if (gap >= 18.0 && validItems[i].text !== '...' && nextItem.text !== '...') {
        rawLines.push({
          time: parseFloat((validItems[i].time + 3.0).toFixed(2)),
          text: '...',
          isInterlude: true,
          endTime: nextItem.time,
        });
      }
    }
  }

  // Enrich every line with endTime and duration for precise karaoke sync
  return rawLines.map((item, idx) => {
    const nextLine = rawLines[idx + 1];
    let endTime = item.endTime || (nextLine ? nextLine.time : (item.time + 4.5));
    if (endTime <= item.time) endTime = item.time + 3.5;
    return {
      ...item,
      endTime,
      duration: Math.max(0.6, endTime - item.time),
    };
  });
});

/**
 * Calculates current active lyric index strictly aligned to exact audio timestamp
 */
const activeLyricIndex = computed(() => {
  const lyrics = displayLyrics.value;
  if (!lyrics || !lyrics.length) return -1;

  const curTime = typeof currentTime.value === 'number' && !isNaN(currentTime.value) ? currentTime.value : 0;
  let activeIdx = -1;

  for (let i = 0; i < lyrics.length; i++) {
    const lyric = lyrics[i];
    const targetTime = lyric.time || 0;

    // Line activates strictly when currentTime reaches its timestamp
    if (curTime >= targetTime) {
      activeIdx = i;
    } else {
      break;
    }
  }
  return activeIdx;
});

/**
 * Splits lyric into array of words for individual rendering
 */
function getLyricWords(lyric) {
  if (!lyric || !lyric.text) return [];
  return lyric.text.trim().split(/\s+/).map((word, wIdx) => ({
    word,
    index: wIdx,
  }));
}

/**
 * Calculates ultra-smooth 60 FPS word-by-word karaoke highlight style for the active line only
 */
function getActiveWordStyle(lyric, wordIdx) {
  const words = lyric.text.trim().split(/\s+/);
  const totalWords = words.length;
  if (totalWords === 0) return {};

  const curTime = currentTime.value || 0;
  const startTime = lyric.time || 0;
  const fullGap = Math.max(0.6, lyric.duration || (lyric.endTime - startTime));

  // Natural singing cadence spans 94% of the sung phrase duration
  const actualSingingDuration = Math.max(0.5, fullGap * 0.94);

  const totalChars = words.reduce((acc, w) => acc + Math.max(2, w.length), 0);
  let accumulatedChars = 0;
  let wordStartRatio = 0;
  let wordEndRatio = 0;

  for (let i = 0; i < totalWords; i++) {
    const wLen = Math.max(2, words[i].length);
    if (i === wordIdx) {
      wordStartRatio = accumulatedChars / totalChars;
      wordEndRatio = (accumulatedChars + wLen) / totalChars;
      break;
    }
    accumulatedChars += wLen;
  }

  const wordStartTime = startTime + wordStartRatio * actualSingingDuration;
  const wordEndTime = startTime + wordEndRatio * actualSingingDuration;
  const wordDuration = Math.max(0.08, wordEndTime - wordStartTime);

  const col = visualizerColor.value || '#00e5ff';

  if (curTime >= wordEndTime) {
    // Word fully sung
    return {
      color: col,
      filter: `drop-shadow(0 2px 8px ${col}70)`,
      transform: 'scale(1.02)',
    };
  } else if (curTime >= wordStartTime) {
    // Word is currently being sung (60 FPS smooth gradient fill)
    const wordProgress = Math.min(100, Math.max(0, ((curTime - wordStartTime) / wordDuration) * 100));
    return {
      background: `linear-gradient(90deg, ${col} 0%, ${col} ${wordProgress}%, rgba(255, 255, 255, 0.4) ${wordProgress}%, rgba(255, 255, 255, 0.4) 100%)`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      filter: `drop-shadow(0 2px 10px ${col}80)`,
      transform: 'scale(1.05)',
    };
  } else {
    // Word not reached yet
    return {
      color: 'rgba(255, 255, 255, 0.42)',
    };
  }
}

watch(activeLyricIndex, (newIdx) => {
  if (newIdx < 0) return;
  nextTick(() => {
    try {
      const el = document.getElementById(`lyric-line-${newIdx}`);
      const container = lyricsContainerRef.value;
      if (el && container && typeof container.scrollTo === 'function') {
        const elTop = el.offsetTop;
        const elHeight = el.clientHeight || 30;
        const containerHeight = container.clientHeight || 400;
        container.scrollTo({
          top: Math.max(0, elTop - containerHeight / 2 + elHeight / 2),
          behavior: 'smooth',
        });
      }
    } catch (err) {}
  });
});

/**
 * Normalizes relative URLs (e.g. /uploads/...) to absolute server endpoints.
 */
function formatMediaUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

/**
 * Formats seconds into MM:SS format.
 */
function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Fetches all songs from Backend REST API
 */
async function fetchSongs() {
  loading.value = true;
  error.value = null;

  try {
    const url = `${API_BASE_URL}/api/songs`;

    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const songs = result.data || result;
    const fetchedList = Array.isArray(songs) ? songs : [];

    const activeSong = currentSong.value;
    if (activeSong) {
      const foundIdx = fetchedList.findIndex((s) => (s._id && activeSong._id ? s._id === activeSong._id : s.title === activeSong.title));
      if (foundIdx !== -1) {
        songList.value = fetchedList;
        currentSongIndex.value = foundIdx;
      } else {
        // Keep active song at head of list
        songList.value = [activeSong, ...fetchedList];
        currentSongIndex.value = 0;
      }
    } else {
      songList.value = fetchedList;
      if (props.initialSongIndex !== undefined && props.initialSongIndex >= 0 && props.initialSongIndex < songList.value.length) {
        currentSongIndex.value = props.initialSongIndex;
      } else {
        currentSongIndex.value = -1;
      }
    }
  } catch (err) {
    console.error('Failed to load songs:', err);
    error.value = `Unable to connect to backend: ${err.message}`;
  } finally {
    loading.value = false;
  }
}

function setQueueFilter(filter) {
  queueFilter.value = filter;
  fetchSongs(filter);
}

/**
 * Automatically fetches synced lyrics from backend if not present
 */
async function autoFetchLyricsForCurrentSong(force = false) {
  const song = currentSong.value;
  if (!song) {
    dynamicFetchedLyrics.value = [];
    return;
  }

  // Immediately set to the new song's local lyrics (or empty if none)
  dynamicFetchedLyrics.value = (song.lyricsData && Array.isArray(song.lyricsData)) ? [...song.lyricsData] : [];

  if (dynamicFetchedLyrics.value.length > 0 && !force) return;

  const requestSongKey = song._id || song.title;

  try {
    const res = await fetch(
      `${API_BASE_URL}/api/songs/lyrics?title=${encodeURIComponent(song.title || '')}&artist=${encodeURIComponent(song.artist || '')}`
    );
    const data = await res.json();
    
    // Only apply if user is still on this exact song!
    const activeSongKey = currentSong.value ? (currentSong.value._id || currentSong.value.title) : null;
    if (activeSongKey === requestSongKey) {
      if (data.success && Array.isArray(data.lyricsData) && data.lyricsData.length > 0) {
        dynamicFetchedLyrics.value = data.lyricsData;
        if (currentSong.value) {
          currentSong.value.lyricsData = data.lyricsData;
        }
      } else {
        dynamicFetchedLyrics.value = [];
      }
    }
  } catch (err) {
    console.warn('Auto fetch lyrics notice:', err.message);
    const activeSongKey = currentSong.value ? (currentSong.value._id || currentSong.value.title) : null;
    if (activeSongKey === requestSongKey) {
      dynamicFetchedLyrics.value = (song.lyricsData && Array.isArray(song.lyricsData)) ? [...song.lyricsData] : [];
    }
  }
}

/**
 * Fetches real related cloud tracks from backend API (/api/songs/related)
 */
async function fetchCloudRecommendations() {
  const song = currentSong.value;
  if (!song) return;

  try {
    const onlineTracks = await fetchOnlineRelatedTracks(song, API_BASE_URL);
    if (Array.isArray(onlineTracks) && onlineTracks.length > 0) {
      cloudDiscoveredTracks.value = onlineTracks;
    }
  } catch (err) {
    console.warn('Cloud discovery notice:', err.message);
  }
}

// Watch both currentSongIndex and the active song object to immediately reset lyrics on song switch
watch(
  () => currentSong.value ? (currentSong.value._id || currentSong.value.title) : null,
  async (newKey) => {
    // 1. Immediately reset lyrics state to prevent previous song's lyrics from lingering
    dynamicFetchedLyrics.value = (currentSong.value?.lyricsData && Array.isArray(currentSong.value.lyricsData))
      ? [...currentSong.value.lyricsData]
      : [];
    
    // 2. Check and apply offline cached audio blob if available
    await checkAndApplyOfflineAudio(currentSong.value);

    // 3. Load offset for this new song
    loadSavedOffsetForSong(currentSong.value);

    // 4. Auto fetch lyrics & recommendations for new song
    if (newKey) {
      autoFetchLyricsForCurrentSong(true);
      fetchCloudRecommendations();
    }
  },
  { immediate: true }
);

watch(
  () => props.initialSongIndex,
  (newIdx) => {
    if (newIdx >= 0 && newIdx < songList.value.length && newIdx !== currentSongIndex.value) {
      currentSongIndex.value = newIdx;
      isPlaying.value = false;
      currentTime.value = 0;
      nextTick(() => {
        togglePlay();
      });
    }
  }
);

/**
 * MediaSession API & Background Audio Playback Engine
 * Enables seamless audio playback when switching apps or locking the screen on iOS & Android.
 * Renders album art, title, artist, seek scrubber on Lock Screen, Dynamic Island & Control Center.
 */
let lastPositionUpdateSec = 0;

function updateSystemMediaSession() {
  if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

  const song = currentSong.value;
  if (!song) {
    try {
      navigator.mediaSession.playbackState = 'none';
    } catch (e) {}
    return;
  }

  const coverUrl = song.coverImage ? formatMediaUrl(song.coverImage) : '';
  const artwork = coverUrl
    ? [
        { src: coverUrl, sizes: '96x96', type: 'image/png' },
        { src: coverUrl, sizes: '128x128', type: 'image/png' },
        { src: coverUrl, sizes: '192x192', type: 'image/png' },
        { src: coverUrl, sizes: '256x256', type: 'image/png' },
        { src: coverUrl, sizes: '384x384', type: 'image/png' },
        { src: coverUrl, sizes: '512x512', type: 'image/png' },
      ]
    : [];

  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: song.title || 'AuraMusic Track',
      artist: song.artist || 'AuraMusic Artist',
      album: 'AuraMusic Hi-Res Audio',
      artwork,
    });

    navigator.mediaSession.playbackState = isPlaying.value ? 'playing' : 'paused';

    const safeSetAction = (action, handler) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch (e) {}
    };

    safeSetAction('play', () => {
      if (!isPlaying.value) togglePlay();
    });
    safeSetAction('pause', () => {
      if (isPlaying.value) togglePlay();
    });
    safeSetAction('previoustrack', () => {
      switchSong(-1);
    });
    safeSetAction('nexttrack', () => {
      switchSong(1);
    });
    safeSetAction('seekto', (details) => {
      if (details.seekTime !== undefined && audioRef.value) {
        audioRef.value.currentTime = details.seekTime;
        currentTime.value = details.seekTime;
        updateMediaSessionPosition();
      }
    });
    safeSetAction('seekforward', (details) => {
      if (audioRef.value) {
        const skipTime = details.seekOffset || 10;
        audioRef.value.currentTime = Math.min(duration.value || 0, audioRef.value.currentTime + skipTime);
        currentTime.value = audioRef.value.currentTime;
        updateMediaSessionPosition();
      }
    });
    safeSetAction('seekbackward', (details) => {
      if (audioRef.value) {
        const skipTime = details.seekOffset || 10;
        audioRef.value.currentTime = Math.max(0, audioRef.value.currentTime - skipTime);
        currentTime.value = audioRef.value.currentTime;
        updateMediaSessionPosition();
      }
    });
    safeSetAction('stop', () => {
      if (audioRef.value) {
        audioRef.value.pause();
        isPlaying.value = false;
      }
    });
  } catch (err) {
    console.warn('[MediaSession Update Notice]:', err);
  }

  updateMediaSessionPosition();
}

function updateMediaSessionPosition() {
  if (typeof navigator === 'undefined' || !('mediaSession' in navigator) || !('setPositionState' in navigator.mediaSession)) return;
  if (!audioRef.value || !duration.value || isNaN(duration.value) || duration.value <= 0) return;
  try {
    navigator.mediaSession.setPositionState({
      duration: Math.max(0, duration.value),
      playbackRate: audioRef.value.playbackRate || 1.0,
      position: Math.min(Math.max(0, audioRef.value.currentTime || 0), duration.value),
    });
  } catch (e) {}
}

/**
 * Picture-in-Picture (PiP) Floating Player Controls & Realtime Sync
 */
const currentActiveLyricText = computed(() => {
  const idx = activeLyricIndex.value;
  if (idx >= 0 && displayLyrics.value[idx]) {
    return displayLyrics.value[idx].text;
  }
  return '';
});

const nextActiveLyricText = computed(() => {
  const idx = activeLyricIndex.value;
  if (idx >= 0 && idx + 1 < displayLyrics.value.length) {
    return displayLyrics.value[idx + 1].text;
  }
  return '';
});

function syncPiPPlayerState() {
  const song = currentSong.value;
  updatePiPState({
    title: song?.title || 'AuraMusic',
    artist: song?.artist || 'Next-Gen Audio Player',
    coverUrl: song?.coverImage ? formatMediaUrl(song.coverImage) : '',
    currentTime: currentTime.value,
    duration: duration.value,
    isPlaying: isPlaying.value,
    visualizerColor: visualizerColor.value,
    currentLyric: currentActiveLyricText.value,
    nextLyric: nextActiveLyricText.value,
    onTogglePlay: togglePlay,
    onNext: () => switchSong(1),
    onPrev: () => switchSong(-1),
    onClose: () => {
      isPiPFloating.value = false;
    },
  });
}

async function handleTogglePiP() {
  const isPiPSupported =
    typeof document !== 'undefined' &&
    'pictureInPictureEnabled' in document &&
    document.pictureInPictureEnabled &&
    typeof HTMLCanvasElement !== 'undefined' &&
    'captureStream' in HTMLCanvasElement.prototype;

  if (!isPiPSupported) {
    showToast('✨ Nhạc đã được bật chế độ chạy ngầm! Bạn có thể tắt màn hình hoặc đổi app mà nhạc vẫn phát trên Lock Screen & Dynamic Island.', 'info');
    return;
  }

  try {
    syncPiPPlayerState();
    const active = await togglePictureInPicture();
    isPiPFloating.value = active;
    if (active) {
      showToast('Mini Player nổi (PiP) đã được kích hoạt! 📺✨', 'success');
    }
  } catch (err) {
    console.warn('[PiP Notice]:', err);
    showToast('✨ Đã kích hoạt phát nhạc ngầm! Bạn có thể tắt màn hình hoặc chuyển app mà nhạc vẫn phát.', 'info');
  }
}

// Watch changes to continuously keep PiP frame & OS MediaSession synced
watch(
  [() => currentTime.value, () => isPlaying.value, () => currentSong.value, () => visualizerColor.value, () => currentActiveLyricText.value],
  () => {
    syncPiPPlayerState();
  }
);

watch(
  [() => currentSong.value, () => isPlaying.value],
  () => {
    updateSystemMediaSession();
  },
  { immediate: true }
);

/**
 * Offline Music Storage Handlers (IndexedDB)
 */
async function loadOfflineTracks() {
  try {
    const list = await getOfflineTracks();
    offlineTracksList.value = list;
    savedOfflineIds.value = new Set(list.map((item) => String(item.id || item._id)));
  } catch (e) {
    console.warn('[loadOfflineTracks error]:', e);
  }
}

async function checkAndApplyOfflineAudio(song) {
  if (!song) {
    offlineAudioBlobUrl.value = null;
    return;
  }
  const trackId = song._id || song.id;
  if (trackId && (savedOfflineIds.value.has(String(trackId)) || song.isOffline)) {
    const blobUrl = await getOfflineAudioUrl(trackId);
    if (blobUrl) {
      offlineAudioBlobUrl.value = blobUrl;
      return;
    }
  }
  offlineAudioBlobUrl.value = null;
}

async function handleToggleOffline(song) {
  if (!song) return;
  const songId = String(song._id || song.id);

  if (savedOfflineIds.value.has(songId)) {
    // Already saved -> Remove
    try {
      await removeTrackOffline(songId);
      savedOfflineIds.value.delete(songId);
      offlineTracksList.value = offlineTracksList.value.filter((s) => String(s.id || s._id) !== songId);
      showToast(`Đã xóa "${song.title}" khỏi bộ nhớ Offline`, 'info');
    } catch (err) {
      showToast('Lỗi khi xóa bài hát offline', 'error');
    }
    return;
  }

  // Not saved -> Download and save
  isDownloadingOffline.value = true;
  showToast(`Đang tải "${song.title}" về máy... ⏳`, 'info');

  try {
    const directUrl = formatMediaUrl(song.audioUrl || song.fileUrl);
    await saveTrackOffline(song, directUrl);
    await loadOfflineTracks();
    showToast(`Đã lưu "${song.title}" vào bộ nhớ Offline thành công! 💾✨`, 'success');
  } catch (err) {
    console.error('[Save Offline Error]:', err);
    showToast(`Không thể tải bài hát offline: ${err.message}`, 'error');
  } finally {
    isDownloadingOffline.value = false;
  }
}

async function handleRemoveOffline(song) {
  if (!song) return;
  const songId = String(song._id || song.id);
  await removeTrackOffline(songId);
  savedOfflineIds.value.delete(songId);
  offlineTracksList.value = offlineTracksList.value.filter((s) => String(s.id || s._id) !== songId);
  showToast(`Đã xóa "${song.title}" khỏi bộ nhớ offline`, 'info');
}

async function loadAndSwitchToOfflineTab() {
  await loadOfflineTracks();
  queueActiveTab.value = 'offline';
}

async function playOfflineTrack(song) {
  if (!song) return;
  const trackId = song._id || song.id;
  const blobUrl = await getOfflineAudioUrl(trackId);
  if (blobUrl) {
    offlineAudioBlobUrl.value = blobUrl;
  }
  
  const existingIdx = songList.value.findIndex((s) => String(s._id || s.id) === String(trackId));
  if (existingIdx !== -1) {
    currentSongIndex.value = existingIdx;
  } else {
    songList.value = [song, ...songList.value];
    currentSongIndex.value = 0;
  }

  currentTime.value = 0;
  isPlaying.value = false;
  nextTick(() => {
    togglePlay();
  });
}

function playAllOfflineTracks() {
  if (offlineTracksList.value.length === 0) return;
  songList.value = [...offlineTracksList.value];
  currentSongIndex.value = 0;
  currentTime.value = 0;
  isPlaying.value = false;
  playOfflineTrack(offlineTracksList.value[0]);
}

/**
 * Equalizer & 8D Spatial Audio Handlers
 */
function updateEqGain(idx, val) {
  eqGains.value[idx] = parseFloat(val);
  activeEqPreset.value = 'custom';
  setupWebAudio(true);
  if (eqNodes[idx]) {
    eqNodes[idx].gain.value = parseFloat(val);
  }
}

function applyEqPreset(preset) {
  activeEqPreset.value = preset.id;
  if (preset.id !== 'flat') {
    setupWebAudio(true);
  }
  preset.gains.forEach((g, idx) => {
    eqGains.value[idx] = g;
    if (eqNodes[idx]) {
      eqNodes[idx].gain.value = g;
    }
  });
}

function resetEq() {
  applyEqPreset({ id: 'flat', gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] });
}

function toggle8D() {
  is8DEnabled.value = !is8DEnabled.value;
  if (is8DEnabled.value) {
    setupWebAudio(true);
  } else if (pannerNode) {
    pannerNode.pan.value = 0;
  }
}

/**
 * Favorites & Custom Playlists Handlers
 */
async function fetchFavorites() {
  if (!currentUser.value) {
    favoriteSongIds.value = new Set();
    favoriteSongsList.value = [];
    return;
  }
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/favorites`, {
      headers: getAuthHeaders(),
    });
    const result = await res.json();
    if (result.success && Array.isArray(result.data)) {
      favoriteSongsList.value = result.data;
      favoriteSongIds.value = new Set(result.data.map((s) => s._id));
    }
  } catch (err) {
    console.warn('[FetchFavorites Error]:', err);
  }
}

async function handleToggleFavorite(song) {
  if (!ensureAuth()) return;
  if (!song || !song._id) return;

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/favorites/${song._id}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const result = await res.json();
    if (result.success) {
      if (result.isFavorite) {
        favoriteSongIds.value.add(song._id);
        if (!favoriteSongsList.value.some((s) => s._id === song._id)) {
          favoriteSongsList.value.push(song);
        }
      } else {
        favoriteSongIds.value.delete(song._id);
        favoriteSongsList.value = favoriteSongsList.value.filter((s) => s._id !== song._id);
      }
      showRecommendationToast(result.message);
    }
  } catch (err) {
    console.error('[ToggleFavorite Error]:', err);
  }
}

async function fetchUserPlaylists() {
  if (!currentUser.value) {
    userPlaylists.value = [];
    return;
  }
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/playlists`, {
      headers: getAuthHeaders(),
    });
    const result = await res.json();
    if (result.success && Array.isArray(result.data)) {
      userPlaylists.value = result.data;
    }
  } catch (err) {
    console.warn('[FetchPlaylists Error]:', err);
  }
}

function openAddToPlaylistModal(song) {
  if (!ensureAuth()) return;
  songToAddToPlaylist.value = song || currentSong.value;
  isAddToPlaylistModalOpen.value = true;
}

async function handleAddSongToPlaylist(playlistId) {
  if (!songToAddToPlaylist.value) return;
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/playlists/${playlistId}/songs`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ songId: songToAddToPlaylist.value._id }),
    });
    const result = await res.json();
    if (result.success) {
      showToast(result.message || 'Đã thêm vào danh sách phát! ✨', 'success');
      fetchUserPlaylists();
      isAddToPlaylistModalOpen.value = false;
    } else {
      showToast(result.message || 'Không thể thêm vào playlist', 'error');
    }
  } catch (err) {
    console.error('[AddSongToPlaylist Error]:', err);
    showToast('Lỗi kết nối khi thêm vào playlist', 'error');
  }
}

async function handleCreateAndAddPlaylist(name) {
  if (!songToAddToPlaylist.value) return;
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/playlists`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });
    const result = await res.json();
    if (result.success && result.data) {
      await handleAddSongToPlaylist(result.data._id);
    }
  } catch (err) {
    console.error('[CreatePlaylist Error]:', err);
  }
}

async function handleDeletePlaylist(playlistId, name) {
  if (!confirm(`Xóa playlist "${name}"?`)) return;
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/playlists/${playlistId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const result = await res.json();
    if (result.success) {
      fetchUserPlaylists();
      showRecommendationToast('Đã xóa playlist');
    }
  } catch (err) {
    console.error('[DeletePlaylist Error]:', err);
  }
}

function playEntirePlaylist(playlist) {
  if (!playlist || !playlist.songs || !playlist.songs.length) return;
  songList.value = [...playlist.songs];
  currentSongIndex.value = 0;
  isPlaying.value = false;
  currentTime.value = 0;
  isQueueOpen.value = false;
  showRecommendationToast(`Đang phát playlist "${playlist.name}" 🎶`);
  nextTick(() => {
    togglePlay();
  });
}

function playAllFavorites() {
  if (!favoriteSongsList.value.length) return;
  songList.value = [...favoriteSongsList.value];
  currentSongIndex.value = 0;
  isPlaying.value = false;
  currentTime.value = 0;
  isQueueOpen.value = false;
  showRecommendationToast(`Đang phát danh sách Bài Hát Yêu Thích ❤️`);
  nextTick(() => {
    togglePlay();
  });
}

function selectSongFromQueue(index) {
  if (index === currentSongIndex.value) return;
  currentSongIndex.value = index;
  isPlaying.value = false;
  currentTime.value = 0;
  nextTick(() => {
    togglePlay();
  });
}

const isIOS = typeof navigator !== 'undefined' && (/iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
const isMobileDevice = typeof navigator !== 'undefined' && (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2));

/**
 * Initialize Web Audio API AudioContext, AnalyserNode, 10-Band EQ & StereoPanner
 */
function setupWebAudio(force = false) {
  // On iOS / Mobile devices, Web Audio API (createMediaElementSource) is muted/suspended by Apple WebKit when the screen locks or tab goes to background.
  // We keep the native audio output clean on mobile for 100% reliable background audio on lock screen.
  if ((isIOS || isMobileDevice) && !force && !is8DEnabled.value && !hasCustomEq.value) {
    return;
  }
  if (audioContext && sourceNode) return;
  if (!audioRef.value) return;

  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!audioContext) {
      audioContext = new AudioCtx();
    }

    if (!analyserNode) {
      analyserNode = audioContext.createAnalyser();
      analyserNode.fftSize = 128; // 64 frequency bins
      analyserNode.smoothingTimeConstant = 0.8;
      const bufferLength = analyserNode.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);
    }

    if (!sourceNode && audioRef.value) {
      sourceNode = audioContext.createMediaElementSource(audioRef.value);

      // Create 10-Band BiquadFilterNodes
      eqNodes = EQ_FREQUENCIES.map((freq, idx) => {
        const filter = audioContext.createBiquadFilter();
        if (idx === 0) {
          filter.type = 'lowshelf';
        } else if (idx === EQ_FREQUENCIES.length - 1) {
          filter.type = 'highshelf';
        } else {
          filter.type = 'peaking';
          filter.Q.value = 1.4;
        }
        filter.frequency.value = freq;
        filter.gain.value = eqGains.value[idx];
        return filter;
      });

      // Create Stereo Panner Node for 8D Spatial Audio
      if (audioContext.createStereoPanner) {
        pannerNode = audioContext.createStereoPanner();
        pannerNode.pan.value = 0;
      }

      // Connect graph: source -> eq[0] -> ... -> eq[9] -> panner -> analyser -> destination
      let currentNode = sourceNode;
      for (const node of eqNodes) {
        currentNode.connect(node);
        currentNode = node;
      }

      if (pannerNode) {
        currentNode.connect(pannerNode);
        currentNode = pannerNode;
      }

      currentNode.connect(analyserNode);
      analyserNode.connect(audioContext.destination);
    }
  } catch (err) {
    console.warn('[Web Audio API] Setup warning:', err);
  }
}

/**
 * Continuous Canvas Visualizer Animation Loop
 */
function startVisualizerLoop() {
  if (animationFrameId) return;

  function render() {
    if (!canvasRef.value) {
      animationFrameId = requestAnimationFrame(render);
      return;
    }

    const canvas = canvasRef.value;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      animationFrameId = requestAnimationFrame(render);
      return;
    }

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    if (audioRef.value && isPlaying.value) {
      currentTime.value = audioRef.value.currentTime;
    }

    // 8D Spatial Audio Panning Rotation
    if (is8DEnabled.value && pannerNode && isPlaying.value) {
      spatial8DAngle += 0.02 * spatial8DSpeed.value;
      pannerNode.pan.value = Math.sin(spatial8DAngle);
    } else if (pannerNode && pannerNode.pan.value !== 0) {
      pannerNode.pan.value = 0;
    }

    if (analyserNode && sourceNode && isPlaying.value && dataArray) {
      analyserNode.getByteFrequencyData(dataArray);

      // Calculate Bass Energy (bins 0-5)
      let bassSum = 0;
      for (let i = 0; i < 6; i++) {
        bassSum += dataArray[i];
      }
      bassEnergy.value = Math.min(1, bassSum / (6 * 220));

      // Calculate Vocal Spectrum Energy (bins 3-14: ~500Hz - 4800Hz)
      let vocalSum = 0;
      for (let i = 3; i < 15; i++) {
        vocalSum += dataArray[i];
      }
      vocalEnergy.value = vocalSum / (12 * 255);
    } else if (isPlaying.value) {
      // Smooth simulated rhythmic energy for mobile/native background audio playback
      const t = Date.now() * 0.005;
      const beat = Math.sin(t * 2.5) * 0.5 + 0.5;
      bassEnergy.value = 0.2 + beat * 0.45;
      vocalEnergy.value = 0.3 + Math.cos(t * 3.8) * 0.3;

      if (!dataArray) {
        dataArray = new Uint8Array(64);
      }
      for (let i = 0; i < dataArray.length; i++) {
        const wave = Math.sin(t * 3 + i * 0.35) * Math.cos(t * 1.5 - i * 0.2);
        dataArray[i] = Math.max(30, Math.min(255, Math.floor(110 + wave * 90 + beat * 50)));
      }
    } else {
      bassEnergy.value = Math.max(0, bassEnergy.value * 0.88 - 0.02);
      vocalEnergy.value = Math.max(0, vocalEnergy.value * 0.85);
      if (dataArray) {
        for (let i = 0; i < dataArray.length; i++) {
          dataArray[i] = Math.max(0, dataArray[i] * 0.9 - 1);
        }
      }
    }

    const color = visualizerColor.value || '#00e5ff';
    const numBars = 32;
    const gap = 3;
    const totalBarWidth = (width - (numBars - 1) * gap) / numBars;
    const barWidth = Math.max(2, totalBarWidth);
    const step = dataArray ? Math.max(1, Math.floor(dataArray.length / numBars)) : 1;

    for (let i = 0; i < numBars; i++) {
      let val = 0;
      if (dataArray) {
        val = dataArray[i * step] || 0;
      }

      const percent = val / 255;
      const minHeight = 3;
      const barHeight = Math.max(minHeight, percent * (height - 4));
      const x = i * (barWidth + gap);
      const y = height - barHeight;

      // Glowing bar gradient
      const grad = ctx.createLinearGradient(0, y, 0, height);
      grad.addColorStop(0, color);
      grad.addColorStop(0.6, getColorWithAlpha(color, 0.55));
      grad.addColorStop(1, getColorWithAlpha(color, 0.1));

      ctx.fillStyle = grad;
      ctx.beginPath();
      const r = Math.min(barWidth / 2, 2.5);
      ctx.roundRect(x, y, barWidth, barHeight, [r, r, 0.5, 0.5]);
      ctx.fill();

      // Glowing highlight top tip
      if (barHeight > 6 && isPlaying.value) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(x + 0.5, y, barWidth - 1, 1.5, [1, 1, 0, 0]);
        ctx.fill();
      }
    }

    animationFrameId = requestAnimationFrame(render);
  }

  animationFrameId = requestAnimationFrame(render);
}

/**
 * Toggle Audio Playback
 */
async function togglePlay() {
  if (!ensureAuth()) return;
  if (!currentSong.value || !audioRef.value) return;

  try {
    setupWebAudio();
    if (audioContext && audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    if (isPlaying.value) {
      audioRef.value.pause();
      isPlaying.value = false;
    } else {
      const playPromise = audioRef.value.play();
      if (playPromise !== undefined) {
        await playPromise;
      }
      isPlaying.value = true;
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.warn('Playback notice:', err.message);
    }
    isPlaying.value = false;
  }
}

/**
 * Audio Event Handlers
 */
function onTimeUpdate() {
  if (!audioRef.value || !currentSong.value) return;
  currentTime.value = audioRef.value.currentTime;

  // Sync MediaSession position state every 1 second
  const currentSec = Math.floor(currentTime.value);
  if (currentSec !== lastPositionUpdateSec) {
    lastPositionUpdateSec = currentSec;
    updateMediaSessionPosition();
  }

  // Record taste profile play event once track plays past 5 seconds
  if (currentTime.value >= 5 && !hasRecordedCurrentTrackPlay.value && currentSong.value) {
    hasRecordedCurrentTrackPlay.value = true;
    recordSongPlayEvent(currentSong.value, currentTime.value, currentUser.value?._id);
  }
}

function onLoadedMetadata() {
  if (!audioRef.value) return;
  duration.value = audioRef.value.duration || 0;
  audioRef.value.volume = volume.value;
  updateSystemMediaSession();
}

/**
 * Normalizes title for strict deduplication
 */
function getCoreSongTitle(title) {
  if (!title) return '';
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(remix|vinahouse|speed up|sped up|slowed|cover|official|mv|audio|prod|ft\..*|feat\..*)\b/gi, '')
    .replace(/[()[\]\-–—_.,!]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if a track is a placeholder test upload (e.g. "Download (1)", "Unknown", etc.)
 */
function isJunkOrPlaceholderSong(song) {
  if (!song) return true;
  const title = (song.title || '').trim().toLowerCase();
  if (/^download([-_ (0-9)]*)$/i.test(title)) return true;
  if (/^track([-_ (0-9)]*)$/i.test(title)) return true;
  if (/^audio([-_ (0-9)]*)$/i.test(title)) return true;
  if (title === 'unknown' || title === 'untitled' || title.length < 2) return true;
  return false;
}

const playedSongIds = ref(new Set());

function recordPlayedTitle(title, id = null) {
  if (id) playedSongIds.value.add(String(id));
  const core = getCoreSongTitle(title);
  if (!core) return;
  playedHistory.value = [core, ...playedHistory.value.filter((t) => t !== core)].slice(0, 80);
}

/**
 * Finds next distinct, professional song strictly matching current song's genre (Remix vs Original) from SoundCloud
 */
async function getNextSmartGenreSong() {
  const current = currentSong.value;
  if (!current) return null;

  const currentCoreTitle = getCoreSongTitle(current.title);
  const currentIsRemix = isSongRemix(current);

  // 1. Try fresh candidates in pre-fetched cloudDiscoveredTracks (100% SoundCloud)
  let candidates = [...cloudDiscoveredTracks.value];

  const filterValidCandidates = (list) => {
    return list.filter((c) => {
      if (!c || isJunkOrPlaceholderSong(c)) return false;
      if (c._id && playedSongIds.value.has(String(c._id))) return false;
      const cCoreTitle = getCoreSongTitle(c.title);
      if (
        !cCoreTitle ||
        cCoreTitle === currentCoreTitle ||
        cCoreTitle.includes(currentCoreTitle) ||
        currentCoreTitle.includes(cCoreTitle) ||
        playedHistory.value.some((h) => h === cCoreTitle || (h.length >= 4 && (cCoreTitle.includes(h) || h.includes(cCoreTitle))))
      ) {
        return false;
      }
      const cIsRemix = isSongRemix(c);
      return currentIsRemix ? cIsRemix : !cIsRemix;
    });
  };

  const validCloudCandidates = filterValidCandidates(candidates);
  if (validCloudCandidates.length > 0) {
    const pickIdx = Math.floor(Math.random() * validCloudCandidates.length);
    return validCloudCandidates[pickIdx];
  }

  // 2. Fetch live SoundCloud related tracks directly from API for this genre
  try {
    const fetched = await fetchOnlineRelatedTracks(current, API_BASE_URL);
    if (Array.isArray(fetched) && fetched.length > 0) {
      cloudDiscoveredTracks.value = fetched;
      const validLive = filterValidCandidates(fetched);
      if (validLive.length > 0) {
        return validLive[0];
      }
    }
  } catch (e) {
    console.warn('[Get Next Smart Song Notice]:', e.message);
  }

  // 3. Fallback: Search local songList for non-duplicate same-genre song
  const validLocalSameGenre = songList.value.filter((s, idx) => {
    if (idx === currentSongIndex.value || isJunkOrPlaceholderSong(s)) return false;
    if (s._id && playedSongIds.value.has(String(s._id))) return false;
    const sCoreTitle = getCoreSongTitle(s.title);
    if (
      !sCoreTitle ||
      sCoreTitle === currentCoreTitle ||
      sCoreTitle.includes(currentCoreTitle) ||
      currentCoreTitle.includes(sCoreTitle) ||
      playedHistory.value.some((h) => h === sCoreTitle || (h.length >= 4 && (sCoreTitle.includes(h) || h.includes(sCoreTitle))))
    ) {
      return false;
    }
    const sIsRemix = isSongRemix(s);
    return currentIsRemix ? sIsRemix : !sIsRemix;
  });

  if (validLocalSameGenre.length > 0) {
    const pickIdx = Math.floor(Math.random() * validLocalSameGenre.length);
    return validLocalSameGenre[pickIdx];
  }

  return null;
}

let isPrefetching = false;

/**
 * Prefetches fresh unplayed tracks from SoundCloud and appends them to songList in background
 */
async function prefetchUpcomingTracks() {
  if (isPrefetching) return;
  const current = currentSong.value;
  if (!current) return;

  isPrefetching = true;
  try {
    const freshTracks = await fetchOnlineRelatedTracks(current, API_BASE_URL);
    if (Array.isArray(freshTracks) && freshTracks.length > 0) {
      cloudDiscoveredTracks.value = freshTracks;
      const existingIds = new Set(songList.value.map((s) => String(s._id || s.title)));
      const currentCore = getCoreSongTitle(current.title);

      const newUniqueTracks = freshTracks.filter((t) => {
        if (!t || isJunkOrPlaceholderSong(t)) return false;
        const trackId = String(t._id || t.title);
        if (existingIds.has(trackId) || playedSongIds.value.has(trackId)) return false;
        const coreTitle = getCoreSongTitle(t.title);
        if (!coreTitle || coreTitle === currentCore || playedHistory.value.some((h) => h === coreTitle)) return false;
        return true;
      });

      if (newUniqueTracks.length > 0) {
        songList.value.push(...newUniqueTracks);
        console.log(`[SoundCloud Radio Autoplay] Seamlessly appended ${newUniqueTracks.length} fresh SoundCloud tracks to queue.`);
      }
    }
  } catch (err) {
    console.warn('[Prefetch Upcoming Tracks Notice]:', err.message);
  } finally {
    isPrefetching = false;
  }
}

/**
 * Automatically advances to next track when current track ends (Infinite non-repeating autoplay)
 */
async function onTrackEnded() {
  isPlaying.value = false;
  currentTime.value = 0;

  if (currentSong.value) {
    recordPlayedTitle(currentSong.value.title, currentSong.value._id);
  }

  // 1. If more tracks remain ahead in queue, advance directly
  if (currentSongIndex.value < songList.value.length - 1) {
    currentSongIndex.value++;
    await nextTick();
    if (audioRef.value) {
      audioRef.value.load();
      await togglePlay();
    }
    autoFetchLyricsForCurrentSong();

    // Prefetch next batch if nearing the end
    if (songList.value.length - currentSongIndex.value <= 3) {
      prefetchUpcomingTracks();
    }
    return;
  }

  // 2. If at the end of queue, fetch next unique smart track and append to queue
  const nextSong = await getNextSmartGenreSong();
  if (nextSong) {
    songList.value.push(nextSong);
    currentSongIndex.value = songList.value.length - 1;
    await nextTick();
    if (audioRef.value) {
      audioRef.value.load();
      await togglePlay();
    }
    autoFetchLyricsForCurrentSong();
    showRecommendationToast(`Đang phát tiếp bài mới: ${nextSong.title} 🎶`);
    prefetchUpcomingTracks();
  }
}

let skipErrorTimer = null;

function onAudioError(e) {
  if (!audioSourceUrl.value) return;
  console.warn('Audio source warning/error on track:', currentSong.value?.title, e);

  if (skipErrorTimer) clearTimeout(skipErrorTimer);
  skipErrorTimer = setTimeout(async () => {
    if (songList.value.length > 1) {
      showToast(`Không thể phát bài "${currentSong.value?.title || 'này'}". Đang chuyển bài tiếp theo... ✨`, 'warning');
      await switchSong(1);
    }
  }, 600);
}

/**
 * Seek audio by clicking on the progress bar
 */
function handleSeek(event) {
  if (!ensureAuth()) return;
  if (!currentSong.value || !audioRef.value || !duration.value) return;

  const rect = event.currentTarget.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const seekRatio = Math.max(0, Math.min(1, clickX / rect.width));
  const newTime = seekRatio * duration.value;

  audioRef.value.currentTime = newTime;
  currentTime.value = newTime;
}

/**
 * Seek to exact timestamp when user clicks a lyric line
 */
function seekToTimestamp(timestamp) {
  if (!ensureAuth()) return;
  if (!currentSong.value || !audioRef.value) return;
  audioRef.value.currentTime = timestamp;
  currentTime.value = timestamp;
  if (!isPlaying.value) {
    togglePlay();
  }
}

/**
 * Volume adjust
 */
function updateVolume() {
  if (audioRef.value) {
    audioRef.value.volume = volume.value;
  }
}

/**
 * Switch songs (next / prev) with infinite non-repeating queue
 */
async function switchSong(direction) {
  if (!ensureAuth()) return;
  if (!currentSong.value) return;

  recordPlayedTitle(currentSong.value.title, currentSong.value._id);

  // PREVIOUS BUTTON (direction < 0)
  if (direction < 0) {
    if (currentSongIndex.value > 0) {
      currentSongIndex.value--;
    } else {
      if (audioRef.value) {
        audioRef.value.currentTime = 0;
        currentTime.value = 0;
      }
      return;
    }

    currentTime.value = 0;
    isPlaying.value = false;
    await nextTick();
    if (audioRef.value) {
      audioRef.value.load();
      await togglePlay();
    }
    autoFetchLyricsForCurrentSong();
    return;
  }

  // NEXT BUTTON (direction > 0)
  if (direction > 0) {
    // A. If next track exists in current queue, advance to it
    if (currentSongIndex.value < songList.value.length - 1) {
      currentSongIndex.value++;
      currentTime.value = 0;
      isPlaying.value = false;

      await nextTick();
      if (audioRef.value) {
        audioRef.value.load();
        await togglePlay();
      }
      autoFetchLyricsForCurrentSong();

      // If near the end of queue, prefetch more
      if (songList.value.length - currentSongIndex.value <= 3) {
        prefetchUpcomingTracks();
      }
      return;
    }

    // B. Reached the end of queue: DO NOT LOOP! Fetch fresh unplayed track & append to queue
    const nextSong = await getNextSmartGenreSong();
    if (nextSong) {
      songList.value.push(nextSong);
      currentSongIndex.value = songList.value.length - 1;
      currentTime.value = 0;
      isPlaying.value = false;

      await nextTick();
      if (audioRef.value) {
        audioRef.value.load();
        await togglePlay();
      }
      autoFetchLyricsForCurrentSong();
      showRecommendationToast(`Đang phát tiếp bài mới: ${nextSong.title} 🎶`);
      prefetchUpcomingTracks();
      return;
    }
  }
}

function handleImageFallback() {
  imageErrorOccurred.value = true;
}



/**
 * Lyrics Editor State & Handlers
 */
const isEditingLyrics = ref(false);
const lyricsJsonInput = ref('');
const lyricsJsonError = ref(null);
const isSavingLyrics = ref(false);
const lyricsSaveSuccess = ref(false);

function toggleEditLyrics() {
  if (isEditingLyrics.value) {
    isEditingLyrics.value = false;
    lyricsJsonError.value = null;
  } else {
    isEditingLyrics.value = true;
    lyricsJsonError.value = null;
    lyricsSaveSuccess.value = false;
    lyricsJsonInput.value = JSON.stringify(currentSong.value?.lyricsData || [], null, 2);
  }
}

function formatLyricsJsonHelper() {
  try {
    const parsed = JSON.parse(lyricsJsonInput.value);
    lyricsJsonInput.value = JSON.stringify(parsed, null, 2);
    lyricsJsonError.value = null;
  } catch (err) {
    lyricsJsonError.value = `Syntax error: ${err.message}`;
  }
}

async function saveLyricsChanges() {
  lyricsJsonError.value = null;
  lyricsSaveSuccess.value = false;

  let parsed;
  try {
    parsed = JSON.parse(lyricsJsonInput.value);
  } catch (err) {
    lyricsJsonError.value = `Invalid JSON syntax: ${err.message}`;
    return;
  }

  if (!Array.isArray(parsed)) {
    lyricsJsonError.value = 'Root JSON must be an array of [{ "time": 0, "text": "..." }]';
    return;
  }

  // Validate format of each item
  for (let i = 0; i < parsed.length; i++) {
    const item = parsed[i];
    if (typeof item !== 'object' || item === null) {
      lyricsJsonError.value = `Item at index ${i} is not a valid object.`;
      return;
    }
    if (item.time === undefined || isNaN(Number(item.time))) {
      lyricsJsonError.value = `Item at index ${i} is missing a numeric "time" field (e.g. { "time": 10.5, "text": "..." }).`;
      return;
    }
    if (item.text === undefined || item.text === null) {
      lyricsJsonError.value = `Item at index ${i} is missing a "text" string field.`;
      return;
    }
  }

  const songId = currentSong.value?._id;
  if (!songId) {
    lyricsJsonError.value = 'No active song selected.';
    return;
  }

  isSavingLyrics.value = true;

  try {
    const response = await fetch(`${API_BASE_URL}/api/songs/${songId}/lyrics`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lyricsData: parsed }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to save lyrics');
    }

    // Update local state in songList
    if (songList.value[currentSongIndex.value]) {
      songList.value[currentSongIndex.value].lyricsData = result.data.lyricsData;
    }

    lyricsSaveSuccess.value = true;
    setTimeout(() => {
      isEditingLyrics.value = false;
      lyricsSaveSuccess.value = false;
    }, 600);
  } catch (err) {
    console.error('Failed to update lyrics:', err);
    lyricsJsonError.value = err.message || 'Error communicating with server';
  } finally {
    isSavingLyrics.value = false;
  }
}

async function handleDeleteQueueSong(songId, songTitle) {
  if (!confirm(`Bạn có chắc muốn xóa bài hát "${songTitle}" khỏi danh sách?`)) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/songs/${songId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const result = await response.json();
    if (result.success) {
      // If deleted active song, reset current index
      if (currentSong.value && currentSong.value._id === songId) {
        if (isPlaying.value && audioRef.value) {
          audioRef.value.pause();
        }
        isPlaying.value = false;
        currentSongIndex.value = -1;
      }
      fetchSongs();
      showToast('Đã xóa bài hát khỏi danh sách! 🗑️', 'success');
    } else {
      showToast(result.message || 'Không thể xóa bài hát này', 'error');
    }
  } catch (err) {
    console.error('Delete queue song error:', err);
    showToast('Lỗi kết nối khi xóa bài hát', 'error');
  }
}

// Reset or update editor when active song changes
watch(currentSongIndex, () => {
  imageErrorOccurred.value = false;
  hasRecordedCurrentTrackPlay.value = false;
  if (isEditingLyrics.value) {
    lyricsJsonInput.value = JSON.stringify(currentSong.value?.lyricsData || [], null, 2);
    lyricsJsonError.value = null;
  }
});

function handleVisibilityChange() {
  if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
    if (audioContext && audioContext.state === 'suspended' && isPlaying.value) {
      audioContext.resume().catch(() => {});
    }
    updateSystemMediaSession();
  }
}

onMounted(() => {
  fetchSongs();
  fetchFavorites();
  fetchUserPlaylists();
  loadOfflineTracks();
  startVisualizerLoop();
  startAutoColorCycle();
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }
});

onUnmounted(() => {
  if (autoColorTimer) cancelAnimationFrame(autoColorTimer);
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  if (typeof document !== 'undefined') {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  }
  if (audioContext && audioContext.state !== 'closed') {
    try {
      audioContext.close();
    } catch {}
  }
});

/**
 * Play a specific song object directly (from search, home, for you radio or other components)
 */
async function playSong(song, newQueue = null, options = {}) {
  if (!song) return;
  if (!ensureAuth()) return;

  if (isPlaying.value && audioRef.value) {
    try {
      audioRef.value.pause();
    } catch {}
  }
  isPlaying.value = false;
  hasRecordedCurrentTrackPlay.value = false;

  if (options && options.isForYouRadio) {
    // 🎧 Dynamic SoundCloud Radio Flow starting from selected track (Zero Repetition)
    songList.value = [song];
    currentSongIndex.value = 0;
    const { genre } = detectSongGenre(song);
    showRecommendationToast(`SoundCloud Radio: Đang phát theo gu ${song.genre || genre || 'yêu thích'} ✨`);
  } else if (Array.isArray(newQueue) && newQueue.length > 0) {
    songList.value = [...newQueue];
    let idx = songList.value.findIndex((s) => (s._id && song._id ? s._id === song._id : s.title === song.title));
    currentSongIndex.value = idx !== -1 ? idx : 0;
  } else {
    // If not new queue, check if song is in current songList
    let idx = songList.value.findIndex((s) => (s._id && song._id ? s._id === song._id : s.title === song.title));
    if (idx !== -1) {
      currentSongIndex.value = idx;
    } else {
      songList.value = [song, ...songList.value];
      currentSongIndex.value = 0;
    }
  }

  if (!song.isOffline) {
    offlineAudioBlobUrl.value = null;
  }

  recordPlayedTitle(song.title, song._id);
  currentTime.value = 0;

  await nextTick();

  if (audioRef.value) {
    audioRef.value.volume = volume.value;
    try {
      setupWebAudio();
      if (audioContext && audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      const playPromise = audioRef.value.play();
      if (playPromise !== undefined) {
        await playPromise;
      }
      isPlaying.value = true;
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.warn('Playback error:', err.message);
      }
      isPlaying.value = false;
    }
  }

  // Non-blocking background fetch for lyrics & prefetch upcoming tracks for infinite seamless play
  autoFetchLyricsForCurrentSong();
  prefetchUpcomingTracks();
}

defineExpose({
  fetchSongs,
  playSong,
  togglePlay,
  switchSong,
  handleSeek,
  handleToggleFavorite,
  openAddToPlaylistModal,
  handleTogglePiP,
  handleToggleOffline,
  loadOfflineTracks,
  playOfflineTrack,
  currentSong,
  isPlaying,
  currentTime,
  duration,
  progressPercentage,
  volume,
  isCurrentSongFavorite,
});
</script>

<style scoped>
/* App Container & Background */
.music-app-container {
  position: relative;
  width: 100%;
  min-height: calc(100vh - 120px);
  color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  padding: 1.5rem 1rem;
  box-sizing: border-box;
}

.ambient-glow {
  position: absolute;
  top: -20%;
  left: -20%;
  width: 140%;
  height: 140%;
  filter: blur(90px);
  z-index: 0;
  pointer-events: none;
  transition: background 0.8s ease, transform 0.15s ease-out;
  opacity: 0.85;
}

/* State Screens (Loading / Error) */
.state-container {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.4rem;
  text-align: center;
  padding: 3rem;
  background: rgba(18, 22, 34, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  backdrop-filter: blur(20px);
}

.loader-spinner {
  width: 52px;
  height: 52px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: #00f2fe;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  box-shadow: 0 0 20px rgba(0, 242, 254, 0.3);
}

.state-text {
  font-size: 1.1rem;
  color: #94a3b8;
  font-weight: 500;
}

.retry-btn {
  background: linear-gradient(135deg, #00f2fe, #4facfe);
  color: #08090d;
  border: none;
  padding: 0.7rem 1.8rem;
  border-radius: 12px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  box-shadow: 0 4px 18px rgba(0, 242, 254, 0.35);
  transition: all 0.25s ease;
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 242, 254, 0.55);
}

/* Split Main Layout (Wider Horizontal Frame for Seamless Lyrics) */
.player-layout {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 420px 1fr;
  width: 96%;
  max-width: 1440px;
  height: 720px;
  background: rgba(14, 18, 28, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 32px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.7), 0 0 40px rgba(0, 242, 254, 0.08);
  overflow: hidden;
}

/* Mobile Tab Switch (Hidden on Desktop) */
.mobile-player-tab-switch {
  display: none;
}

/* LEFT PANEL: Vinyl & Controls */
.player-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.2rem 2.5rem;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(10, 13, 20, 0.5);
  position: relative;
}

/* Cyber Grid Background Overlay */
.cyber-grid-overlay {
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(to right, rgba(255, 255, 255, 0.01) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.01) 1px, transparent 1px);
  background-size: 32px 32px;
  pointer-events: none;
  z-index: 0;
  opacity: 0.6;
}

/* Audio Spec Badges */
.audio-badges-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1.2rem;
}

.audio-badge {
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  padding: 0.25rem 0.7rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  user-select: none;
}

.hi-res-badge {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: #f1f5f9;
  backdrop-filter: blur(10px);
}

.badge-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  box-shadow: 0 0 10px currentColor;
}

.badge-dot.pulse {
  animation: badgePulse 1.6s infinite ease-in-out;
}

@keyframes badgePulse {
  0%, 100% { opacity: 0.5; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1.3); }
}

.spec-badge {
  background: rgba(255, 255, 255, 0.03);
  color: #64748b;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

/* Vinyl Disc Styling */
.vinyl-wrapper {
  position: relative;
  width: 260px;
  height: 260px;
  margin-bottom: 1.4rem;
}

.vinyl-halo {
  position: absolute;
  inset: -10px;
  border-radius: 50%;
  border: 2px solid transparent;
  transition: box-shadow 0.15s ease-out, border-color 0.4s ease, transform 0.15s ease-out;
}

.halo-pulsing {
  animation: pulseGlow 3s infinite alternate ease-in-out;
}

.vinyl-disc {
  position: relative;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, #1c1d25 0%, #0d0e14 55%, #050608 100%);
  border-radius: 50%;
  box-shadow: 
    0 16px 45px rgba(0, 0, 0, 0.9),
    inset 0 0 0 2px rgba(255, 255, 255, 0.08),
    inset 0 0 20px rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* Vinyl Light Reflection Sheens */
.vinyl-sheen {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  pointer-events: none;
  background: conic-gradient(
    from 45deg,
    transparent 0deg,
    rgba(255, 255, 255, 0.12) 40deg,
    transparent 80deg,
    transparent 180deg,
    rgba(255, 255, 255, 0.12) 220deg,
    transparent 260deg
  );
  z-index: 1;
}

.sheen-2 {
  transform: rotate(90deg);
  opacity: 0.6;
}

/* Realistic Metallic Tonearm (Kim quay đĩa) */
.tonearm-assembly {
  position: absolute;
  top: -14px;
  right: -26px;
  width: 76px;
  height: 170px;
  pointer-events: none;
  z-index: 10;
  transform-origin: 22px 22px;
  transform: rotate(-34deg);
  transition: transform 1.3s cubic-bezier(0.34, 1.25, 0.64, 1);
  filter: drop-shadow(4px 12px 16px rgba(0, 0, 0, 0.8));
}

.tonearm-assembly.is-playing {
  transform: rotate(18deg);
}

.tonearm-base {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: radial-gradient(circle, #94a3b8 0%, #334155 70%, #0f172a 100%);
  border: 2px solid #cbd5e1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.8);
}

.tonearm-pivot {
  position: absolute;
  top: 15px;
  left: 15px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #f1f5f9;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.6);
}

.tonearm-arm {
  position: absolute;
  top: 22px;
  left: 20px;
  width: 5px;
  height: 115px;
  background: linear-gradient(to right, #94a3b8, #ffffff, #64748b);
  border-radius: 3px;
  transform-origin: top center;
  transform: rotate(6deg);
}

.tonearm-cartridge {
  position: absolute;
  bottom: -16px;
  left: -6px;
  width: 16px;
  height: 22px;
  background: #0f172a;
  border: 1.5px solid #94a3b8;
  border-radius: 4px;
  transform: rotate(-10deg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
}

.tonearm-stylus {
  position: absolute;
  bottom: -4px;
  left: 5px;
  width: 5px;
  height: 7px;
  background: #f8fafc;
  border-radius: 1px;
}

/* Continuous Rotation Animation */
.is-spinning {
  animation: spinVinyl 14s linear infinite;
}

.is-paused {
  animation: spinVinyl 14s linear infinite;
  animation-play-state: paused;
}

/* Realistic Vinyl Grooves */
.vinyl-groove {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.05);
  pointer-events: none;
}
.groove-outer {
  inset: 12px;
}
.groove-middle {
  inset: 30px;
}
.groove-inner {
  inset: 48px;
}

/* Vinyl Center Label & Cover Image */
.vinyl-center {
  position: relative;
  width: 115px;
  height: 115px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 0 0 5px #08090d, 0 6px 18px rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.cover-art-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.vinyl-center.is-default-vinyl {
  background: radial-gradient(circle, #252836 0%, #171923 60%, #0e1017 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.vinyl-default-label {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle, #202433 0%, #141722 65%, #0b0c10 100%);
  border: 2px solid rgba(255, 255, 255, 0.18);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  user-select: none;
  box-shadow: inset 0 0 16px rgba(0, 0, 0, 0.9);
  transition: border-color 0.4s ease;
}

.label-inner-ring {
  position: absolute;
  inset: 12px;
  border-radius: 50%;
  border: 1px dashed rgba(255, 255, 255, 0.2);
  pointer-events: none;
}

.label-top-curve {
  font-size: 0.52rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  color: #94a3b8;
  text-transform: uppercase;
  margin-bottom: 2px;
  z-index: 1;
}

.label-music-symbol {
  font-size: 1.15rem;
  line-height: 1;
  z-index: 1;
  filter: drop-shadow(0 0 8px currentColor);
}

.label-bottom-curve {
  font-size: 0.48rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  color: #64748b;
  margin-top: 2px;
  z-index: 1;
}

.spindle-hole {
  position: absolute;
  width: 20px;
  height: 20px;
  background-color: #08090d;
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.9);
  z-index: 2;
}

/* Song Title & Artist */
.song-meta {
  text-align: center;
  margin-bottom: 1.2rem;
  max-width: 92%;
}

.song-title {
  font-family: var(--font-display, 'Lexend', 'Be Vietnam Pro', sans-serif);
  font-size: 1.45rem;
  font-weight: 800;
  margin: 0 0 0.35rem 0;
  letter-spacing: -0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #ffffff;
}

.song-artist {
  font-size: 0.92rem;
  color: #94a3b8;
  font-weight: 500;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Seekbar & Timeline */
.playback-timeline {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 340px;
  gap: 0.85rem;
  margin-bottom: 1.2rem;
}

.time-display {
  font-size: 0.78rem;
  color: #64748b;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  width: 40px;
}

.progress-bar-container {
  flex: 1;
  padding: 8px 0;
  cursor: pointer;
}

.progress-bar-bg {
  height: 5px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  transition: height 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.progress-bar-container:hover .progress-bar-bg {
  height: 8px;
}

.progress-bar-fill {
  height: 100%;
  width: 0%;
  border-radius: 6px;
  transition: width 0.08s linear;
  box-shadow: 0 0 10px currentColor;
}

/* Controls Toolbar */
.controls-toolbar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.3rem;
  margin-bottom: 1.2rem;
}

.control-btn {
  background: transparent;
  border: none;
  color: #cbd5e1;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease, background-color 0.2s ease;
}

.control-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.nav-btn {
  width: 46px;
  height: 46px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.nav-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  transform: scale(1.1);
}

.play-pause-btn {
  width: 62px;
  height: 62px;
  border-radius: 50%;
  border: none;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.play-pause-btn:hover:not(:disabled) {
  transform: scale(1.1);
  filter: brightness(1.2);
}

.play-pause-btn:active:not(:disabled) {
  transform: scale(0.95);
}

/* Bottom Tools Bar (Volume + Theme Selector) */
.bottom-tools-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 300px;
  gap: 0.85rem;
  margin-bottom: 0.4rem;
}

/* Volume Slider Group */
.volume-slider-group {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  opacity: 0.75;
  transition: opacity 0.2s;
}

.volume-slider-group:hover {
  opacity: 1;
}

.volume-icon {
  color: #94a3b8;
}

.volume-range {
  width: 80px;
  height: 4px;
  cursor: pointer;
}

/* Theme Mood Selector & Auto Flow */
.theme-mood-selector {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(255, 255, 255, 0.04);
  padding: 0.25rem 0.45rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* Auto Rainbow Button */
.theme-auto-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.18rem 0.5rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #94a3b8;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.theme-auto-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  transform: scale(1.05);
}

.theme-auto-btn.active {
  background: linear-gradient(135deg, rgba(0, 242, 254, 0.25), rgba(217, 70, 239, 0.25));
  border: 1px solid #00f2fe;
  color: #ffffff;
  box-shadow: 0 0 12px rgba(0, 242, 254, 0.4);
}

.auto-rainbow-ring {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: conic-gradient(#00f2fe, #d946ef, #f59e0b, #10b981, #f43f5e, #00f2fe);
  display: inline-block;
  animation: rainbow-spin 2s linear infinite;
}

@keyframes rainbow-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.theme-dot-btn {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
  padding: 0;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease;
}

.theme-dot-btn:hover {
  transform: scale(1.35);
}

.theme-dot-btn.active {
  transform: scale(1.4);
  border-color: #ffffff;
}

/* Custom Color Picker Wrapper */
.custom-color-picker-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.custom-picker-label {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.25);
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
}

.custom-picker-label:hover {
  color: #ffffff;
  transform: scale(1.3);
  background: rgba(255, 255, 255, 0.15);
}

.hidden-color-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

/* Real-Time Visualizer Canvas Container */
.visualizer-container {
  width: 100%;
  max-width: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 0.6rem;
  padding: 0.4rem 0.6rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  backdrop-filter: blur(12px);
  transition: border-color 0.4s ease;
}

.visualizer-canvas {
  width: 100%;
  height: 38px;
  display: block;
}

/* RIGHT PANEL: Synchronized Lyrics & Queue */
.player-right {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 2.2rem 2.5rem;
  position: relative;
  overflow: hidden;
  background: rgba(14, 18, 28, 0.4);
}

.lyrics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.2rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.lyrics-header-left {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.lyrics-badge {
  font-family: var(--font-display, 'Lexend', 'Be Vietnam Pro', sans-serif);
  font-size: 0.84rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 800;
  color: #e2e8f0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.lyrics-hint {
  font-size: 0.74rem;
  color: #64748b;
  font-weight: 500;
}

.lyrics-header-actions {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

/* Sync Offset Tuner */
.sync-offset-tuner {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  padding: 0.2rem 0.4rem;
}

.offset-btn {
  background: rgba(255, 255, 255, 0.08);
  border: none;
  border-radius: 12px;
  color: #94a3b8;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.offset-btn:hover {
  background: rgba(0, 242, 254, 0.2);
  color: #00f2fe;
}

.offset-label {
  font-size: 0.76rem;
  font-weight: 700;
  color: #cbd5e1;
  padding: 0 0.35rem;
  cursor: pointer;
  user-select: none;
  transition: color 0.15s ease;
}

.offset-label.has-offset {
  color: #00f2fe;
}

.offset-label:hover {
  color: #ffffff;
}

/* Edit Lyrics Toggle Button */
.edit-lyrics-btn {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.42rem 0.9rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  color: #cbd5e1;
  font-size: 0.78rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-lyrics-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-1px);
}

.edit-lyrics-btn.is-editing {
  background: rgba(0, 242, 254, 0.1);
  box-shadow: 0 0 15px rgba(0, 242, 254, 0.25);
}

/* Lyrics JSON Editor Container */
.lyrics-editor-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  overflow: hidden;
  animation: fadeIn 0.25s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.editor-subhead {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: #94a3b8;
}

.editor-tip code {
  font-family: 'Fira Code', 'Consolas', monospace;
  background: rgba(255, 255, 255, 0.08);
  padding: 2px 6px;
  border-radius: 4px;
  color: #38bdf8;
  font-size: 0.75rem;
}

.editor-util-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: #94a3b8;
  padding: 0.3rem 0.7rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.editor-util-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.3);
}

.lyrics-json-textarea {
  flex: 1;
  min-height: 260px;
  background: rgba(8, 9, 13, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  font-family: 'Fira Code', 'JetBrains Mono', 'Consolas', monospace;
  font-size: 0.88rem;
  line-height: 1.5;
  color: #7dd3fc;
  padding: 1rem 1.1rem;
  resize: none;
  outline: none;
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.5);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.lyrics-json-textarea:focus {
  border-color: #00f2fe;
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.5), 0 0 16px rgba(0, 242, 254, 0.25);
}

.editor-error-msg {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.35);
  color: #fca5a5;
  padding: 0.6rem 0.85rem;
  border-radius: 10px;
  font-size: 0.82rem;
  animation: fadeIn 0.2s ease;
}

.editor-actions {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding-top: 0.4rem;
}

.save-lyrics-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.4rem;
  border-radius: 10px;
  border: none;
  font-weight: 700;
  font-size: 0.88rem;
  color: #08090d;
  cursor: pointer;
  transition: transform 0.15s ease, filter 0.15s ease;
}

.save-lyrics-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  filter: brightness(1.15);
}

.save-lyrics-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancel-edit-btn {
  padding: 0.65rem 1.2rem;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #94a3b8;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.cancel-edit-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}

/* Scrolling Container with Apple/Spotify-style depth of field mask */
.lyrics-scroll-container {
  flex: 1;
  overflow-y: auto;
  padding: 7rem 0;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  scrollbar-width: none;
  -ms-overflow-style: none;
  mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 16%,
    black 84%,
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 16%,
    black 84%,
    transparent 100%
  );
}

.lyrics-scroll-container::-webkit-scrollbar {
  display: none;
}

/* Individual Lyric Line */
.lyric-line {
  cursor: pointer;
  opacity: 0.38;
  transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s ease;
  user-select: none;
  padding: 0.65rem 1.1rem;
  border-radius: 18px;
  max-width: 96%;
}

.lyric-text {
  font-size: 1.35rem;
  line-height: 1.6;
  font-weight: 600;
  color: #94a3b8;
  margin: 0;
  letter-spacing: -0.01em;
  transition: all 0.3s ease;
}

.karaoke-active-line {
  font-family: var(--font-main, 'Lexend', 'Be Vietnam Pro', sans-serif);
  font-size: 1.55rem;
  font-weight: 800;
  line-height: 1.45;
  letter-spacing: -0.02em;
}

.karaoke-word {
  display: inline-block;
  margin-right: 0.36em;
  white-space: nowrap;
}

.is-active-word {
  will-change: background, color, transform;
  transform: translateZ(0);
}

.is-passed-word {
  color: rgba(255, 255, 255, 0.45);
}

.is-future-word {
  color: rgba(255, 255, 255, 0.3);
}

.dots-text {
  text-align: left;
}

.dots-pulse {
  font-size: 2.4rem;
  letter-spacing: 0.35em;
  font-weight: 900;
  display: inline-block;
  animation: pulseDots 1.4s infinite ease-in-out alternate;
}

@keyframes pulseDots {
  from {
    opacity: 0.6;
    transform: scale(0.92);
  }
  to {
    opacity: 1;
    transform: scale(1.08);
  }
}

.lyric-line:hover {
  opacity: 0.85;
  background: rgba(255, 255, 255, 0.05);
}

/* Active Highlighted Lyric */
.lyric-line.is-active {
  opacity: 1;
  transform: scale(1.04) translateX(6px);
  background: rgba(255, 255, 255, 0.06);
  border-left: 3px solid #00f2fe;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.empty-lyrics-notice {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #64748b;
  font-style: italic;
  font-size: 0.95rem;
}

/* Standby / Empty Player Banner */
.empty-player-banner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100%;
  padding: 2.5rem 1.5rem;
  animation: fadeIn 0.3s ease;
}

.empty-banner-disc {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  filter: drop-shadow(0 0 16px rgba(0, 242, 254, 0.4));
  animation: spinSlow 12s linear infinite;
}

.empty-banner-title {
  font-family: var(--font-display, 'Lexend', 'Be Vietnam Pro', sans-serif);
  font-size: 1.4rem;
  font-weight: 800;
  color: #f1f5f9;
  margin: 0 0 0.6rem 0;
}

.empty-banner-desc {
  font-size: 0.92rem;
  line-height: 1.6;
  color: #94a3b8;
  max-width: 400px;
  margin: 0 0 1.8rem 0;
}

.open-queue-cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.75rem 1.6rem;
  background: rgba(0, 242, 254, 0.12);
  border: 1px solid rgba(0, 242, 254, 0.35);
  border-radius: 14px;
  color: #00f2fe;
  font-size: 0.9rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.open-queue-cta-btn:hover {
  background: #00f2fe;
  color: #08090d;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 242, 254, 0.4);
}

/* Keyframe Animations */
@keyframes spinVinyl {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes spinSlow {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulseGlow {
  0% { transform: scale(0.97); opacity: 0.6; }
  100% { transform: scale(1.03); opacity: 1; }
}

/* Responsive Breakpoints */
@media (max-width: 1024px) {
  .player-layout {
    grid-template-columns: 1fr;
    height: auto;
    max-height: 90vh;
  }

  .player-left {
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding: 1.8rem;
  }

  .vinyl-wrapper {
    width: 200px;
    height: 200px;
  }

  .vinyl-center {
    height: 80px;
  }

  .player-right {
    height: 340px;
    padding: 1.5rem;
  }

  .lyrics-scroll-container {
    padding: 3rem 0;
  }
}

/* ==========================================================================
   EQUALIZER & PLAYLISTS & FAVORITES ENHANCED STYLES
   ========================================================================== */
.audio-badges-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 1rem;
}

.badge-group-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-tools-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.top-tool-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
}

.top-tool-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  transform: translateY(-1px);
}

.eq-active-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  box-shadow: 0 0 6px currentColor;
  animation: pulse-dot 1.5s infinite;
}

/* Song Meta Header with Heart & Playlist Actions */
.song-meta {
  width: 100%;
  margin-bottom: 1.2rem;
}

.song-meta-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.meta-text-col {
  flex: 1;
  min-width: 0;
}

.song-actions-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.song-fav-btn, .song-playlist-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.song-fav-btn:hover {
  color: #ff007f;
  border-color: rgba(255, 0, 127, 0.4);
  transform: scale(1.15);
}

.song-fav-btn.is-fav {
  transform: scale(1.1);
  animation: heart-pop 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.song-playlist-btn:hover {
  color: #00f2fe;
  border-color: rgba(0, 242, 254, 0.4);
  transform: scale(1.15);
}

@keyframes heart-pop {
  0% { transform: scale(0.8); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1.1); }
}

/* Queue Drawer */
.queue-drawer-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9998;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: flex-end;
}

.queue-drawer-panel {
  width: 100%;
  max-width: 440px;
  height: 100%;
  background: linear-gradient(180deg, rgba(16, 20, 32, 0.98) 0%, rgba(10, 12, 18, 0.99) 100%);
  border-left: 1px solid;
  display: flex;
  flex-direction: column;
  box-shadow: -15px 0 50px rgba(0, 0, 0, 0.8);
  padding: 1.5rem;
  box-sizing: border-box;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.drawer-tabs-nav {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.drawer-tab-btn {
  padding: 0.35rem 0.65rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #94a3b8;
  font-size: 0.74rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.drawer-close-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
}

.drawer-tab-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.drawer-quick-bar {
  margin-bottom: 0.85rem;
}

.play-all-btn {
  width: 100%;
  padding: 0.7rem;
  border-radius: 12px;
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 800;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
  transition: transform 0.2s;
}

.play-all-btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.1);
}

.queue-list-items {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.queue-item-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.queue-item-row:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(3px);
}

.queue-item-row.is-current-playing {
  background: rgba(0, 242, 254, 0.08);
  border-color: rgba(0, 242, 254, 0.3);
}

.queue-thumb-box {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  overflow: hidden;
  background: #1a202c;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.queue-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.queue-playing-waves {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.queue-playing-waves span {
  width: 3px;
  height: 12px;
  background: #00f2fe;
  animation: wave-bounce 0.8s infinite alternate;
}

.queue-info-box {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.queue-song-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.queue-song-artist {
  font-size: 0.72rem;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.queue-actions-box {
  display: flex;
  gap: 0.35rem;
}

.q-action-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.q-action-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
}

.drawer-empty-state {
  padding: 3rem 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.drawer-empty-state .empty-icon {
  font-size: 2.2rem;
}

.drawer-empty-state .empty-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.drawer-empty-state .empty-sub {
  font-size: 0.78rem;
  color: #64748b;
  max-width: 250px;
}

/* Playlists Accordion */
.playlists-accordion-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.playlist-drawer-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 0.85rem;
  transition: all 0.2s;
}

.pl-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pl-header-info {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.pl-card-icon {
  font-size: 1.2rem;
}

.pl-card-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 0.15rem 0;
}

.pl-card-meta {
  font-size: 0.72rem;
  color: #64748b;
}

.pl-card-actions {
  display: flex;
  gap: 0.4rem;
}

.pl-play-btn {
  padding: 0.35rem 0.75rem;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 800;
  border: none;
  cursor: pointer;
  transition: transform 0.2s;
}

.pl-play-btn:hover {
  transform: scale(1.05);
}

.pl-del-btn {
  padding: 0.35rem 0.5rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
}

/* Drawer Animation */
.drawer-slide-enter-active, .drawer-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-slide-enter-from, .drawer-slide-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* ================= COMPREHENSIVE RESPONSIVE DESIGN ================= */

/* Tablets & Small Laptops (<= 1024px) */
@media (max-width: 1024px) {
  .player-layout {
    grid-template-columns: 360px 1fr;
    height: auto;
    min-height: 640px;
    border-radius: 24px;
  }
  .player-left {
    padding: 1.8rem 1.5rem;
  }
  .vinyl-wrapper {
    width: 220px;
    height: 220px;
  }
}

/* Mobile Devices & Small Tablets (<= 768px) */
@media (max-width: 768px) {
  .music-app-container {
    padding: 0.5rem 0.6rem 6.5rem !important;
    width: 100% !important;
    max-width: 100vw !important;
    min-height: auto !important;
    overflow-x: hidden !important;
    box-sizing: border-box !important;
  }
  .player-layout {
    display: flex !important;
    flex-direction: column !important;
    grid-template-columns: none !important;
    height: auto !important;
    min-height: auto !important;
    border-radius: 24px !important;
    margin: 0 auto !important;
    width: 100% !important;
    max-width: 100% !important;
    overflow: hidden !important;
    box-sizing: border-box !important;
    background: rgba(14, 18, 28, 0.94) !important;
  }

  /* Mobile Tab Switcher */
  .mobile-player-tab-switch {
    display: flex !important;
    width: 100% !important;
    max-width: 280px !important;
    margin: 0.85rem auto 0.5rem auto !important;
    background: rgba(255, 255, 255, 0.06) !important;
    padding: 0.25rem !important;
    border-radius: 14px !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    gap: 0.35rem !important;
    z-index: 10;
  }
  .m-tab-btn {
    flex: 1;
    padding: 0.48rem 0.75rem;
    border-radius: 10px;
    font-size: 0.82rem;
    font-weight: 700;
    background: transparent;
    border: 1px solid transparent;
    color: #94a3b8;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
  }
  .m-tab-btn.active {
    color: #00f2fe;
    background: rgba(0, 242, 254, 0.15);
    border-color: rgba(0, 242, 254, 0.35);
    box-shadow: 0 2px 10px rgba(0, 242, 254, 0.2);
  }

  .m-hidden {
    display: none !important;
  }

  .player-left {
    width: 100% !important;
    max-width: 100% !important;
    border-right: none !important;
    border-bottom: none !important;
    padding: 0.75rem 1rem 1.75rem !important;
    box-sizing: border-box !important;
    align-items: center !important;
    text-align: center !important;
  }

  .vinyl-wrapper {
    width: 190px !important;
    height: 190px !important;
    min-width: 190px !important;
    min-height: 190px !important;
    max-width: 190px !important;
    max-height: 190px !important;
    aspect-ratio: 1 / 1 !important;
    border-radius: 50% !important;
    flex-shrink: 0 !important;
    margin: 0.5rem auto 1.1rem auto !important;
    position: relative !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
  .vinyl-disc {
    width: 100% !important;
    height: 100% !important;
    aspect-ratio: 1 / 1 !important;
    border-radius: 50% !important;
    flex-shrink: 0 !important;
  }
  .vinyl-center {
    width: 90px !important;
    height: 90px !important;
    aspect-ratio: 1 / 1 !important;
    border-radius: 50% !important;
    flex-shrink: 0 !important;
  }
  .cover-art-img {
    width: 100% !important;
    height: 100% !important;
    aspect-ratio: 1 / 1 !important;
    border-radius: 50% !important;
    object-fit: cover !important;
  }
  .tonearm-assembly {
    display: none !important; /* Hide metallic tonearm on mobile to keep vinyl centered */
  }

  .track-meta-block {
    width: 100% !important;
    max-width: 100% !important;
    margin-bottom: 1rem !important;
    text-align: center !important;
    align-items: center !important;
  }
  .song-title-wrapper {
    width: 100% !important;
    justify-content: center !important;
  }
  .song-title {
    font-size: 1.25rem !important;
    font-weight: 800 !important;
    max-width: 100% !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    text-align: center !important;
  }
  .song-artist {
    font-size: 0.88rem !important;
    color: #94a3b8 !important;
    text-align: center !important;
    margin-top: 0.2rem !important;
  }

  .timeline-container {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
    margin-bottom: 0.4rem !important;
  }
  .timeline-bar-wrap {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
    gap: 0.65rem !important;
  }
  .time-stamp {
    font-size: 0.76rem !important;
    font-weight: 600 !important;
  }

  .playback-controls {
    width: 100% !important;
    justify-content: center !important;
    align-items: center !important;
    gap: 1.1rem !important;
    margin: 0.5rem 0 0 !important;
  }
  .play-pause-btn {
    width: 58px !important;
    height: 58px !important;
  }
  .control-btn.nav-btn {
    width: 44px !important;
    height: 44px !important;
  }
  .control-action-btn {
    width: 40px !important;
    height: 40px !important;
  }

  /* Mobile Volume Slider & Mood Bar */
  .bottom-tools-bar {
    display: flex !important;
    flex-direction: column !important;
    width: 100% !important;
    max-width: 340px !important;
    margin: 0.75rem auto 0.4rem auto !important;
    align-items: center !important;
    gap: 0.65rem !important;
    box-sizing: border-box !important;
  }
  .volume-slider-group {
    width: 100% !important;
    display: flex !important;
    align-items: center !important;
    gap: 0.65rem !important;
    background: rgba(255, 255, 255, 0.05) !important;
    padding: 0.4rem 0.85rem !important;
    border-radius: 14px !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    box-sizing: border-box !important;
  }
  .volume-range {
    flex: 1 !important;
    height: 5px !important;
  }
  .theme-mood-selector {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 0.45rem !important;
    width: 100% !important;
    flex-wrap: wrap !important;
  }
  .theme-dot-btn {
    width: 22px !important;
    height: 22px !important;
    min-width: 22px !important;
    min-height: 22px !important;
    border-radius: 50% !important;
    border: 2px solid rgba(255, 255, 255, 0.25) !important;
    cursor: pointer !important;
    transition: transform 0.2s, box-shadow 0.2s !important;
  }
  .theme-dot-btn.active {
    border-color: #ffffff !important;
    transform: scale(1.18) !important;
    box-shadow: 0 0 10px currentColor !important;
  }
  .theme-auto-btn {
    padding: 0.28rem 0.75rem !important;
    font-size: 0.76rem !important;
    font-weight: 700 !important;
    border-radius: 999px !important;
    height: 26px !important;
    display: inline-flex !important;
    align-items: center !important;
    gap: 0.3rem !important;
  }
  .custom-picker-label {
    width: 22px !important;
    height: 22px !important;
    min-width: 22px !important;
    min-height: 22px !important;
    border-radius: 50% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  /* Mobile Real-Time Sóng Nhạc Audio Frequency Visualizer */
  .visualizer-container {
    display: flex !important;
    width: 100% !important;
    max-width: 340px !important;
    height: 36px !important;
    margin: 0.4rem auto 0.2rem auto !important;
    background: rgba(0, 0, 0, 0.4) !important;
    border: 1px solid rgba(255, 255, 255, 0.12) !important;
    border-radius: 10px !important;
    overflow: hidden !important;
    align-items: center !important;
    justify-content: center !important;
  }
  .visualizer-canvas {
    width: 100% !important;
    height: 100% !important;
    display: block !important;
  }

  /* Mobile Lyrics Section */
  .player-right {
    width: 100% !important;
    max-width: 100% !important;
    padding: 0.85rem 1rem 1.5rem !important;
    box-sizing: border-box !important;
  }
  .lyrics-display-card {
    width: 100% !important;
    max-width: 100% !important;
    height: calc(100vh - 280px) !important;
    min-height: 380px !important;
    padding: 1.5rem 1rem !important;
    box-sizing: border-box !important;
    border-radius: 20px !important;
  }
  .lyrics-line-item {
    font-size: 1.05rem !important;
    padding: 0.5rem 0.75rem !important;
    line-height: 1.6 !important;
  }
  .lyrics-line-item.active {
    font-size: 1.3rem !important;
    font-weight: 800 !important;
  }

  .queue-drawer-panel {
    width: 100% !important;
    max-width: 100% !important;
    border-radius: 24px 24px 0 0 !important;
  }
  .audio-badges-bar {
    width: 100% !important;
    flex-wrap: wrap !important;
    justify-content: center !important;
    gap: 0.4rem !important;
  }
  .badge-group-left {
    justify-content: center !important;
  }
  .header-tools-group {
    width: 100% !important;
    flex-wrap: wrap !important;
    justify-content: center !important;
    gap: 0.4rem !important;
  }
  .top-tool-btn {
    padding: 0.38rem 0.75rem !important;
    font-size: 0.76rem !important;
  }
}

/* Extra Small Phones (<= 480px) */
@media (max-width: 480px) {
  .vinyl-wrapper {
    width: 190px !important;
    height: 190px !important;
  }
  .song-title {
    font-size: 1.15rem !important;
  }
  .song-artist {
    font-size: 0.82rem !important;
  }
  .play-pause-btn {
    width: 54px !important;
    height: 54px !important;
  }
}

/* Header Top Utility Buttons (PiP, EQ, Playlist) */
.header-tools-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.top-tool-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.42rem;
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  user-select: none;
}

.top-tool-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  transform: translateY(-1px);
}

.top-tool-btn.active {
  background: rgba(0, 242, 254, 0.12);
  box-shadow: 0 0 15px rgba(0, 242, 254, 0.2);
}

.pip-mini-icon, .eq-mini-icon {
  font-size: 0.92rem;
}

.eq-active-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  box-shadow: 0 0 8px currentColor;
}

.song-offline-btn:hover {
  color: #10b981 !important;
  border-color: rgba(16, 185, 129, 0.4) !important;
  transform: scale(1.15);
}

.song-offline-btn.is-offline-saved {
  color: #10b981 !important;
  animation: heart-pop 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.spin-icon {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>

