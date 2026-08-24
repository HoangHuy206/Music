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
  if (typeof window !== 'undefined' && window.location.hostname) {
    const host = window.location.hostname;
    // Private LAN IPs (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
    if (/^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host)) {
      return `${window.location.protocol}//${host}:5000`;
    }
  }

  return 'http://localhost:5000';
}

export const API_BASE_URL = getApiBaseUrl();
