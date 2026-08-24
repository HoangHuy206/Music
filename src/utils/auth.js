import { ref } from 'vue';
import { API_BASE_URL } from '../config/api.js';

const TOKEN_KEY = 'aura_auth_token';
const USER_KEY = 'aura_auth_user';

export const currentUser = ref(null);
export const authToken = ref(null);

// Initialize from localStorage on load
export function initAuth() {
  const savedToken = localStorage.getItem(TOKEN_KEY);
  const savedUser = localStorage.getItem(USER_KEY);

  if (savedToken && savedUser) {
    try {
      authToken.value = savedToken;
      currentUser.value = JSON.parse(savedUser);
    } catch {
      logout();
    }
  }
}

// Set authenticated session
export function setSession(token, user) {
  authToken.value = token;
  currentUser.value = user;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// Update current user session data
export function updateUserSession(user) {
  currentUser.value = { ...currentUser.value, ...user };
  localStorage.setItem(USER_KEY, JSON.stringify(currentUser.value));
}

// Fetch latest user profile from backend
export async function fetchUserProfile(apiBaseUrl = API_BASE_URL) {
  if (!authToken.value) return null;
  try {
    const res = await fetch(`${apiBaseUrl}/api/auth/me`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (data.success && data.data) {
      updateUserSession(data.data);
      return data.data;
    }
  } catch (err) {
    console.error('[Auth Fetch Me Error]:', err);
  }
  return null;
}

// Clear session
export function logout() {
  authToken.value = null;
  currentUser.value = null;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// Get authorization headers for fetch requests
export function getAuthHeaders() {
  if (authToken.value) {
    return {
      Authorization: `Bearer ${authToken.value}`,
    };
  }
  return {};
}

// Initialize immediately
initAuth();

