import { v4 as uuidv4 } from 'uuid';
import GroupPosts from '../../models/groupPosts.js';
import Profile from '../../models/profileOrm.js';

export async function createPostController(req, res) {
    try {
        const attachmentsFiles = req.files?.attachments;
        console.log('attachmentsFiles', attachmentsFiles);

        const {
            groupId,
            postContent,
            postCreator,
            postCreatorName,
            postType,
            pollData,
            eventData,
        } = req.body;

        if (!postCreator) {
            return res.status(400).json({
                success: false,
                message: 'Post creator is required',
                error: 'Post creator is required',
            });
        }

        const postId = uuidv4();
        const postIsActive = true;
        const postIsDeleted = false;

        let verifiedPostCreatorName = postCreatorName;

        if (verifiedPostCreatorName === null) {
            try {
                const profile = await Profile.findOne({ where: { userId: postCreator } });
                if (!profile) {
                    return res.status(404).json({
                        success: false,
                        message: 'Profile not found',
                        error: 'Profile not found',
                    });
                }
                verifiedPostCreatorName = profile.name;
            } catch (error) {
                console.error('Error finding profile:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Error finding profile',
                    error: error.message,
                });
            }
        }

        const post = await GroupPosts.create({
            groupId,
            postId,
            postType,
            postContent,
            postCreator,
            postCreatorName: verifiedPostCreatorName,
            postIsActive,
            postIsDeleted,
            pollData: pollData ? JSON.parse(pollData) : null,
            eventData: eventData ? JSON.parse(eventData) : null,
        });

        if (post) {
            console.log('we have created the post', post);
            return res.status(201).json({
                success: true,
                message: 'Post created successfully',
                data: post.get({ plain: true }),
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Error creating post',
            error: 'Failed to persist post',
        });
    } catch (error) {
        console.error('Error creating post:', error);
        return res.status(500).json({
            success: false,
            message: 'Error creating post',
            error: error.message,
        });
    }
}