// server/src/services/socketService.js
import { createSocketServer } from '../config/socketConfig.js';
import { setupSocketHandlers } from '../handlers/socketHandlers.js';

class SocketService {
    constructor() {
        this.io = null;
    }

    initialize(httpServer) {
        this.io = createSocketServer(httpServer);
        setupSocketHandlers(this.io);
        
        console.log('🔌 Socket.IO server initialized');
        return this.io;
    }

    getIO() {
        return this.io;
    }

    // Utility methods for other parts of your app
    broadcastToGroup(groupId, event, data) {
        if (this.io) {
            this.io.to(`group-${groupId}`).emit(event, data);
        }
    }

    sendToUser(userId, event, data) {
        if (this.io) {
            this.io.to(`user-${userId}`).emit(event, data);
        }
    }

    getOnlineUsers() {
        if (!this.io) return [];
        
        const users = [];
        this.io.sockets.sockets.forEach((socket) => {
            users.push({
                userId: socket.userId,
                email: socket.userEmail,
                socketId: socket.id,
                userGroups: socket.userGroups || []
            });
        });
        return users;
    }
}

export const socketService = new SocketService();