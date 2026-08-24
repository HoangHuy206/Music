/**
 * Centralized API base URL config
 * Prioritizes VITE_API_URL environment variable for production deployments (Render/Vercel)
 * Automatically adapts hostname for mobile devices connecting over LAN
 */
function getApiBaseUrl() {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }

  // When accessing via LAN IP (e.g., 192.168.x.x:3000 on mobile)
  if (
    typeof window !== 'undefined' &&
    window.location.hostname &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    return `${window.location.protocol}//${window.location.hostname}:5000`;
  }

  return 'http://localhost:5000';
}

export const API_BASE_URL = getApiBaseUrl();
