import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleWare } from '../../middleware/authMiddleWare.js';
import { joinGroupController } from '../../controllers/groups/joinGroup.js';
import { saveGroupMediaController, loadGroupMediaController } from '../../controllers/groups/media.js';

import { createGroupController } from '../../controllers/groups/createGroup.js';

import {
    getGroupInfoController,
    getUserCreatedGroupsController,
    getUserFollowedGroupsController,
    getUserFollowedGroupByIdController,
} from '../../controllers/groups/loadGroups.js';
import { joinGroupRequestController, loadJoinGroupRequestsController, rejectJoinGroupRequestController, acceptJoinGroupRequestController } from '../../controllers/groups/joinGroupRequests.js';

const groupsRouter = express.Router();

import upload from '../../middleware/multer.js';
import uploadToS3 from '../../middleware/multerForS3.js';

groupsRouter.post('/create', uploadToS3.fields([{name: 'coverImage', maxCount: 1}, {name: 'logo', maxCount: 1}]), createGroupController);
groupsRouter.post('/join', authMiddleWare, joinGroupController);
groupsRouter.post('/join/request', authMiddleWare, joinGroupRequestController);
groupsRouter.get('/info/:groupId', getGroupInfoController);
groupsRouter.get('/load/created/', authMiddleWare, getUserCreatedGroupsController);
groupsRouter.get('/load/followed', authMiddleWare, getUserFollowedGroupsController);
groupsRouter.post('/media/save/:groupId', uploadToS3.single('file'), saveGroupMediaController);
groupsRouter.get('/media/load/:groupId', loadGroupMediaController);
groupsRouter.get('/join/requests/:groupId', loadJoinGroupRequestsController);
groupsRouter.post('/join/requests/reject', authMiddleWare, rejectJoinGroupRequestController);
groupsRouter.post('/join/requests/accept', authMiddleWare, acceptJoinGroupRequestController);
groupsRouter.get('/load/followed/:groupId', authMiddleWare, getUserFollowedGroupByIdController);
   

export default groupsRouter;