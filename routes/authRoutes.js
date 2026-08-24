import express from 'express';
import {
  registerUser,
  loginUser,
  googleAuth,
  getMe,
  updateProfile,
  updatePassword,
  getUserStats,
  getMySongs,
  getFavorites,
  toggleFavorite,
  getUserPlaylists,
  createPlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  deletePlaylist,
  recordPlayEvent,
  getPersonalizedRecommendations,
} from '../controllers/authController.js';
import { protect, optionalAuth } from '../middlewares/auth.js';
import { uploadAvatarMedia } from '../middlewares/upload.js';

const router = express.Router();

// Public auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);

// Personalized recommendation route (supports both logged-in and guest users)
router.get('/recommendations', optionalAuth, getPersonalizedRecommendations);

// Protected user profile & management routes
router.get('/me', protect, getMe);
router.put('/profile', protect, uploadAvatarMedia, updateProfile);
router.put('/password', protect, updatePassword);
router.get('/stats', protect, getUserStats);
router.get('/my-songs', protect, getMySongs);
router.get('/favorites', protect, getFavorites);
router.post('/favorites/:songId', protect, toggleFavorite);
router.post('/record-play', protect, recordPlayEvent);

// Custom Playlists routes
router.get('/playlists', protect, getUserPlaylists);
router.post('/playlists', protect, createPlaylist);
router.post('/playlists/:playlistId/songs', protect, addSongToPlaylist);
router.delete('/playlists/:playlistId/songs/:songId', protect, removeSongFromPlaylist);
router.delete('/playlists/:playlistId', protect, deletePlaylist);

export default router;

