// server/src/handlers/socketHandlers.js
import { getUsersInRoom } from '../util/socketUtils.js';
import { setupPrivateChatHandlers } from './privateChatHandlers.js';
export function setupSocketHandlers(io) {

    setupPrivateChatHandlers(io);
    io.on('connection', (socket) => {
        console.log(`✅ User ${socket.userEmail} connected with socket ${socket.id}`);

        // Handle joining a group room
        socket.on('join-group', async (data) => {
            await handleJoinGroup(socket, data);
        });

        // Handle leaving a group room
        socket.on('leave-group', (data) => {
            handleLeaveGroup(socket, data);
        });

        // Handle sending messages
        socket.on('send-message', async (data) => {
            await handleSendMessage(socket, data);
        });

        // Handle typing indicators
        socket.on('typing', (data) => {
            handleTyping(socket, data);
        });

        // Handle private messages
        socket.on('send-private-message', (data) => {
            handlePrivateMessage(socket, data);
        });

        // Handle user disconnect
        socket.on('disconnect', () => {
            handleDisconnect(socket);
        });
    });
}

// Handle joining a group
async function handleJoinGroup(socket, data) {
    const { groupId } = data;
    
    try {
        // Join the group room
        socket.join(`group-${groupId}`);
        
        // Store which groups the user is in
        socket.userGroups = socket.userGroups || [];
        if (!socket.userGroups.includes(groupId)) {
            socket.userGroups.push(groupId);
        }
        
        console.log(`✅ User ${socket.userEmail} joined group ${groupId}`);
        
        // Notify the user they successfully joined
        socket.emit('joined-group', { 
            groupId, 
            success: true,
            message: `Successfully joined group ${groupId}`
        });
        
        // Notify other users in the group
        socket.to(`group-${groupId}`).emit('user-joined', {
            userId: socket.userId,
            email: socket.userEmail,
            groupId: groupId,
            timestamp: new Date()
        });
        
        // Send current online users in the group
        const roomUsers = await getUsersInRoom(socket.io, `group-${groupId}`);
        socket.io.to(`group-${groupId}`).emit('online-users', roomUsers);
        
    } catch (error) {
        console.error('Error joining group:', error);
        socket.emit('join-error', { 
            message: 'Error joining group',
            groupId: groupId 
        });
    }
}

// Handle leaving a group
function handleLeaveGroup(socket, data) {
    const { groupId } = data;
    
    socket.leave(`group-${groupId}`);
    
    // Remove from user's groups list
    if (socket.userGroups) {
        socket.userGroups = socket.userGroups.filter(id => id !== groupId);
    }
    
    console.log(`❌ User ${socket.userEmail} left group ${groupId}`);
    
    // Notify other users in the group
    socket.to(`group-${groupId}`).emit('user-left', {
        userId: socket.userId,
        email: socket.userEmail,
        groupId: groupId,
        timestamp: new Date()
    });
    
    socket.emit('left-group', { 
        groupId, 
        success: true 
    });
}

// Handle sending messages
async function handleSendMessage(socket, data) {
    const { groupId, message, messageType = 'text' } = data;
    
    try {
        // Verify user is in the group room
        if (!socket.userGroups || !socket.userGroups.includes(groupId)) {
            socket.emit('message-error', { 
                message: 'You must join the group first',
                groupId: groupId 
            });
            return;
        }
        
        // Create message object
        const messageData = {
            id: `msg-${Date.now()}-${socket.userId}`,
            message: message,
            userId: socket.userId,
            userEmail: socket.userEmail,
            groupId: groupId,
            messageType: messageType,
            timestamp: new Date(),
            socketId: socket.id
        };
        
        // Broadcast message to all users in the group room
        socket.io.to(`group-${groupId}`).emit('new-message', messageData);
        
        console.log(`📨 Message sent to group ${groupId} by ${socket.userEmail}`);
        
    } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message-error', { 
            message: 'Error sending message',
            groupId: groupId 
        });
    }
}

// Handle typing indicators
function handleTyping(socket, data) {
    const { groupId, isTyping } = data;
    
    socket.to(`group-${groupId}`).emit('user-typing', {
        userId: socket.userId,
        email: socket.userEmail,
        groupId: groupId,
        isTyping: isTyping,
        timestamp: new Date()
    });
}

// Handle private messages
function handlePrivateMessage(socket, data) {
    const { targetUserId, message } = data;
    
    // Send to specific user
    socket.io.to(`user-${targetUserId}`).emit('private-message', {
        from: socket.userId,
        fromEmail: socket.userEmail,
        message: message,
        timestamp: new Date()
    });
}

// Handle user disconnect
function handleDisconnect(socket) {
    console.log(`❌ User ${socket.userEmail} disconnected`);
    
    // Notify all groups the user was in
    if (socket.userGroups) {
        socket.userGroups.forEach(groupId => {
            socket.to(`group-${groupId}`).emit('user-disconnected', {
                userId: socket.userId,
                email: socket.userEmail,
                groupId: groupId,
                timestamp: new Date()
            });
        });
    }
}