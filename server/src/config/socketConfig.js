import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { verifyToken } from '../util/jwtUtils.js';

dotenv.config();

export function createSocketServer(httpServer)
{
    const io = new Server(httpServer,{
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true,  // CRITICAL: Allow credentials
        },
    })

   io.use((socket, next) => {
        try {
            // Try to get token from cookies (httpOnly cookie)
            const cookies = socket.handshake.headers.cookie;
            let token = null;
            
            if (cookies) {
                // Parse cookies to find auth_token
                const tokenMatch = cookies.match(/auth_token=([^;]+)/);
                if (tokenMatch) {
                    token = tokenMatch[1];
                }
            }
            
            // Fallback: Try auth object
            if (!token) {
                token = socket.handshake.auth.token;
            }
            
            if (!token) {
                console.error('❌ No token found in cookies or auth');
                return next(new Error('Authentication error: No token provided'));
            }
            
            // Verify token
            const decoded = verifyToken(token);
            
            if (!decoded.success) {
                console.error('❌ Token verification failed:', decoded.error);
                return next(new Error('Authentication error: Invalid token'));
            }
            
            socket.userId = decoded.data.userId || decoded.data.id;
            socket.userEmail = decoded.data.email || decoded.data.userEmail;
            
            // Join user-specific room
            socket.join(`user-${socket.userId}`);
            
            console.log(`✅ User authenticated: ${socket.userEmail} (${socket.userId})`);
            
            next();
            
        } catch (error) {
            console.error('❌ Socket auth error:', error);
            return next(new Error('Authentication error: ' + error.message));
        }
    });
    return io;
}