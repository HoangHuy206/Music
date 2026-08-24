<template>
  <div class="profile-page-container">
    <!-- Ambient Atmospheric Glows -->
    <div class="profile-ambient-glow glow-top-left"></div>
    <div class="profile-ambient-glow glow-top-right"></div>

    <!-- Delete Confirmation Modal -->
    <transition name="modal-pop">
      <div v-if="songToDelete" class="delete-confirm-overlay" @click.self="songToDelete = null">
        <div class="delete-confirm-card">
          <div class="delete-icon-glow">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
          </div>
          <h3 class="delete-modal-title">Xóa Bài Hát?</h3>
          <p class="delete-modal-desc">
            Bạn có chắc chắn muốn xóa bài hát "<strong>{{ songToDelete.title }}</strong>" không? Hành động này không thể hoàn tác.
          </p>
          <div class="delete-modal-actions">
            <button class="btn-cancel" :disabled="isDeleting" @click="songToDelete = null">Hủy Bỏ</button>
            <button class="btn-delete-confirm" :disabled="isDeleting" @click="confirmDeleteSong">
              <span v-if="isDeleting" class="spinner-sm"></span>
              <span v-else>Xóa Vĩnh Viễn</span>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- GUEST NOT LOGGED IN STATE -->
    <div v-if="!currentUser" class="guest-profile-card">
      <div class="guest-card-mesh"></div>
      <div class="guest-icon-wrap">
        <div class="guest-icon-inner">
          <svg viewBox="0 0 24 24" width="42" height="42" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
      </div>
      <h2 class="guest-title">Hồ Sơ Cá Nhân & Không Gian Âm Nhạc</h2>
      <p class="guest-desc">
        Đăng nhập vào <strong>AuraMusic</strong> để quản lý các bài hát bạn đã tải lên, lưu danh sách bài hát yêu thích, tải lên avatar động GIF và đồng bộ trải nghiệm nghe nhạc của bạn.
      </p>
      <div class="guest-cta-group">
        <button class="guest-login-btn" @click="$emit('open-auth', 'login')">
          <span>Đăng Nhập Ngay</span>
        </button>
        <button class="guest-register-btn" @click="$emit('open-auth', 'register')">
          <span>Tạo Tài Khoản Mới</span>
        </button>
      </div>
    </div>

    <!-- LOGGED IN USER PROFILE VIEW -->
    <div v-else class="profile-main-wrapper">
      <!-- 1. Hero Profile Header Card -->
      <section class="profile-header-card">
        <div class="profile-banner-bg">
          <div class="banner-overlay-pattern"></div>
          <div class="banner-accent-flare"></div>
        </div>

        <div class="profile-header-content">
          <!-- Avatar Box with Direct Click-to-Upload -->
          <div class="avatar-container" @click="triggerHeaderAvatarPick">
            <div class="avatar-frame">
              <img
                v-if="avatarPreviewUrl || profileForm.avatar || currentUser.avatar"
                :src="avatarPreviewUrl || profileForm.avatar || currentUser.avatar"
                :alt="currentUser.displayName || currentUser.username"
                class="avatar-image"
                @error="handleAvatarError"
              />
              <div v-else class="avatar-fallback">
                <span>{{ (currentUser.displayName || currentUser.username || 'U')[0].toUpperCase() }}</span>
              </div>
              <div class="avatar-status-badge" title="Tài khoản đang hoạt động">
                <span class="status-dot-pulse"></span>
              </div>
            </div>
            <button class="avatar-edit-trigger" title="Đổi ảnh đại diện từ máy tính" @click.stop="triggerHeaderAvatarPick">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
            </button>
            <input
              ref="headerAvatarInputRef"
              type="file"
              class="hidden-file-input"
              accept="image/jpeg,image/png,image/gif,image/webp"
              @change="handleAvatarFileSelect"
            />
          </div>

          <!-- User Identity Meta -->
          <div class="user-meta-info">
            <div class="name-row">
              <h1 class="user-name">{{ currentUser.displayName || currentUser.username }}</h1>
              <span class="member-tag">
                <span class="tag-star">✦</span>
                Audiophile VIP
              </span>
            </div>
            <p class="user-handle">@{{ currentUser.username }} • <span class="user-email-text">{{ currentUser.email }}</span></p>
            <p class="user-bio-quote">{{ currentUser.bio || 'AuraMusic lover & Audiophile 🎧' }}</p>

            <!-- Stat Counters -->
            <div class="profile-stats-bar">
              <div class="stat-pill">
                <div class="stat-icon-circ stat-cyan">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                  </svg>
                </div>
                <div class="stat-text-group">
                  <span class="stat-val">{{ mySongs.length }}</span>
                  <span class="stat-lbl">Tracks Đã Tải Lên</span>
                </div>
              </div>

              <div class="stat-pill">
                <div class="stat-icon-circ stat-pink">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
                <div class="stat-text-group">
                  <span class="stat-val">{{ favoriteSongs.length }}</span>
                  <span class="stat-lbl">Yêu Thích</span>
                </div>
              </div>

              <div class="stat-pill">
                <div class="stat-icon-circ stat-violet">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
                  </svg>
                </div>
                <div class="stat-text-group">
                  <span class="stat-val">{{ formatJoinDate(currentUser.createdAt) }}</span>
                  <span class="stat-lbl">Gia Nhập</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. Profile Tabs Navigation -->
      <nav class="profile-tabs-nav">
        <button
          class="tab-item-btn"
          :class="{ active: activeTab === 'my-songs' }"
          @click="activeTab = 'my-songs'"
        >
          <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
          <span class="tab-label-desktop">Bài Hát Của Tôi</span>
          <span class="tab-label-mobile">Bài Hát</span>
          <span class="tab-badge">{{ mySongs.length }}</span>
        </button>

        <button
          class="tab-item-btn"
          :class="{ active: activeTab === 'favorites' }"
          @click="activeTab = 'favorites'"
        >
          <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <span class="tab-label-desktop">Yêu Thích</span>
          <span class="tab-label-mobile">Yêu Thích</span>
          <span class="tab-badge">{{ favoriteSongs.length }}</span>
        </button>

        <button
          class="tab-item-btn"
          :class="{ active: activeTab === 'playlists' }"
          @click="activeTab = 'playlists'"
        >
          <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
            <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
          </svg>
          <span class="tab-label-desktop">Playlists Của Tôi</span>
          <span class="tab-label-mobile">Playlists</span>
          <span class="tab-badge">{{ userPlaylists.length }}</span>
        </button>

        <button
          class="tab-item-btn"
          :class="{ active: activeTab === 'settings' }"
          @click="activeTab = 'settings'"
        >
          <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
          </svg>
          <span class="tab-label-desktop">Cài Đặt Hồ Sơ & Bảo Mật</span>
          <span class="tab-label-mobile">Cài Đặt</span>
        </button>
      </nav>

      <!-- 3. Tab Contents -->
      <div class="tab-content-area">
        <!-- TAB 1: MY UPLOADS -->
        <section v-if="activeTab === 'my-songs'" class="tab-pane">
          <div class="pane-header">
            <div class="pane-title-group">
              <h3 class="pane-title">Kho Bài Hát Tải Lên</h3>
              <p class="pane-subtitle">Tất cả bài hát do bạn đóng góp và xử lý qua AI Audio Pipeline</p>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="isLoadingSongs" class="loading-state-box">
            <div class="profile-spinner"></div>
            <span>Đang tải danh sách bài hát...</span>
          </div>

          <!-- Empty State -->
          <div v-else-if="mySongs.length === 0" class="empty-state-card">
            <div class="empty-icon-wrap">
              <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
            <h4>Chưa có bài hát nào được tải lên</h4>
            <p>Bạn chưa tải lên bài hát nào vào thư viện cá nhân. Hãy bắt đầu ngay!</p>
            <button class="empty-action-btn" @click="$emit('navigate', 'upload')">
              <span>Tải Lên Bài Đầu Tiên</span>
            </button>
          </div>

          <!-- Songs Grid -->
          <div v-else class="songs-grid">
            <div
              v-for="song in mySongs"
              :key="song._id"
              class="song-card"
            >
              <div class="card-cover-box" @click="handlePlaySong(song)">
                <img
                  v-if="song.coverImage"
                  :src="formatMediaUrl(song.coverImage)"
                  :alt="song.title"
                  class="cover-img"
                />
                <div v-else class="cover-fallback">🎵</div>
                <div class="cover-play-hover">
                  <div class="play-bubble">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div class="card-info">
                <h4 class="song-title-text" :title="song.title">{{ song.title }}</h4>
                <p class="song-artist-text">{{ song.artist || 'Unknown Artist' }}</p>
                <div class="song-tags-row">
                  <span class="tag-pill-badge tag-ai">AI Synced</span>
                  <span class="song-date-text">{{ formatShortDate(song.createdAt) }}</span>
                </div>
              </div>

              <div class="card-actions">
                <button
                  class="action-icon-btn play-btn"
                  title="Phát bài này"
                  @click="handlePlaySong(song)"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
                <button
                  class="action-icon-btn delete-btn"
                  title="Xóa bài hát"
                  @click="songToDelete = song"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- TAB 2: FAVORITES -->
        <section v-if="activeTab === 'favorites'" class="tab-pane">
          <div class="pane-header">
            <div class="pane-title-group">
              <h3 class="pane-title">Bài Hát Yêu Thích</h3>
              <p class="pane-subtitle">Danh sách giai điệu bạn đã thả tim và lưu lại để thưởng thức</p>
            </div>
          </div>

          <div v-if="favoriteSongs.length === 0" class="empty-state-card">
            <div class="empty-icon-wrap empty-pink">
              <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <h4>Chưa có bài hát yêu thích</h4>
            <p>Khám phá kho nhạc và nhấn biểu tượng trái tim để lưu bài hát yêu thích của bạn.</p>
            <button class="empty-action-btn" @click="$emit('navigate', 'home')">
              <span>Khám Phá Bài Hát Ngay</span>
            </button>
          </div>

          <div v-else class="songs-grid">
            <div
              v-for="song in favoriteSongs"
              :key="song._id"
              class="song-card"
            >
              <div class="card-cover-box" @click="handlePlaySong(song)">
                <img
                  v-if="song.coverImage"
                  :src="formatMediaUrl(song.coverImage)"
                  :alt="song.title"
                  class="cover-img"
                />
                <div v-else class="cover-fallback">🎵</div>
                <div class="cover-play-hover">
                  <div class="play-bubble">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div class="card-info">
                <h4 class="song-title-text" :title="song.title">{{ song.title }}</h4>
                <p class="song-artist-text">{{ song.artist || 'Unknown Artist' }}</p>
                <div class="song-tags-row">
                  <span class="tag-pill-badge tag-fav">❤️ Liked</span>
                </div>
              </div>

              <div class="card-actions">
                <button
                  class="action-icon-btn play-btn"
                  title="Phát bài này"
                  @click="handlePlaySong(song)"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
                <button
                  class="action-icon-btn fav-active-btn"
                  title="Bỏ yêu thích"
                  @click="handleRemoveFavorite(song._id)"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="#ff007f">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- TAB 3: CUSTOM PLAYLISTS -->
        <section v-if="activeTab === 'playlists'" class="tab-pane">
          <div class="pane-header">
            <div class="pane-title-group">
              <h3 class="pane-title">Danh Sách Phát Của Tôi</h3>
              <p class="pane-subtitle">Tập hợp các bài hát theo chủ đề, tâm trạng và sở thích riêng của bạn</p>
            </div>
            <button class="pane-action-btn" @click="showCreatePlaylistModal = !showCreatePlaylistModal">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              <span>{{ showCreatePlaylistModal ? 'Đóng' : 'Tạo Playlist Mới' }}</span>
            </button>
          </div>

          <!-- Create Playlist Form Box -->
          <div v-if="showCreatePlaylistModal" class="create-pl-card">
            <h4 class="create-pl-head">✨ Tạo Danh Sách Phát Mới</h4>
            <div class="create-pl-row">
              <input
                v-model="newPlName"
                type="text"
                class="create-pl-input"
                placeholder="Nhập tên playlist (vd: Nhạc Chill Đêm, Motivation...)"
                maxlength="40"
              />
              <input
                v-model="newPlDesc"
                type="text"
                class="create-pl-input"
                placeholder="Mô tả ngắn (tùy chọn)"
                maxlength="100"
              />
              <div class="create-pl-actions">
                <button class="btn-cancel-sm" @click="showCreatePlaylistModal = false">Hủy</button>
                <button class="btn-submit-pl" @click="handleCreateNewPlaylist">Tạo Playlist</button>
              </div>
            </div>
          </div>

          <div v-if="userPlaylists.length === 0" class="empty-state-card">
            <div class="empty-icon-wrap empty-cyan">
              <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
                <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
              </svg>
            </div>
            <h4 class="empty-title">Chưa Có Playlist Nào</h4>
            <p class="empty-desc">Tạo playlist để nhóm các bài hát yêu thích theo chủ đề và gu âm nhạc riêng của bạn.</p>
            <button class="empty-cta-btn" @click="showCreatePlaylistModal = true">Tạo Playlist Đầu Tiên</button>
          </div>

          <div v-else class="playlists-grid">
            <div v-for="pl in userPlaylists" :key="pl._id" class="profile-playlist-card">
              <div class="pl-card-top">
                <div class="pl-card-visual">
                  <span class="pl-big-icon">📁</span>
                  <span class="pl-badge-count">{{ pl.songs?.length || 0 }} bài</span>
                </div>
                <div class="pl-card-details">
                  <h4 class="pl-title">{{ pl.name }}</h4>
                  <p class="pl-desc">{{ pl.description || 'Không có mô tả' }}</p>
                  <span class="pl-date">{{ formatShortDate(pl.createdAt) }}</span>
                </div>
              </div>

              <!-- List of Songs Preview -->
              <div v-if="pl.songs && pl.songs.length" class="pl-songs-preview">
                <div v-for="s in pl.songs.slice(0, 3)" :key="s._id" class="pl-mini-song-row">
                  <span class="dot">🎵</span>
                  <span class="title">{{ s.title }}</span>
                  <span class="artist">- {{ s.artist }}</span>
                </div>
                <div v-if="pl.songs.length > 3" class="more-songs">và {{ pl.songs.length - 3 }} bài hát khác...</div>
              </div>

              <div class="pl-card-bottom-actions">
                <button
                  class="pl-play-all-btn"
                  :disabled="!pl.songs || !pl.songs.length"
                  @click="handlePlayPlaylist(pl)"
                >
                  ▶ Phát Playlist
                </button>
                <button class="pl-delete-btn" @click="handleDeletePlaylist(pl._id, pl.name)">
                  🗑️ Xóa
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- TAB 4: PROFILE SETTINGS & SECURITY -->
        <section v-if="activeTab === 'settings'" class="tab-pane settings-pane">
          <div class="settings-grid">
            <!-- Form 1: General Info & Custom Avatar Upload -->
            <div class="settings-card">
              <div class="card-header-line">
                <div class="card-header-icon cyan">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <div>
                  <h4 class="card-box-title">Thông Tin Cá Nhân & Avatar</h4>
                  <p class="card-box-subtitle">Tự do tải ảnh đại diện hoặc ảnh động GIF từ máy tính của bạn</p>
                </div>
              </div>

              <!-- Interactive Custom Avatar Uploader from Device -->
              <div class="avatar-upload-zone-wrapper">
                <label class="form-label">Ảnh Đại Diện (Hỗ trợ GIF, PNG, JPG, WEBP)</label>
                
                <div
                  class="avatar-uploader-card"
                  :class="{ 'is-dragging': isAvatarDragging, 'has-file': selectedAvatarFile }"
                  @dragover.prevent="isAvatarDragging = true"
                  @dragleave.prevent="isAvatarDragging = false"
                  @drop.prevent="handleAvatarDrop"
                  @click="triggerAvatarFileSelect"
                >
                  <input
                    ref="avatarFileInputRef"
                    type="file"
                    class="hidden-file-input"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    @change="handleAvatarFileSelect"
                  />

                  <div class="avatar-preview-box">
                    <img
                      :src="avatarPreviewUrl || profileForm.avatar || currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'"
                      alt="Avatar Preview"
                      class="avatar-uploader-img"
                    />
                    <div class="avatar-upload-hover-overlay">
                      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                        <path d="M4 4h3l2-2h6l2 2h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2m8 3a5 5 0 0 0-5 5a5 5 0 0 0 5 5a5 5 0 0 0 5-5a5 5 0 0 0-5-5m0 2a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3z"/>
                      </svg>
                      <span>Chọn Ảnh</span>
                    </div>
                  </div>

                  <div class="uploader-details">
                    <h5 class="uploader-title">
                      {{ selectedAvatarFile ? selectedAvatarFile.name : 'Tải lên từ kho ảnh của bạn' }}
                    </h5>
                    <p class="uploader-subtitle">
                      <span v-if="selectedAvatarFile">
                        Kích thước: {{ (selectedAvatarFile.size / 1024).toFixed(1) }} KB • Đã sẵn sàng lưu
                      </span>
                      <span v-else>
                        Kéo thả ảnh hoặc click để duyệt tệp từ máy tính / điện thoại
                      </span>
                    </p>
                    <div class="uploader-actions-row">
                      <button
                        type="button"
                        class="btn-browse-file"
                        @click.stop="triggerAvatarFileSelect"
                      >
                        📁 Chọn tệp từ máy
                      </button>
                      <button
                        v-if="selectedAvatarFile"
                        type="button"
                        class="btn-reset-avatar"
                        @click.stop="clearSelectedAvatarFile"
                      >
                        ✕ Bỏ chọn
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <form class="settings-form" @submit.prevent="handleUpdateProfile">
                <div class="form-group">
                  <label class="form-label">Tên Hiển Thị (Display Name)</label>
                  <input
                    v-model="profileForm.displayName"
                    type="text"
                    class="form-input-text"
                    placeholder="Nhập tên hiển thị của bạn"
                    required
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Email Liên Hệ</label>
                  <input
                    v-model="profileForm.email"
                    type="email"
                    class="form-input-text"
                    placeholder="name@example.com"
                    required
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Tiểu Sử / Trích Dẫn Yêu Thích</label>
                  <textarea
                    v-model="profileForm.bio"
                    rows="3"
                    class="form-textarea"
                    placeholder="Chia sẻ gu âm nhạc hoặc dòng trạng thái ngắn..."
                    maxlength="250"
                  ></textarea>
                  <span class="char-count">{{ profileForm.bio.length }}/250 ký tự</span>
                </div>

                <button type="submit" class="submit-save-btn" :disabled="isUpdatingProfile">
                  <span v-if="isUpdatingProfile" class="spinner-sm"></span>
                  <span v-else>Lưu Thay Đổi & Cập Nhật Avatar</span>
                </button>
              </form>
            </div>

            <!-- Form 2: Change Password -->
            <div class="settings-card">
              <div class="card-header-line">
                <div class="card-header-icon violet">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                  </svg>
                </div>
                <div>
                  <h4 class="card-box-title">Đổi Mật Khẩu</h4>
                  <p class="card-box-subtitle">Bảo vệ tài khoản với mật khẩu an toàn</p>
                </div>
              </div>

              <form class="settings-form" @submit.prevent="handleChangePassword">
                <div class="form-group">
                  <label class="form-label">Mật Khẩu Hiện Tại</label>
                  <input
                    v-model="passwordForm.currentPassword"
                    type="password"
                    class="form-input-text"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Mật Khẩu Mới (Tối thiểu 6 ký tự)</label>
                  <input
                    v-model="passwordForm.newPassword"
                    type="password"
                    class="form-input-text"
                    placeholder="••••••••"
                    minlength="6"
                    required
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Xác Nhận Mật Khẩu Mới</label>
                  <input
                    v-model="passwordForm.confirmPassword"
                    type="password"
                    class="form-input-text"
                    placeholder="••••••••"
                    minlength="6"
                    required
                  />
                </div>

                <button type="submit" class="submit-save-btn sec-violet" :disabled="isUpdatingPassword">
                  <span v-if="isUpdatingPassword" class="spinner-sm"></span>
                  <span v-else>Cập Nhật Mật Khẩu</span>
                </button>
              </form>

              <!-- Preferences Box -->
              <div class="experience-sub-box">
                <h5 class="sub-box-title">Tùy Chọn Âm Thanh & Player</h5>
                <div class="pref-toggle-row">
                  <div>
                    <span class="pref-label">Hiệu ứng Visualizer 60FPS</span>
                    <span class="pref-desc">Phổ tần số thời gian thực chất lượng cao</span>
                  </div>
                  <input type="checkbox" checked class="pref-switch" />
                </div>
                <div class="pref-toggle-row">
                  <div>
                    <span class="pref-label">Tự động phát tiếp</span>
                    <span class="pref-desc">Chuyển sang bài hát tiếp theo khi hết bài</span>
                  </div>
                  <input type="checkbox" checked class="pref-switch" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue';
import { currentUser, getAuthHeaders, updateUserSession, fetchUserProfile } from '../utils/auth.js';
import { showToast } from '../utils/toast.js';
import { API_BASE_URL } from '../config/api.js';

const emit = defineEmits(['navigate', 'play-song', 'open-auth']);

const activeTab = ref('my-songs');
const mySongs = ref([]);
const favoriteSongs = ref([]);
const userPlaylists = ref([]);
const showCreatePlaylistModal = ref(false);
const newPlName = ref('');
const newPlDesc = ref('');
const isLoadingSongs = ref(false);
const isUpdatingProfile = ref(false);
const isUpdatingPassword = ref(false);
const isDeleting = ref(false);
const songToDelete = ref(null);

// Avatar File Upload State
const headerAvatarInputRef = ref(null);
const avatarFileInputRef = ref(null);
const selectedAvatarFile = ref(null);
const avatarPreviewUrl = ref('');
const isAvatarDragging = ref(false);


// Forms State
const profileForm = reactive({
  displayName: '',
  email: '',
  avatar: '',
  bio: '',
});

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

function syncFormWithUser() {
  if (currentUser.value) {
    profileForm.displayName = currentUser.value.displayName || currentUser.value.username || '';
    profileForm.email = currentUser.value.email || '';
    profileForm.avatar = currentUser.value.avatar || '';
    profileForm.bio = currentUser.value.bio || '';
  }
}

watch(currentUser, () => {
  syncFormWithUser();
  if (currentUser.value) {
    fetchMySongs();
    fetchFavorites();
    fetchUserPlaylists();
  }
});

watch(activeTab, (newTab) => {
  if (newTab === 'favorites') {
    fetchFavorites();
  } else if (newTab === 'my-songs') {
    fetchMySongs();
  } else if (newTab === 'playlists') {
    fetchUserPlaylists();
  }
});

onMounted(() => {
  syncFormWithUser();
  if (currentUser.value) {
    fetchUserProfile(API_BASE_URL);
    fetchMySongs();
    fetchFavorites();
    fetchUserPlaylists();
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('auramusic:favorites-updated', fetchFavorites);
    window.addEventListener('auramusic:song-uploaded', fetchMySongs);
    window.addEventListener('focus', fetchFavorites);
  }
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('auramusic:favorites-updated', fetchFavorites);
    window.removeEventListener('auramusic:song-uploaded', fetchMySongs);
    window.removeEventListener('focus', fetchFavorites);
  }
});

function formatMediaUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

function formatJoinDate(dateStr) {
  const targetDate = dateStr || currentUser.value?.createdAt;
  if (!targetDate) {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }
  try {
    const d = new Date(targetDate);
    if (isNaN(d.getTime())) {
      const now = new Date();
      return `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    }
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch {
    return '23/08/2026';
  }
}

function formatShortDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  } catch {
    return '';
  }
}

function handleAvatarError(e) {
  e.target.style.display = 'none';
}

// Trigger Header avatar pick
function triggerHeaderAvatarPick() {
  activeTab.value = 'settings';
  if (avatarFileInputRef.value) {
    avatarFileInputRef.value.click();
  } else if (headerAvatarInputRef.value) {
    headerAvatarInputRef.value.click();
  }
}

// Trigger Settings avatar file select
function triggerAvatarFileSelect() {
  if (avatarFileInputRef.value) {
    avatarFileInputRef.value.click();
  }
}

// Handle File Selection (from input or drop)
function handleAvatarFileSelect(e) {
  const file = (e.target.files && e.target.files[0]) || null;
  if (!file) return;
  processAvatarFile(file);
}

function handleAvatarDrop(e) {
  isAvatarDragging.value = false;
  const file = (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) || null;
  if (!file) return;
  processAvatarFile(file);
}

function processAvatarFile(file) {
  if (!file.type.startsWith('image/')) {
    showToast('Chỉ chấp nhận tệp hình ảnh (JPG, PNG, GIF, WEBP)', 'error');
    return;
  }

  if (file.size > 15 * 1024 * 1024) {
    showToast('Dung lượng tệp không được vượt quá 15MB', 'error');
    return;
  }

  selectedAvatarFile.value = file;
  avatarPreviewUrl.value = URL.createObjectURL(file);
  showToast(`Đã chọn ảnh "${file.name}". Bấm "Lưu Thay Đổi" để cập nhật! ✨`);
}

function clearSelectedAvatarFile() {
  selectedAvatarFile.value = null;
  avatarPreviewUrl.value = '';
  if (avatarFileInputRef.value) avatarFileInputRef.value.value = '';
  if (headerAvatarInputRef.value) headerAvatarInputRef.value.value = '';
}

// Fetch user's uploaded songs
async function fetchMySongs() {
  if (!currentUser.value) return;
  isLoadingSongs.value = true;
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/my-songs`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      mySongs.value = data.data;
    }
  } catch (err) {
    console.error('[Fetch My Songs Error]:', err);
  } finally {
    isLoadingSongs.value = false;
  }
}

// Fetch user's favorite songs
async function fetchFavorites() {
  if (!currentUser.value) return;
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/favorites`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      favoriteSongs.value = data.data.filter(Boolean);
    }
  } catch (err) {
    console.error('[Fetch Favorites Error]:', err);
  }
}

// Play song from profile list
function handlePlaySong(song, queue = null) {
  const targetQueue = Array.isArray(queue) && queue.length > 0 ? queue : (activeTab.value === 'favorites' ? favoriteSongs.value : mySongs.value);
  emit('play-song', song, targetQueue);
}

// Remove song from favorites
async function handleRemoveFavorite(songId) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/favorites/${songId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (data.success) {
      favoriteSongs.value = favoriteSongs.value.filter((s) => s._id !== songId);
      showToast('Đã xóa khỏi danh sách yêu thích');
    }
  } catch (err) {
    console.error('[Remove Favorite Error]:', err);
  }
}

// Fetch user's custom playlists
async function fetchUserPlaylists() {
  if (!currentUser.value) return;
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/playlists`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      userPlaylists.value = data.data;
    }
  } catch (err) {
    console.error('[Fetch Playlists Error]:', err);
  }
}

// Create new playlist
async function handleCreateNewPlaylist() {
  if (!newPlName.value.trim()) {
    showToast('Vui lòng nhập tên playlist', 'error');
    return;
  }
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/playlists`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: newPlName.value.trim(),
        description: newPlDesc.value.trim(),
      }),
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message || 'Tạo playlist thành công');
      newPlName.value = '';
      newPlDesc.value = '';
      showCreatePlaylistModal.value = false;
      fetchUserPlaylists();
    } else {
      showToast(data.message || 'Không thể tạo playlist', 'error');
    }
  } catch (err) {
    console.error('[Create Playlist Error]:', err);
    showToast('Lỗi kết nối khi tạo playlist', 'error');
  }
}

// Delete custom playlist
async function handleDeletePlaylist(playlistId, name) {
  if (!confirm(`Bạn có chắc muốn xóa playlist "${name}"?`)) return;
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/playlists/${playlistId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message || 'Đã xóa playlist');
      fetchUserPlaylists();
    } else {
      showToast(data.message || 'Không thể xóa playlist', 'error');
    }
  } catch (err) {
    console.error('[Delete Playlist Error]:', err);
  }
}

// Play playlist from Profile
function handlePlayPlaylist(playlist) {
  if (!playlist || !playlist.songs || !playlist.songs.length) return;
  emit('play-song', playlist.songs[0], playlist.songs);
}

// Delete user's uploaded song
async function confirmDeleteSong() {
  if (!songToDelete.value) return;
  isDeleting.value = true;
  const target = songToDelete.value;
  try {
    const res = await fetch(`${API_BASE_URL}/api/songs/${target._id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (data.success) {
      mySongs.value = mySongs.value.filter((s) => s._id !== target._id);
      showToast(`Đã xóa bài hát "${target.title}" thành công!`);
      songToDelete.value = null;
    } else {
      showToast(data.message || 'Không thể xóa bài hát', 'error');
    }
  } catch (err) {
    console.error('[Delete Song Error]:', err);
    showToast(err.message || 'Lỗi khi xóa bài hát', 'error');
  } finally {
    isDeleting.value = false;
  }
}

// Update profile with Avatar Upload File Support
async function handleUpdateProfile() {
  isUpdatingProfile.value = true;
  try {
    const formData = new FormData();
    formData.append('displayName', profileForm.displayName);
    formData.append('email', profileForm.email);
    formData.append('bio', profileForm.bio);

    if (selectedAvatarFile.value) {
      formData.append('avatarFile', selectedAvatarFile.value);
    } else if (profileForm.avatar) {
      formData.append('avatar', profileForm.avatar);
    }

    const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: formData,
    });

    const data = await res.json();
    if (data.success && data.data) {
      updateUserSession(data.data);
      profileForm.avatar = data.data.avatar;
      selectedAvatarFile.value = null;
      avatarPreviewUrl.value = '';
      showToast('Cập nhật thông tin & ảnh đại diện thành công! ✨');
    } else {
      showToast(data.message || 'Cập nhật thất bại', 'error');
    }
  } catch (err) {
    console.error('[Update Profile Error]:', err);
    showToast(err.message || 'Lỗi khi cập nhật hồ sơ', 'error');
  } finally {
    isUpdatingProfile.value = false;
  }
}

// Change password
async function handleChangePassword() {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    showToast('Mật khẩu xác nhận không khớp!', 'error');
    return;
  }
  isUpdatingPassword.value = true;
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }),
    });
    const data = await res.json();
    if (data.success) {
      passwordForm.currentPassword = '';
      passwordForm.newPassword = '';
      passwordForm.confirmPassword = '';
      showToast('Đổi mật khẩu thành công! 🔒');
    } else {
      showToast(data.message || 'Đổi mật khẩu thất bại', 'error');
    }
  } catch (err) {
    console.error('[Change Password Error]:', err);
    showToast(err.message || 'Lỗi khi đổi mật khẩu', 'error');
  } finally {
    isUpdatingPassword.value = false;
  }
}
</script>

<style scoped>
.profile-page-container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
  position: relative;
  min-height: calc(100vh - 120px);
  overflow-x: hidden;
  box-sizing: border-box;
}

/* Ambient Glows */
.profile-ambient-glow {
  position: absolute;
  width: min(500px, 90vw);
  height: min(500px, 90vw);
  border-radius: 50%;
  filter: blur(140px);
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}
.glow-top-left {
  top: 0px;
  left: 0px;
  background: radial-gradient(circle, rgba(0, 242, 254, 0.12) 0%, transparent 70%);
}
.glow-top-right {
  top: 100px;
  right: 0px;
  background: radial-gradient(circle, rgba(157, 78, 221, 0.14) 0%, transparent 70%);
}

@media (max-width: 768px) {
  .profile-ambient-glow {
    display: none;
  }
}

/* Toast */
.profile-toast {
  position: fixed;
  top: 80px;
  right: 24px;
  z-index: 200;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1.5rem;
  border-radius: 12px;
  font-size: 0.92rem;
  font-weight: 500;
  backdrop-filter: blur(16px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}
.profile-toast.success {
  background: rgba(16, 185, 129, 0.9);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.profile-toast.error {
  background: rgba(239, 68, 68, 0.9);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.toast-icon {
  font-size: 1.1rem;
}
.toast-fade-enter-active, .toast-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-fade-enter-from, .toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-16px) scale(0.95);
}

/* Guest State */
.guest-profile-card {
  position: relative;
  z-index: 1;
  max-width: 680px;
  margin: 4rem auto;
  padding: 3.5rem 2.5rem;
  background: rgba(18, 20, 29, 0.7);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
}
.guest-icon-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}
.guest-icon-inner {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(0, 242, 254, 0.2), rgba(157, 78, 221, 0.2));
  border: 1px solid rgba(0, 242, 254, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00f2fe;
}
.guest-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 1rem;
}
.guest-desc {
  font-size: 1rem;
  color: #94a3b8;
  line-height: 1.6;
  margin-bottom: 2rem;
}
.guest-cta-group {
  display: flex;
  gap: 1rem;
  justify-content: center;
}
.guest-login-btn {
  padding: 0.85rem 1.8rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #00f2fe, #4facfe);
  color: #08090d;
  font-weight: 700;
  font-size: 0.95rem;
  border: none;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.guest-login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 242, 254, 0.35);
}
.guest-register-btn {
  padding: 0.85rem 1.8rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  color: #f1f5f9;
  font-weight: 600;
  font-size: 0.95rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}
.guest-register-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
}

/* Main Profile Layout */
.profile-main-wrapper {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* 1. Header Card */
.profile-header-card {
  position: relative;
  background: rgba(16, 18, 27, 0.75);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
}
.profile-banner-bg {
  height: 140px;
  background: linear-gradient(135deg, rgba(0, 242, 254, 0.25) 0%, rgba(157, 78, 221, 0.3) 50%, rgba(255, 0, 127, 0.2) 100%);
  position: relative;
  overflow: hidden;
}
.banner-overlay-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px);
  background-size: 20px 20px;
  opacity: 0.6;
}
.banner-accent-flare {
  position: absolute;
  top: -50%;
  right: 10%;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.25) 0%, transparent 60%);
  border-radius: 50%;
  filter: blur(30px);
}

.profile-header-content {
  padding: 0 2rem 2rem;
  margin-top: -55px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.avatar-container {
  position: relative;
  cursor: pointer;
}
.avatar-frame {
  width: 110px;
  height: 110px;
  border-radius: 24px;
  border: 4px solid #0d0f17;
  overflow: hidden;
  background: linear-gradient(135deg, #1e2235, #141724);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, border-color 0.2s;
}
.avatar-container:hover .avatar-frame {
  transform: scale(1.03);
  border-color: #00f2fe;
}
.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar-fallback {
  font-size: 2.8rem;
  font-weight: 800;
  color: #00f2fe;
}
.avatar-status-badge {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #10b981;
  border: 3px solid #0d0f17;
  display: flex;
  align-items: center;
  justify-content: center;
}
.status-dot-pulse {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #fff;
}
.avatar-edit-trigger {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}
.avatar-edit-trigger:hover {
  background: #00f2fe;
  color: #000;
  transform: scale(1.1);
}
.hidden-file-input {
  display: none;
}

.user-meta-info {
  flex: 1;
  min-width: 280px;
}
.name-row {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 0.35rem;
}
.user-name {
  font-size: 1.7rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.02em;
}
.member-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 140, 0, 0.15));
  border: 1px solid rgba(255, 215, 0, 0.35);
  color: #ffd700;
  font-size: 0.75rem;
  font-weight: 700;
}
.tag-star {
  font-size: 0.8rem;
}
.user-handle {
  font-size: 0.92rem;
  color: #64748b;
  margin-bottom: 0.5rem;
}
.user-email-text {
  color: #94a3b8;
}
.user-bio-quote {
  font-size: 0.95rem;
  color: #cbd5e1;
  margin-bottom: 1.25rem;
  font-style: italic;
}

.profile-stats-bar {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}
.stat-pill {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.5rem 0.9rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
}
.stat-icon-circ {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.stat-cyan {
  background: rgba(0, 242, 254, 0.15);
  color: #00f2fe;
}
.stat-pink {
  background: rgba(255, 0, 127, 0.15);
  color: #ff007f;
}
.stat-violet {
  background: rgba(157, 78, 221, 0.15);
  color: #c77dff;
}
.stat-text-group {
  display: flex;
  flex-direction: column;
}
.stat-val {
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.1;
}
.stat-lbl {
  font-size: 0.72rem;
  color: #94a3b8;
  font-weight: 500;
}

.header-action-group {
  display: flex;
  gap: 0.75rem;
}
.upload-quick-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.3rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #00f2fe, #4facfe);
  color: #08090d;
  font-weight: 700;
  font-size: 0.88rem;
  border: none;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.upload-quick-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 242, 254, 0.3);
}
.player-quick-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.3rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  font-weight: 600;
  font-size: 0.88rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}
.player-quick-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
}

/* 2. Tabs Navigation */
.profile-tabs-nav {
  display: flex;
  gap: 0.75rem;
  background: rgba(14, 16, 24, 0.6);
  backdrop-filter: blur(16px);
  padding: 0.45rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  overflow-x: auto;
}
.tab-label-desktop {
  display: inline;
}
.tab-label-mobile {
  display: none;
}

.tab-item-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  background: transparent;
  color: #94a3b8;
  font-size: 0.92rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.tab-item-btn:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.04);
}
.tab-item-btn.active {
  background: linear-gradient(135deg, rgba(0, 242, 254, 0.15), rgba(157, 78, 221, 0.15));
  color: #00f2fe;
  border: 1px solid rgba(0, 242, 254, 0.25);
}
.tab-badge {
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  font-size: 0.75rem;
  font-weight: 700;
}
.tab-item-btn.active .tab-badge {
  background: rgba(0, 242, 254, 0.25);
  color: #fff;
}

/* 3. Tab Contents */
.tab-content-area {
  min-height: 380px;
}
.pane-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.pane-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #fff;
}
.pane-subtitle {
  font-size: 0.88rem;
  color: #94a3b8;
  margin-top: 0.2rem;
}
.pane-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1.1rem;
  border-radius: 10px;
  background: rgba(0, 242, 254, 0.12);
  color: #00f2fe;
  border: 1px solid rgba(0, 242, 254, 0.25);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.pane-action-btn:hover {
  background: #00f2fe;
  color: #000;
}

/* Empty States */
.empty-state-card {
  padding: 4rem 2rem;
  text-align: center;
  background: rgba(16, 18, 27, 0.5);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 20px;
}
.empty-icon-wrap {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  background: rgba(0, 242, 254, 0.1);
  color: #00f2fe;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem;
}
.empty-pink {
  background: rgba(255, 0, 127, 0.1);
  color: #ff007f;
}
.empty-state-card h4 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.5rem;
}
.empty-state-card p {
  font-size: 0.92rem;
  color: #94a3b8;
  margin-bottom: 1.5rem;
}
.empty-action-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #00f2fe, #4facfe);
  color: #08090d;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.empty-action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 242, 254, 0.3);
}

.loading-state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 4rem;
  color: #94a3b8;
}
.profile-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #00f2fe;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Songs Grid */
.songs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}
.song-card {
  background: rgba(18, 20, 31, 0.65);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
}
.song-card:hover {
  transform: translateY(-3px);
  border-color: rgba(0, 242, 254, 0.3);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
}

.card-cover-box {
  position: relative;
  width: 58px;
  height: 58px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  cursor: pointer;
  background: #141724;
}
.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.cover-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}
.cover-play-hover {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
}
.card-cover-box:hover .cover-play-hover {
  opacity: 1;
}
.play-bubble {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #00f2fe;
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-info {
  flex: 1;
  min-width: 0;
}
.song-title-text {
  font-size: 0.95rem;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.2rem;
}
.song-artist-text {
  font-size: 0.8rem;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.35rem;
}
.song-tags-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.tag-pill-badge {
  font-size: 0.68rem;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
  font-weight: 600;
}
.tag-ai {
  background: rgba(0, 242, 254, 0.12);
  color: #00f2fe;
}
.tag-fav {
  background: rgba(255, 0, 127, 0.12);
  color: #ff007f;
}
.song-date-text {
  font-size: 0.72rem;
  color: #64748b;
}

.card-actions {
  display: flex;
  gap: 0.35rem;
}
.action-icon-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}
.action-icon-btn.play-btn:hover {
  background: #00f2fe;
  color: #000;
  border-color: #00f2fe;
}
.action-icon-btn.delete-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.4);
}
.action-icon-btn.fav-active-btn {
  background: rgba(255, 0, 127, 0.1);
  border-color: rgba(255, 0, 127, 0.2);
}
.action-icon-btn.fav-active-btn:hover {
  background: rgba(255, 0, 127, 0.25);
}

/* SETTINGS TAB */
.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}
@media (max-width: 900px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
}

.settings-card {
  background: rgba(18, 20, 31, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 1.75rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
}
.card-header-line {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.card-header-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.card-header-icon.cyan {
  background: rgba(0, 242, 254, 0.15);
  color: #00f2fe;
}
.card-header-icon.violet {
  background: rgba(157, 78, 221, 0.15);
  color: #c77dff;
}
.card-box-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #fff;
}
.card-box-subtitle {
  font-size: 0.82rem;
  color: #94a3b8;
}

/* Custom Avatar Uploader Card */
.avatar-upload-zone-wrapper {
  margin-bottom: 1.5rem;
}
.avatar-uploader-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1rem 1.25rem;
  border-radius: 16px;
  background: rgba(8, 10, 16, 0.6);
  border: 1.5px dashed rgba(255, 255, 255, 0.14);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.avatar-uploader-card:hover, .avatar-uploader-card.is-dragging {
  border-color: #00f2fe;
  background: rgba(0, 242, 254, 0.05);
  box-shadow: 0 0 20px rgba(0, 242, 254, 0.15);
}
.avatar-uploader-card.has-file {
  border-style: solid;
  border-color: rgba(0, 242, 254, 0.4);
}

.avatar-preview-box {
  position: relative;
  width: 68px;
  height: 68px;
  border-radius: 18px;
  overflow: hidden;
  flex-shrink: 0;
  background: #141724;
  border: 2px solid rgba(255, 255, 255, 0.15);
}
.avatar-uploader-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar-upload-hover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  color: #00f2fe;
  font-size: 0.68rem;
  font-weight: 700;
  gap: 0.2rem;
  transition: opacity 0.2s;
}
.avatar-uploader-card:hover .avatar-upload-hover-overlay {
  opacity: 1;
}

.uploader-details {
  flex: 1;
  min-width: 0;
}
.uploader-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.uploader-subtitle {
  font-size: 0.78rem;
  color: #94a3b8;
  margin: 0 0 0.65rem 0;
  line-height: 1.4;
}
.uploader-actions-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.btn-browse-file {
  padding: 0.4rem 0.85rem;
  border-radius: 8px;
  background: rgba(0, 242, 254, 0.12);
  color: #00f2fe;
  border: 1px solid rgba(0, 242, 254, 0.25);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-browse-file:hover {
  background: #00f2fe;
  color: #08090d;
}
.btn-reset-avatar {
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.12);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.25);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-reset-avatar:hover {
  background: #ef4444;
  color: #ffffff;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.form-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #cbd5e1;
}
.form-input-text, .form-textarea {
  background: rgba(8, 10, 16, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 0.75rem 1rem;
  color: #fff;
  font-size: 0.92rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.form-input-text:focus, .form-textarea:focus {
  outline: none;
  border-color: #00f2fe;
  box-shadow: 0 0 0 3px rgba(0, 242, 254, 0.15);
}
.form-textarea {
  resize: vertical;
}
.char-count {
  font-size: 0.72rem;
  color: #64748b;
  text-align: right;
}

.submit-save-btn {
  margin-top: 0.5rem;
  padding: 0.85rem 1.5rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #00f2fe, #4facfe);
  color: #08090d;
  font-weight: 700;
  font-size: 0.92rem;
  border: none;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
.submit-save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 22px rgba(0, 242, 254, 0.3);
}
.submit-save-btn.sec-violet {
  background: linear-gradient(135deg, #9d4edd, #7b2cbf);
  color: #fff;
}
.submit-save-btn.sec-violet:hover {
  box-shadow: 0 8px 22px rgba(157, 78, 221, 0.35);
}
.submit-save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.experience-sub-box {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}
.sub-box-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 1rem;
}
.pref-toggle-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.65rem 0;
}
.pref-label {
  display: block;
  font-size: 0.88rem;
  font-weight: 600;
  color: #e2e8f0;
}
.pref-desc {
  display: block;
  font-size: 0.76rem;
  color: #64748b;
}
.pref-switch {
  width: 20px;
  height: 20px;
  accent-color: #00f2fe;
  cursor: pointer;
}

/* Delete Modal Pop */
.delete-confirm-overlay {
  position: fixed;
  inset: 0;
  z-index: 300;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}
.delete-confirm-card {
  background: #141724;
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 20px;
  padding: 2rem;
  max-width: 440px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
}
.delete-icon-glow {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem;
}
.delete-modal-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.65rem;
}
.delete-modal-desc {
  font-size: 0.92rem;
  color: #94a3b8;
  line-height: 1.5;
  margin-bottom: 1.75rem;
}
.delete-modal-actions {
  display: flex;
  gap: 0.75rem;
}
.btn-cancel {
  flex: 1;
  padding: 0.75rem;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  color: #cbd5e1;
  font-weight: 600;
  border: none;
  cursor: pointer;
}
.btn-delete-confirm {
  flex: 1;
  padding: 0.75rem;
  border-radius: 10px;
  background: #ef4444;
  color: #fff;
  font-weight: 700;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.spinner-sm {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.modal-pop-enter-active, .modal-pop-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-pop-enter-from, .modal-pop-leave-to {
  opacity: 0;
  transform: scale(0.92);
}

/* ==========================================================================
   CUSTOM PLAYLISTS STYLES
   ========================================================================== */
.create-pl-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px dashed rgba(0, 242, 254, 0.35);
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.5rem;
}

.create-pl-head {
  font-size: 0.95rem;
  font-weight: 800;
  color: #00f2fe;
  margin: 0 0 0.85rem 0;
}

.create-pl-row {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.create-pl-input {
  background: rgba(10, 12, 20, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  color: #ffffff;
  padding: 0.65rem 0.95rem;
  font-size: 0.88rem;
  outline: none;
}

.create-pl-input:focus {
  border-color: #00f2fe;
}

.create-pl-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  margin-top: 0.35rem;
}

.btn-cancel-sm {
  padding: 0.45rem 0.9rem;
  border-radius: 8px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-submit-pl {
  padding: 0.45rem 1.2rem;
  border-radius: 8px;
  background: linear-gradient(135deg, #00f2fe, #4facfe);
  color: #08090d;
  font-size: 0.82rem;
  font-weight: 800;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 242, 254, 0.3);
}

.playlists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}

.profile-playlist-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.95rem;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.profile-playlist-card:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(0, 242, 254, 0.3);
  transform: translateY(-3px);
}

.pl-card-top {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
}

.pl-card-visual {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: rgba(0, 242, 254, 0.1);
  border: 1px solid rgba(0, 242, 254, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.pl-big-icon {
  font-size: 1.4rem;
}

.pl-badge-count {
  font-size: 0.65rem;
  font-weight: 800;
  color: #00f2fe;
}

.pl-card-details {
  flex: 1;
  min-width: 0;
}

.pl-title {
  font-size: 1rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 0.2rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pl-desc {
  font-size: 0.78rem;
  color: #94a3b8;
  margin: 0 0 0.3rem 0;
  line-height: 1.35;
}

.pl-date {
  font-size: 0.7rem;
  color: #64748b;
}

.pl-songs-preview {
  background: rgba(8, 10, 16, 0.5);
  border-radius: 10px;
  padding: 0.6rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.pl-mini-song-row {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.76rem;
  color: #cbd5e1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pl-mini-song-row .title {
  font-weight: 700;
  color: #ffffff;
}

.pl-mini-song-row .artist {
  color: #64748b;
}

.more-songs {
  font-size: 0.7rem;
  color: #00f2fe;
  font-style: italic;
  margin-top: 0.2rem;
}

.pl-card-bottom-actions {
  display: flex;
  gap: 0.6rem;
  align-items: center;
}

.pl-play-all-btn {
  flex: 1;
  padding: 0.55rem 0.85rem;
  border-radius: 10px;
  background: linear-gradient(135deg, #00f2fe, #3b82f6);
  color: #08090d;
  font-size: 0.8rem;
  font-weight: 800;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.pl-play-all-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(1.1);
}

.pl-play-all-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pl-delete-btn {
  padding: 0.55rem 0.75rem;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.pl-delete-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
}

/* ================= MOBILE RESPONSIVE FIXES ================= */
.profile-tabs-nav {
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
}
.profile-tabs-nav::-webkit-scrollbar {
  display: none;
}

@media (max-width: 768px) {
  .profile-page-container {
    padding: 0.5rem 0.5rem 6.5rem;
    width: 100%;
    max-width: 100vw;
    overflow-x: hidden;
    box-sizing: border-box;
  }
  .profile-main-wrapper {
    width: 100%;
    max-width: 100%;
    overflow-x: hidden;
    box-sizing: border-box;
    gap: 1.25rem;
  }
  .profile-header-card {
    width: 100%;
    max-width: 100%;
    overflow: hidden;
    box-sizing: border-box;
  }
  .profile-banner-bg {
    height: 90px;
  }
  .profile-header-content {
    padding: 0 0.75rem 1.25rem;
    margin-top: -45px;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.75rem;
    width: 100%;
    box-sizing: border-box;
  }
  .avatar-frame {
    width: 80px;
    height: 80px;
    border-radius: 16px;
  }
  .user-meta-info {
    min-width: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    text-align: center;
    box-sizing: border-box;
  }
  .name-row {
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
    width: 100%;
    justify-content: center;
  }
  .user-name {
    font-size: 1.25rem;
    word-break: break-word;
    text-align: center;
  }
  .member-tag {
    align-self: center;
  }
  .user-handle {
    font-size: 0.76rem;
    word-break: break-all;
    text-align: center;
    margin-bottom: 0.35rem;
  }
  .user-bio-quote {
    font-size: 0.82rem;
    margin-bottom: 0.75rem;
    text-align: center;
  }
  .profile-stats-bar {
    display: grid !important;
    grid-template-columns: repeat(3, 1fr) !important;
    gap: 0.35rem !important;
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
    margin: 0 !important;
  }
  .stat-pill {
    padding: 0.45rem 0.2rem !important;
    gap: 0.25rem !important;
    flex-direction: column !important;
    text-align: center !important;
    align-items: center !important;
    justify-content: center !important;
    border-radius: 10px !important;
    min-width: 0 !important;
    box-sizing: border-box !important;
  }
  .stat-icon-circ {
    width: 24px;
    height: 24px;
    border-radius: 6px;
  }
  .stat-icon-circ svg {
    width: 12px;
    height: 12px;
  }
  .stat-val {
    font-size: 0.78rem !important;
  }
  .stat-lbl {
    font-size: 0.58rem !important;
    white-space: nowrap !important;
  }
  .header-action-group {
    width: 100%;
    justify-content: center;
    gap: 0.5rem;
  }
  .upload-quick-btn,
  .player-quick-btn {
    flex: 1;
    padding: 0.6rem 0.75rem;
    font-size: 0.78rem;
    justify-content: center;
  }
  .tab-label-desktop {
    display: none !important;
  }
  .tab-label-mobile {
    display: inline !important;
  }
  .profile-tabs-nav {
    display: grid !important;
    grid-template-columns: repeat(4, 1fr) !important;
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
    padding: 0.25rem !important;
    gap: 0.25rem !important;
    overflow-x: hidden !important;
    border-radius: 12px;
  }
  .tab-item-btn {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    text-align: center !important;
    padding: 0.45rem 0.15rem !important;
    font-size: 0.7rem !important;
    gap: 0.2rem !important;
    border-radius: 9px !important;
    min-width: 0 !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }
  .tab-item-btn svg {
    width: 16px !important;
    height: 16px !important;
    flex-shrink: 0;
  }
  .tab-badge {
    font-size: 0.6rem !important;
    padding: 0.05rem 0.25rem !important;
    margin-top: 0.1rem;
  }
  .tab-content-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.35rem;
    width: 100%;
    box-sizing: border-box;
    text-align: left;
  }
  .tab-title {
    font-size: 1.15rem;
    word-break: break-word;
  }
  .tab-subtitle {
    font-size: 0.76rem;
    word-break: break-word;
  }
  .empty-state-box {
    padding: 2.2rem 1.2rem;
    width: 100%;
    box-sizing: border-box;
  }
  .empty-icon-circ {
    width: 54px;
    height: 54px;
  }
  .empty-title {
    font-size: 1.05rem;
  }
  .empty-desc {
    font-size: 0.82rem;
  }
}
</style>
