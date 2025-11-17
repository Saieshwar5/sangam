import UsersMessages from '../models/usersMessagesOrm.js';
import { Op } from 'sequelize';
import ChatUsers from '../models/chatUsersOrm.js';


export const saveMessage = async (req, res) => {
    try {
        const { text, userId, sendTo, roomId, isRead = false, isSent = true , timestamp} = req.body;

        // Validate required fields
        if (!text || !userId || !sendTo) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: text, userId, and sendTo are required'
            });
        }

        if(!timestamp) {
            return res.status(400).json({
                success: false,
                message: 'Timestamp is required'
            });
        }

        // Generate unique messageId
        const messageId = `msg-${Date.now()}-${userId}-${Math.random().toString(36).substr(2, 9)}`;

        // Create message
        const message = await UsersMessages.create({
            userId,
            messageId,
            sendTo,
            roomId: roomId || null,
            text,
            isRead,
            isSent,
            timestamp: timestamp
        });

        res.status(201).json({
            success: true,
            message: 'Message saved successfully',
            data: message
        });
    } catch (error) {
        console.error('Error saving message:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save message',
            error: error.message
        });
    }
};

export const getMessagesByRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { limit = 50, offset = 0 } = req.query;

        if (!roomId) {
            return res.status(400).json({
                success: false,
                message: 'Room ID is required'
            });
        }

        // Get messages for this room
        const messages = await UsersMessages.findAll({
            where: { roomId },
            order: [['timestamp', 'ASC']], // Use createdAt from timestamps
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            message: 'Messages loaded successfully',
            data: messages,
            count: messages.length
        });
    } catch (error) {
        console.error('Error loading messages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load messages',
            error: error.message
        });
    }
};

export const getMessagesBetweenUsers = async (req, res) => {
    try {
        const { userId1, userId2 } = req.query;
        const { limit = 50, offset = 0 } = req.query;

        if (!userId1 || !userId2) {
            return res.status(400).json({
                success: false,
                message: 'Both userId1 and userId2 are required'
            });
        }

        // Get messages between two users (sender and receiver)
        const messages = await UsersMessages.findAll({
            where: {
                [Op.or]: [
                    { userId: userId1, sendTo: userId2 },
                    { userId: userId2, sendTo: userId1 }
                ]
            },
            order: [['createdAt', 'ASC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            message: 'Messages loaded successfully',
            data: messages,
            count: messages.length
        });
    } catch (error) {
        console.error('Error loading messages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load messages',
            error: error.message
        });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const { messageIds, roomId } = req.body;

        if (!messageIds || !Array.isArray(messageIds)) {
            return res.status(400).json({
                success: false,
                message: 'messageIds array is required'
            });
        }

        // Update messages as read
        await UsersMessages.update(
            { isRead: true },
            {
                where: {
                    id: messageIds,
                    ...(roomId && { roomId })
                }
            }
        );

        await ChatUsers.update(
            { unreadCount: 0 },
            {
                where: { chatUserId: messageIds[0].sendTo }
            }
        );

        res.json({
            success: true,
            message: 'Messages marked as read'
        });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark messages as read',
            error: error.message
        });
    }
};

export const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;

        if (!messageId) {
            return res.status(400).json({
                success: false,
                message: 'Message ID is required'
            });
        }

        const result = await UsersMessages.destroy({ 
            where: { id: messageId } 
        });

        if (result === 0) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        res.json({
            success: true,
            message: 'Message deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete message',
            error: error.message
        });
    }
};


// In messageControllers.js (around line 210)

export const getUnreadMessagesByReceiver = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        // Get all unread messages for this user
        const unreadMessages = await UsersMessages.findAll({
            where: {
                sendTo: userId,  // Messages sent TO this user
                isRead: false    // Only unread messages
            },
            order: [['timestamp', 'DESC']],
            attributes: [
                'id',
                'messageId',
                'userId',      // Sender's ID
                'sendTo',      // Receiver's ID (this userId)
                'text',
                'roomId',
                'timestamp',
                'isRead'
            ]
        });

        // ✅ GROUP BY SENDER (userId is the sender)
        const unreadBySender = {};
        
        unreadMessages.forEach(message => {
            const senderId = message.userId; // Sender's ID
            
            if (!unreadBySender[senderId]) {
                unreadBySender[senderId] = {
                    senderId: senderId,
                    count: 0,
                    unreadMessages: [],
                    latestMessage: message.text,
                    latestMessageTime: message.timestamp
                };
            }
            
            unreadBySender[senderId].count++;
            unreadBySender[senderId].unreadMessages.push(message);
            
            // Update latest message if this one is newer
            if (new Date(message.timestamp) > new Date(unreadBySender[senderId].latestMessageTime)) {
                unreadBySender[senderId].latestMessage = message.text;
                unreadBySender[senderId].latestMessageTime = message.timestamp;
            }
        });

        console.log("unreadBySender ##########################################", unreadBySender);

        // Convert to array
        const unreadBySenderArray = Object.values(unreadBySender);


        console.log("unreadBySenderArray ##########################################", unreadBySenderArray);
        
        // Calculate total
        const totalUnread = unreadMessages.length;

        res.json({
            success: true,
            message: 'Unread messages loaded successfully',
            data: {
                totalUnread ,
                unreadBySender: unreadBySenderArray,
                // For backward compatibility
                unreadMessages: unreadMessages
            }
        });
    } catch (error) {
        console.error('Error loading unread messages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load unread messages',
            error: error.message
        });
    }
};

/**
 * Get total unread count for a user
 * Optimized for quick response
 */
export const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        // Count unread messages
        const unreadCount = await UsersMessages.count({
            where: {
                sendTo: userId,
                isRead: false
            }
        });

        res.json({
            success: true,
            message: 'Unread count retrieved successfully',
            data: {
                userId,
                unreadCount
            }
        });
    } catch (error) {
        console.error('Error counting unread messages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to count unread messages',
            error: error.message
        });
    }
};

/**
 * Mark messages as read by sender
 * Marks all unread messages from a specific sender as read
 */
export const markSenderMessagesAsRead = async (req, res) => {
    try {
        const { userId } = req.params;  // Receiver's user ID
        const { senderId } = req.body;  // Sender's user ID

        if (!userId || !senderId) {
            return res.status(400).json({
                success: false,
                message: 'Both userId and senderId are required'
            });
        }

        // Mark all messages from this sender as read
        const result = await UsersMessages.update(
            { isRead: true },
            {
                where: {
                    sendTo: userId,
                    userId: senderId,  // Sent BY this sender
                    isRead: false      // Only unread ones
                }
            }
        );

        res.json({
            success: true,
            message: 'Messages marked as read',
            data: {
                updatedCount: result[0]
            }
        });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark messages as read',
            error: error.message
        });
    }
};

/**
 * Get unread messages for a specific room/conversation
 */
export const getUnreadMessagesByRoom = async (req, res) => {
    try {
        const { roomId, userId } = req.query;

        if (!roomId || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Both roomId and userId are required'
            });
        }

        const unreadMessages = await UsersMessages.findAll({
            where: {
                roomId,
                sendTo: userId,
                isRead: false
            },
            order: [['createdAt', 'ASC']],
            attributes: [
                'id',
                'messageId',
                'userId',
                'text',
                'createdAt'
            ]
        });

        res.json({
            success: true,
            message: 'Unread messages for room loaded successfully',
            data: {
                roomId,
                unreadCount: unreadMessages.length,
                messages: unreadMessages
            }
        });
    } catch (error) {
        console.error('Error loading unread messages for room:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load unread messages for room',
            error: error.message
        });
    }
};