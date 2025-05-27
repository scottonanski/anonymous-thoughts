// api/src/controllers/thoughtsController.ts

import { Request, Response, NextFunction } from 'express';
import * as thoughtsService from '../services/thoughtService';
import type { CreateThoughtInput, Thought } from '../types'; // Assuming Thought type might be useful for response typing

/**
 * Handles GET /api/thoughts
 * Retrieves all thoughts.
 */
export const getAllThoughtsHandler = async (
  _req: Request, // No request data needed
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const allThoughts = await thoughtsService.getAllThoughts();
    res.status(200).json({
      status: 'success',
      results: allThoughts.length,
      data: {
        thoughts: allThoughts,
      },
    });
  } catch (error) {
    next(error); // Pass error to the global error handler
  }
};

/**
 * Handles POST /api/thoughts
 * Creates a new thought.
 */
export const createThoughtHandler = async (
  req: Request<{}, {}, CreateThoughtInput>, // ReqBody is CreateThoughtInput
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { text } = req.body;

    // Basic validation (service layer will do more thorough validation)
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      // For now, let the service throw the more specific error.
      // Or, you could throw a specific error here:
      // throw new Error('Thought text is required and cannot be empty.');
      // This will be caught by the service layer's validation anyway.
    }

    const newThought = await thoughtsService.createThought({ text });

    res.status(201).json({
      status: 'success',
      data: {
        thought: newThought,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handles GET /api/thoughts/:thoughtId
 * Retrieves a single thought by its ID.
 */
export const getThoughtByIdHandler = async (
  req: Request<{ thoughtId: string }>, // ParamsDictionary
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { thoughtId } = req.params;
    const thought = await thoughtsService.getThoughtById(thoughtId);

    if (!thought) {
      // If thought is not found by the service, send a 404
      // We can create a custom error type later for this (e.g., NotFoundError)
      // For now, a simple message is fine, or we let the global error handler deal with a generic error if service threw.
      // However, service returns undefined for not found, so controller handles the 404.
      res.status(404).json({
        status: 'fail',
        message: `Thought with ID ${thoughtId} not found.`,
      });
      return; // Important to return to prevent further execution
    }

    res.status(200).json({
      status: 'success',
      data: {
        thought,
      },
    });
  } catch (error) {
    next(error);
  }
};

// --- (Placeholders for other handlers we'll add for replies and votes) ---
// export const addReplyHandler = async (...) => { ... };
// export const voteOnThoughtHandler = async (...) => { ... };
// export const voteOnReplyHandler = async (...) => { ... };