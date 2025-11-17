import express from 'express';
import upload from '../../middleware/multer.js';
import { voteOnPollPost } from '../../controllers/posts/pollPostVoteController.js';
import { recordUserInvitationController } from '../../controllers/posts/eventInvitation.js';
import { authMiddleWare } from '../../middleware/authMiddleWare.js';
import { createPostController } from '../../controllers/posts/createPost.js';
import { loadGroupPostsController, testController } from '../../controllers/posts/loadPost.js';


const PostsRouter = express.Router();
PostsRouter.post('/create', upload.fields([{name: 'attachments', maxCount: 10}]), createPostController);
PostsRouter.get('/group/:groupId/', authMiddleWare, loadGroupPostsController);
PostsRouter.get('/test/:groupId/:userId', testController);
PostsRouter.post('/poll/:postId/vote', voteOnPollPost);
PostsRouter.post('/event/:postId/participate', authMiddleWare, recordUserInvitationController);



export default PostsRouter;



