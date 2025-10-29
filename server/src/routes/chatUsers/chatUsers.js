import express from 'express';
import { loadExistingChatUsers, addUserToChatUsers, loadChatUserProfile } from '../../controllers/chatUsersControllers.js';
import { authMiddleWare } from '../../middleware/authMiddleWare.js';

const chatUsersRoutes = express.Router();

chatUsersRoutes.use(authMiddleWare);

chatUsersRoutes.get('/chat/users', loadExistingChatUsers);
chatUsersRoutes.post('/chat/users',addUserToChatUsers);
chatUsersRoutes.get('/chat-users/load-chat-user-profile', loadChatUserProfile);




export default chatUsersRoutes; 