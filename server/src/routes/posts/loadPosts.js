import express from 'express';
import GroupPosts from '../../models/groupPosts.js';
import PollPostVote from '../../models/pollsPostOrm.js';
import UsersInvitation from '../../models/usersInvitationOrm.js';
import { authMiddleWare } from '../../middleware/authMiddleWare.js';
import User from '../../models/usersOrm.js';

const loadPostsRouter = express.Router();

loadPostsRouter.get('/posts/group/:groupId/', authMiddleWare, async (req, res) => {
    const userId = req.user.id;
    
    const { groupId } = req.params;
    if (!groupId) {
        return res.status(400).json({ 
            success: false, 
            message: 'Group ID is required', 
            error: 'Group ID is required' 
        });
    }

    try {
        const posts = await GroupPosts.findAll({ 
            where: { 
                groupId: groupId,
                postIsDeleted: false 
            },
            order: [['createdAt', 'ASC']],
            include: [
                // Include votes - but only for this specific user
                {
                    model: PollPostVote,
                    as: 'votes', // matches alias in associations.js line 169
                    attributes: ['id', 'pollPostId', 'userId', 'voteData', 'createdAt'],
                    where: { userId }, // filter to only this user's votes
                    required: false, // LEFT JOIN - keep posts even if user hasn't voted
                },
                // Include invitations - but only for this specific user
                {
                    model: UsersInvitation,
                    as: 'invitations', // matches alias in associations.js line 221
                    attributes: ['id', 'eventPostId', 'userId', 'isAccepted', 'createdAt'],
                    where: { userId }, // filter to only this user's invitations
                    required: false, // LEFT JOIN - keep posts even if user hasn't RSVPed
                }
            ]
        });

        if (posts.length > 0) {
            return res.status(200).json({ 
                success: true, 
                message: 'Posts loaded successfully', 
                data: posts 
            });
        } else {
            return res.status(404).json({ 
                success: false, 
                message: 'No posts found', 
                error: 'No posts found' 
            });
        }
    } catch (error) {
        console.error('Error loading posts:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Failed to load posts', 
            error: error.message 
        });
    }
});

export default loadPostsRouter;