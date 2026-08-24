import express from 'express';
import {
  createSong,
  getAllSongs,
  getSongById,
  searchSongs,
  getSearchSuggestions,
  getRelatedSongs,
  getSongLyrics,
  updateSongLyrics,
  deleteSong,
} from '../controllers/songController.js';
import { uploadSongMedia } from '../middlewares/upload.js';
import { optionalAuth, protect } from '../middlewares/auth.js';

const router = express.Router();

// Public helper routes - Must be defined BEFORE /:id
router.get('/search', searchSongs);
router.get('/suggestions', getSearchSuggestions);
router.get('/related', getRelatedSongs);
router.get('/lyrics', getSongLyrics);

// Routes for /api/songs
router
  .route('/')
  .get(optionalAuth, getAllSongs)
  .post(optionalAuth, uploadSongMedia, createSong);

router
  .route('/:id')
  .get(getSongById)
  .delete(protect, deleteSong);

router
  .route('/:id/lyrics')
  .put(protect, updateSongLyrics)
  .patch(protect, updateSongLyrics);

export default router;
