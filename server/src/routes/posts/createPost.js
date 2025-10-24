import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import GroupPosts from '../../models/groupPosts.js';
import upload from '../../middleware/multer.js';

const createPostRouter = express.Router();

createPostRouter.post('/posts', upload.fields([{name: 'attachments', maxCount: 10}]), async (req, res) => {


    try {
    const attachmentsFiles = req.files?.attachments;
    console.log("attachmentsFiles", attachmentsFiles);

    const { groupId, postContent, postCreator, postCreatorName, postType, pollData, eventData } = req.body;

    const postId = uuidv4();

    const postIsActive = true;
    const postIsDeleted = false;
    
    const post = await GroupPosts.create({ groupId, postId, postType, postContent, postCreator, postCreatorName, postIsActive, postIsDeleted, pollData: pollData ? JSON.parse(pollData) : null, eventData: eventData ? JSON.parse(eventData) : null });
    if(post) {
        console.log( "we have created the post", post);
    res.status(201).json({ success: true, 
        message: 'Post created successfully', 
        data: post.get({plain: true}) });
    }
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ success: false, message: 'Error creating post', error: error.message });
    }
});



export default createPostRouter;



