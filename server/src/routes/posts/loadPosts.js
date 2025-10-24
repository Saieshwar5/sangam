import express from 'express';
import GroupPosts from '../../models/groupPosts.js';
import { authMiddleWare } from '../../middleware/authMiddleWare.js';
import User from '../../models/usersOrm.js';

const loadPostsRouter = express.Router();

loadPostsRouter.get('/posts/group/:groupId',authMiddleWare, async (req, res) => {
    const userId = req.user.id;
    if(!userId){
        return res.status(401).json({ success: false, message: 'Unauthorized', error: 'Unauthorized' });
    }
    const { groupId } = req.params;
   
    if(!groupId){
        return res.status(400).json({ success: false, message: 'Group ID is required', error: 'Group ID is required' });
    }
    const posts = await GroupPosts.findAll({ 
        where: { groupId: groupId,
        } });
    if(posts.length > 0){
        return res.status(200).json({ success: true, message: 'Posts loaded successfully', data: posts });
    }
    else{
        return res.status(404).json({ success: false, message: 'No posts found', error: 'No posts found' });
    }
});

export default loadPostsRouter;