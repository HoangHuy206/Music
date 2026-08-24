<template>
  <div class="global-toast-container">
    <transition-group name="toast-spring" tag="div" class="toast-stack">
      <div
        v-for="item in toastState.toasts"
        :key="item.id"
        class="toast-card"
        :class="[`toast-${item.type}`]"
        @click="dismiss(item.id)"
      >
        <!-- Ambient Neon Glow Behind Card -->
        <div class="toast-card-glow"></div>

        <!-- Left: Glowing Type Icon -->
        <div class="toast-icon-box">
          <!-- Success: Checkmark -->
          <svg v-if="item.type === 'success'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>

          <!-- Error: X Cross -->
          <svg v-else-if="item.type === 'error'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>

          <!-- Warning: Alert Triangle -->
          <svg v-else-if="item.type === 'warning'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>

          <!-- Info: Sparkle / Music Note -->
          <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>

        <!-- Middle: Content Info -->
        <div class="toast-body">
          <div class="toast-header-row">
            <span class="toast-badge-title">
              {{ getBadgeTitle(item.type) }}
            </span>
          </div>
          <p class="toast-msg-text">{{ item.message }}</p>
        </div>

        <!-- Right: Close Button -->
        <button class="toast-close-btn" title="Đóng thông báo" @click.stop="dismiss(item.id)">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <!-- Bottom Animated Progress Bar -->
        <div
          v-if="item.duration > 0"
          class="toast-progress-track"
        >
          <div
            class="toast-progress-bar"
            :style="{ animationDuration: `${item.duration}ms` }"
          ></div>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { toastState, removeToast } from '../utils/toast.js';

function dismiss(id) {
  removeToast(id);
}

function getBadgeTitle(type) {
  switch (type) {
    case 'success':
      return 'Thành Công ✦';
    case 'error':
      return 'Thông Báo Lỗi ✕';
    case 'warning':
      return 'Lưu Ý ⚠️';
    case 'info':
    default:
      return 'AuraMusic ⚡';
  }
}
</script>

<style scoped>
.global-toast-container {
  position: fixed;
  top: 84px;
  right: 24px;
  z-index: 999999;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  max-width: 420px;
  width: calc(100% - 32px);
}

.toast-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.toast-card {
  position: relative;
  overflow: hidden;
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px 16px 14px;
  border-radius: 16px;
  background: rgba(13, 17, 26, 0.88);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.15);
  cursor: pointer;
  user-select: none;
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s;
}

.toast-card:hover {
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.25);
}

/* Glowing Aura behind card */
.toast-card-glow {
  position: absolute;
  top: -20px;
  left: -20px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  opacity: 0.35;
  filter: blur(25px);
  pointer-events: none;
}

/* 1. Success Style */
.toast-success {
  border-color: rgba(0, 245, 160, 0.35);
}
.toast-success .toast-card-glow {
  background: #00f5a0;
}
.toast-success .toast-icon-box {
  background: rgba(0, 245, 160, 0.15);
  color: #00f5a0;
  box-shadow: 0 0 20px rgba(0, 245, 160, 0.3);
}
.toast-success .toast-badge-title {
  color: #00f5a0;
}
.toast-success .toast-progress-bar {
  background: linear-gradient(90deg, #00f5a0, #00f2fe);
}

/* 2. Error Style */
.toast-error {
  border-color: rgba(255, 42, 133, 0.4);
}
.toast-error .toast-card-glow {
  background: #ff2a85;
}
.toast-error .toast-icon-box {
  background: rgba(255, 42, 133, 0.15);
  color: #ff2a85;
  box-shadow: 0 0 20px rgba(255, 42, 133, 0.3);
}
.toast-error .toast-badge-title {
  color: #ff2a85;
}
.toast-error .toast-progress-bar {
  background: linear-gradient(90deg, #ff2a85, #ff5e62);
}

/* 3. Warning Style */
.toast-warning {
  border-color: rgba(255, 193, 7, 0.4);
}
.toast-warning .toast-card-glow {
  background: #ffc107;
}
.toast-warning .toast-icon-box {
  background: rgba(255, 193, 7, 0.15);
  color: #ffc107;
  box-shadow: 0 0 20px rgba(255, 193, 7, 0.3);
}
.toast-warning .toast-badge-title {
  color: #ffc107;
}
.toast-warning .toast-progress-bar {
  background: linear-gradient(90deg, #ffc107, #ff9800);
}

/* 4. Info Style */
.toast-info {
  border-color: rgba(0, 242, 254, 0.35);
}
.toast-info .toast-card-glow {
  background: #00f2fe;
}
.toast-info .toast-icon-box {
  background: rgba(0, 242, 254, 0.15);
  color: #00f2fe;
  box-shadow: 0 0 20px rgba(0, 242, 254, 0.3);
}
.toast-info .toast-badge-title {
  color: #00f2fe;
}
.toast-info .toast-progress-bar {
  background: linear-gradient(90deg, #00f2fe, #9d4edd);
}

/* Icon Box */
.toast-icon-box {
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Body */
.toast-body {
  flex: 1;
  min-width: 0;
}

.toast-header-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
}

.toast-badge-title {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.toast-msg-text {
  font-size: 0.88rem;
  font-weight: 500;
  color: #f1f5f9;
  line-height: 1.45;
  word-break: break-word;
}

/* Close Button */
.toast-close-btn {
  flex-shrink: 0;
  background: transparent;
  border: none;
  color: #64748b;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toast-close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

/* Progress bar */
.toast-progress-track {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.06);
}

.toast-progress-bar {
  height: 100%;
  width: 100%;
  animation: toast-shrink linear forwards;
  transform-origin: left;
}

@keyframes toast-shrink {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

/* Transitions: Springy entrance & exit */
.toast-spring-enter-active {
  animation: toast-enter 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-spring-leave-active {
  animation: toast-exit 0.3s cubic-bezier(0.4, 0, 1, 1) forwards;
}

@keyframes toast-enter {
  0% {
    opacity: 0;
    transform: translateX(40px) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes toast-exit {
  0% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateX(50px) scale(0.85);
  }
}

/* Mobile Responsiveness */
@media (max-width: 640px) {
  .global-toast-container {
    top: 72px;
    right: 16px;
    left: 16px;
    width: auto;
  }
}
</style>
