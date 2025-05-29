// api/src/routes/thoughtRoutes.ts

import { Router } from 'express';
import {
  getAllThoughtsHandler,
  createThoughtHandler,
  getThoughtByIdHandler,
  addReplyHandler,
  voteOnThoughtHandler,
  voteOnReplyHandler,
} from '../controllers/thoughtsController.js'; // Ensure this path is correct

const router = Router();

// --- Thoughts ---
// GET /api/thoughts - Get all thoughts
router.get('/', getAllThoughtsHandler);

// POST /api/thoughts - Create a new thought
router.post('/', createThoughtHandler);

// GET /api/thoughts/:thoughtId - Get a single thought by ID
router.get('/:thoughtId', getThoughtByIdHandler);

// POST /api/thoughts/:thoughtId/vote - Vote on a thought
router.post('/:thoughtId/vote', voteOnThoughtHandler);

// --- Replies (scoped under a thought) ---
// POST /api/thoughts/:thoughtId/replies - Add a reply to a thought
router.post('/:thoughtId/replies', addReplyHandler);

// POST /api/thoughts/:thoughtId/replies/:replyId/vote - Vote on a reply
router.post('/:thoughtId/replies/:replyId/vote', voteOnReplyHandler);

export default router;