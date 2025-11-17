import express from 'express';
import { loadExistingChatUsers, addUserToChatUsers, loadChatUserProfile } from '../../controllers/chatUsersControllers.js';
import { authMiddleWare } from '../../middleware/authMiddleWare.js';

const chatUsersRoutes = express.Router();

chatUsersRoutes.use(authMiddleWare);

chatUsersRoutes.get('/users', loadExistingChatUsers);
chatUsersRoutes.post('/users',addUserToChatUsers);
chatUsersRoutes.get('/load-chat-user-profile', loadChatUserProfile);




export default chatUsersRoutes; 