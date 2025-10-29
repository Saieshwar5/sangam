// server/src/handlers/privateChatHandlers.js

/**
 * Private Chat Socket Handlers
 * Handles all private messaging between individual users
 */

/**
 * Setup private chat event handlers
 * @param {io} io - Socket.IO server instance
 */
export function setupPrivateChatHandlers(io) {
    io.on('connection', (socket) => {
        console.log(`🔌 Private chat handler initialized for socket: ${socket.id}`);

        /**
         * Initialize a private chat between two users
         * Creates a room and notifies both users
         */
        socket.on('init-private-chat', async (data) => {
            try {
                const { targetUserId } = data;
                
                console.log(`📞 Init private chat request from ${socket.userId} to ${targetUserId}`);
                
                // Validate input
                if (!targetUserId) {
                    return socket.emit('chat-error', { 
                        message: 'Invalid user ID', 
                        error: 'TARGET_USER_ID_REQUIRED' 
                    });
                }

                // Don't allow users to chat with themselves
                if (socket.userId === targetUserId) {
                    return socket.emit('chat-error', { 
                        message: 'Cannot start chat with yourself', 
                        error: 'SELF_CHAT_NOT_ALLOWED' 
                    });
                }
                
                // Create a unique room ID by sorting user IDs
                // This ensures both users get the same room ID
                const roomId = [socket.userId, targetUserId].sort().join('-');
                const privateRoomName = `private-${roomId}`;
                
                // Join the private room
                socket.join(privateRoomName);
                console.log(`✅ User ${socket.userId} joined room: ${privateRoomName}`);



                socket.to(`user-${targetUserId}`).emit('connect-with-you', {
                    userId: socket.userId,
                    roomId: privateRoomName
                });
                // Notify the initiating user that chat started
                socket.emit('private-chat-started', { 
                    roomId: privateRoomName,
                    targetUserId: targetUserId
                });
                
                // Notify the target user that someone wants to chat
                socket.to(`user-${targetUserId}`).emit('private-chat-request', {
                    fromUserId: socket.userId,
                    roomId: privateRoomName,
                    timestamp: new Date().toISOString()
                });
                
                console.log(`💬 Private chat initialized between ${socket.userId} and ${targetUserId}`);
                
            } catch (error) {
                console.error('Error initializing private chat:', error);
                socket.emit('chat-error', { 
                    message: 'Failed to initialize chat', 
                    error: error.message 
                });
            }
        });

        /**
         * Accept a private chat request
         * User joins the private room
         */
        socket.on('accept-private-chat', async (data) => {
            try {
                const { roomId } = data;
                
                if (!roomId) {
                    return socket.emit('chat-error', { 
                        message: 'Room ID is required', 
                        error: 'ROOM_ID_REQUIRED' 
                    });
                }
                
                // Join the private room
                socket.join(roomId);
                
                // Notify all users in the room that someone joined
                io.to(roomId).emit('user-joined-private-chat', {
                    userId: socket.userId,
                    userName: socket.userEmail,
                    roomId: roomId,
                    timestamp: new Date().toISOString()
                });
                
                console.log(`✅ User ${socket.userId} joined private chat room: ${roomId}`);
                
                // Send acknowledgment back
                socket.emit('private-chat-accepted', {
                    roomId: roomId,
                    timestamp: new Date().toISOString()
                });
                
            } catch (error) {
                console.error('Error accepting private chat:', error);
                socket.emit('chat-error', { 
                    message: 'Failed to accept chat', 
                    error: error.message 
                });
            }
        });

        /**
         * Send a private message
         * Broadcasts message to all users in the private room
         */
        socket.on('send-private-chat-message', async (data) => {
            try {
                const { roomId, message, targetUserId } = data;
                
                console.log(`📨 Send message request in room: ${roomId}`);
                
                // Validate input
                if (!roomId || !message) {
                    return socket.emit('chat-error', { 
                        message: 'Missing required fields', 
                        error: 'MISSING_FIELDS' 
                    });
                }

                // Check if message is not empty after trimming
                if (!message.trim()) {
                    return socket.emit('chat-error', { 
                        message: 'Message cannot be empty', 
                        error: 'EMPTY_MESSAGE' 
                    });
                }
                
                // Create message data object
                const messageData = {
                    id: `msg-${Date.now()}-${socket.userId}-${Math.random().toString(36).substr(2, 9)}`,
                    messageId: `msg-${Date.now()}-${socket.userId}`,
                    text: message.trim(),
                    timestamp: new Date().toISOString(),
                    userId: socket.userId,
                    userName: socket.userEmail,
                    userAvatar: "/default-avatar.png",
                    isRead: false,
                    isSent: false // This will be determined on client side
                };
                
                // ✅ CRITICAL FIX: Auto-join target user to room if they're not already in it
                if (targetUserId) {
                    const targetSocket = Array.from(io.sockets.sockets.values())
                        .find(s => s.userId === targetUserId);
                    
                    if (targetSocket) {
                        // Check if target user is in the room
                        const room = io.sockets.adapter.rooms.get(roomId);
                        const isTargetInRoom = room && room.has(targetSocket.id);
                        
                        if (!isTargetInRoom) {
                            // Auto-join target user to the room
                            targetSocket.join(roomId);
                            console.log(`✅ Auto-joined user ${targetUserId} to room ${roomId}`);
                            
                            // Notify target user they can now see this chat
                            targetSocket.emit('private-chat-auto-joined', {
                                roomId: roomId,
                                fromUserId: socket.userId,
                                fromUserName: socket.userEmail,
                                firstMessage: messageData
                            });
                        }
                    }
                }
                
                // Send message to all users in the private room (including auto-joined user)
                io.to(roomId).emit('new-private-message', messageData);
                
                console.log(`📨 Private message sent in room ${roomId} by ${socket.userEmail}`);
                
                // Send notification to target user's personal socket
                if (targetUserId) {
                    socket.to(`user-${targetUserId}`).emit('private-message-notification', {
                        fromUserId: socket.userId,
                        fromUserName: socket.userEmail,
                        message: message.trim().substring(0, 50) + (message.length > 50 ? '...' : ''),
                        timestamp: messageData.timestamp,
                        roomId: roomId
                    });
                }
                
                // Send acknowledgment back to sender
                socket.emit('message-sent', {
                    messageId: messageData.messageId,
                    timestamp: messageData.timestamp
                });
                
            } catch (error) {
                console.error('Error sending private message:', error);
                socket.emit('chat-error', { 
                    message: 'Failed to send message', 
                    error: error.message 
                });
            }
        });

        /**
         * Handle typing indicator
         * Notifies other users in the room when someone is typing
         */
        socket.on('private-chat-typing', (data) => {
            try {
                const { roomId, isTyping, targetUserId } = data;
                
                if (!roomId) {
                    return socket.emit('chat-error', { 
                        message: 'Room ID is required', 
                        error: 'ROOM_ID_REQUIRED' 
                    });
                }
                
                // Broadcast typing status to all other users in the room
                socket.to(roomId).emit('user-typing-indicator', {
                    userId: socket.userId,
                    userName: socket.userEmail,
                    isTyping: isTyping,
                    timestamp: new Date().toISOString()
                });
                
                console.log(`⌨️ User ${socket.userId} is ${isTyping ? 'typing' : 'not typing'} in room ${roomId}`);
                
            } catch (error) {
                console.error('Error handling typing indicator:', error);
            }
        });

        /**
         * Mark a message as read
         * Notifies the sender that their message was read
         */
        socket.on('mark-message-read', (data) => {
            try {
                const { messageId, roomId } = data;
                
                if (!messageId || !roomId) {
                    return socket.emit('chat-error', { 
                        message: 'Message ID and Room ID are required', 
                        error: 'MISSING_FIELDS' 
                    });
                }
                
                // Broadcast read receipt to all users in the room
                io.to(roomId).emit('message-read', {
                    messageId: messageId,
                    readBy: socket.userId,
                    readByName: socket.userEmail,
                    timestamp: new Date().toISOString()
                });
                
                console.log(`✓✓ Message ${messageId} marked as read by ${socket.userId}`);
                
            } catch (error) {
                console.error('Error marking message as read:', error);
            }
        });

        /**
         * Check if a user is online
         * Returns the online status of a specific user
         */
        socket.on('check-user-online', (data) => {
            try {
                const { userId } = data;
                
                if (!userId) {
                    return socket.emit('chat-error', { 
                        message: 'User ID is required', 
                        error: 'USER_ID_REQUIRED' 
                    });
                }
                
                // Find the socket for the target user
                const userSocket = Array.from(io.sockets.sockets.values())
                    .find(s => s.userId === userId);
                
                const isOnline = !!userSocket;
                
                console.log(`🔍 User ${userId} is ${isOnline ? 'online' : 'offline'}`);
                
                // Send status back to requester
                socket.emit('user-online-status', {
                    userId: userId,
                    isOnline: isOnline,
                    timestamp: new Date().toISOString()
                });
                
            } catch (error) {
                console.error('Error checking user online status:', error);
            }
        });

        /**
         * Leave a private chat room
         * Remove user from the private room
         */
        socket.on('leave-private-chat', (data) => {
            try {
                const { roomId } = data;
                
                if (!roomId) {
                    return socket.emit('chat-error', { 
                        message: 'Room ID is required', 
                        error: 'ROOM_ID_REQUIRED' 
                    });
                }
                
                // Leave the room
                socket.leave(roomId);
                
                // Notify other users in the room
                socket.to(roomId).emit('user-left-private-chat', {
                    userId: socket.userId,
                    userName: socket.userEmail,
                    roomId: roomId,
                    timestamp: new Date().toISOString()
                });
                
                console.log(`❌ User ${socket.userId} left private chat room: ${roomId}`);
                
            } catch (error) {
                console.error('Error leaving private chat:', error);
            }
        });

        /**
         * Get chat history (optional - for loading previous messages)
         */
        socket.on('request-chat-history', async (data) => {
            try {
                const { roomId, limit = 50 } = data;
                
                if (!roomId) {
                    return socket.emit('chat-error', { 
                        message: 'Room ID is required', 
                        error: 'ROOM_ID_REQUIRED' 
                    });
                }
                
                // TODO: Fetch chat history from database
                // For now, send empty array
                socket.emit('chat-history', {
                    roomId: roomId,
                    messages: [],
                    hasMore: false
                });
                
                console.log(`📜 Chat history requested for room ${roomId}`);
                
            } catch (error) {
                console.error('Error fetching chat history:', error);
            }
        });
    });
}