import express from 'express';
import {
    getPostComments,
    addComment,
    addReply,
    updateComment,
    deleteComment
} from '../../controllers/comments/commentsController.js';

const commentsRouter = express.Router();

// Get all comments for a post
commentsRouter.get('/comments/post/:postId', getPostComments);

// Add a new top-level comment to a post
commentsRouter.post('/comments/post/:postId', addComment);

// Add a reply to a comment
commentsRouter.post('/comments/:commentId/reply', addReply);

// Update a comment
commentsRouter.put('/comments/:commentId', updateComment);

// Delete a comment (soft delete)
commentsRouter.delete('/comments/:commentId', deleteComment);

export default commentsRouter;

