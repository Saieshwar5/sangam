// server/src/controllers/chatUsersControllers.js

import ChatUser from '../models/chatUsersOrm.js';
import { Profile, User } from '../models/associations.js';
import { Op } from 'sequelize';

// server/src/controllers/chatUsersControllers.js

export const loadExistingChatUsers = async (req, res) => {
    const currentUserId = req.user.id;
    
    if(!currentUserId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    try {
        // Find all chat contacts for the current user
        const chatUsers = await ChatUser.findAll({
            where: {
                userId: currentUserId  // Where current user owns the chat list
            },
            include: [
                {
                    model: User,
                    as: 'contactUser',  // The contact's user data
                    attributes: ['id', 'userId', 'email'],
                    required: false,
                    include: [
                        {
                            model: Profile,
                            as: 'profile',  // Contact's profile
                            attributes: ['name', 'email', 'profilePicture', 'bio', 'profession', 'phoneNumber'],
                            required: false
                        }
                    ]
                }
            ],
            order: [['lastMessageTime', 'DESC']]
        });

        if(!chatUsers || chatUsers.length === 0) {
            return res.json({ 
                success: true, 
                message: 'No chat users found', 
                data: [] 
            });
        }

        const chatUsersWithProfile = chatUsers.map(chatUser => {
            return {
                chatUserId: chatUser.chatUserId,
                chatUserName: chatUser.chatUserName,
                chatUserAvatar: chatUser.profile?.profilePicture || '/default-avatar.png',
                timestamp: chatUser.timestamp,
                isOnline: chatUser.isOnline,
                unreadCount: chatUser.unreadCount,
                lastMessageTime: chatUser.lastMessageTime,
                lastMessage: chatUser.lastMessage,
            };
        });

        console.log("loading existing chat users ===============================================>", chatUsersWithProfile);

        res.json({ 
            success: true, 
            message: 'Chat users loaded successfully', 
            data: chatUsersWithProfile 
        });
    } catch (error) {
        console.error('Error loading chat users:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to load chat users', 
            error: error.message 
        });
    }
};



export const loadChatUserProfile = async (req, res) => {
    const chatUserId = req.query.chatUserId;
    const userId = req.user.id;
    if(!userId) {
        return res.status(401).json({ 
            success: false, 
            message: 'Unauthorized' 
        });
    }
    if(!chatUserId) {
        return res.status(400).json({ 
            success: false, 
            message: 'chatUserId is required' 
        });
    }

    try {
             const profile = await Profile.findOne({
                where: { userId: chatUserId }
             });
             if(!profile) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Profile not found' 
                });
             }

           const  finalProfile = {
                chatUserId: profile.userId,
                chatUserName: profile.name,
                chatUserAvatar: profile.profilePicture,
                timestamp: new Date().toISOString(),
                isOnline: false,
                unreadCount: 0,
                lastMessageTime: null,
                lastMessage: null
             }
             res.status(200).json({ 
                success: true, 
                message: 'Profile loaded successfully', 
                data: finalProfile 
             });
    } catch (error) {
        console.error('Error loading chat user profile:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to load chat user profile', 
            error: error.message 
        });
    }
};
// Load a specific chat user by their userId
export const loadChatUserById = async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.user.userId;
    
    if(!userId) {
        return res.status(400).json({ 
            success: false, 
            message: 'User ID is required' 
        });
    }
    
    try {
        const chatUser = await ChatUser.findOne({
            where: { userId },
            include: [
                {
                    model: Profile,
                    as: 'profile',
                    attributes: ['name', 'email', 'profilePicture', 'bio', 'profession', 'phoneNumber'],
                    required: false
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'userId', 'email'],
                    required: false
                }
            ]
        });
        
        if (!chatUser) {
            return res.status(404).json({ 
                success: false, 
                message: 'Chat user not found' 
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Chat user loaded successfully', 
            data: chatUser 
        });
    } catch (error) {
        console.error('Error loading chat user:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to load chat user', 
            error: error.message 
        });
    }
};

// Create or update a chat user
export const addUserToChatUsers = async (req, res) => {
    try {
        const { userId, chatUserId, chatUserName, isOnline, unreadCount, lastMessage, lastMessageTime } = req.body;
        if (!chatUserId || !chatUserName) {
            return res.status(400).json({ 
                success: false, 
                message: 'chatUserId and chatUserName are required' 
            });
        }
        
        // Use upsert to create or update
        const [chatUser, created] = await ChatUser.upsert({
            userId,
            chatUserId,
            chatUserName,
            isOnline: isOnline || false,
            unreadCount: unreadCount || 0,
            lastMessage: lastMessage || null,
            lastMessageTime: lastMessageTime || new Date(),
            timestamp: new Date().toISOString()
        }, {
            returning: true
        });

        if(!created) {
            return res.status(400).json({ 
                success: false, 
                message: 'Failed to add/update chat user' 
            });
        }

        console.log("adding user to opposite user chat store ===============================================>", chatUser);
        
        res.json({ 
            success: true, 
            message: created ? 'Chat user created successfully' : 'Chat user updated successfully',
            data: chatUser 
        });
    } catch (error) {
        console.error('Error adding/updating chat user:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to add/update chat user', 
            error: error.message 
        });
    }
};

// Update chat user's online status
export const updateChatUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { isOnline, unreadCount, lastMessage, lastMessageTime } = req.body;
        
        const updateData = {};
        if (isOnline !== undefined) updateData.isOnline = isOnline;
        if (unreadCount !== undefined) updateData.unreadCount = unreadCount;
        if (lastMessage !== undefined) updateData.lastMessage = lastMessage;
        if (lastMessageTime !== undefined) updateData.lastMessageTime = lastMessageTime;
        
        const [updatedCount] = await ChatUser.update(updateData, {
            where: { userId }
        });
        
        if (updatedCount === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Chat user not found' 
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Chat user status updated successfully' 
        });
    } catch (error) {
        console.error('Error updating chat user status:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update chat user status', 
            error: error.message 
        });
    }
};