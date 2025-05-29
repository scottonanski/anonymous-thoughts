// api/src/controllers/thoughtsController.ts

import type { Request, Response, NextFunction } from 'express';
import * as thoughtService from '../services/thoughtService.js'; // Ensure this matches your service filename
import type {
  CreateThoughtInput,
  CreateReplyInput,
  Thought,
  Reply,
  VoteInput, // For request body when voting
} from '../types.js';

// Define a type for our standard success response structure
interface SuccessResponse<T> {
  status: 'success';
  data: T;
  results?: number; // Optional, for lists
}

/**
 * Handles GET /api/thoughts
 */
export const getAllThoughtsHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const allThoughts: Thought[] = await thoughtService.getAllThoughts();
    const response: SuccessResponse<{ thoughts: Thought[] }> = {
      status: 'success',
      results: allThoughts.length,
      data: {
        thoughts: allThoughts,
      },
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Handles POST /api/thoughts
 */
export const createThoughtHandler = async (
  req: Request<unknown, unknown, CreateThoughtInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { text } = req.body;
    const newThought: Thought = await thoughtService.createThought({ text });
    const response: SuccessResponse<{ thought: Thought }> = {
      status: 'success',
      data: {
        thought: newThought,
      },
    };
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Handles GET /api/thoughts/:thoughtId
 */
export const getThoughtByIdHandler = async (
  req: Request<{ thoughtId: string }, unknown, unknown>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { thoughtId } = req.params;
    const thought: Thought | undefined = await thoughtService.getThoughtById(thoughtId);

    if (!thought) {
      res.status(404).json({
        status: 'fail',
        message: `Thought with ID ${thoughtId} not found.`,
      });
      return;
    }
    const response: SuccessResponse<{ thought: Thought }> = {
      status: 'success',
      data: {
        thought,
      },
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Handles POST /api/thoughts/:thoughtId/replies
 */
export const addReplyHandler = async (
  req: Request<{ thoughtId: string }, unknown, CreateReplyInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { thoughtId } = req.params;
    const { text } = req.body;
    const newReply = await thoughtService.addReply(thoughtId, { text });

    if (!newReply) {
      res.status(404).json({
        status: 'fail',
        message: `Thought with ID ${thoughtId} not found, cannot add reply.`,
      });
      return;
    }
    const response: SuccessResponse<{ reply: Reply }> = {
      status: 'success',
      data: {
        reply: newReply,
      },
    };
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Handles POST /api/thoughts/:thoughtId/vote
 */
export const voteOnThoughtHandler = async (
  req: Request<{ thoughtId: string }, unknown, VoteInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { thoughtId } = req.params;
    const { voteType } = req.body;

    if (!voteType || (voteType !== 'up' && voteType !== 'down')) {
      res.status(400).json({
        status: 'fail',
        message: "Invalid voteType. Must be 'up' or 'down'.",
      });
      return;
    }

    const updatedThought = await thoughtService.voteOnThought(thoughtId, voteType);

    if (!updatedThought) {
      // Thought either not found or was deleted due to votes
      res.status(404).json({
        status: 'fail',
        message: `Thought with ID ${thoughtId} not found or was deleted.`,
      });
      return;
    }
    const response: SuccessResponse<{ thought: Thought }> = {
      status: 'success',
      data: {
        thought: updatedThought,
      },
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Handles POST /api/thoughts/:thoughtId/replies/:replyId/vote
 */
export const voteOnReplyHandler = async (
  // For req.params, it's good to be explicit: { thoughtId: string; replyId: string }
  req: Request<{ thoughtId: string; replyId: string }, unknown, VoteInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { thoughtId, replyId } = req.params;
    const { voteType } = req.body;

    if (!voteType || (voteType !== 'up' && voteType !== 'down')) {
      res.status(400).json({
        status: 'fail',
        message: "Invalid voteType. Must be 'up' or 'down'.",
      });
      return;
    }

    const updatedReply = await thoughtService.voteOnReply(
      thoughtId,
      replyId,
      voteType
    );

    if (!updatedReply) {
      // Reply either not found or was deleted due to votes
      res.status(404).json({
        status: 'fail',
        message: `Reply with ID ${replyId} (on thought ${thoughtId}) not found or was deleted.`,
      });
      return;
    }
    const response: SuccessResponse<{ reply: Reply }> = {
      status: 'success',
      data: {
        reply: updatedReply,
      },
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};