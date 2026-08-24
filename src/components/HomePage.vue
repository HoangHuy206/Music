<template>
  <div class="aura-home-container">
    <!-- ================= 1. HERO BANNER ================= -->
    <section class="hero-section">
      <div class="hero-backdrop">
        <div class="hero-glow-1"></div>
        <div class="hero-glow-2"></div>
      </div>

      <div class="hero-content">
        <div class="hero-badge">
          <span class="badge-dot"></span>
          <span>NỀN TẢNG ÂM NHẠC AI THẾ HỆ MỚI v2.5</span>
        </div>

        <h1 class="hero-title">
          Trải Nghiệm Âm Nhạc <br />
          <span class="gradient-text">Cá Nhân Hóa Đỉnh Cao</span>
        </h1>

        <p class="hero-subtitle">
          Hệ thống AI tự động phân tích gu nghe nhạc theo từng tài khoản, đề xuất các list nhạc chuẩn phong cách yêu thích cùng chất lượng âm thanh Studio Hi-Res.
        </p>

        <div class="hero-actions">
          <button class="btn-hero-primary" @click="scrollToSection('personalized-section')">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            <span>Khám Phá Dành Cho Bạn</span>
          </button>
          <button class="btn-hero-secondary" @click="$emit('navigate', 'upload')">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
            </svg>
            <span>Tải Nhạc Lên Studio</span>
          </button>
        </div>
      </div>
    </section>

    <!-- ================= 2. STARTER DISCOVERY SECTION FOR NEW USERS (0 LISTENS) ================= -->
    <section v-if="!hasListeningHistory" class="home-music-section starter-onboarding-section">
      <div class="section-header-row">
        <div class="section-title-wrap">
          <div class="section-tag-pill">
            <span class="tag-sparkle">🎧</span>
            <span>BẮT ĐẦU TRẢI NGHIỆM</span>
          </div>
          <h2 class="section-main-title">
            Khám Phá & Chọn Bản Nhạc Đầu Tiên
          </h2>
          <p class="section-sub-desc">
            
          </p>
        </div>

        <button
          v-if="starterTracks.length > 0"
          class="btn-play-all-mix"
          @click="handlePlayTrack(starterTracks[0], starterTracks)"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
          <span>Khám Phá Ngay ({{ starterTracks.length }})</span>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoadingRecs" class="music-loading-state">
        <div class="aura-spinner"></div>
        <span>Đang chuẩn bị kho nhạc khởi đầu cho bạn...</span>
      </div>

      <!-- Starter Tracks Grid -->
      <div v-else class="tracks-card-grid">
        <div
          v-for="(track, idx) in starterTracks"
          :key="track._id || idx"
          class="track-item-card"
          :class="{ 'card-active-playing': currentSongId === track._id }"
          @click="handlePlayTrack(track, starterTracks)"
        >
          <!-- Artwork Container -->
          <div class="track-artwork-box">
            <img
              v-if="track.coverImage"
              :src="formatMediaUrl(track.coverImage)"
              :alt="track.title"
              class="track-img"
              loading="lazy"
              @error="(e) => e.target.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80'"
            />
            <div v-else class="track-img-fallback">
              <span>{{ getGenreIcon(track.genre) }}</span>
            </div>

            <!-- Hover Play Button Overlay -->
            <div class="artwork-hover-overlay">
              <div class="round-play-btn" :class="{ 'is-playing-now': currentSongId === track._id && isPlaying }">
                <svg v-if="currentSongId === track._id && isPlaying" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>

            <!-- Active Equalizer Animation -->
            <div v-if="currentSongId === track._id && isPlaying" class="card-equalizer-bars">
              <span class="eq-bar bar-1"></span>
              <span class="eq-bar bar-2"></span>
              <span class="eq-bar bar-3"></span>
              <span class="eq-bar bar-4"></span>
            </div>
          </div>

          <!-- Track Info -->
          <div class="track-card-body">
            <h4 class="track-title-txt" :title="track.title">{{ track.title }}</h4>
            <p class="track-artist-txt" :title="track.artist">{{ track.artist || 'Nghệ Sĩ' }}</p>

            <div class="track-card-footer">
              <span class="track-reason-tag">
                {{ track.genre || 'Âm Nhạc' }}
              </span>

              <!-- Action Buttons -->
              <div class="track-actions-row" @click.stop>
                <button
                  class="card-act-btn"
                  :class="{ 'btn-liked': isTrackFavorite(track) }"
                  :title="isTrackFavorite(track) ? 'Bỏ thích' : 'Yêu thích'"
                  @click="$emit('toggle-favorite', track)"
                >
                  <svg viewBox="0 0 24 24" width="15" height="15" :fill="isTrackFavorite(track) ? '#ef4444' : 'currentColor'">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </button>
                <button
                  class="card-act-btn"
                  title="Thêm vào playlist"
                  @click="$emit('add-to-playlist', track)"
                >
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                    <path d="M14 10H2v2h12v-2zm0-4H2v2h12V6zm4 8v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM2 16h8v-2H2v2z"/>
                  </svg>
                </button>
                <button
                  class="card-act-btn"
                  title="Chia sẻ"
                  @click="$emit('share-song', track)"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ================= 3. MUSIC CONTENT: SECTION 1 - DÀNH RIÊNG CHO BẠN (DAILY FLOW) ================= -->
    <section v-if="hasListeningHistory && displayForYouTracks.length > 0" id="personalized-section" class="home-music-section">
      <div class="section-header-row">
        <div class="section-title-wrap">
          <div class="section-tag-pill">
            <span class="tag-sparkle">✨</span>
            <span>AI DAILY FLOW</span>
          </div>
          <h2 class="section-main-title">
            Dành Riêng Cho {{ currentAccountName }}
          </h2>
          
        </div>

        <!-- Play All Mix Button -->
        <button
          v-if="displayForYouTracks.length > 0"
          class="btn-play-all-mix"
          @click="handlePlayAllForYou"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
          <span>Phát Tất Cả ({{ displayForYouTracks.length }})</span>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoadingRecs" class="music-loading-state">
        <div class="aura-spinner"></div>
        <span>Đang tính toán và tải danh sách đề xuất cá nhân...</span>
      </div>

      <!-- For You Tracks Grid -->
      <div v-else-if="displayForYouTracks.length > 0" class="tracks-card-grid">
        <div
          v-for="(track, idx) in displayForYouTracks"
          :key="track._id || idx"
          class="track-item-card"
          :class="{ 'card-active-playing': currentSongId === track._id }"
          @click="handlePlayForYouTrack(track)"
        >
          <!-- Artwork Container -->
          <div class="track-artwork-box">
            <img
              v-if="track.coverImage"
              :src="formatMediaUrl(track.coverImage)"
              :alt="track.title"
              class="track-img"
              loading="lazy"
              @error="(e) => e.target.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80'"
            />
            <div v-else class="track-img-fallback">
              <span>{{ getGenreIcon(track.genre) }}</span>
            </div>

            <!-- Hover Play Button Overlay -->
            <div class="artwork-hover-overlay">
              <div class="round-play-btn" :class="{ 'is-playing-now': currentSongId === track._id && isPlaying }">
                <svg v-if="currentSongId === track._id && isPlaying" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>

            <!-- Active Equalizer Animation -->
            <div v-if="currentSongId === track._id && isPlaying" class="card-equalizer-bars">
              <span class="eq-bar bar-1"></span>
              <span class="eq-bar bar-2"></span>
              <span class="eq-bar bar-3"></span>
              <span class="eq-bar bar-4"></span>
            </div>
          </div>

          <!-- Track Info -->
          <div class="track-card-body">
            <h4 class="track-title-txt" :title="track.title">{{ track.title }}</h4>
            <p class="track-artist-txt" :title="track.artist">{{ track.artist || 'Nghệ Sĩ' }}</p>

            <div class="track-card-footer">
              <span class="track-reason-tag">
                {{ track.matchReason || (track.isRemix ? '⚡ Remix sôi động' : '💖 Bản Gốc được yêu thích') }}
              </span>

              <!-- Action Buttons -->
              <div class="track-actions-row" @click.stop>
                <button
                  class="card-act-btn"
                  :class="{ 'btn-liked': isTrackFavorite(track) }"
                  :title="isTrackFavorite(track) ? 'Bỏ thích' : 'Yêu thích'"
                  @click="$emit('toggle-favorite', track)"
                >
                  <svg viewBox="0 0 24 24" width="15" height="15" :fill="isTrackFavorite(track) ? '#ef4444' : 'currentColor'">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </button>
                <button
                  class="card-act-btn"
                  title="Thêm vào playlist"
                  @click="$emit('add-to-playlist', track)"
                >
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                    <path d="M14 10H2v2h12v-2zm0-4H2v2h12V6zm4 8v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM2 16h8v-2H2v2z"/>
                  </svg>
                </button>
                <button
                  class="card-act-btn"
                  title="Chia sẻ"
                  @click="$emit('share-song', track)"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ================= 4. MUSIC CONTENT: SECTION 2 - CÁC LIST NHẠC PHONG CÁCH BẠN HAY NGHE ================= -->
    <section v-if="hasListeningHistory && displayGenrePlaylists.length > 0" class="home-music-section">
      <div class="section-header-row">
        <div class="section-title-wrap">
          <div class="section-tag-pill tag-purple">
            <span class="tag-sparkle">🎧</span>
            <span>GENRE COLLECTIONS</span>
          </div>
          <h2 class="section-main-title">
            Các List Nhạc Phong Cách Bạn Hay Nghe
          </h2>
          <p class="section-sub-desc">
            Tự động phân nhóm thành các playlist theo phong cách nghe của tài khoản, sắp xếp theo thể loại bạn yêu thích nhất.
          </p>
        </div>
      </div>

      <!-- Genre Playlists Cards Grid -->
      <div class="genre-cards-grid">
        <div
          v-for="playlist in displayGenrePlaylists"
          :key="playlist.id"
          class="genre-playlist-card"
        >
          <div class="gp-card-header">
            <div class="gp-icon-circle">{{ playlist.icon }}</div>
            <div class="gp-badge">{{ playlist.genreMatch }}</div>
          </div>

          <div class="gp-card-body">
            <h3 class="gp-title">{{ playlist.title }}</h3>
            <p class="gp-desc">{{ playlist.description }}</p>

            <div class="gp-meta-row">
              <span class="gp-track-count">🎵 {{ playlist.songs?.length || 0 }} bài hát</span>
              <span v-if="playlist.userAffinityScore > 0" class="gp-affinity-badge">
                🔥 Gu hay nghe
              </span>
            </div>

            <!-- Preview Song Rows -->
            <div class="gp-mini-tracks-list">
              <div
                v-for="(song, sIdx) in (playlist.songs || []).slice(0, 3)"
                :key="song._id || sIdx"
                class="gp-mini-song-row"
                @click="handlePlayTrack(song, playlist.songs)"
              >
                <span class="gp-song-num">{{ sIdx + 1 }}</span>
                <span class="gp-song-title">{{ song.title }}</span>
                <span class="gp-song-artist">{{ song.artist }}</span>
              </div>
            </div>

            <!-- Play Full Genre Playlist Button -->
            <button
              class="btn-play-genre-playlist"
              @click="handlePlayGenrePlaylist(playlist)"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>Phát Toàn Bộ List Này</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ================= 5. MUSIC CONTENT: SECTION 3 - NGHE LẠI (BÀI HÁT HAY NGHE NHẤT) ================= -->
    <section v-if="hasListeningHistory && displayFrequentlyPlayed.length > 0" class="home-music-section">
      <div class="section-header-row">
        <div class="section-title-wrap">
          <div class="section-tag-pill tag-cyan">
            <span class="tag-sparkle">🔥</span>
            <span>TOP REPLAY</span>
          </div>
          <h2 class="section-main-title">
            Nghe Lại • Bài Hát Bạn Hay Nghe Nhất
          </h2>
          <p class="section-sub-desc">
            Những bài hát được bạn bật lại nhiều lần nhất trên tài khoản này.
          </p>
        </div>
      </div>

      <div class="frequent-songs-grid">
        <div
          v-for="(track, fIdx) in displayFrequentlyPlayed"
          :key="track._id || fIdx"
          class="frequent-song-item"
          :class="{ 'is-active-frequent': currentSongId === track._id }"
          @click="handlePlayTrack(track, displayFrequentlyPlayed)"
        >
          <div class="frequent-thumb-box">
            <img
              v-if="track.coverImage"
              :src="formatMediaUrl(track.coverImage)"
              :alt="track.title"
              class="frequent-thumb-img"
              @error="(e) => e.target.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80'"
            />
            <div v-else class="frequent-thumb-fallback">🎵</div>

            <div class="frequent-play-btn">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>

          <div class="frequent-meta-box">
            <h4 class="frequent-title" :title="track.title">{{ track.title }}</h4>
            <p class="frequent-artist">{{ track.artist || 'Nghệ Sĩ' }}</p>
          </div>

          <div class="frequent-count-badge">
            <span>🔥 {{ track.playCount || 1 }} lượt</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ================= 5. MUSIC CONTENT: SECTION 4 - DANH SÁCH PHÁT CỦA BẠN ================= -->
    <section v-if="currentUser && recommendationData.customPlaylists?.length" class="home-music-section">
      <div class="section-header-row">
        <div class="section-title-wrap">
          <div class="section-tag-pill tag-indigo">
            <span class="tag-sparkle">📁</span>
            <span>LIBRARY PLAYLISTS</span>
          </div>
          <h2 class="section-main-title">Danh Sách Phát Của Bạn</h2>
          <p class="section-sub-desc">Các playlist do tài khoản của bạn tự tạo trong Thư viện.</p>
        </div>
        <button class="btn-text-action" @click="$emit('navigate', 'profile')">
          Xem Tất Cả Playlist →
        </button>
      </div>

      <div class="custom-playlists-shelf">
        <div
          v-for="pl in recommendationData.customPlaylists"
          :key="pl._id"
          class="custom-playlist-card"
          @click="handlePlayCustomPlaylist(pl)"
        >
          <div class="custom-pl-cover">
            <span class="custom-pl-icon">🎵</span>
            <div class="custom-pl-play-hover">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
          <div class="custom-pl-info">
            <h4 class="custom-pl-name">{{ pl.name }}</h4>
            <p class="custom-pl-count">{{ pl.songs?.length || 0 }} bài hát</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ================= 6. CORE PLATFORM FEATURES ================= -->
    <section class="platform-features-section">
      <div class="features-header-center">
        <h2 class="features-title">Tính Năng Công Nghệ Âm Nhạc Hàng Đầu</h2>
        <p class="features-subtitle">Trải nghiệm toàn diện cùng bộ công cụ xử lý âm thanh AI chuyên nghiệp</p>
      </div>

      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon-box bg-purple">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>
          <h3 class="feature-name">Tách Lời Nhạc Bằng AI</h3>
          <p class="feature-desc">Tách Vocal và Instrumental chỉ bằng một cú nhấp chuột với độ sạch tối đa cho Karaoke và Remix.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon-box bg-cyan">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
            </svg>
          </div>
          <h3 class="feature-name">Âm Thanh Lossless Hi-Res</h3>
          <p class="feature-desc">Trình phát nhạc tích hợp bộ giải mã chuẩn Studio 24-bit/96kHz mang lại chất âm sống động.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon-box bg-pink">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
              <path d="M4 9h2v11H4zm4-5h2v16H8zm4 3h2v13h-2zm4 4h2v9h-2zm4-2h2v11h-2z"/>
            </svg>
          </div>
          <h3 class="feature-name">Visualizer Sóng Nhạc 60FPS</h3>
          <p class="feature-desc">Hơn 5 chế độ hiệu ứng thị giác dạng sóng, tròn, hạt và dải phổ phản hồi chân thực theo từng nhịp bass.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon-box bg-amber">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
          </div>
          <h3 class="feature-name">Lời Bài Hát Đồng Bộ Realtime</h3>
          <p class="feature-desc">Hiển thị lời bài hát định dạng LRC cuộn mượt mà từng từ theo nhịp hát của ca sĩ.</p>
        </div>
      </div>
    </section>

    <!-- ================= 7. SUPPORT & FEEDBACK SECTION ================= -->
    <section class="support-center-section" id="support-section">
      <div class="support-section-header">
        <div class="section-tag-pill tag-emerald">
          <span class="tag-sparkle">💬</span>
          <span>TRỢ GIÚP & HỖ TRỢ TRỰC TUYẾN</span>
        </div>
        <h2 class="section-main-title">Bạn Cần Hỗ Trợ Hay Có Ý Kiến Đóng Góp?</h2>
        <p class="section-sub-desc">
          Đội ngũ phát triển AuraMusic luôn sẵn sàng hỗ trợ 24/7, lắng nghe báo lỗi bài hát, đề xuất bài hát mới và các ý kiến cải tiến từ bạn.
        </p>
      </div>

      <div class="support-bento-grid">
        <!-- Left: Quick Info & Contact Cards -->
        <!-- Left: Quick Info & Contact Cards -->
        <div class="support-info-cards">
          <div class="support-quick-card">
            <div class="quick-card-icon bg-cyan-glow">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                <path d="M8 10h.01"></path>
                <path d="M12 10h.01"></path>
                <path d="M16 10h.01"></path>
              </svg>
            </div>
            <div class="quick-card-text">
              <h4>Đội Ngũ Kỹ Thuật Trực Tiếp</h4>
              <p>Tiếp nhận & xử lý 24/7</p>
              <span class="quick-card-sub">Phản hồi giải đáp qua email dưới 24h</span>
            </div>
          </div>

          <div class="support-quick-card">
            <div class="quick-card-icon bg-purple-glow">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 18V5l12-2v13"></path>
                <circle cx="6" cy="18" r="3"></circle>
                <circle cx="18" cy="16" r="3"></circle>
              </svg>
            </div>
            <div class="quick-card-text">
              <h4>Báo Lỗi Phát Nhạc & Lời Bài Hát</h4>
              <p>Đồng bộ beat, cập nhật lời chuẩn</p>
              <span class="quick-card-sub">AI Whisper & Đội ngũ kỹ thuật xử lý</span>
            </div>
          </div>

          <div class="support-quick-card">
            <div class="quick-card-icon bg-pink-glow">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <div class="quick-card-text">
              <h4>Đề Xuất Thêm Bài Hát Mới</h4>
              <p>Yêu cầu bản nhạc yêu thích</p>
              <span class="quick-card-sub">Hỗ trợ link SoundCloud / MP3 Studio</span>
            </div>
          </div>
        </div>

        <!-- Right: Interactive Support Form -->
        <div class="support-form-card">
          <!-- Guest Warning Banner if not logged in -->
          <div v-if="!currentUser" class="guest-support-alert" @click="$emit('open-auth', 'login')">
            <div class="guest-alert-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
            </div>
            <div class="guest-alert-text">
              <span>Bạn chưa đăng nhập. <strong>Đăng nhập ngay</strong> </span>
            </div>
          </div>

          <!-- User Verified Chip if logged in -->
          <div v-else class="user-support-verified-bar">
            <span class="user-verified-badge">
              <span class="verified-dot"></span>
              Đã xác thực: <strong>{{ currentUser.displayName || currentUser.username }}</strong> ({{ currentUser.email }})
            </span>
          </div>

          <form class="support-form" @submit.prevent="handleSupportSubmit">
            <div class="form-row-dual">
              <div class="form-group">
                <label class="form-input-label">Họ và Tên <span class="req">*</span></label>
                <div class="input-with-icon-wrap">
                  <span class="input-icon-prefix">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </span>
                  <input
                    v-model="supportForm.name"
                    type="text"
                    class="form-input-field has-prefix"
                    placeholder="Ví dụ: Huy Hoàng"
                    required
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="form-input-label">Email Liên Hệ <span class="req">*</span></label>
                <div class="input-with-icon-wrap">
                  <span class="input-icon-prefix">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                  </span>
                  <input
                    v-model="supportForm.email"
                    type="email"
                    class="form-input-field has-prefix"
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-input-label">Chủ Đề Yêu Cầu</label>
              <div class="input-with-icon-wrap">
                <span class="input-icon-prefix">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/>
                  </svg>
                </span>
                <select v-model="supportForm.topic" class="form-input-field has-prefix form-select-field">
                  <option value="Báo lỗi phát nhạc / Sai lời / Lỗi beat">🎵 Báo lỗi phát nhạc / Sai lời / Lỗi beat</option>
                  <option value="Đề xuất thêm bài hát mới">✨ Đề xuất thêm bài hát mới vào hệ thống</option>
                  <option value="Góp ý tính năng & giao diện">💡 Góp ý cải tiến tính năng & giao diện</option>
                  <option value="Hỗ trợ tài khoản & danh sách phát">👤 Hỗ trợ tài khoản & danh sách phát</option>
                  <option value="Khác">💬 Khác</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-input-label">Nội Dung Chi Tiết <span class="req">*</span></label>
              <textarea
                v-model="supportForm.message"
                class="form-textarea-field"
                rows="4"
                placeholder="Mô tả cụ thể vấn đề hoặc ý kiến đóng góp của bạn tại đây..."
                required
              ></textarea>
            </div>

            <button type="submit" class="btn-submit-support" :disabled="isSubmittingSupport">
              <span v-if="isSubmittingSupport" class="btn-spinner"></span>
              <span v-else class="btn-submit-content">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
                <span>Gửi Tin Nhắn Hỗ Trợ ✨</span>
              </span>
            </button>
          </form>
        </div>
      </div>
    </section>

    <!-- ================= 8. ENHANCED FOOTER ================= -->
    <footer class="aura-home-footer">
      <div class="footer-inner">
        <div class="footer-brand-side">
          <div class="footer-logo">
            <span class="logo-icon">✨</span>
            <span class="logo-text">AuraMusic</span>
            <span class="footer-version-tag">v2.5 Pro</span>
          </div>
          <p class="footer-motto">
            Nền tảng nghe nhạc trực tuyến thế hệ mới, tích hợp AI đề xuất cá nhân hóa, tách lời karaoke và giải mã âm thanh Hi-Res Studio 24-bit/96kHz.
          </p>
          <div class="footer-social-chips">
            <span class="system-status-indicator">
              <span class="status-live-dot"></span>
              <span>Hệ thống AI hoạt động 100%</span>
            </span>
          </div>
        </div>

        <div class="footer-links-grid">
          <div class="footer-col">
            <h4 class="col-title">Khám Phá Âm Nhạc</h4>
            <a href="#" @click.prevent="scrollToSection('personalized-section')">Đề Xuất Dành Riêng Cho Bạn</a>
            <a href="#" @click.prevent="scrollToSection('genres-section')">List Nhạc Theo Phong Cách</a>
            <a href="#" @click.prevent="scrollToSection('recent-section')">Những Bản Nhạc Hay Nghe</a>
            <a href="#" @click.prevent="scrollToSection('starter-discovery-section')">Khám Phá Bài Hát Mới</a>
          </div>

          <div class="footer-col">
            <h4 class="col-title">Công Nghệ & Tính Năng</h4>
            <a href="#" @click.prevent="$emit('navigate', 'upload')">AI Tách Lời & Vocal Studio</a>
            <a href="#" @click.prevent="$emit('navigate', 'player')">Visualizer Sóng Nhạc 60FPS</a>
            <a href="#" @click.prevent="$emit('navigate', 'player')">Bộ Chỉnh Âm Equalizer & 8D</a>
            <a href="#" @click.prevent="$emit('navigate', 'player')">Lời Nhạc Chạy Realtime LRC</a>
          </div>

          <div class="footer-col">
            <h4 class="col-title">Trợ Giúp & Tài Khoản</h4>
            <a href="#support-section">Trung Tâm Hỗ Trợ & Góp Ý</a>
            <a href="#" @click.prevent="$emit('navigate', 'profile')">Trang Cá Nhân & Thư Viện</a>
            <a href="#" @click.prevent="$emit('open-auth', 'login')">Đăng Nhập Tài Khoản</a>
            <a href="#" @click.prevent="$emit('open-auth', 'register')">Đăng Ký Thành Viên</a>
          </div>
        </div>
      </div>

      <div class="footer-bottom-bar">
        <div class="footer-bottom-content">
          <span>© 2026 AuraMusic. Nền Tảng Âm Nhạc Cá Nhân Hóa Đỉnh Cao • Powered by Web Audio API & Groq Whisper AI.</span>
          <div class="footer-tech-badges">
            <span class="tech-badge">Hi-Res 24-bit</span>
            <span class="tech-badge">60FPS Web Audio</span>
            <span class="tech-badge">MongoDB Cloud</span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { currentUser } from '../utils/auth.js';
import { fetchPersonalizedRecommendations } from '../utils/recommendation.js';
import { showToast } from '../utils/toast.js';
import { API_BASE_URL } from '../config/api.js';

const props = defineProps({
  favoriteSongIds: {
    type: Object,
    default: () => new Set(),
  },
  currentSongId: {
    type: String,
    default: '',
  },
  isPlaying: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  'navigate',
  'play-song',
  'toggle-favorite',
  'add-to-playlist',
  'share-song',
  'open-auth',
]);

// Support & Feedback Form State
const supportForm = ref({
  name: '',
  email: '',
  topic: 'Báo lỗi phát nhạc / Sai lời / Lỗi beat',
  message: '',
});
const isSubmittingSupport = ref(false);

watch(
  currentUser,
  (u) => {
    if (u) {
      supportForm.value.name = u.displayName || u.username || '';
      supportForm.value.email = u.email || '';
    } else {
      supportForm.value.name = '';
      supportForm.value.email = '';
    }
  },
  { immediate: true }
);

async function handleSupportSubmit() {
  if (!currentUser.value) {
    showToast('Vui lòng đăng nhập tài khoản để gửi yêu cầu hỗ trợ! 🔐', 'warning');
    emit('open-auth', 'login');
    return;
  }

  if (!supportForm.value.name?.trim() || !supportForm.value.email?.trim() || !supportForm.value.message?.trim()) {
    showToast('Vui lòng điền đầy đủ Họ tên, Email và Nội dung cần hỗ trợ!', 'warning');
    return;
  }

  isSubmittingSupport.value = true;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(`${API_BASE_URL}/api/support`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(supportForm.value),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await res.json();
    if (data.success) {
      showToast('Yêu cầu hỗ trợ đã được gửi thành công đến đội ngũ AuraMusic!', 'success');
      supportForm.value.message = '';
    } else {
      showToast(data.message || 'Không thể gửi phản hồi lúc này.', 'error');
    }
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      showToast('Hết thời gian chờ phản hồi từ máy chủ. Vui lòng thử lại sau!', 'error');
    } else {
      showToast('Lỗi kết nối khi gửi yêu cầu hỗ trợ.', 'error');
    }
  } finally {
    isSubmittingSupport.value = false;
  }
}

// Recommendation state
const isLoadingRecs = ref(true);

const recommendationData = ref({
  isPersonalized: false,
  username: 'Khách',
  totalListens: 0,
  tasteSummary: {
    dominantGenre: 'Nhạc Trẻ / Pop (Bản Gốc)',
    genreDistribution: [],
    topArtists: [],
  },
  forYouMix: [],
  genrePlaylists: [],
  frequentlyPlayed: [],
  recentlyPlayed: [],
  customPlaylists: [],
});

const currentAccountName = computed(() => {
  if (currentUser.value && currentUser.value.username) {
    return currentUser.value.displayName || currentUser.value.username;
  }
  return 'Bạn';
});

// Curated Popular Sample Tracks matching SoundCloud with authentic artworks and 100% unique audio files
const curatedDiscoverTracks = [
 
  {
    _id: 'sc_disc_2',
    title: 'Bước Qua Nhau (Acoustic Ballad)',
    artist: 'Vũ.',
    genre: 'Ballad / Pop (Bản Gốc)',
    coverImage: 'https://i1.sndcdn.com/artworks-RQLugOELnFx12PCA-Zo3yNA-t500x500.jpg',
    audioUrl: '/uploads/sc_buocquanhau.mp3',
    duration: 260,
    isRemix: false,
  },
  {
    _id: 'sc_disc_3',
    title: 'Cắt Đôi Nỗi Sầu (Bản Gốc)',
    artist: 'Tăng Duy Tân, Drum7',
    genre: 'Nhạc Trẻ / Pop (Bản Gốc)',
    coverImage: 'https://i1.sndcdn.com/artworks-ij1m8XDcUNhi-0-t500x500.jpg',
    audioUrl: '/uploads/sc_catdoinoisau.mp3',
    duration: 210,
    isRemix: false,
  },
  {
    _id: 'sc_disc_4',
    title: 'Dấu Mưa (Bản Gốc)',
    artist: 'Trung Quân Idol',
    genre: 'Ballad / Pop (Bản Gốc)',
    coverImage: 'https://i1.sndcdn.com/artworks-vNWza9QmhFSGLMLe-eLjhdA-t500x500.jpg',
    audioUrl: '/uploads/sc_daumua.mp3',
    duration: 270,
    isRemix: false,
  },
  {
    _id: 'sc_disc_5',
    title: 'Sau Lời Từ Khước (Mai OST)',
    artist: 'Phan Mạnh Quỳnh',
    genre: 'Ballad / Pop (Bản Gốc)',
    coverImage: 'https://i1.sndcdn.com/artworks-Ba2UL6kdDDeKJbDN-OtjU6Q-t500x500.jpg',
    audioUrl: '/uploads/sc_sauloitukhuoc.mp3',
    duration: 240,
    isRemix: false,
  },
  {
    _id: 'sc_disc_6',
    title: 'Chuyện Đôi Ta (Lofi Chill)',
    artist: 'Emcee L (Da LAB) ft. Muộii',
    genre: 'Chill / Lofi (Bản Gốc)',
    coverImage: 'https://i1.sndcdn.com/artworks-0ljHO6lNVPp3dJPy-CTOtGw-t500x500.jpg',
    audioUrl: '/uploads/sc_chuyendoita.mp3',
    duration: 215,
    isRemix: false,
  },
  {
    _id: 'sc_disc_7',
    title: 'Thủ Đô Cypher',
    artist: 'Quang Tùng, My Neighbor',
    genre: 'Rap / Hiphop (Bản Gốc)',
    coverImage: 'https://i1.sndcdn.com/artworks-boUbSWZLWhl68BIU-3IYi7w-t500x500.jpg',
    audioUrl: '/uploads/sc_thudocypher.mp3',
    duration: 210,
    isRemix: false,
  },
  {
    _id: 'sc_disc_8',
    title: '50 Năm Về Sau (Ctrl Remix)',
    artist: 'Hoàng tử quạ, Why, Anh Vũ',
    genre: 'Remix / Vinahouse',
    coverImage: 'https://i1.sndcdn.com/artworks-SrJByJnuAhSxp8EX-i1SFDw-t500x500.jpg',
    audioUrl: '/uploads/sc_50namvesau.mp3',
    duration: 240,
    isRemix: true,
  },
  {
    _id: 'sc_disc_9',
    title: 'sao thay doi mi em buon',
    artist: 'ngong, kezjuein, dgkhoi',
    genre: 'Chill / Lofi (Bản Gốc)',
    coverImage: 'https://i1.sndcdn.com/artworks-8JyIJUskqOMahV8I-cw4KUA-t500x500.jpg',
    audioUrl: '/uploads/sc_saothaydoimiembuon.mp3',
    duration: 215,
    isRemix: false,
  },
  {
    _id: 'sc_disc_10',
    title: '(1/3) HEN HO NHUNG KHONG YEU',
    artist: '*dvs, Lê An Thái, QThang',
    genre: 'Nhạc Trẻ / Pop (Bản Gốc)',
    coverImage: 'https://i1.sndcdn.com/artworks-kItbng1pUE9ZVYRk-LzXDNw-t500x500.jpg',
    audioUrl: '/uploads/audioFile-1787207474735-73897040.mp3',
    duration: 198,
    isRemix: false,
  },
  {
    _id: 'sc_disc_11',
    title: 'XAO XUYEN - HZ REMIX',
    artist: 'Đặng Hoàng Anh, ViTH',
    genre: 'Remix / Vinahouse',
    coverImage: 'https://i1.sndcdn.com/artworks-joVTDz7LFaBGZYIr-4M3gEg-t500x500.jpg',
    audioUrl: '/uploads/sc_xaoxuyen.mp3',
    duration: 228,
    isRemix: true,
  },
  {
    _id: 'sc_disc_12',
    title: 'Em Oi Len Pho (Lofi Vibe)',
    artist: 'minhnhat, lofi sound',
    genre: 'Chill / Lofi (Bản Gốc)',
    coverImage: 'https://i1.sndcdn.com/artworks-000627358417-38osje-t500x500.jpg',
    audioUrl: '/uploads/sc_emoilenpho.mp3',
    duration: 185,
    isRemix: false,
  },
  {
    _id: 'sc_disc_13',
    title: 'Em Chẳng Sao Mà Remix',
    artist: 'Duy Hiếu Official, Teejay x Duy Hiếu',
    genre: 'Remix / Vinahouse',
    coverImage: 'https://i1.sndcdn.com/artworks-npG6sKcoAb3s5ZaR-nl6S3g-t500x500.jpg',
    audioUrl: '/uploads/sc_emchangsao.mp3',
    duration: 250,
    isRemix: true,
  },
  {
    _id: 'sc_disc_14',
    title: 'Thương Thì Thôi MK Remix',
    artist: 'Vu Minh Phong, Mk prdc',
    genre: 'Remix / Vinahouse',
    coverImage: 'https://i1.sndcdn.com/artworks-7xm4yS43FW04mz1b-7vbMlA-t500x500.jpg',
    audioUrl: '/uploads/sc_thuongthithoi.mp3',
    duration: 250,
    isRemix: true,
  },
  {
    _id: 'sc_disc_15',
    title: 'Chân Tình Remix Lemon 2k',
    artist: 'Iris Music, Như Chưa Từng Có',
    genre: 'Remix / Vinahouse',
    coverImage: 'https://i1.sndcdn.com/artworks-JdzJQ3cyyUBLtgPo-7yt91g-t500x500.jpg',
    audioUrl: '/uploads/sc_chantinh.mp3',
    duration: 232,
    isRemix: true,
  },
  {
    _id: 'sc_disc_16',
    title: 'Có Khi Nào Rời Xa (Remix 2020)',
    artist: 'Mr. Sang, Dương Edward ft Vũ Kem',
    genre: 'Remix / Vinahouse',
    coverImage: 'https://i1.sndcdn.com/artworks-vZAz5qa2oWEHyUhf-is8ptQ-t500x500.jpg',
    audioUrl: '/uploads/sc_cokhinoroi.mp3',
    duration: 260,
    isRemix: true,
  },
  {
    _id: 'sc_disc_17',
    title: 'Chỉ Còn Những Mùa Nhớ (Tùng Nguyen Remix)',
    artist: 'neva, Neva Fix',
    genre: 'Remix / Vinahouse',
    coverImage: 'https://i1.sndcdn.com/artworks-000060098625-y7pb1s-t500x500.jpg',
    audioUrl: '/uploads/sc_chiconnhungmuanho.mp3',
    duration: 245,
    isRemix: true,
  },
  {
    _id: 'sc_disc_18',
    title: 'Kiểu Gì Chẳng Mất (Huy PT x NVT Remix)',
    artist: 'Firistist',
    genre: 'Remix / Vinahouse',
    coverImage: 'https://i1.sndcdn.com/artworks-yfSQe2QvNK1dlddk-M8ZebQ-t500x500.jpg',
    audioUrl: '/uploads/sc_kieugichangmat.mp3',
    duration: 235,
    isRemix: true,
  },
];

// Check if user has active listening history
const hasListeningHistory = computed(() => {
  if (!currentUser.value) return false;
  return !!(
    recommendationData.value &&
    (recommendationData.value.hasListeningHistory || (recommendationData.value.totalListens && recommendationData.value.totalListens > 0) || (recommendationData.value.forYouMix && recommendationData.value.forYouMix.length > 0))
  );
});

// Starter tracks for brand new accounts
const starterTracks = computed(() => {
  if (recommendationData.value.starterTracks && recommendationData.value.starterTracks.length > 0) {
    return recommendationData.value.starterTracks;
  }
  return curatedDiscoverTracks;
});

// Display list for "Dành Riêng Cho Bạn" (only when user has listened to at least 1 track)
const displayForYouTracks = computed(() => {
  if (!hasListeningHistory.value) return [];
  return recommendationData.value.forYouMix || [];
});

// Display list for Genre Playlists (Các list nhạc phong cách)
const displayGenrePlaylists = computed(() => {
  if (!hasListeningHistory.value) return [];
  return recommendationData.value.genrePlaylists || [];
});

// Display list for Frequently Played (Nghe lại)
const displayFrequentlyPlayed = computed(() => {
  if (!hasListeningHistory.value) return [];
  return recommendationData.value.frequentlyPlayed || [];
});

function getGenreIcon(genre) {
  if (!genre) return '🎵';
  if (genre.includes('Remix') || genre.includes('Vinahouse')) return '⚡';
  if (genre.includes('EDM') || genre.includes('Dance')) return '🔥';
  if (genre.includes('Ballad') || genre.includes('Pop')) return '💖';
  if (genre.includes('Chill') || genre.includes('Lofi')) return '☕';
  if (genre.includes('Rap') || genre.includes('Hiphop')) return '🎤';
  return '🎵';
}

function formatMediaUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

function isTrackFavorite(track) {
  if (!track || !track._id) return false;
  return props.favoriteSongIds ? props.favoriteSongIds.has(track._id) : false;
}

// Load Recommendations from Backend Engine
async function loadRecommendations() {
  isLoadingRecs.value = true;
  try {
    const data = await fetchPersonalizedRecommendations(API_BASE_URL);
    if (data) {
      recommendationData.value = data;
    }
  } catch (err) {
    console.warn('[Home Recommendations Fetch Notice]:', err);
  } finally {
    isLoadingRecs.value = false;
  }
}

// Play a single track
function handlePlayTrack(track, queue = null) {
  emit('play-song', track, queue);
}

// Play track from "Dành Riêng Cho..." section in dynamic SoundCloud radio flow
function handlePlayForYouTrack(track) {
  emit('play-song', track, displayForYouTracks.value, { isForYouRadio: true });
}

// Play all tracks from For You in dynamic SoundCloud radio flow
function handlePlayAllForYou() {
  if (displayForYouTracks.value.length > 0) {
    emit('play-song', displayForYouTracks.value[0], displayForYouTracks.value, { isForYouRadio: true });
  }
}

// Play full genre playlist
function handlePlayGenrePlaylist(playlist) {
  if (playlist.songs && playlist.songs.length > 0) {
    emit('play-song', playlist.songs[0], playlist.songs);
  }
}

// Play custom playlist
function handlePlayCustomPlaylist(pl) {
  if (!pl || !pl.songs || pl.songs.length === 0) return;
  emit('play-song', pl.songs[0], pl.songs);
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

function onPlayRecorded() {
  // Smoothly reload recommendations in background when a play event occurs
  fetchPersonalizedRecommendations(API_BASE_URL).then((data) => {
    if (data) {
      recommendationData.value = data;
    }
  });
}

function onWindowFocus() {
  fetchPersonalizedRecommendations(API_BASE_URL).then((data) => {
    if (data) {
      recommendationData.value = data;
    }
  });
}

watch(currentUser, () => {
  loadRecommendations();
});

onMounted(() => {
  loadRecommendations();
  if (typeof window !== 'undefined') {
    window.addEventListener('auramusic:play-recorded', onPlayRecorded);
    window.addEventListener('focus', onWindowFocus);
  }
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('auramusic:play-recorded', onPlayRecorded);
    window.removeEventListener('focus', onWindowFocus);
  }
});
</script>

<style scoped>
/* Main Container */
.aura-home-container {
  width: 100%;
  max-width: 1380px;
  margin: 0 auto;
  padding: 1.5rem 1.8rem 6rem;
  box-sizing: border-box;
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  display: flex;
  flex-direction: column;
  gap: 3.5rem;
}

/* ================= 1. HERO BANNER ================= */
.hero-section {
  position: relative;
  padding: 3.5rem 2.5rem;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(20, 20, 32, 0.95), rgba(10, 10, 18, 0.95));
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
}

.hero-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.hero-glow-1 {
  position: absolute;
  top: -20%;
  left: 10%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(0, 242, 254, 0.15), transparent 70%);
  filter: blur(50px);
}

.hero-glow-2 {
  position: absolute;
  bottom: -20%;
  right: 15%;
  width: 450px;
  height: 450px;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.18), transparent 70%);
  filter: blur(60px);
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.85rem;
  border-radius: 20px;
  background: rgba(0, 242, 254, 0.1);
  border: 1px solid rgba(0, 242, 254, 0.25);
  color: #00f2fe;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  width: fit-content;
}

.badge-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #00f2fe;
  box-shadow: 0 0 8px #00f2fe;
  animation: pulseDot 1.5s infinite;
}

@keyframes pulseDot {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.4); opacity: 0.6; }
}

.hero-title {
  font-size: 2.8rem;
  font-weight: 800;
  line-height: 1.2;
  margin: 0;
  letter-spacing: -0.02em;
}

.gradient-text {
  background: linear-gradient(135deg, #00f2fe 0%, #4facfe 50%, #a855f7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-subtitle {
  font-size: 1.05rem;
  color: #a0a0b0;
  line-height: 1.6;
  margin: 0;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.btn-hero-primary {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.85rem 1.6rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #00f2fe, #4facfe);
  border: none;
  color: #000;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(0, 242, 254, 0.35);
  transition: all 0.2s ease;
}

.btn-hero-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 242, 254, 0.5);
}

.btn-hero-secondary {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.85rem 1.5rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #fff;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-hero-secondary:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.3);
}

/* ================= 2. MUSIC SECTIONS ================= */
.home-music-section {
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
}

.section-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
}

.section-title-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.section-tag-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  background: rgba(0, 242, 254, 0.1);
  border: 1px solid rgba(0, 242, 254, 0.25);
  color: #00f2fe;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  width: fit-content;
}

.section-tag-pill.tag-purple {
  background: rgba(168, 85, 247, 0.1);
  border-color: rgba(168, 85, 247, 0.25);
  color: #a855f7;
}

.section-tag-pill.tag-cyan {
  background: rgba(6, 182, 212, 0.1);
  border-color: rgba(6, 182, 212, 0.25);
  color: #06b6d4;
}

.section-tag-pill.tag-indigo {
  background: rgba(99, 102, 241, 0.1);
  border-color: rgba(99, 102, 241, 0.25);
  color: #818cf8;
}

.section-main-title {
  font-size: 1.65rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
  letter-spacing: -0.01em;
}

.section-sub-desc {
  font-size: 0.9rem;
  color: #8e8ea0;
  margin: 0;
}

.header-actions-dual {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex-wrap: wrap;
}

.btn-shuffle-mix {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.65rem 1.1rem;
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #fff;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-shuffle-mix:hover {
  background: rgba(255, 255, 255, 0.16);
  border-color: rgba(0, 242, 254, 0.4);
  transform: translateY(-1px);
  color: #00f2fe;
}

.btn-play-all-mix {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  border-radius: 25px;
  background: linear-gradient(135deg, #00f2fe, #4facfe);
  border: none;
  color: #000;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 242, 254, 0.3);
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-play-all-mix:hover {
  transform: scale(1.04);
  box-shadow: 0 6px 20px rgba(0, 242, 254, 0.45);
}

.btn-text-action {
  background: none;
  border: none;
  color: #00f2fe;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  transition: color 0.15s ease;
}

.btn-text-action:hover {
  color: #ffffff;
  text-decoration: underline;
}

/* ================= TRACKS CARD GRID ================= */
.tracks-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.4rem;
}

.track-item-card {
  background: rgba(22, 22, 34, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 14px;
  padding: 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
}

.track-item-card:hover {
  transform: translateY(-4px);
  background: rgba(30, 30, 46, 0.95);
  border-color: rgba(0, 242, 254, 0.3);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
}

.track-item-card.card-active-playing {
  border-color: #00f2fe;
  background: rgba(0, 242, 254, 0.06);
  box-shadow: 0 0 20px rgba(0, 242, 254, 0.2);
}

.track-artwork-box {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 10px;
  overflow: hidden;
  background: #151520;
}

.track-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.track-item-card:hover .track-img {
  transform: scale(1.05);
}

.track-img-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  background: linear-gradient(135deg, #1e1e30, #111120);
}

.match-badge-chip {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 242, 254, 0.4);
  color: #00f2fe;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  z-index: 2;
}

.artwork-hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.track-item-card:hover .artwork-hover-overlay {
  opacity: 1;
}

.round-play-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #00f2fe;
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0, 242, 254, 0.6);
  transform: scale(0.85);
  transition: all 0.2s ease;
}

.track-item-card:hover .round-play-btn {
  transform: scale(1);
}

.round-play-btn.is-playing-now {
  background: #ef4444;
  color: #fff;
}

.card-equalizer-bars {
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 18px;
  padding: 4px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 4px;
}

.eq-bar {
  width: 3px;
  background: #00f2fe;
  border-radius: 1px;
  animation: eqJump 0.8s ease-in-out infinite alternate;
}

.bar-1 { height: 60%; animation-delay: 0.1s; }
.bar-2 { height: 100%; animation-delay: 0.3s; }
.bar-3 { height: 40%; animation-delay: 0.2s; }
.bar-4 { height: 80%; animation-delay: 0.4s; }

@keyframes eqJump {
  0% { height: 20%; }
  100% { height: 100%; }
}

.track-card-body {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.track-title-txt {
  font-size: 0.95rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-artist-txt {
  font-size: 0.82rem;
  color: #9999aa;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.4rem;
  padding-top: 0.4rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.track-reason-tag {
  font-size: 0.72rem;
  color: #00f2fe;
  background: rgba(0, 242, 254, 0.08);
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  max-width: 110px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-actions-row {
  display: flex;
  gap: 4px;
}

.card-act-btn {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #cccccc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.card-act-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  border-color: #00f2fe;
}

.card-act-btn.btn-liked {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.4);
}

/* ================= GENRE PLAYLISTS GRID ================= */
.genre-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.4rem;
}

.genre-playlist-card {
  background: linear-gradient(135deg, rgba(25, 25, 38, 0.9), rgba(16, 16, 26, 0.95));
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.4rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: all 0.25s ease;
}

.genre-playlist-card:hover {
  transform: translateY(-4px);
  border-color: rgba(168, 85, 247, 0.35);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
}

.gp-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.gp-icon-circle {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.gp-badge {
  font-size: 0.74rem;
  font-weight: 700;
  color: #a855f7;
  background: rgba(168, 85, 247, 0.12);
  border: 1px solid rgba(168, 85, 247, 0.25);
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
}

.gp-card-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.gp-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.gp-desc {
  font-size: 0.82rem;
  color: #9999aa;
  margin: 0;
  line-height: 1.4;
}

.gp-meta-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.78rem;
  color: #cccccc;
}

.gp-affinity-badge {
  color: #f59e0b;
  font-weight: 700;
  background: rgba(245, 158, 11, 0.12);
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
}

.gp-mini-tracks-list {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-top: 0.2rem;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 8px;
  padding: 0.4rem;
}

.gp-mini-song-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background 0.15s ease;
}

.gp-mini-song-row:hover {
  background: rgba(255, 255, 255, 0.08);
}

.gp-song-num {
  color: #666;
  font-size: 0.75rem;
  width: 14px;
}

.gp-song-title {
  color: #eee;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.gp-song-artist {
  color: #888;
  font-size: 0.75rem;
}

.btn-play-genre-playlist {
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.65rem 1rem;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #ffffff;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-play-genre-playlist:hover {
  background: linear-gradient(135deg, #a855f7, #6366f1);
  border-color: transparent;
}

/* ================= FREQUENTLY PLAYED (NGHE LẠI) ================= */
.frequent-songs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.frequent-song-item {
  background: rgba(20, 20, 32, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  padding: 0.6rem 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.frequent-song-item:hover {
  background: rgba(30, 30, 48, 0.95);
  border-color: rgba(0, 242, 254, 0.3);
  transform: translateX(4px);
}

.frequent-thumb-box {
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: #1a1a28;
}

.frequent-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.frequent-thumb-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.frequent-play-btn {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 242, 254, 0.85);
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.frequent-song-item:hover .frequent-play-btn {
  opacity: 1;
}

.frequent-meta-box {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.frequent-title {
  font-size: 0.88rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.frequent-artist {
  font-size: 0.76rem;
  color: #9999aa;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.frequent-count-badge {
  font-size: 0.72rem;
  color: #f59e0b;
  font-weight: 700;
  background: rgba(245, 158, 11, 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  flex-shrink: 0;
}

/* ================= CUSTOM PLAYLISTS SHELF ================= */
.custom-playlists-shelf {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.2rem;
}

.custom-playlist-card {
  background: rgba(20, 20, 32, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.custom-playlist-card:hover {
  transform: translateY(-3px);
  border-color: rgba(99, 102, 241, 0.4);
  background: rgba(30, 30, 48, 0.9);
}

.custom-pl-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 8px;
  background: linear-gradient(135deg, #312e81, #1e1b4b);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.custom-pl-icon {
  font-size: 2.5rem;
}

.custom-pl-play-hover {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(99, 102, 241, 0.8);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.custom-playlist-card:hover .custom-pl-play-hover {
  opacity: 1;
}

.custom-pl-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.custom-pl-count {
  font-size: 0.78rem;
  color: #888;
  margin: 0;
}

/* ================= 6. PLATFORM FEATURES ================= */
.platform-features-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding-top: 1rem;
}

.features-header-center {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.features-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
}

.features-subtitle {
  font-size: 0.95rem;
  color: #9999aa;
  margin: 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.4rem;
}

.feature-card {
  background: rgba(20, 20, 32, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 16px;
  padding: 1.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  transition: all 0.25s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  background: rgba(28, 28, 44, 0.9);
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

.feature-icon-box {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-purple { background: rgba(168, 85, 247, 0.15); color: #c084fc; }
.bg-cyan { background: rgba(6, 182, 212, 0.15); color: #22d3ee; }
.bg-pink { background: rgba(236, 72, 153, 0.15); color: #f472b6; }
.bg-amber { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }

.feature-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.feature-desc {
  font-size: 0.85rem;
  color: #9999aa;
  margin: 0;
  line-height: 1.5;
}

/* ================= 7. SUPPORT & FEEDBACK SECTION ================= */
.support-center-section {
  margin-top: 3.5rem;
  padding: 2.5rem;
  background: linear-gradient(135deg, rgba(18, 18, 30, 0.7) 0%, rgba(26, 26, 46, 0.5) 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
}

.support-section-header {
  margin-bottom: 2rem;
}

.support-bento-grid {
  display: grid;
  grid-template-columns: 1fr 1.35fr;
  gap: 2rem;
  align-items: stretch;
}

.support-info-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.support-quick-card {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: 1.2rem 1.4rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  transition: all 0.25s ease;
}

.support-quick-card:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(0, 242, 254, 0.3);
  transform: translateX(4px);
}

.quick-card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.bg-cyan-glow {
  background: rgba(0, 242, 254, 0.15);
  color: #00f2fe;
  box-shadow: 0 0 15px rgba(0, 242, 254, 0.2);
}

.bg-purple-glow {
  background: rgba(168, 85, 247, 0.15);
  color: #c084fc;
  box-shadow: 0 0 15px rgba(168, 85, 247, 0.2);
}

.bg-pink-glow {
  background: rgba(236, 72, 153, 0.15);
  color: #f472b6;
  box-shadow: 0 0 15px rgba(236, 72, 153, 0.2);
}

.quick-card-text h4 {
  font-size: 0.96rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 0.2rem 0;
}

.quick-card-text p {
  font-size: 0.88rem;
  color: #cbd5e1;
  margin: 0 0 0.2rem 0;
  font-weight: 500;
}

.quick-card-sub {
  font-size: 0.76rem;
  color: #64748b;
}

.support-form-card {
  background: rgba(15, 15, 25, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 1.8rem;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
}

.support-form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.form-row-dual {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

/* Guest Support Alert */
.guest-support-alert {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1.1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 12px;
  margin-bottom: 1.2rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.guest-support-alert:hover {
  background: rgba(239, 68, 68, 0.16);
  border-color: rgba(239, 68, 68, 0.4);
  transform: translateY(-1px);
}

.guest-alert-icon {
  color: #ef4444;
  display: flex;
  align-items: center;
}

.guest-alert-text {
  font-size: 0.84rem;
  color: #fca5a5;
  line-height: 1.45;
}

.guest-alert-text strong {
  color: #fff;
  text-decoration: underline;
}

/* User Support Verified Bar */
.user-support-verified-bar {
  margin-bottom: 1.2rem;
}

.user-verified-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.9rem;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.25);
  border-radius: 20px;
  font-size: 0.82rem;
  color: #34d399;
}

.verified-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
}

.input-with-icon-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon-prefix {
  position: absolute;
  left: 0.9rem;
  color: #64748b;
  display: flex;
  align-items: center;
  pointer-events: none;
  z-index: 2;
}

.form-input-field.has-prefix {
  padding-left: 2.5rem;
}

.form-input-label {
  font-size: 0.84rem;
  font-weight: 600;
  color: #94a3b8;
}

.form-input-label .req {
  color: #ef4444;
}

.form-input-field,
.form-textarea-field {
  width: 100%;
  padding: 0.8rem 1rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #fff;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s ease;
  font-family: inherit;
}

.form-select-field {
  cursor: pointer;
}

.form-select-field option {
  background: #181826;
  color: #fff;
}

.form-input-field:focus,
.form-textarea-field:focus {
  border-color: #00f2fe;
  background: rgba(255, 255, 255, 0.07);
  box-shadow: 0 0 15px rgba(0, 242, 254, 0.2);
}

.btn-submit-support {
  padding: 0.95rem 1.5rem;
  background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
  border: none;
  border-radius: 12px;
  color: #000;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0, 242, 254, 0.3);
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.5rem;
}

.btn-submit-content {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.btn-submit-support:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 28px rgba(0, 242, 254, 0.5);
}

.btn-submit-support:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(0, 0, 0, 0.2);
  border-top-color: #000;
  border-radius: 50%;
  animation: auraSpin 0.7s linear infinite;
}

/* ================= 8. ENHANCED FOOTER ================= */
.aura-home-footer {
  margin-top: 4rem;
  padding: 3rem 0 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.footer-inner {
  display: flex;
  justify-content: space-between;
  gap: 3.5rem;
}

.footer-brand-side {
  max-width: 360px;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.footer-version-tag {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  background: rgba(0, 242, 254, 0.15);
  border: 1px solid rgba(0, 242, 254, 0.3);
  color: #00f2fe;
  border-radius: 20px;
}

.footer-motto {
  font-size: 0.86rem;
  color: #888899;
  line-height: 1.6;
  margin: 0;
}

.footer-social-chips {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.3rem;
}

.system-status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.3rem 0.75rem;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.25);
  border-radius: 20px;
  font-size: 0.75rem;
  color: #34d399;
  font-weight: 600;
}

.status-live-dot {
  width: 7px;
  height: 7px;
  background: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 8px #10b981;
  animation: pulseDot 1.8s infinite;
}

@keyframes pulseDot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.8); }
}

.footer-links-grid {
  display: flex;
  gap: 3.5rem;
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.col-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 0.5rem 0;
  letter-spacing: 0.2px;
}

.footer-col a {
  color: #94a3b8;
  font-size: 0.85rem;
  text-decoration: none;
  transition: all 0.2s ease;
}

.footer-col a:hover {
  color: #00f2fe;
  transform: translateX(3px);
}

.footer-bottom-bar {
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.footer-bottom-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
  font-size: 0.8rem;
  color: #64748b;
}

.footer-tech-badges {
  display: flex;
  gap: 0.5rem;
}

.tech-badge {
  padding: 0.2rem 0.55rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  font-size: 0.72rem;
  color: #94a3b8;
}

/* Loading State */
.music-loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  padding: 3rem 0;
  color: #9999aa;
  font-size: 0.9rem;
}

.aura-spinner {
  width: 26px;
  height: 26px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top-color: #00f2fe;
  border-radius: 50%;
  animation: auraSpin 0.8s linear infinite;
}

@keyframes auraSpin {
  100% { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 900px) {
  .hero-title {
    font-size: 2.2rem;
  }
  .support-bento-grid {
    grid-template-columns: 1fr;
  }
  .footer-inner {
    flex-direction: column;
    gap: 2.5rem;
  }
  .footer-links-grid {
    flex-wrap: wrap;
    gap: 2.5rem;
  }
}

@media (max-width: 600px) {
  .aura-home-container {
    padding: 1rem 1rem 5rem;
  }
  .hero-section {
    padding: 2rem 1.4rem;
  }
  .hero-title {
    font-size: 1.8rem;
  }
  .hero-actions {
    flex-direction: column;
  }
  .tracks-card-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
  .form-row-dual {
    grid-template-columns: 1fr;
  }
  .support-center-section {
    padding: 1.5rem 1.2rem;
  }
}
</style>
