// api/src/routes/thoughtRoutes.ts

import { Router } from 'express';
import {
  getAllThoughtsHandler,
  createThoughtHandler,
  getThoughtByIdHandler,
  addReplyHandler,
  voteOnThoughtHandler,
  voteOnReplyHandler,
} from '../controllers/thoughtsController.js'; // note .js extension for ESM import

const router = Router();

// GET /api/thoughts - get all thoughts
router.get('/', getAllThoughtsHandler);

// POST /api/thoughts - create new thought
router.post('/', createThoughtHandler);

// GET /api/thoughts/:thoughtId - get thought by id
router.get('/:thoughtId', getThoughtByIdHandler);

// POST /api/thoughts/:thoughtId/vote - vote on a thought
router.post('/:thoughtId/vote', voteOnThoughtHandler);

// POST /api/thoughts/:thoughtId/replies - add reply to thought
router.post('/:thoughtId/replies', addReplyHandler);

// POST /api/thoughts/:thoughtId/replies/:replyId/vote - vote on a reply
router.post('/:thoughtId/replies/:replyId/vote', voteOnReplyHandler);

export default router;
