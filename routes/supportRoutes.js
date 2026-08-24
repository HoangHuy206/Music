import express from 'express';
import { submitSupportTicket } from '../controllers/supportController.js';

const router = express.Router();

// POST /api/support - Submit support inquiry & send to admin Gmail
router.post('/', submitSupportTicket);

export default router;
