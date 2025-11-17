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
} from '../../controllers/groups/loadGroups.js';


const groupsRouter = express.Router();

import upload from '../../middleware/multer.js';
import uploadToS3 from '../../middleware/multerForS3.js';

groupsRouter.post('/create', uploadToS3.fields([{name: 'coverImage', maxCount: 1}, {name: 'logo', maxCount: 1}]), createGroupController);
groupsRouter.post('/join', authMiddleWare, joinGroupController);
groupsRouter.get('/info/:groupId', getGroupInfoController);
groupsRouter.get('/load/created/', authMiddleWare, getUserCreatedGroupsController);
groupsRouter.get('/load/followed', authMiddleWare, getUserFollowedGroupsController);
groupsRouter.post('/media/save/:groupId', uploadToS3.single('file'), saveGroupMediaController);
groupsRouter.get('/media/load/:groupId', loadGroupMediaController);
   

export default groupsRouter;