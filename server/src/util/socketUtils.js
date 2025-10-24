// server/src/utils/socketUtils.js

export async function getUsersInRoom(io, roomName) {
    const room = io.sockets.adapter.rooms.get(roomName);
    if (!room) return [];
    
    const users = [];
    for (const socketId of room) {
        const socket = io.sockets.sockets.get(socketId);
        if (socket) {
            users.push({
                userId: socket.userId,
                email: socket.userEmail,
                socketId: socket.id
            });
        }
    }
    return users;
}

export function getOnlineUsers(io) {
    const users = [];
    io.sockets.sockets.forEach((socket) => {
        users.push({
            userId: socket.userId,
            email: socket.userEmail,
            socketId: socket.id,
            userGroups: socket.userGroups || []
        });
    });
    return users;
}

export function broadcastToGroup(io, groupId, event, data) {
    io.to(`group-${groupId}`).emit(event, data);
}

export function sendToUser(io, userId, event, data) {
    io.to(`user-${userId}`).emit(event, data);
}