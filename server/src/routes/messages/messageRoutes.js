import express from 'express';
import { 
    saveMessage, 
    getMessagesByRoom, 
    getMessagesBetweenUsers,
    markAsRead, 
    deleteMessage,
    getUnreadMessagesByReceiver,
    getUnreadCount,
    markSenderMessagesAsRead,
    getUnreadMessagesByRoom
} from '../../controllers/messageControllers.js';
import {authMiddleWare} from "../../middleware/authMiddleWare.js"

const messageRoutes = express.Router();

// All routes require authentication
messageRoutes.use(authMiddleWare);

// Save a new message
messageRoutes.post('/messages', saveMessage);

// Get messages for a room (private chat)
messageRoutes.get('/messages/room/:roomId', getMessagesByRoom);

// Get messages between two users
messageRoutes.get('/messages/between', getMessagesBetweenUsers);

// Mark messages as read
messageRoutes.put('/messages/mark-read', markAsRead);

// Delete a message
messageRoutes.delete('/messages/:messageId', deleteMessage);

// NEW ROUTES FOR UNREAD MESSAGES

// Get unread messages grouped by sender
messageRoutes.get('/unread-messages/', getUnreadMessagesByReceiver);

// Get total unread count for a user (quick endpoint)
messageRoutes.get('/unread-count', getUnreadCount);

// Mark all messages from a specific sender as read
messageRoutes.put('/mark-sender-read/:userId', markSenderMessagesAsRead);

// Get unread messages for a specific room
messageRoutes.get('/unread-by-room', getUnreadMessagesByRoom);

export default messageRoutes;