// api/src/routes/thoughtRoutes.ts

import { Router } from 'express';
import {
  getAllThoughtsHandler,
  createThoughtHandler,
  getThoughtByIdHandler,
} from '../controllers/thoughtsController'; // Path to your controller

const router = Router();

// GET /api/thoughts - Get all thoughts
// Mounted at /api/thoughts, so this handles GET /api/thoughts
router.get('/', getAllThoughtsHandler);

// POST /api/thoughts - Create a new thought
// Mounted at /api/thoughts, so this handles POST /api/thoughts
router.post('/', createThoughtHandler);

// GET /api/thoughts/:thoughtId - Get a single thought by ID
// Mounted at /api/thoughts, so this handles GET /api/thoughts/:thoughtId
router.get('/:thoughtId', getThoughtByIdHandler);

// Future routes (replies, voting) will go here:
// router.post('/:thoughtId/replies', addReplyHandler);
// router.post('/:thoughtId/vote', voteOnThoughtHandler);
// router.post('/:thoughtId/replies/:replyId/vote', voteOnReplyHandler); // Added this example too

export default router;