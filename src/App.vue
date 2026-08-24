<template>
  <div class="app-root" :class="{ 'theme-light': isLightMode }" @click="handleDocumentClick">
    <!-- Global Modern Animated Glass Toast Notification System -->
    <GlobalToast />

    <!-- 0. Intro Cinematic Splash Screen -->
    <IntroSplash
      v-if="showIntroSplash"
      @finish="showIntroSplash = false"
    />

    <!-- Top Floating Glass Navigation Header -->
    <header class="app-header">
      <div class="header-inner">
        <!-- Left: Brand Logo with Animated Equalizer Bars -->
        <div class="brand" @click="currentTab = 'home'">
          <div class="brand-visual">
            <div class="brand-equalizer">
              <span class="eq-bar bar-1"></span>
              <span class="eq-bar bar-2"></span>
              <span class="eq-bar bar-3"></span>
            </div>
          </div>
          <span class="brand-text">Aura<span class="brand-highlight">Music</span></span>
          <span class="brand-version-badge">v2.5</span>
        </div>

        <!-- Center: Real-Time Song Search Bar -->
        <div ref="searchContainerRef" class="navbar-search-wrapper" @click.stop>
          <div class="search-input-box" :class="{ 'is-focused': isSearchFocused }">
            <div class="search-icon-glow">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" class="search-mag-icon">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
            </div>

            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              class="search-input-field"
              placeholder="Search for artists, bands, tracks, podcasts..."
              @input="handleSearchInput"
              @keydown.enter="submitFullSearch(searchQuery)"
              @focus="onSearchFocus"
            />

            <!-- Loading Spinner while searching -->
            <div v-if="isSearching" class="search-spinner"></div>

            <!-- Clear Search Button -->
            <button
              v-else-if="searchQuery"
              class="search-clear-btn"
              title="Xóa tìm kiếm"
              @click="clearSearch"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>

            <!-- Shortcut Badge -->
            <div v-else class="search-shortcut-badge">
              <span>⌘ K</span>
            </div>
          </div>

          <!-- SoundCloud-Style Autocomplete Suggestions Dropdown -->
          <transition name="dropdown-slide">
            <div v-if="isDropdownOpen && searchQuery.trim()" class="sc-search-dropdown-card">
              <!-- Top Row: Search for "{searchQuery}" -->
              <div class="sc-suggest-row sc-search-for-row" @click="submitFullSearch(searchQuery)">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" class="sc-suggest-mag-icon">
                  <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
                <span class="sc-search-for-txt">Search for "<strong>{{ searchQuery }}</strong>"</span>
              </div>

              <!-- List of Keyword & Title Suggestions -->
              <div
                v-for="(suggestion, idx) in searchSuggestions"
                :key="idx"
                class="sc-suggest-row"
                @click="submitFullSearch(suggestion)"
              >
                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" class="sc-suggest-mag-icon">
                  <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
                <span class="sc-suggest-title-txt">{{ suggestion }}</span>
              </div>
            </div>
          </transition>
        </div>

        <!-- Center-Right: Main Nav Tabs -->
        <nav class="nav-tabs">
          <button
            class="nav-tab-btn"
            :class="{ active: currentTab === 'home' }"
            @click="currentTab = 'home'"
          >
            <span class="nav-icon-wrap">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
            </span>
            <span>Trang Chủ</span>
            <span v-if="currentTab === 'home'" class="active-indicator"></span>
          </button>

          <button
            class="nav-tab-btn"
            :class="{ active: currentTab === 'profile' }"
            @click="handleNavigate('profile')"
          >
            <span class="nav-icon-wrap">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </span>
            <span>Hồ Sơ</span>
            <span v-if="currentTab === 'profile'" class="active-indicator"></span>
          </button>
        </nav>

        <!-- Far Right: User Auth Actions -->
        <div class="header-auth-actions">
          <!-- Dark / Light Mode Toggle Button -->
          <button
            class="theme-toggle-btn"
            :title="isLightMode ? 'Chuyển sang Giao diện Tối (Dark Mode)' : 'Chuyển sang Giao diện Sáng (Light Mode)'"
            @click="toggleThemeMode"
          >
            <div class="theme-icon-box" :class="{ 'is-light': isLightMode }">
              <!-- Sun Icon -->
              <svg v-if="isLightMode" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" class="theme-icon sun-icon">
                <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
              </svg>
              <!-- Moon Icon -->
              <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="currentColor" class="theme-icon moon-icon">
                <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-3.03 0-5.5-2.47-5.5-5.5 0-1.82.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>
              </svg>
            </div>
            <span class="theme-mode-label">{{ isLightMode ? 'Light' : 'Dark' }}</span>
          </button>

          <!-- Logged In User Profile Chip -->
          <div
            v-if="currentUser"
            class="user-profile-chip"
            title="Xem trang cá nhân & thư viện của tôi"
            @click="handleNavigate('profile')"
          >
            <div class="user-avatar-circle">
              <img
                v-if="currentUser.avatar && !avatarLoadError"
                :src="formatMediaUrl(currentUser.avatar)"
                :alt="currentUser.displayName || currentUser.username"
                class="user-avatar-img"
                referrerpolicy="no-referrer"
                @error="avatarLoadError = true"
              />
              <span v-else class="user-avatar-letter">{{ (currentUser.displayName || currentUser.username || 'U')[0].toUpperCase() }}</span>
              <span class="online-status-dot"></span>
            </div>
            <span class="user-display-name">{{ currentUser.displayName || currentUser.username }}</span>
            <button class="logout-btn" title="Đăng xuất" @click.stop="promptLogout">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
              </svg>
            </button>
          </div>

          <!-- Guest Login / Register Buttons -->
          <div v-else class="guest-auth-btns">
            <button class="login-nav-btn" @click="openAuthModal('login')">
              <span>Đăng Nhập</span>
            </button>
            <button class="register-nav-btn" @click="openAuthModal('register')">
              <span class="btn-shimmer"></span>
              <span>Đăng Ký</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="app-body" :class="{ 'is-home': currentTab === 'home' }">
      <!-- 1. Home Page View (Hero, Content, Featured, Footer) -->
      <HomePage
        v-show="currentTab === 'home'"
        :favorite-song-ids="favoriteSongIds"
        :current-song-id="playerRef?.currentSong?._id"
        :is-playing="playerRef?.isPlaying"
        @navigate="handleNavigate"
        @play-song="handlePlayFromHome"
        @toggle-favorite="handleToggleFavorite"
        @add-to-playlist="handleAddToPlaylistFromHome"
        @share-song="openShareModal"
        @open-auth="openAuthModal"
      />

      <!-- 2. Interactive Vinyl Music Player View -->
      <MusicPlayer
        v-show="currentTab === 'player'"
        ref="playerRef"
        :initial-song-index="selectedSongIndex"
        :has-search-results="searchResults.length > 0"
        @back-to-search="currentTab = 'search'"
        @open-auth="openAuthModal('login')"
      />

      <!-- 3. Upload & Audio Processing Pipeline View -->
      <UploadSong
        v-if="currentTab === 'upload'"
        @song-uploaded="handleSongUploaded"
        @navigate="handleNavigate"
      />

      <!-- 4. User Profile & Library View -->
      <ProfilePage
        v-show="currentTab === 'profile'"
        @navigate="handleNavigate"
        @play-song="handlePlayFromProfile"
        @share-song="openShareModal"
        @open-auth="openAuthModal"
      />

      <!-- 5. SoundCloud-Style Search Results View -->
      <SearchResultsView
        v-if="currentTab === 'search'"
        :query="executedSearchQuery"
        :search-tracks="searchResults"
        :search-playlists="searchPlaylists"
        :is-loading="isSearching"
        :favorite-song-ids="favoriteSongIds"
        :current-song-id="playerRef?.currentSong?._id"
        :is-playing="playerRef?.isPlaying"
        @play-track="handlePlayFromSearchResult"
        @open-player-track="handleOpenPlayerFromSearch"
        @toggle-favorite="handleToggleFavorite"
        @add-to-playlist="handleAddToPlaylistFromSearch"
        @share-song="openShareModal"
      />
    </main>

    <!-- App Bottom Micro Footer (shown on player/upload views) -->
    <footer v-if="currentTab !== 'home'" class="app-sub-footer">
      <div class="sub-footer-inner">
        <div class="sub-footer-left">
          <span class="sub-footer-dot"></span>
          <span>© 2026 AuraMusic • Web Audio API 60FPS • Synced AI Lyrics</span>
        </div>
        <span class="sub-footer-link" @click="currentTab = 'home'">← Trở về Trang Chủ</span>
      </div>
    </footer>

    <!-- SoundCloud-Style Sticky Bottom Persistent Mini Player Bar -->
    <transition name="mini-player-slide">
      <aside
        v-if="playerRef?.currentSong && currentTab !== 'player'"
        class="sc-bottom-mini-player"
      >
        <div class="sc-mini-player-inner">
          <!-- Left: Playback Controls (Prev, Play/Pause, Next, Timeline, Duration) -->
          <div class="sc-mini-left-controls">
            <button
              class="sc-ctrl-btn sc-prev-btn"
              title="Bài trước"
              @click.stop="playerRef.switchSong(-1)"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/>
              </svg>
            </button>

            <button
              class="sc-ctrl-btn sc-play-btn"
              :title="playerRef.isPlaying ? 'Tạm dừng' : 'Phát'"
              @click.stop="playerRef.togglePlay()"
            >
              <svg v-if="playerRef.isPlaying" viewBox="0 0 24 24" width="20" height="20" fill="#000">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" width="20" height="20" fill="#000">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>

            <button
              class="sc-ctrl-btn sc-next-btn"
              title="Bài kế tiếp"
              @click.stop="playerRef.switchSong(1)"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
              </svg>
            </button>

            <!-- Timeline & Progress Track -->
            <div class="sc-mini-timeline-box" @click.stop="playerRef.handleSeek($event)">
              <span class="sc-mini-time">{{ formatDuration(playerRef.currentTime) }}</span>
              <div class="sc-mini-progress-track">
                <div
                  class="sc-mini-progress-fill"
                  :style="{ width: `${playerRef.progressPercentage}%` }"
                ></div>
              </div>
              <span class="sc-mini-time">{{ formatDuration(playerRef.duration) }}</span>
            </div>
          </div>

          <!-- Right: Track Metadata, Favorite Heart -->
          <div class="sc-mini-right-meta">
            <div
              class="sc-mini-artwork-wrapper clickable-nav-player"
              title="Bấm vào ảnh để vào Trình phát Vinyl & Lời bài hát 🎧"
              @click="goToPlayerTab"
            >
              <img
                v-if="playerRef.currentSong.coverImage"
                :src="formatMediaUrl(playerRef.currentSong.coverImage)"
                :alt="playerRef.currentSong.title"
                class="sc-mini-artwork-img"
              />
              <span v-else class="sc-mini-art-fallback">🎵</span>
            </div>

            <div
              class="sc-mini-titles clickable-nav-player"
              title="Bấm vào tên bài để vào Trình phát Vinyl & Lời bài hát 🎧"
              @click="goToPlayerTab"
            >
              <span class="sc-mini-artist">{{ playerRef.currentSong.artist || 'Nghệ Sĩ' }}</span>
              <h4 class="sc-mini-title" :title="playerRef.currentSong.title">{{ playerRef.currentSong.title }}</h4>
            </div>

            <!-- Action buttons -->
            <div class="sc-mini-actions" @click.stop>
              <button
                class="sc-mini-action-btn"
                :class="{ 'is-fav': playerRef.isCurrentSongFavorite }"
                title="Yêu thích ❤️"
                @click="playerRef.handleToggleFavorite(playerRef.currentSong)"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" :fill="playerRef.isCurrentSongFavorite ? '#ff007f' : 'currentColor'">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </button>

              <button
                class="sc-mini-action-btn"
                title="Chia sẻ bài hát 🔗"
                @click="openShareModal(playerRef.currentSong)"
              >
                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </transition>

    <!-- Mobile Bottom Navigation Bar (Visible on mobile screens <= 768px) -->
    <nav class="mobile-bottom-nav-bar">
      <button
        class="mobile-nav-item"
        :class="{ active: currentTab === 'home' }"
        @click="currentTab = 'home'"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
        <span class="mobile-nav-label">Trang Chủ</span>
      </button>

      <button
        class="mobile-nav-item"
        :class="{ active: currentTab === 'player' }"
        @click="goToPlayerTab"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
        <span class="mobile-nav-label">Nghe Nhạc</span>
      </button>

      <button
        class="mobile-nav-item"
        :class="{ active: currentTab === 'upload' }"
        @click="handleNavigate('upload')"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
        </svg>
        <span class="mobile-nav-label">Tải Lên</span>
      </button>

      <button
        class="mobile-nav-item"
        :class="{ active: currentTab === 'profile' }"
        @click="handleNavigate('profile')"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
        <span class="mobile-nav-label">Hồ Sơ</span>
      </button>
    </nav>

    <!-- Share Track Modal Component -->
    <ShareModal
      :is-open="isShareModalOpen"
      :song="shareTargetSong"
      @close="isShareModalOpen = false"
    />

    <!-- Auth Modal Component (Login / Register) -->
    <AuthModal
      :is-open="isAuthModalOpen"
      :initial-tab="authModalTab"
      @close="isAuthModalOpen = false"
      @auth-success="onAuthSuccess"
    />

    <!-- Logout Confirmation Modal -->
    <transition name="modal-fade">
      <div v-if="showLogoutConfirmModal" class="confirm-modal-overlay" @click.self="showLogoutConfirmModal = false">
        <div class="confirm-modal-box">
          <div class="confirm-icon-wrap">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#ef4444" stroke-width="2">
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3 class="confirm-modal-title">Xác Nhận Đăng Xuất</h3>
          <p class="confirm-modal-desc">
            Bạn có chắc chắn muốn đăng xuất khỏi tài khoản <strong>{{ currentUser?.displayName || currentUser?.username }}</strong> không?
          </p>
          <div class="confirm-modal-actions">
            <button class="btn-cancel-modal" @click="showLogoutConfirmModal = false">
              Hủy
            </button>
            <button class="btn-confirm-logout" @click="executeLogout">
              Đăng Xuất
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue';
import GlobalToast from './components/GlobalToast.vue';
import IntroSplash from './components/IntroSplash.vue';
import HomePage from './components/HomePage.vue';
import MusicPlayer from './components/MusicPlayer.vue';
import UploadSong from './components/UploadSong.vue';
import ProfilePage from './components/ProfilePage.vue';
import SearchResultsView from './components/SearchResultsView.vue';
import AuthModal from './components/AuthModal.vue';
import ShareModal from './components/ShareModal.vue';
import { showToast } from './utils/toast.js';
import { currentUser, logout, getAuthHeaders, fetchUserProfile } from './utils/auth.js';
import { API_BASE_URL } from './config/api.js';

const showIntroSplash = ref(true);
const currentTab = ref('home');
const selectedSongIndex = ref(-1);
const playerRef = ref(null);
const searchInputRef = ref(null);

// PWA Install Prompt State
const deferredInstallPrompt = ref(null);
const canInstallPWA = ref(false);

function setupPWAEvents() {
  if (typeof window === 'undefined') return;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt.value = e;
    canInstallPWA.value = true;
  });

  window.addEventListener('appinstalled', () => {
    canInstallPWA.value = false;
    deferredInstallPrompt.value = null;
    showToast('AuraMusic đã được cài đặt thành công trên thiết bị của bạn! 🎉', 'success');
  });
}

async function handleInstallPWA() {
  if (deferredInstallPrompt.value) {
    deferredInstallPrompt.value.prompt();
    const { outcome } = await deferredInstallPrompt.value.userChoice;
    if (outcome === 'accepted') {
      showToast('Đang cài đặt ứng dụng AuraMusic... ✨', 'info');
      canInstallPWA.value = false;
    }
    deferredInstallPrompt.value = null;
  } else {
    showToast('💡 Để cài đặt AuraMusic: Trên trình duyệt bấm biểu tượng Cài đặt (Install) ở thanh địa chỉ hoặc "Thêm vào màn hình chính"', 'info');
  }
}

// Share Modal State
const isShareModalOpen = ref(false);
const shareTargetSong = ref(null);

function openShareModal(song) {
  shareTargetSong.value = song || playerRef.value?.currentSong;
  if (!shareTargetSong.value) {
    showToast('Chưa có bài hát nào đang phát để chia sẻ!', 'warning');
    return;
  }
  isShareModalOpen.value = true;
}

// Search State matching SoundCloud
const searchQuery = ref('');
const searchSuggestions = ref([]);
const executedSearchQuery = ref('');
const searchResults = ref([]);
const searchPlaylists = ref([]);
const isSearching = ref(false);
const isDropdownOpen = ref(false);
const isSearchFocused = ref(false);
const searchContainerRef = ref(null);
const favoriteSongIds = ref(new Set());
let debounceTimer = null;

// Pending playback state when user is not logged in
const pendingPlaySong = ref(null);
const pendingPlayIndex = ref(-1);

// Global hotkey: Ctrl + K / Cmd + K to focus search
function handleGlobalKeydown(e) {
  if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
    e.preventDefault();
    if (searchInputRef.value) {
      searchInputRef.value.focus();
    }
  }
}

async function fetchUserFavorites() {
  if (!currentUser.value) {
    try {
      const local = localStorage.getItem('auramusic_local_favorites');
      if (local) {
        const parsed = JSON.parse(local);
        favoriteSongIds.value = new Set(parsed.map((s) => String(s._id || s.id)));
      } else {
        favoriteSongIds.value = new Set();
      }
    } catch {
      favoriteSongIds.value = new Set();
    }
    return;
  }
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/favorites`, {
      headers: getAuthHeaders(),
    });
    const result = await res.json();
    if (result.success && Array.isArray(result.data)) {
      const valid = result.data.filter(Boolean);
      favoriteSongIds.value = new Set(valid.map((s) => String(s._id || s.id)));
      try {
        localStorage.setItem('auramusic_local_favorites', JSON.stringify(valid));
      } catch {}
    }
  } catch {}
}

const avatarLoadError = ref(false);

watch(currentUser, () => {
  avatarLoadError.value = false;
  fetchUserFavorites();
});

// Theme Mode State (Dark vs Light)
const isLightMode = ref(false);

function applyTheme(isLight) {
  if (isLight) {
    document.documentElement.classList.add('theme-light');
    localStorage.setItem('auramusic_theme', 'light');
  } else {
    document.documentElement.classList.remove('theme-light');
    localStorage.setItem('auramusic_theme', 'dark');
  }
}

function toggleThemeMode() {
  isLightMode.value = !isLightMode.value;
  applyTheme(isLightMode.value);
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown);
  window.addEventListener('auramusic:favorites-updated', fetchUserFavorites);
  setupPWAEvents();
  fetchUserFavorites();
  if (currentUser.value) {
    fetchUserProfile();
  }
  const savedTheme = localStorage.getItem('auramusic_theme');
  if (savedTheme === 'light') {
    isLightMode.value = true;
    applyTheme(true);
  }
  setTimeout(() => {
    checkSharedLinkOnMount();
  }, 500);
});

async function checkSharedLinkOnMount() {
  const params = new URLSearchParams(window.location.search);
  const playId = params.get('play');
  const songQuery = params.get('song');

  if (!playId && !songQuery) return;

  try {
    if (playId) {
      const res = await fetch(`${API_BASE_URL}/api/songs/${playId}`);
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          await nextTick();
          if (playerRef.value?.playSong) {
            await playerRef.value.playSong(result.data);
            showToast(`Đang phát bài hát chia sẻ: ${result.data.title} 🎧`, 'info');
          }
          return;
        }
      }
    }

    if (songQuery) {
      const res = await fetch(`${API_BASE_URL}/api/search?q=${encodeURIComponent(songQuery)}`);
      if (res.ok) {
        const result = await res.json();
        if (result.success && Array.isArray(result.data?.tracks) && result.data.tracks.length > 0) {
          const track = result.data.tracks[0];
          await nextTick();
          if (playerRef.value?.playSong) {
            await playerRef.value.playSong(track);
            showToast(`Đang phát bài hát chia sẻ: ${track.title} 🎧`, 'info');
          }
        }
      }
    }
  } catch (err) {
    console.warn('[Check Shared Link Error]:', err);
  }
}

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown);
  window.removeEventListener('auramusic:favorites-updated', fetchUserFavorites);
});

function formatMediaUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

/**
 * 1. Real-time Autocomplete Suggestions (SoundCloud Style)
 * When typing, immediately suggests matching song titles and keyword variants
 */
function handleSearchInput() {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  const rawQuery = searchQuery.value;
  if (!rawQuery || !rawQuery.trim()) {
    searchSuggestions.value = [];
    isDropdownOpen.value = false;
    return;
  }

  const query = rawQuery.trim();
  isDropdownOpen.value = true;

  debounceTimer = setTimeout(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/songs/suggestions?q=${encodeURIComponent(query)}`, {
        headers: getAuthHeaders(),
      });
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        searchSuggestions.value = result.data;
      } else {
        searchSuggestions.value = [query, `${query} remix`, `${query} acoustic`];
      }
    } catch (err) {
      console.warn('[Suggestions Fetch Notice]:', err);
      searchSuggestions.value = [query, `${query} remix`];
    }
  }, 100);
}

function onSearchFocus() {
  isSearchFocused.value = true;
  if (searchQuery.value.trim()) {
    isDropdownOpen.value = true;
    if (searchSuggestions.value.length === 0) {
      handleSearchInput();
    }
  }
}

function clearSearch() {
  searchQuery.value = '';
  searchSuggestions.value = [];
  isDropdownOpen.value = false;
  isSearching.value = false;
}

// Close search dropdown on click outside
function handleDocumentClick() {
  isDropdownOpen.value = false;
  isSearchFocused.value = false;
}

/**
 * 2. Submit Full Search & Navigate to SoundCloud-Style Search Results Page
 * When clicking a title/suggestion or pressing Enter, immediately fetches full tracks list
 */
async function submitFullSearch(queryText) {
  if (!queryText || !queryText.trim()) return;
  const targetQuery = queryText.trim();
  executedSearchQuery.value = targetQuery;
  searchQuery.value = '';
  searchSuggestions.value = [];
  isDropdownOpen.value = false;
  isSearchFocused.value = false;
  if (searchInputRef.value) {
    searchInputRef.value.blur();
  }
  isSearching.value = true;
  currentTab.value = 'search';
  window.scrollTo({ top: 0, behavior: 'smooth' });

  try {
    const response = await fetch(`${API_BASE_URL}/api/songs/search?q=${encodeURIComponent(targetQuery)}`, {
      headers: getAuthHeaders(),
    });
    const result = await response.json();
    if (result.success && Array.isArray(result.data)) {
      searchResults.value = result.data;
    } else {
      searchResults.value = [];
    }
  } catch (err) {
    console.error('[Full Search Error]:', err);
    searchResults.value = [];
  } finally {
    isSearching.value = false;
  }
}

/**
 * 3. Play Track from Search Results (Plays in Sticky Bottom Bar without leaving Search page)
 */
async function handlePlayFromSearchResult(track, queue = null) {
  if (!currentUser.value) {
    pendingPlaySong.value = track;
    openAuthModal('login');
    return;
  }

  await nextTick();
  if (playerRef.value && typeof playerRef.value.playSong === 'function') {
    playerRef.value.playSong(track, queue, { isFromSearch: true });
  }
}

/**
 * Open Player directly from Search Results (when clicking Cover Avatar or Track Title)
 */
async function handleOpenPlayerFromSearch(track, queue = null) {
  if (!currentUser.value) {
    pendingPlaySong.value = track;
    openAuthModal('login');
    return;
  }

  currentTab.value = 'player';
  await nextTick();
  if (playerRef.value && typeof playerRef.value.playSong === 'function') {
    playerRef.value.playSong(track, queue, { isFromSearch: true });
  }
}

/**
 * 4. Toggle Favorite from Search Results
 */
async function handleToggleFavorite(track) {
  if (!currentUser.value) {
    openAuthModal('login');
    return;
  }
  if (!track) return;

  try {
    const songId = track._id || 'temp_id';
    const res = await fetch(`${API_BASE_URL}/api/auth/favorites/${songId}`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: track.title,
        artist: track.artist,
        coverImage: track.coverImage,
        audioUrl: track.audioUrl,
        duration: track.duration,
        genre: track.genre,
        isRemix: track.isRemix,
      }),
    });
    const result = await res.json();
    if (result.success) {
      const realId = result.songId || track._id;
      if (result.isFavorite) {
        favoriteSongIds.value.add(realId);
        if (track._id) favoriteSongIds.value.add(track._id);
        showToast('Đã thêm vào danh sách Yêu Thích ❤️', 'success');
      } else {
        favoriteSongIds.value.delete(realId);
        if (track._id) favoriteSongIds.value.delete(track._id);
        showToast('Đã xóa khỏi danh sách Yêu Thích 💔', 'info');
      }

      // Notify profile page and all other views to update favorites list in real-time
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auramusic:favorites-updated', {
          detail: { isFavorite: result.isFavorite, songId: realId, data: result.data }
        }));
      }
    } else {
      showToast(result.message || 'Không thể cập nhật yêu thích', 'error');
    }
  } catch (err) {
    console.error('[Toggle Favorite Error]:', err);
    showToast('Lỗi kết nối khi cập nhật yêu thích', 'error');
  }
}

function goToPlayerTab() {
  currentTab.value = 'player';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function handleAddToPlaylistFromSearch(track) {
  if (!currentUser.value) {
    openAuthModal('login');
    return;
  }
  handlePlayFromSearchResult(track);
}

// Auth Modal state
const isAuthModalOpen = ref(false);
const authModalTab = ref('login');
const showLogoutConfirmModal = ref(false);

function openAuthModal(tab = 'login') {
  authModalTab.value = tab;
  isAuthModalOpen.value = true;
}

function promptLogout() {
  showLogoutConfirmModal.value = true;
}

function executeLogout() {
  showLogoutConfirmModal.value = false;
  logout();
  showToast('Đã đăng xuất tài khoản 👋', 'info');
  setTimeout(() => {
    window.location.href = '/';
  }, 250);
}

async function onAuthSuccess(user) {
  console.log('Logged in user:', user);
  showToast(`Chào mừng trở lại, ${user?.displayName || user?.username}! ✨`, 'success');
  await fetchUserFavorites();

  if (playerRef.value && typeof playerRef.value.fetchSongs === 'function') {
    playerRef.value.fetchSongs();
  }

  // Immediately notify Home & Profile to reload this specific account's taste recommendations
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auramusic:play-recorded', { detail: { action: 'auth-login' } }));
    window.dispatchEvent(new CustomEvent('auramusic:favorites-updated', { detail: { action: 'auth-login' } }));
  }

  // If user was trying to play a song before login, resume playing now
  if (pendingPlaySong.value) {
    const songToPlay = pendingPlaySong.value;
    pendingPlaySong.value = null;
    pendingPlayIndex.value = -1;
    await nextTick();
    if (playerRef.value && typeof playerRef.value.playSong === 'function') {
      playerRef.value.playSong(songToPlay);
    }
  } else if (pendingPlayIndex.value >= 0) {
    const idx = pendingPlayIndex.value;
    pendingPlayIndex.value = -1;
    selectedSongIndex.value = idx;
    currentTab.value = 'player';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    currentTab.value = 'home';
  }
}

function handleNavigate(tab) {
  currentTab.value = tab;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function handlePlayFromHome(song, queueOrIndex = null, options = {}) {
  if (!currentUser.value) {
    pendingPlaySong.value = song;
    openAuthModal('login');
    return;
  }

  // Stay on Home Page and play music smoothly in the bottom mini player bar
  if (playerRef.value && typeof playerRef.value.playSong === 'function') {
    if (Array.isArray(queueOrIndex) && queueOrIndex.length > 0) {
      await playerRef.value.playSong(song, queueOrIndex, options);
    } else {
      await playerRef.value.playSong(song, null, options);
    }
  }
}

function handleAddToPlaylistFromHome(song) {
  if (!currentUser.value) {
    openAuthModal('login');
    return;
  }
  if (playerRef.value?.openAddToPlaylistModal) {
    playerRef.value.openAddToPlaylistModal(song);
  }
}

async function handlePlayFromProfile(song, queue = null) {
  currentTab.value = 'player';
  window.scrollTo({ top: 0, behavior: 'smooth' });
  await nextTick();
  if (playerRef.value && typeof playerRef.value.playSong === 'function') {
    playerRef.value.playSong(song, queue);
  }
}

function handleSongUploaded(newSong) {
  console.log('New song uploaded:', newSong);
  setTimeout(() => {
    selectedSongIndex.value = 0;
    currentTab.value = 'player';
  }, 1000);
}
</script>

<style scoped>
.app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #08090d;
  background-image: 
    radial-gradient(circle at 15% 10%, rgba(0, 242, 254, 0.04) 0%, transparent 40%),
    radial-gradient(circle at 85% 90%, rgba(157, 78, 221, 0.04) 0%, transparent 45%);
  color: #f1f5f9;
  position: relative;
}

/* Floating Glass Header */
.app-header {
  position: sticky;
  top: 0;
  z-index: 120;
  padding: 0.75rem 1.5rem;
  background: rgba(8, 9, 13, 0.75);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  transition: all 0.3s ease;
}

.header-inner {
  max-width: 1440px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
}

/* Brand Logo */
.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  flex-shrink: 0;
}

.brand:hover {
  transform: translateY(-1px);
}

.brand:hover .brand-text {
  text-shadow: 0 0 24px rgba(0, 242, 254, 0.6);
}

.brand-visual {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(0, 242, 254, 0.2), rgba(157, 78, 221, 0.2));
  border: 1px solid rgba(0, 242, 254, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 16px rgba(0, 242, 254, 0.2);
}

.brand-equalizer {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 16px;
}

.eq-bar {
  width: 3px;
  background: linear-gradient(to top, #00f2fe, #4facfe);
  border-radius: 2px;
  animation: eqBounce 1.2s ease-in-out infinite alternate;
}

.bar-1 { height: 40%; animation-delay: 0.1s; }
.bar-2 { height: 90%; animation-delay: 0.3s; }
.bar-3 { height: 60%; animation-delay: 0.2s; }

@keyframes eqBounce {
  0% { height: 25%; }
  100% { height: 100%; }
}

.brand-text {
  font-family: var(--font-display, 'Lexend', 'Be Vietnam Pro', sans-serif);
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #ffffff;
  transition: all 0.3s ease;
}

.brand-highlight {
  background: linear-gradient(135deg, #00f2fe, #9d4edd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.brand-version-badge {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: 6px;
  background: rgba(0, 242, 254, 0.1);
  color: #00f2fe;
  border: 1px solid rgba(0, 242, 254, 0.25);
  letter-spacing: 0.05em;
}

/* Navbar Search Component */
.navbar-search-wrapper {
  position: relative;
  flex: 1;
  max-width: 420px;
}

.search-input-box {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 0.5rem 0.9rem;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.search-input-box.is-focused,
.search-input-box:focus-within {
  background: rgba(18, 22, 34, 0.9);
  border-color: #00f2fe;
  box-shadow: 0 0 20px rgba(0, 242, 254, 0.25), inset 0 0 10px rgba(0, 242, 254, 0.08);
}

.search-icon-glow {
  color: #64748b;
  margin-right: 0.65rem;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.search-input-box.is-focused .search-icon-glow {
  color: #00f2fe;
}

.search-input-field {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #ffffff;
  font-size: 0.9rem;
  font-family: inherit;
  font-weight: 500;
}

.search-input-field::placeholder {
  color: #64748b;
  font-weight: 400;
}

.search-shortcut-badge {
  display: flex;
  align-items: center;
  padding: 0.15rem 0.45rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #64748b;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  user-select: none;
}

.search-clear-btn {
  background: rgba(255, 255, 255, 0.08);
  border: none;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
}

.search-clear-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.search-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(0, 242, 254, 0.2);
  border-top-color: #00f2fe;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

/* SoundCloud-Style Autocomplete Search Dropdown Menu */
.sc-search-dropdown-card {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: #11141d;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 12px;
  box-shadow: 0 16px 45px rgba(0, 0, 0, 0.9), 0 0 25px rgba(0, 242, 254, 0.1);
  padding: 0.35rem 0;
  z-index: 999;
  max-height: 380px;
  overflow-y: auto;
}

.dropdown-slide-enter-active,
.dropdown-slide-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.dropdown-slide-enter-from,
.dropdown-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}

.sc-suggest-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 1rem;
  color: #e2e8f0;
  font-size: 0.88rem;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
  user-select: none;
}

.sc-suggest-row:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #00f2fe;
}

.sc-search-for-row {
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  padding-bottom: 0.75rem;
  margin-bottom: 0.25rem;
  color: #94a3b8;
}

.sc-search-for-row:hover {
  color: #ffffff;
}

.sc-suggest-mag-icon {
  color: #64748b;
  flex-shrink: 0;
}

.sc-suggest-row:hover .sc-suggest-mag-icon {
  color: #00f2fe;
}

.sc-search-for-txt {
  font-size: 0.86rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sc-search-for-txt strong {
  color: #ffffff;
}

.sc-suggest-title-txt {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

.dropdown-song-item:hover .play-action-icon {
  opacity: 1;
  transform: scale(1);
}

.dropdown-status-msg {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem;
  color: #94a3b8;
  font-size: 0.9rem;
}

.dropdown-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(0, 242, 254, 0.2);
  border-top-color: #00f2fe;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.dropdown-empty-msg {
  text-align: center;
  padding: 2rem 1rem;
  color: #94a3b8;
  font-size: 0.88rem;
}

.empty-emoji {
  font-size: 2rem;
  display: block;
  margin-bottom: 0.5rem;
}

.empty-sub {
  display: block;
  font-size: 0.78rem;
  color: #64748b;
  margin-top: 0.4rem;
}

/* Nav Tabs */
.nav-tabs {
  display: flex;
  gap: 0.35rem;
  background: rgba(255, 255, 255, 0.04);
  padding: 0.35rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  flex-shrink: 0;
}

.nav-tab-btn {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  background: transparent;
  border: none;
  color: #94a3b8;
  padding: 0.55rem 1.15rem;
  border-radius: 12px;
  font-size: 0.88rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.nav-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.nav-tab-btn:hover {
  color: #ffffff;
}

.nav-tab-btn:hover .nav-icon-wrap {
  transform: translateY(-1px);
}

.nav-tab-btn.active {
  background: rgba(0, 242, 254, 0.15);
  color: #ffffff;
  box-shadow: 0 0 20px rgba(0, 242, 254, 0.2);
  border: 1px solid rgba(0, 242, 254, 0.3);
}

.active-indicator {
  position: absolute;
  bottom: 3px;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 2px;
  background: #00f2fe;
  border-radius: 2px;
  box-shadow: 0 0 8px #00f2fe;
}

/* Header Auth Actions */
.header-auth-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.pwa-install-nav-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.42rem 0.85rem;
  border-radius: 12px;
  background: rgba(0, 242, 254, 0.08);
  border: 1px solid rgba(0, 242, 254, 0.25);
  color: #00f2fe;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
}

.pwa-install-nav-btn:hover {
  background: rgba(0, 242, 254, 0.18);
  border-color: #00f2fe;
  box-shadow: 0 0 16px rgba(0, 242, 254, 0.35);
  transform: translateY(-1px);
}

.guest-auth-btns {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.login-nav-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: #e2e8f0;
  padding: 0.5rem 1.1rem;
  border-radius: 12px;
  font-size: 0.86rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.25s ease;
}

.login-nav-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.3);
  color: #ffffff;
  transform: translateY(-1px);
}

.register-nav-btn {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
  color: #08090d;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 12px;
  font-size: 0.86rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  box-shadow: 0 4px 18px rgba(0, 242, 254, 0.35);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.register-nav-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0, 242, 254, 0.55);
}

.btn-shimmer {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    60deg,
    transparent 30%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 70%
  );
  transform: translateX(-100%);
  animation: shimmerSweep 3.5s infinite;
}

@keyframes shimmerSweep {
  100% { transform: translateX(100%); }
}

.user-profile-chip {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 0.35rem 0.75rem 0.35rem 0.45rem;
  border-radius: 36px;
  backdrop-filter: blur(12px);
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-profile-chip:hover {
  background: rgba(255, 255, 255, 0.09);
  border-color: rgba(0, 242, 254, 0.4);
  transform: translateY(-1px);
}

.user-avatar-circle {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00f2fe, #9d4edd);
  color: #08090d;
  font-weight: 800;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: visible;
  box-shadow: 0 0 10px rgba(0, 242, 254, 0.3);
}

.user-avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.online-status-dot {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  border: 2px solid #08090d;
  z-index: 2;
}

.user-display-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: #f1f5f9;
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  border-radius: 50%;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

/* App Main Body */
.app-body {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  width: 100%;
}

.app-body.is-home {
  display: block;
  width: 100%;
  align-items: initial;
  justify-content: initial;
}

/* Sub-Footer */
.app-sub-footer {
  padding: 1.2rem 2rem;
  background: rgba(8, 9, 13, 0.92);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 0.82rem;
  color: #64748b;
  backdrop-filter: blur(16px);
}

.sub-footer-inner {
  max-width: 1440px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sub-footer-left {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.sub-footer-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #00f2fe;
  box-shadow: 0 0 6px #00f2fe;
}

.sub-footer-link {
  color: #00f2fe;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.sub-footer-link:hover {
  color: #ffffff;
  text-shadow: 0 0 10px rgba(0, 242, 254, 0.6);
  transform: translateX(-3px);
}

/* SoundCloud-Style Sticky Bottom Persistent Mini-Player Bar */
.sc-bottom-mini-player {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: rgba(14, 17, 26, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 242, 254, 0.1);
  z-index: 1000;
  display: flex;
  align-items: center;
  user-select: none;
  cursor: pointer;
}

.sc-mini-player-inner {
  width: 100%;
  max-width: 1360px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

/* Left Controls */
.sc-mini-left-controls {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex: 1;
  max-width: 720px;
}

.sc-ctrl-btn {
  background: transparent;
  border: none;
  color: #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0.35rem;
  border-radius: 50%;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.sc-ctrl-btn:hover {
  color: #ffffff;
  transform: scale(1.15);
}

.sc-play-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #ffffff;
  color: #000000;
  box-shadow: 0 2px 10px rgba(255, 255, 255, 0.3);
}

.sc-play-btn:hover {
  background: #00f2fe;
  color: #08090d;
  box-shadow: 0 4px 15px rgba(0, 242, 254, 0.6);
  transform: scale(1.08);
}

/* Mini Timeline */
.sc-mini-timeline-box {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex: 1;
  min-width: 180px;
  cursor: pointer;
}

.sc-mini-time {
  font-size: 0.72rem;
  font-weight: 700;
  color: #94a3b8;
  font-family: monospace;
  min-width: 36px;
  text-align: center;
}

.sc-mini-progress-track {
  position: relative;
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 999px;
  overflow: visible;
  transition: height 0.15s;
}

.sc-mini-timeline-box:hover .sc-mini-progress-track {
  height: 6px;
}

.sc-mini-progress-fill {
  position: relative;
  height: 100%;
  background: #00f2fe;
  border-radius: 999px;
  box-shadow: 0 0 8px rgba(0, 242, 254, 0.5);
}

/* Right Metadata */
.sc-mini-right-meta {
  display: flex;
  align-items: center;
  gap: 0.95rem;
  min-width: 0;
  cursor: pointer;
}

.sc-mini-artwork-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  overflow: hidden;
  background: #181d2c;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.sc-mini-artwork-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sc-mini-art-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.sc-mini-titles {
  display: flex;
  flex-direction: column;
  min-width: 0;
  max-width: 280px;
}

.sc-mini-artist {
  font-size: 0.72rem;
  color: #94a3b8;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sc-mini-title {
  font-size: 0.88rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s;
}

.sc-mini-right-meta:hover .sc-mini-title {
  color: #00f2fe;
}

.clickable-nav-player {
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.clickable-nav-player:hover {
  transform: translateY(-1px);
}

.sc-mini-artwork-wrapper.clickable-nav-player:hover {
  border-color: #00f2fe;
  box-shadow: 0 0 14px rgba(0, 242, 254, 0.45);
  transform: scale(1.06);
}

.sc-mini-actions {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.sc-mini-action-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  padding: 0.35rem 0.65rem;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
  transition: all 0.2s;
}

.sc-mini-action-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
}

.btn-open-player {
  background: rgba(0, 242, 254, 0.12);
  border-color: rgba(0, 242, 254, 0.3);
  color: #00f2fe;
}

.btn-open-player:hover {
  background: #00f2fe;
  color: #08090d;
}

.mini-player-slide-enter-active,
.mini-player-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
}

.mini-player-slide-enter-from,
.mini-player-slide-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* Theme Mode Toggle Button */
.theme-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.85rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #cbd5e1;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
}

.theme-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
  color: #ffffff;
  transform: translateY(-1px);
}

.theme-icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00f2fe;
  transition: transform 0.3s ease, color 0.3s ease;
}

.theme-icon-box.is-light {
  color: #f59e0b;
  transform: rotate(360deg);
}

.theme-mode-label {
  font-size: 0.78rem;
  letter-spacing: 0.03em;
}

/* ==========================================================================
   LIGHT MODE THEME ENGINE & STYLES OVERRIDES
   ========================================================================== */
.app-root.theme-light,
:root.theme-light {
  --bg-dark: #f8fafc;
  --bg-card: rgba(255, 255, 255, 0.9);
  --border-glass: rgba(0, 0, 0, 0.08);
  background-color: #f8fafc;
  color: #0f172a;
}

.theme-light {
  background-color: #f8fafc !important;
  color: #0f172a;
}

.theme-light .app-header {
  background: rgba(255, 255, 255, 0.92);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.04);
}

.theme-light .brand-text {
  color: #0f172a;
}

.theme-light .brand-version-badge {
  background: rgba(2, 132, 199, 0.1);
  color: #0284c7;
  border-color: rgba(2, 132, 199, 0.25);
}

.theme-light .theme-toggle-btn {
  background: rgba(0, 0, 0, 0.04);
  border-color: rgba(0, 0, 0, 0.12);
  color: #334155;
}

.theme-light .theme-toggle-btn:hover {
  background: rgba(0, 0, 0, 0.08);
  color: #0f172a;
}

.theme-light .search-input-box {
  background: #ffffff;
  border-color: rgba(0, 0, 0, 0.12);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
}

.theme-light .search-input-box.is-focused,
.theme-light .search-input-box:focus-within {
  background: #ffffff;
  border-color: #0284c7;
  box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
}

.theme-light .search-input-field {
  color: #0f172a;
}

.theme-light .search-input-field::placeholder {
  color: #94a3b8;
}

.theme-light .search-shortcut-badge {
  background: rgba(0, 0, 0, 0.05);
  border-color: rgba(0, 0, 0, 0.1);
  color: #64748b;
}

.theme-light .sc-search-dropdown-card {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.12);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
}

.theme-light .sc-suggest-row {
  color: #1e293b;
}

.theme-light .sc-suggest-row:hover {
  background: rgba(2, 132, 199, 0.08);
  color: #0284c7;
}

.theme-light .sc-search-for-row {
  border-bottom-color: rgba(0, 0, 0, 0.06);
  color: #64748b;
}

.theme-light .sc-search-for-txt strong {
  color: #0f172a;
}

.theme-light .nav-tab-btn {
  color: #64748b;
}

.theme-light .nav-tab-btn:hover {
  color: #0f172a;
  background: rgba(0, 0, 0, 0.05);
}

.theme-light .nav-tab-btn.active {
  color: #0284c7;
  background: rgba(2, 132, 199, 0.1);
}

.theme-light .user-profile-chip {
  background: #ffffff;
  border-color: rgba(0, 0, 0, 0.1);
  color: #0f172a;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.theme-light .user-display-name {
  color: #0f172a;
}

.theme-light .login-nav-btn {
  color: #475569;
}

.theme-light .login-nav-btn:hover {
  color: #0f172a;
  background: rgba(0, 0, 0, 0.05);
}

/* Light mode for sticky bottom player */
.theme-light .sc-bottom-mini-player {
  background: rgba(255, 255, 255, 0.95);
  border-top-color: rgba(0, 0, 0, 0.1);
  box-shadow: 0 -4px 25px rgba(0, 0, 0, 0.08);
}

.theme-light .sc-ctrl-btn {
  color: #475569;
}

.theme-light .sc-ctrl-btn:hover {
  color: #0f172a;
}

.theme-light .sc-play-btn {
  background: #0f172a;
  color: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
}

.theme-light .sc-play-btn:hover {
  background: #0284c7;
  color: #ffffff;
}

.theme-light .sc-mini-title {
  color: #0f172a;
}

.theme-light .sc-mini-progress-track {
  background: rgba(0, 0, 0, 0.12);
}

.theme-light .sc-mini-action-btn {
  background: #f1f5f9;
  border-color: rgba(0, 0, 0, 0.08);
  color: #475569;
}

.theme-light .sc-mini-action-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

/* Light mode for SearchResultsView */
.theme-light :deep(.search-results-page) {
  background: #f8fafc;
  color: #0f172a;
}

.theme-light :deep(.search-hero-banner) {
  background: #ffffff;
  border-color: rgba(2, 132, 199, 0.25);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
}

.theme-light :deep(.search-hero-title) {
  color: #0f172a;
}

.theme-light :deep(.track-card-row) {
  background: #ffffff;
  border-color: rgba(0, 0, 0, 0.08);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
}

.theme-light :deep(.track-card-row:hover) {
  background: #ffffff;
  border-color: #0284c7;
  box-shadow: 0 8px 25px rgba(2, 132, 199, 0.12);
}

.theme-light :deep(.track-main-title) {
  color: #0f172a;
}

.theme-light :deep(.track-waveform-bar-wrapper) {
  background: #f1f5f9;
}

.theme-light :deep(.single-wave-bar) {
  background: rgba(0, 0, 0, 0.18);
}

.theme-light :deep(.track-card-row:hover .single-wave-bar) {
  background: linear-gradient(180deg, #0284c7 0%, #3b82f6 100%);
}

.theme-light :deep(.filter-chip-btn) {
  background: #f1f5f9;
  border-color: rgba(0, 0, 0, 0.08);
  color: #475569;
}

.theme-light :deep(.filter-chip-btn.active) {
  background: rgba(2, 132, 199, 0.12);
  border-color: #0284c7;
  color: #0284c7;
}

.theme-light :deep(.btn-play-now) {
  background: rgba(2, 132, 199, 0.12);
  border-color: rgba(2, 132, 199, 0.3);
  color: #0284c7;
}

.theme-light :deep(.btn-play-now:hover) {
  background: #0284c7;
  color: #ffffff;
}

.theme-light :deep(.action-icon-btn) {
  background: #f1f5f9;
  border-color: rgba(0, 0, 0, 0.08);
  color: #64748b;
}

.theme-light :deep(.action-icon-btn:hover) {
  background: #e2e8f0;
  color: #0f172a;
}

/* Light mode for HomePage */
.theme-light :deep(.home-page-container) {
  color: #0f172a;
}

.theme-light :deep(.hero-title) {
  color: #0f172a;
}

.theme-light :deep(.hero-subtitle) {
  color: #475569;
}

.theme-light :deep(.stat-card) {
  background: #ffffff;
  border-color: rgba(0, 0, 0, 0.08);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
}

.theme-light :deep(.stat-num) {
  color: #0f172a;
}

.theme-light :deep(.showcase-glass-card) {
  background: #ffffff;
  border-color: rgba(0, 0, 0, 0.08);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
}

.theme-light :deep(.showcase-title) {
  color: #0f172a;
}

.theme-light :deep(.category-card) {
  background: #ffffff;
  border-color: rgba(0, 0, 0, 0.08);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
}

.theme-light :deep(.category-card-title) {
  color: #0f172a;
}

.theme-light :deep(.featured-track-row) {
  background: #ffffff;
  border-color: rgba(0, 0, 0, 0.08);
}

.theme-light :deep(.featured-track-row:hover) {
  background: #f8fafc;
  border-color: #0284c7;
}

.theme-light :deep(.featured-track-title) {
  color: #0f172a;
}

/* Light mode for ProfilePage */
.theme-light :deep(.profile-page-container) {
  background: #f8fafc;
  color: #0f172a;
}

.theme-light :deep(.profile-hero-card) {
  background: #ffffff;
  border-color: rgba(0, 0, 0, 0.08);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
}

.theme-light :deep(.user-name-title) {
  color: #0f172a;
}

.theme-light :deep(.tab-nav-btn) {
  color: #64748b;
}

.theme-light :deep(.tab-nav-btn.active) {
  color: #0284c7;
  border-bottom-color: #0284c7;
}

.theme-light :deep(.song-item-card),
.theme-light :deep(.playlist-library-card) {
  background: #ffffff;
  border-color: rgba(0, 0, 0, 0.08);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
}

.theme-light :deep(.card-song-title),
.theme-light :deep(.pl-card-name) {
  color: #0f172a;
}

.theme-light :deep(.support-form-card) {
  background: #ffffff;
  border-color: rgba(0, 0, 0, 0.08);
  box-shadow: 0 10px 35px rgba(0, 0, 0, 0.04);
}

.theme-light :deep(.form-input-field),
.theme-light :deep(.form-textarea-field) {
  background: #f8fafc;
  border-color: rgba(0, 0, 0, 0.12);
  color: #0f172a;
}

.theme-light :deep(.form-input-label) {
  color: #334155;
}

.theme-light .app-sub-footer {
  background: #f1f5f9;
  border-top-color: rgba(0, 0, 0, 0.08);
  color: #64748b;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Mobile Bottom Navigation Bar */
.mobile-bottom-nav-bar {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: calc(58px + env(safe-area-inset-bottom, 0px));
  padding-bottom: env(safe-area-inset-bottom, 0px);
  background: rgba(10, 13, 20, 0.95);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 999;
  align-items: center;
  justify-content: space-around;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.6);
}

.mobile-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  background: none;
  border: none;
  color: #64748b;
  padding: 0.4rem 0.2rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  font-family: inherit;
}

.mobile-nav-item.active {
  color: #00f2fe;
}

.mobile-nav-item.active svg {
  filter: drop-shadow(0 0 8px rgba(0, 242, 254, 0.6));
}

.mobile-nav-label {
  font-size: 0.68rem;
  font-weight: 700;
}

@media (max-width: 960px) {
  .app-header {
    padding: 0.75rem 1rem;
  }
  .header-inner {
    flex-wrap: wrap;
    gap: 0.85rem;
  }
  .navbar-search-wrapper {
    order: 3;
    max-width: 100%;
    width: 100%;
  }
  .sc-mini-timeline-box {
    display: none;
  }
}

@media (max-width: 768px) {
  .mobile-bottom-nav-bar {
    display: flex;
  }
  .nav-tabs {
    display: none; /* Replaced by Mobile Bottom Nav */
  }
  .sc-bottom-mini-player {
    bottom: calc(58px + env(safe-area-inset-bottom, 0px));
    border-radius: 14px 14px 0 0;
  }
  .app-main-content {
    padding-bottom: 150px;
  }
}

@media (max-width: 640px) {
  .brand-version-badge {
    display: none;
  }
  .search-shortcut-badge {
    display: none;
  }
  .user-display-name {
    display: none;
  }
  .sc-mini-titles {
    max-width: 120px;
  }
  .theme-mode-label {
    display: none;
  }
  .guest-auth-btns button {
    padding: 0.45rem 0.75rem;
    font-size: 0.78rem;
  }
}

/* ================= LOGOUT CONFIRMATION MODAL ================= */
.confirm-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1.5rem;
}

.confirm-modal-box {
  width: 100%;
  max-width: 440px;
  background: linear-gradient(135deg, #181826 0%, #12121d 100%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  padding: 2.2rem 2rem 1.8rem;
  text-align: center;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(239, 68, 68, 0.15);
  animation: modalPopIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.confirm-icon-wrap {
  width: 64px;
  height: 64px;
  margin: 0 auto 1.2rem;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 25px rgba(239, 68, 68, 0.25);
}

.confirm-modal-title {
  color: #fff;
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
}

.confirm-modal-desc {
  color: #94a3b8;
  font-size: 0.96rem;
  line-height: 1.55;
  margin-bottom: 2rem;
}

.confirm-modal-desc strong {
  color: #f1f5f9;
}

.confirm-modal-actions {
  display: flex;
  gap: 1rem;
}

.btn-cancel-modal {
  flex: 1;
  padding: 0.85rem 1.2rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #cbd5e1;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel-modal:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

.btn-confirm-logout {
  flex: 1;
  padding: 0.85rem 1.2rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border: none;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 18px rgba(239, 68, 68, 0.4);
  transition: all 0.2s ease;
}

.btn-confirm-logout:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(239, 68, 68, 0.6);
}

.btn-confirm-logout:active {
  transform: translateY(0);
}

@keyframes modalPopIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(15px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
