import GroupPosts from '../../models/groupPosts.js';
import PollPostVote from '../../models/pollsPostOrm.js';
import UsersInvitation from '../../models/usersInvitationOrm.js';

export async function loadGroupPostsController(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
                error: 'Unauthorized',
            });
        }

        const { groupId } = req.params;
        if (!groupId) {
            return res.status(400).json({
                success: false,
                message: 'Group ID is required',
                error: 'Group ID is required',
            });
        }

        const posts = await GroupPosts.findAll({
            where: {
                groupId,
                postIsDeleted: false,
            },
            order: [['createdAt', 'ASC']],
            include: [
                {
                    model: PollPostVote,
                    as: 'votes',
                    attributes: ['id', 'pollPostId', 'userId', 'voteData', 'createdAt'],
                    where: { userId },
                    required: false,
                },
                {
                    model: UsersInvitation,
                    as: 'invitations',
                    attributes: ['id', 'eventPostId', 'userId', 'isAccepted', 'createdAt'],
                    where: { userId },
                    required: false,
                },
            ],
        });

        if (!posts.length) {
            return res.status(404).json({
                success: false,
                message: 'No posts found',
                error: 'No posts found',
            });
        }


        
       

        return res.status(200).json({
            success: true,
            message: 'Posts loaded successfully',
            data: posts,
        });
    } catch (error) {
        console.error('Error loading posts:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to load posts',
            error: error.message,
        });
    }
}


export async function testController(req, res) {

    try {
        
        
        const { groupId , userId } = req.params;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
                error: 'Unauthorized',
            });
        }

        if (!groupId) {
            return res.status(400).json({
                success: false,
                message: 'Group ID is required',
                error: 'Group ID is required',
            });
        }

        const posts = await GroupPosts.findAll({
            where: {
                groupId,
                postIsDeleted: false,
            },
            order: [['createdAt', 'ASC']],
            include: [
                {
                    model: PollPostVote,
                    as: 'votes',
                    attributes: ['id', 'pollPostId', 'userId', 'voteData', 'createdAt'],
                    where: { userId },
                    required: false,
                },
                {
                    model: UsersInvitation,
                    as: 'invitations',
                    attributes: ['id', 'eventPostId', 'userId', 'isAccepted', 'createdAt'],
                    where: { userId },
                    required: false,
                },
            ],
        });

        if (!posts.length) {
            return res.status(404).json({
                success: false,
                message: 'No posts found',
                error: 'No posts found',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Posts loaded successfully',
            data: posts,
        });
    } catch (error) {
        console.error('Error loading posts:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to load posts',
            error: error.message,
        });
    }








}