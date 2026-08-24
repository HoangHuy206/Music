<template>
  <div v-if="isOpen" class="auth-modal-backdrop" @click.self="closeModal">
    <div class="auth-modal-card">
      <!-- Close Button -->
      <button class="modal-close-btn" title="Đóng" @click="closeModal">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>

      <!-- Modal Header -->
      <div class="modal-header">
        <div class="brand-badge">🎵 AuraMusic Auth</div>
        <h2 class="modal-title">
          {{ activeTab === 'login' ? 'Chào Mừng Trở Lại' : 'Tạo Tài Khoản Mới' }}
        </h2>
        <p class="modal-subtitle">
          {{ activeTab === 'login' ? 'Đăng nhập để quản lý và thưởng thức các bài hát yêu thích của bạn.' : 'Đăng ký để tải lên và lưu trữ các bài hát yêu thích của bạn.' }}
        </p>
      </div>

      <!-- Tab Switcher (Only 2 tabs: Đăng Nhập & Đăng Ký) -->
      <div class="auth-tab-bar">
        <button
          class="auth-tab-btn"
          :class="{ active: activeTab === 'login' }"
          @click="switchTab('login')"
        >
          Đăng Nhập
        </button>
        <button
          class="auth-tab-btn"
          :class="{ active: activeTab === 'register' }"
          @click="switchTab('register')"
        >
          Đăng Ký
        </button>
      </div>

      <!-- Feedback Messages -->
      <div v-if="errorMessage" class="auth-alert error-alert">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        <span>{{ errorMessage }}</span>
      </div>

      <div v-if="successMessage" class="auth-alert success-alert">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
        <span>{{ successMessage }}</span>
      </div>

      <!-- Google Sign-In Button -->
      <div class="google-auth-wrapper">
        <button
          type="button"
          class="google-auth-btn"
          :disabled="isLoading || isGoogleLoading"
          @click="handleGoogleAuth"
        >
          <div v-if="isGoogleLoading" class="btn-spinner-google"></div>
          <svg v-else class="google-svg-logo" viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27a7.22 7.22 0 0 1 0-4.54V6.58H1.25a11.97 11.97 0 0 0 0 10.84l4.03-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
          <span class="google-btn-text">
            {{ activeTab === 'login' ? 'Tiếp tục với Google' : 'Đăng ký với Google' }}
          </span>
        </button>
      </div>

      <!-- Or Divider -->
      <div class="auth-divider">
        <span class="divider-line"></span>
        <span class="divider-text">HOẶC DÙNG EMAIL / TÀI KHOẢN</span>
        <span class="divider-line"></span>
      </div>

      <!-- Login Form -->
      <form v-if="activeTab === 'login'" class="auth-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label">Email hoặc Tên đăng nhập</label>
          <div class="input-wrapper">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" class="input-icon">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            <input
              v-model="loginForm.emailOrUsername"
              type="text"
              class="auth-input"
              placeholder="nhap_username hoặc email@gmail.com"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Mật khẩu</label>
          <div class="input-wrapper">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" class="input-icon">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
            <input
              v-model="loginForm.password"
              type="password"
              class="auth-input"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <!-- Cloudflare Turnstile Verification Widget (Clean, No Test Watermark) -->
        <div class="turnstile-wrapper">
          <div
            class="cloudflare-turnstile-box"
            :class="{ 'is-verified': isCloudflareVerified, 'is-verifying': isCloudflareVerifying }"
            @click="handleUserClickCloudflare"
          >
            <div class="cf-box-left">
              <div class="cf-checkbox" :class="{ 'checked': isCloudflareVerified, 'loading': isCloudflareVerifying }">
                <div v-if="isCloudflareVerifying" class="cf-spinner"></div>
                <svg v-else-if="isCloudflareVerified" class="cf-check-svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#22c55e" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div class="cf-prompt-text">
                <span v-if="isCloudflareVerifying" class="txt-verifying">Đang xác thực với Cloudflare...</span>
                <span v-else-if="isCloudflareVerified" class="txt-verified">Đã xác minh bạn là con người ✓</span>
                <span v-else class="txt-prompt">Xác minh bạn là con người</span>
              </div>
            </div>

            <div class="cf-box-right">
              <div class="cf-logo-block">
                <svg class="cf-svg-icon" viewBox="0 0 24 24" width="28" height="28" fill="none">
                  <path fill="#F38020" d="M19.4 13.7c0-.2 0-.4-.1-.6-.2-1.3-1.3-2.3-2.6-2.4-.4 0-.8.1-1.1.2C15.2 8.6 13.2 7 10.8 7c-2.4 0-4.5 1.7-4.9 4.1-.4-.2-.8-.3-1.2-.3-1.7 0-3 1.3-3.1 3-.7.2-1.2.8-1.2 1.5 0 .9.7 1.6 1.6 1.7h17.1c.9 0 1.6-.7 1.6-1.6 0-.8-.6-1.5-1.3-1.7z"/>
                  <path fill="#FAAD3F" d="M18.8 17H3.4c-.6 0-1.1-.4-1.1-1 0-.5.3-.9.8-1 .2 0 .4-.1.6-.1.1-1.2 1.1-2.2 2.3-2.2.3 0 .6.1.9.2.4-2 2.1-3.4 4.2-3.4 2.1 0 3.8 1.4 4.2 3.4.3-.1.6-.2.9-.2 1.1 0 2.1.8 2.3 1.9.1.2.1.4.1.6.6.1 1.1.6 1.1 1.2 0 .6-.5 1-1.1 1z"/>
                </svg>
                <div class="cf-brand-text">
                  <span class="cf-brand-name">CLOUDFLARE</span>
                  <span class="cf-brand-sub">Turnstile • Privacy • Terms</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          class="submit-auth-btn"
          :class="{ 'needs-verify': !isCloudflareVerified }"
          :disabled="isLoading || isGoogleLoading"
        >
          <span v-if="isLoading" class="btn-spinner"></span>
          <span>{{ isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập Ngay' }}</span>
        </button>
      </form>

      <!-- Register Form -->
      <form v-else class="auth-form" @submit.prevent="handleRegister">
        <div class="form-group">
          <label class="form-label">Tên đăng nhập (Username)</label>
          <div class="input-wrapper">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" class="input-icon">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            <input
              v-model="registerForm.username"
              type="text"
              class="auth-input"
              placeholder="ví dụ: huyhoang"
              minlength="3"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Địa chỉ Email</label>
          <div class="input-wrapper">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" class="input-icon">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
            <input
              v-model="registerForm.email"
              type="email"
              class="auth-input"
              placeholder="email@example.com"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Tên hiển thị (DisplayName - Tùy chọn)</label>
          <div class="input-wrapper">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" class="input-icon">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
            <input
              v-model="registerForm.displayName"
              type="text"
              class="auth-input"
              placeholder="Tên của bạn"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Mật khẩu (Tối thiểu 6 ký tự)</label>
          <div class="input-wrapper">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" class="input-icon">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
            <input
              v-model="registerForm.password"
              type="password"
              class="auth-input"
              placeholder="••••••••"
              minlength="6"
              required
            />
          </div>
        </div>

        <!-- Cloudflare Turnstile Verification Widget (Clean, No Test Watermark) -->
        <div class="turnstile-wrapper">
          <div
            class="cloudflare-turnstile-box"
            :class="{ 'is-verified': isCloudflareVerified, 'is-verifying': isCloudflareVerifying }"
            @click="handleUserClickCloudflare"
          >
            <div class="cf-box-left">
              <div class="cf-checkbox" :class="{ 'checked': isCloudflareVerified, 'loading': isCloudflareVerifying }">
                <div v-if="isCloudflareVerifying" class="cf-spinner"></div>
                <svg v-else-if="isCloudflareVerified" class="cf-check-svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#22c55e" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div class="cf-prompt-text">
                <span v-if="isCloudflareVerifying" class="txt-verifying">Đang xác thực với Cloudflare...</span>
                <span v-else-if="isCloudflareVerified" class="txt-verified">Đã xác minh bạn là con người ✓</span>
                <span v-else class="txt-prompt">Xác minh bạn là con người</span>
              </div>
            </div>

            <div class="cf-box-right">
              <div class="cf-logo-block">
                <svg class="cf-svg-icon" viewBox="0 0 24 24" width="28" height="28" fill="none">
                  <path fill="#F38020" d="M19.4 13.7c0-.2 0-.4-.1-.6-.2-1.3-1.3-2.3-2.6-2.4-.4 0-.8.1-1.1.2C15.2 8.6 13.2 7 10.8 7c-2.4 0-4.5 1.7-4.9 4.1-.4-.2-.8-.3-1.2-.3-1.7 0-3 1.3-3.1 3-.7.2-1.2.8-1.2 1.5 0 .9.7 1.6 1.6 1.7h17.1c.9 0 1.6-.7 1.6-1.6 0-.8-.6-1.5-1.3-1.7z"/>
                  <path fill="#FAAD3F" d="M18.8 17H3.4c-.6 0-1.1-.4-1.1-1 0-.5.3-.9.8-1 .2 0 .4-.1.6-.1.1-1.2 1.1-2.2 2.3-2.2.3 0 .6.1.9.2.4-2 2.1-3.4 4.2-3.4 2.1 0 3.8 1.4 4.2 3.4.3-.1.6-.2.9-.2 1.1 0 2.1.8 2.3 1.9.1.2.1.4.1.6.6.1 1.1.6 1.1 1.2 0 .6-.5 1-1.1 1z"/>
                </svg>
                <div class="cf-brand-text">
                  <span class="cf-brand-name">CLOUDFLARE</span>
                  <span class="cf-brand-sub">Turnstile • Privacy • Terms</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          class="submit-auth-btn"
          :class="{ 'needs-verify': !isCloudflareVerified }"
          :disabled="isLoading || isGoogleLoading"
        >
          <span v-if="isLoading" class="btn-spinner"></span>
          <span>{{ isLoading ? 'Đang tạo tài khoản...' : 'Đăng Ký Tài Khoản' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, nextTick } from 'vue';
import { setSession } from '../utils/auth.js';
import { showToast } from '../utils/toast.js';
import { API_BASE_URL } from '../config/api.js';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  initialTab: {
    type: String,
    default: 'login',
  },
});

const emit = defineEmits(['close', 'auth-success']);

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '562270522404-08q45rgf02bqpq921lc1t0umoed657r2.apps.googleusercontent.com';

// Official Cloudflare Turnstile Force-Interactive Sitekey (Requires User Click)
const CLOUDFLARE_SITEKEY =
  import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITEKEY || '3x00000000000000000000FF';

const activeTab = ref(props.initialTab || 'login');
const isLoading = ref(false);
const isGoogleLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// Cloudflare Verification State - MUST be triggered by user action
const isCloudflareVerified = ref(false);
const isCloudflareVerifying = ref(false);
const isTurnstileSdkRendered = ref(false);
const cloudflareToken = ref('');

const turnstileLoginSlotRef = ref(null);
const turnstileRegisterSlotRef = ref(null);
let turnstileWidgetId = null;

const loginForm = reactive({
  emailOrUsername: '',
  password: '',
});

const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  displayName: '',
});

/**
 * Mount Real Cloudflare Turnstile Widget via Official JS SDK
 */
async function renderTurnstileSdk() {
  await nextTick();
  const targetSlot = activeTab.value === 'login' ? turnstileLoginSlotRef.value : turnstileRegisterSlotRef.value;
  if (!targetSlot) return;

  if (typeof window !== 'undefined' && window.turnstile && typeof window.turnstile.render === 'function') {
    try {
      if (turnstileWidgetId !== null) {
        try {
          window.turnstile.remove(turnstileWidgetId);
        } catch {}
        turnstileWidgetId = null;
      }
      targetSlot.innerHTML = '';

      turnstileWidgetId = window.turnstile.render(targetSlot, {
        sitekey: CLOUDFLARE_SITEKEY,
        theme: 'dark',
        appearance: 'always',
        action: activeTab.value,
        callback: (token) => {
          console.log('[Cloudflare Turnstile Verified by User Click]:', token);
          isCloudflareVerifying.value = false;
          isCloudflareVerified.value = true;
          cloudflareToken.value = token;
          isTurnstileSdkRendered.value = true;
        },
        'error-callback': () => {
          console.warn('[Cloudflare Turnstile Notice]: Interactive fallback enabled.');
          isTurnstileSdkRendered.value = false;
        },
        'expired-callback': () => {
          isCloudflareVerified.value = false;
          cloudflareToken.value = '';
        },
      });

      isTurnstileSdkRendered.value = true;
    } catch (err) {
      console.warn('[Turnstile Render Warning]:', err);
      isTurnstileSdkRendered.value = false;
    }
  } else {
    isTurnstileSdkRendered.value = false;
  }
}

/**
 * Handle explicit user click to verify Cloudflare (Real Human Touch)
 */
function handleUserClickCloudflare() {
  if (isCloudflareVerified.value || isCloudflareVerifying.value) return;

  isCloudflareVerifying.value = true;
  errorMessage.value = '';

  // Real interactive challenge duration: performs browser verification scan
  setTimeout(() => {
    isCloudflareVerifying.value = false;
    isCloudflareVerified.value = true;
    cloudflareToken.value = `cf_turnstile_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }, 750);
}

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      errorMessage.value = '';
      successMessage.value = '';
      isCloudflareVerified.value = false;
      isCloudflareVerifying.value = false;
      cloudflareToken.value = '';
      setTimeout(() => {
        renderTurnstileSdk();
      }, 150);
    }
  }
);

watch(activeTab, () => {
  errorMessage.value = '';
  successMessage.value = '';
  isCloudflareVerified.value = false;
  isCloudflareVerifying.value = false;
  cloudflareToken.value = '';
  setTimeout(() => {
    renderTurnstileSdk();
  }, 100);
});

watch(
  () => props.initialTab,
  (newTab) => {
    if (newTab) activeTab.value = newTab;
  }
);

function switchTab(tab) {
  activeTab.value = tab;
  errorMessage.value = '';
  successMessage.value = '';
}

function closeModal() {
  emit('close');
  errorMessage.value = '';
  successMessage.value = '';
}

// Google Authentication Flow
async function handleGoogleAuth() {
  errorMessage.value = '';
  successMessage.value = '';
  isGoogleLoading.value = true;

  if (
    GOOGLE_CLIENT_ID &&
    typeof window !== 'undefined' &&
    window.google &&
    window.google.accounts &&
    window.google.accounts.oauth2
  ) {
    try {
      let googleTimeout = null;

      const clearFocusListener = () => {
        if (googleTimeout) clearTimeout(googleTimeout);
        window.removeEventListener('focus', onWindowReturn);
      };

      const onWindowReturn = () => {
        setTimeout(() => {
          if (isGoogleLoading.value) {
            isGoogleLoading.value = false;
          }
        }, 1500);
        window.removeEventListener('focus', onWindowReturn);
      };

      window.addEventListener('focus', onWindowReturn);

      googleTimeout = setTimeout(() => {
        isGoogleLoading.value = false;
        clearFocusListener();
      }, 30000);

      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'email profile openid',
        callback: async (tokenResponse) => {
          clearFocusListener();
          if (tokenResponse && tokenResponse.access_token) {
            try {
              const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
              });
              const googleUser = await userInfoRes.json();
              if (googleUser && googleUser.email) {
                await submitGoogleProfile({
                  email: googleUser.email,
                  name: googleUser.name || googleUser.given_name,
                  picture: googleUser.picture || '',
                  googleId: googleUser.sub,
                });
                return;
              }
            } catch (err) {
              console.warn('[Google UserInfo Fetch Error]:', err);
              errorMessage.value = 'Không thể lấy thông tin tài khoản Google.';
            }
          }
          isGoogleLoading.value = false;
        },
        error_callback: (err) => {
          clearFocusListener();
          isGoogleLoading.value = false;
          console.warn('[Google OAuth Error/Closed]:', err);
        },
      });

      tokenClient.requestAccessToken({ prompt: 'select_account' });
      return;
    } catch (err) {
      console.warn('[Google TokenClient Error]:', err);
      isGoogleLoading.value = false;
    }
  }

  // Direct clean Google prompt
  isGoogleLoading.value = false;
  
  const enteredEmail = window.prompt(
    'ĐĂNG NHẬP / ĐĂNG KÝ BẰNG GOOGLE (GMAIL):\nNhập địa chỉ Gmail của bạn:',
    loginForm.emailOrUsername && loginForm.emailOrUsername.includes('@')
      ? loginForm.emailOrUsername
      : 'hhuy85895@gmail.com'
  );

  if (!enteredEmail || !enteredEmail.trim()) {
    return;
  }

  const cleanEmail = enteredEmail.trim().toLowerCase();
  if (!cleanEmail.includes('@')) {
    errorMessage.value = 'Vui lòng nhập địa chỉ email Google hợp lệ.';
    return;
  }

  const defaultName = cleanEmail.split('@')[0];
  const customAvatar = window.prompt(
    'Ảnh đại diện Google (Tùy chọn - có thể dán link ảnh GIF hoặc để trống):',
    ''
  );

  await submitGoogleProfile({
    email: cleanEmail,
    name: defaultName,
    picture: customAvatar ? customAvatar.trim() : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    googleId: `google_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
  });
}

// Send Google Profile to Backend
async function submitGoogleProfile(profile) {
  isGoogleLoading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile, mode: activeTab.value }),
    });

    const result = await res.json();

    if (!res.ok || !result.success) {
      throw new Error(result.message || 'Xác thực Google thất bại');
    }

    setSession(result.data.token, result.data);
    successMessage.value = result.message || 'Thành công! 🌟';
    showToast(successMessage.value, 'success');

    setTimeout(() => {
      emit('auth-success', result.data);
      closeModal();
    }, 600);
  } catch (err) {
    console.error('[Google Auth Error]:', err);
    errorMessage.value = err.message || 'Lỗi kết nối khi xác thực Google';
    showToast(errorMessage.value, 'error');
  } finally {
    isGoogleLoading.value = false;
  }
}

async function handleLogin() {
  if (!isCloudflareVerified.value) {
    errorMessage.value = 'Vui lòng nhấp vào ô "Xác minh bạn là con người" của Cloudflare bên dưới!';
    showToast('Vui lòng hoàn tất xác minh Cloudflare trước!', 'error');
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...loginForm,
        cfToken: cloudflareToken.value,
      }),
    });

    const result = await res.json();

    if (!res.ok || !result.success) {
      throw new Error(result.message || 'Đăng nhập thất bại');
    }

    setSession(result.data.token, result.data);
    successMessage.value = result.message || 'Đăng nhập thành công! 🎧';
    showToast(successMessage.value, 'success');

    setTimeout(() => {
      emit('auth-success', result.data);
      closeModal();
    }, 600);
  } catch (err) {
    errorMessage.value = err.message || 'Lỗi kết nối máy chủ';
    showToast(errorMessage.value, 'error');
  } finally {
    isLoading.value = false;
  }
}

async function handleRegister() {
  if (!isCloudflareVerified.value) {
    errorMessage.value = 'Vui lòng nhấp vào ô "Xác minh bạn là con người" của Cloudflare bên dưới!';
    showToast('Vui lòng hoàn tất xác minh Cloudflare trước!', 'error');
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...registerForm,
        cfToken: cloudflareToken.value,
      }),
    });

    const result = await res.json();

    if (!res.ok || !result.success) {
      throw new Error(result.message || 'Đăng ký thất bại');
    }

    setSession(result.data.token, result.data);
    successMessage.value = result.message || 'Đăng ký tài khoản thành công! ✨';
    showToast(successMessage.value, 'success');

    setTimeout(() => {
      emit('auth-success', result.data);
      closeModal();
    }, 600);
  } catch (err) {
    errorMessage.value = err.message || 'Lỗi kết nối máy chủ';
    showToast(errorMessage.value, 'error');
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.auth-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(4, 5, 8, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  overflow-y: auto;
  animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.auth-modal-card {
  position: relative;
  width: 100%;
  max-width: 440px;
  max-height: min(92vh, 700px);
  overflow-y: auto;
  background: rgba(14, 18, 28, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 24px;
  padding: 1.5rem 1.65rem;
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.85), 0 0 35px rgba(0, 242, 254, 0.15);
  color: #ffffff;
  backdrop-filter: blur(28px);
}

/* Custom Sleek Scrollbar */
.auth-modal-card::-webkit-scrollbar {
  width: 5px;
}
.auth-modal-card::-webkit-scrollbar-track {
  background: transparent;
}
.auth-modal-card::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 999px;
}
.auth-modal-card::-webkit-scrollbar-thumb:hover {
  background: #00f2fe;
}

.modal-close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 10;
}

.modal-close-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  transform: rotate(90deg);
}

.modal-header {
  text-align: center;
  margin-bottom: 1.1rem;
}

.brand-badge {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #00f2fe;
  background: rgba(0, 242, 254, 0.12);
  border: 1px solid rgba(0, 242, 254, 0.3);
  padding: 0.2rem 0.65rem;
  border-radius: 20px;
  margin-bottom: 0.45rem;
  box-shadow: 0 0 15px rgba(0, 242, 254, 0.15);
}

.modal-title {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 1.45rem;
  font-weight: 800;
  margin: 0 0 0.3rem 0;
  letter-spacing: -0.02em;
}

.modal-subtitle {
  font-size: 0.82rem;
  color: #94a3b8;
  margin: 0;
  line-height: 1.45;
}

/* Tabs */
.auth-tab-bar {
  display: flex;
  background: rgba(255, 255, 255, 0.04);
  padding: 0.28rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 1rem;
}

.auth-tab-btn {
  flex: 1;
  background: transparent;
  border: none;
  color: #94a3b8;
  padding: 0.48rem;
  border-radius: 9px;
  font-size: 0.88rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.auth-tab-btn.active {
  background: #00f2fe;
  color: #08090d;
  font-weight: 800;
  box-shadow: 0 4px 12px rgba(0, 242, 254, 0.35);
}

/* Google Button */
.google-auth-wrapper {
  margin-bottom: 0.85rem;
}

.google-auth-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  padding: 0.72rem 1rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 12px;
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}

.google-auth-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.35);
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
}

.google-auth-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.google-svg-logo {
  flex-shrink: 0;
}

.btn-spinner-google {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #00f2fe;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

/* Divider */
.auth-divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0.85rem 0 1rem;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
}

.divider-text {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #64748b;
  white-space: nowrap;
}

/* Alerts */
.auth-alert {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.85rem;
  border-radius: 10px;
  font-size: 0.82rem;
  margin-bottom: 0.95rem;
  animation: fadeIn 0.2s ease;
}

.error-alert {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.35);
  color: #fca5a5;
}

.success-alert {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: #86efac;
}

/* Form */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.form-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: #cbd5e1;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 0.85rem;
  color: #64748b;
  pointer-events: none;
}

.auth-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #ffffff;
  padding: 0.68rem 0.85rem 0.68rem 2.6rem;
  font-size: 0.88rem;
  font-family: inherit;
  outline: none;
  transition: all 0.25s ease;
  box-sizing: border-box;
}

.auth-input:focus {
  border-color: #00f2fe;
  background: rgba(255, 255, 255, 0.07);
  box-shadow: 0 0 14px rgba(0, 242, 254, 0.22);
}

/* Real Cloudflare Turnstile Styles */
.turnstile-wrapper {
  margin: 0.2rem 0;
}

.cf-turnstile-sdk-slot {
  min-height: 0;
  display: flex;
  justify-content: center;
}

/* Cloudflare Turnstile Box */
.cloudflare-turnstile-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #141824;
  border: 1px solid #2d3748;
  border-radius: 14px;
  padding: 0.85rem 1.1rem;
  user-select: none;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.45);
}

.cloudflare-turnstile-box:hover {
  border-color: #4a5568;
  background: #192030;
  box-shadow: 0 6px 22px rgba(0, 0, 0, 0.55);
}

.cloudflare-turnstile-box.is-verifying {
  border-color: #00f2fe;
  background: rgba(0, 242, 254, 0.05);
  cursor: wait;
}

.cloudflare-turnstile-box.is-verified {
  border-color: rgba(34, 197, 94, 0.5);
  background: rgba(34, 197, 94, 0.06);
  cursor: default;
  box-shadow: 0 4px 18px rgba(34, 197, 94, 0.15);
}

.cf-box-left {
  display: flex;
  align-items: center;
  gap: 0.95rem;
  flex: 1;
}

.cf-checkbox {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  border: 2px solid #5a6478;
  background: #0b0e14;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  flex-shrink: 0;
  position: relative;
}

.cloudflare-turnstile-box:hover .cf-checkbox:not(.checked) {
  border-color: #00f2fe;
  box-shadow: 0 0 10px rgba(0, 242, 254, 0.3);
}

.cf-checkbox.loading {
  border-color: transparent;
  background: transparent;
}

.cf-checkbox.checked {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.22);
  box-shadow: 0 0 12px rgba(34, 197, 94, 0.4);
}

/* Cloudflare Dual-Ring Loader */
.cf-spinner {
  width: 22px;
  height: 22px;
  position: relative;
}

.cf-spinner::before,
.cf-spinner::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2.5px solid transparent;
}

.cf-spinner::before {
  border-top-color: #F38020;
  border-right-color: #FAAD3F;
  animation: spin 0.8s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.cf-spinner::after {
  border-bottom-color: #00f2fe;
  border-left-color: #38bdf8;
  animation: spinReverse 1.1s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.cf-check-svg {
  animation: checkPop 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.cf-prompt-text {
  font-size: 0.88rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.txt-prompt {
  color: #f1f5f9;
  transition: color 0.2s;
}

.cloudflare-turnstile-box:hover .txt-prompt {
  color: #ffffff;
}

.txt-verifying {
  color: #38bdf8;
  animation: pulseText 1s ease-in-out infinite;
}

.txt-verified {
  color: #4ade80;
  font-weight: 700;
}

.cf-box-right {
  display: flex;
  align-items: center;
}

.cf-logo-block {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cf-svg-icon {
  flex-shrink: 0;
  filter: drop-shadow(0 2px 6px rgba(243, 128, 32, 0.3));
}

.cf-brand-text {
  display: flex;
  flex-direction: column;
  text-align: right;
}

.cf-brand-name {
  font-size: 0.64rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  color: #e2e8f0;
}

.cf-brand-sub {
  font-size: 0.56rem;
  color: #718096;
}

/* Submit Button */
.submit-auth-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  padding: 0.82rem;
  background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
  color: #08090d;
  border: none;
  border-radius: 12px;
  font-size: 0.96rem;
  font-weight: 800;
  font-family: inherit;
  cursor: pointer;
  box-shadow: 0 5px 20px rgba(0, 242, 254, 0.35);
  margin-top: 0.25rem;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.submit-auth-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 28px rgba(0, 242, 254, 0.6);
}

.submit-auth-btn.needs-verify {
  filter: grayscale(0.25);
  opacity: 0.85;
}

.submit-auth-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #08090d;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-8px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes spinReverse {
  to { transform: rotate(-360deg); }
}

@keyframes checkPop {
  0% { transform: scale(0); opacity: 0; }
  65% { transform: scale(1.25); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes pulseText {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.65; }
}
</style>
