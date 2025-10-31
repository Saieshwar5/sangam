import Comment from '../../models/commentsOrm.js';
import GroupPosts from '../../models/groupPosts.js';
import User from '../../models/usersOrm.js';
import Profile from '../../models/profileOrm.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Recursively build nested comment tree with userName from Profile
 * @param {string} commentId - Parent comment ID
 * @returns {Promise<Array>} - Array of nested replies with userName
 */
async function fetchReplies(commentId) {
    const replies = await Comment.findAll({
        where: { 
            parentCommentId: commentId,
            isDeleted: false 
        },
        include: [{
            model: User,
            as: 'author',
            attributes: ['userId', 'email'],
            include: [{
                model: Profile,
                attributes: ['name', 'displayName'],
                required: false // LEFT JOIN - in case profile doesn't exist
            }]
        }],
        order: [['createdAt', 'ASC']],
        raw: false // Need false to access associations
    });
    
    // Transform replies to include userName
    const repliesWithUserName = replies.map(reply => {
        const replyData = reply.get({ plain: true });
        // Profile might be accessed as 'Profile' (capitalized) or 'profile' (lowercase)
        const profile = replyData.author?.Profile || replyData.author?.profile;
        // Get userName: prefer Profile.name, then Profile.displayName, then email prefix, finally 'Anonymous'
        const userName = profile?.name || profile?.displayName || replyData.author?.email?.split('@')[0] || 'Anonymous';
        
        return {
            commentId: replyData.commentId,
            postId: replyData.postId,
            userId: replyData.userId,
            userName: userName,
            commentText: replyData.commentText,
            createdAt: replyData.createdAt,
            updatedAt: replyData.updatedAt,
            parentCommentId: replyData.parentCommentId,
            isDeleted: replyData.isDeleted,
            replies: [] // Will be populated recursively
        };
    });
    
    // Recursively fetch replies for each reply
    for (const reply of repliesWithUserName) {
        reply.replies = await fetchReplies(reply.commentId);
    }
    
    return repliesWithUserName;
}

/**
 * Get all comments for a specific post
 * GET /api/comments/post/:postId
 */
export const getPostComments = async (req, res) => {
    try {
        const { postId } = req.params;

        if (!postId) {
            return res.status(400).json({
                success: false,
                message: 'Post ID is required',
                error: 'Missing postId'
            });
        }

        // Check if post exists
        const post = await GroupPosts.findOne({
            where: { postId, postIsDeleted: false }
        });

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found',
                error: 'Post not found'
            });
        }

        // Fetch top-level comments (no parent) with User and Profile
        const topLevelComments = await Comment.findAll({
            where: { 
                postId, 
                parentCommentId: null,
                isDeleted: false 
            },
            include: [{
                model: User,
                as: 'author',
                attributes: ['userId', 'email'],
                include: [{
                    model: Profile,
                    attributes: ['name', 'displayName'],
                    required: false // LEFT JOIN - in case profile doesn't exist
                }]
            }],
            order: [['createdAt', 'DESC']],
            raw: false // Need false to access associations
        });

        // Transform comments to include userName from Profile
        const commentsWithUserName = topLevelComments.map(comment => {
            const commentData = comment.get({ plain: true });
            // Profile might be accessed as 'Profile' (capitalized) or 'profile' (lowercase) depending on Sequelize version
            const profile = commentData.author?.Profile || commentData.author?.profile;
            // Get userName: prefer Profile.name, then Profile.displayName, then email prefix, finally 'Anonymous'
            const userName = profile?.name || profile?.displayName || commentData.author?.email?.split('@')[0] || 'Anonymous';
            
            return {
                commentId: commentData.commentId,
                postId: commentData.postId,
                userId: commentData.userId,
                userName: userName,
                commentText: commentData.commentText,
                createdAt: commentData.createdAt,
                updatedAt: commentData.updatedAt,
                parentCommentId: commentData.parentCommentId,
                isDeleted: commentData.isDeleted,
                replies: [] // Will be populated by fetchReplies
            };
        });

        // Recursively fetch replies for each top-level comment
        for (const comment of commentsWithUserName) {
            comment.replies = await fetchReplies(comment.commentId);
        }

        return res.status(200).json({
            success: true,
            message: 'Comments loaded successfully',
            data: commentsWithUserName
        });

    } catch (error) {
        console.error('Error loading comments:', error);
        return res.status(500).json({
            success: false,
            message: 'Error loading comments',
            error: error.message
        });
    }
};

/**
 * Add a new top-level comment to a post
 * POST /api/comments/post/:postId
 * Body: { commentText, userId }
 */
export const addComment = async (req, res) => {
    try {

        console.log("we are at the controller to add a comment");
        const { postId } = req.params;
        const { commentText, userId } = req.body;

        // Validation
        if (!postId || !commentText || !userId) {
            return res.status(400).json({
                success: false,
                message: 'postId, commentText, and userId are required',
                error: 'Missing required fields'
            });
        }

        if (commentText.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Comment text cannot be empty',
                error: 'Invalid commentText'
            });
        }

        // Check if post exists
        const post = await GroupPosts.findOne({
            where: { postId, postIsDeleted: false }
        });

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found',
                error: 'Post not found'
            });
        }

        // Check if user exists
        const user = await User.findOne({
            where: { userId }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
                error: 'User not found'
            });
        }

        // Create the comment
        const commentId = uuidv4();
        const newComment = await Comment.create({
            commentId,
            postId,
            userId,
            parentCommentId: null, // Top-level comment
            commentText: commentText.trim(),
            isDeleted: false
        });

        return res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            data: {
                commentId: newComment.commentId,
                postId: newComment.postId,
                userId: newComment.userId,
                commentText: newComment.commentText,
                createdAt: newComment.createdAt,
                updatedAt: newComment.updatedAt
            }
        });

    } catch (error) {
        console.error('Error adding comment:', error);
        return res.status(500).json({
            success: false,
            message: 'Error adding comment',
            error: error.message
        });
    }
};

/**
 * Add a reply to a comment
 * POST /api/comments/:commentId/reply
 * Body: { postId, replyText, userId }
 */
export const addReply = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { postId, replyText, userId } = req.body;

        // Validation
        if (!commentId || !postId || !replyText || !userId) {
            return res.status(400).json({
                success: false,
                message: 'commentId, postId, replyText, and userId are required',
                error: 'Missing required fields'
            });
        }

        if (replyText.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Reply text cannot be empty',
                error: 'Invalid replyText'
            });
        }

        // Check if parent comment exists
        const parentComment = await Comment.findOne({
            where: { commentId, isDeleted: false }
        });

        if (!parentComment) {
            return res.status(404).json({
                success: false,
                message: 'Parent comment not found',
                error: 'Parent comment not found'
            });
        }

        // Check if post exists
        const post = await GroupPosts.findOne({
            where: { postId, postIsDeleted: false }
        });

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found',
                error: 'Post not found'
            });
        }

        // Check if user exists
        const user = await User.findOne({
            where: { userId }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
                error: 'User not found'
            });
        }

        // Create the reply
        const replyCommentId = uuidv4();
        const newReply = await Comment.create({
            commentId: replyCommentId,
            postId,
            userId,
            parentCommentId: commentId, // Link to parent comment
            commentText: replyText.trim(),
            isDeleted: false
        });

        return res.status(201).json({
            success: true,
            message: 'Reply added successfully',
            data: {
                commentId: newReply.commentId,
                parentCommentId: newReply.parentCommentId,
                postId: newReply.postId,
                userId: newReply.userId,
                commentText: newReply.commentText,
                createdAt: newReply.createdAt,
                updatedAt: newReply.updatedAt
            }
        });

    } catch (error) {
        console.error('Error adding reply:', error);
        return res.status(500).json({
            success: false,
            message: 'Error adding reply',
            error: error.message
        });
    }
};

/**
 * Update a comment
 * PUT /api/comments/:commentId
 * Body: { commentText, userId }
 */
export const updateComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { commentText, userId } = req.body;

        // Validation
        if (!commentId || !commentText || !userId) {
            return res.status(400).json({
                success: false,
                message: 'commentId, commentText, and userId are required',
                error: 'Missing required fields'
            });
        }

        if (commentText.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Comment text cannot be empty',
                error: 'Invalid commentText'
            });
        }

        // Find the comment
        const comment = await Comment.findOne({
            where: { commentId, isDeleted: false }
        });

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found',
                error: 'Comment not found'
            });
        }

        // Check if user owns the comment
        if (comment.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own comments',
                error: 'Forbidden'
            });
        }

        // Update the comment
        await comment.update({
            commentText: commentText.trim()
        });

        return res.status(200).json({
            success: true,
            message: 'Comment updated successfully',
            data: {
                commentId: comment.commentId,
                commentText: comment.commentText,
                updatedAt: comment.updatedAt
            }
        });

    } catch (error) {
        console.error('Error updating comment:', error);
        return res.status(500).json({
            success: false,
            message: 'Error updating comment',
            error: error.message
        });
    }
};

/**
 * Delete a comment (soft delete)
 * DELETE /api/comments/:commentId
 * Body: { userId }
 */
export const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { userId } = req.body;

        // Validation
        if (!commentId || !userId) {
            return res.status(400).json({
                success: false,
                message: 'commentId and userId are required',
                error: 'Missing required fields'
            });
        }

        // Find the comment
        const comment = await Comment.findOne({
            where: { commentId, isDeleted: false }
        });

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found',
                error: 'Comment not found'
            });
        }

        // Check if user owns the comment
        if (comment.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own comments',
                error: 'Forbidden'
            });
        }

        // Soft delete the comment
        await comment.update({
            isDeleted: true
        });

        return res.status(200).json({
            success: true,
            message: 'Comment deleted successfully',
            data: {
                commentId: comment.commentId
            }
        });

    } catch (error) {
        console.error('Error deleting comment:', error);
        return res.status(500).json({
            success: false,
            message: 'Error deleting comment',
            error: error.message
        });
    }
};

