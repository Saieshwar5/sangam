import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import { verifyToken } from '../util/jwtUtils.js';

dotenv.config();

export function createSocketServer(httpServer)
{
    const io = new Server(httpServer,{
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:3000',
            methods: ['GET', 'POST'],
        },
    })

   io.use((socket, next)=> {
    const token = socket.handshake.auth.token;
    if(!token) {
        return next(new Error('Authentication error'));
    }
    try{
            const decoded = verifyToken(token);
            if(!decoded.success) {
                return next(new Error('Authentication error'));
            }
            socket.user = decoded.data;
            next();
        }
    catch(error) {
        return next(new Error('Authentication error'));
    }
    });
    return io;
}