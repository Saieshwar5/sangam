"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useUserAuthStore } from '@/app/context/userAuthStore';
import { useRouter } from 'next/navigation';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    privateChatRoom: string | null;
    setPrivateChatRoom: (roomId: string | null) => void;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    privateChatRoom: null,
    setPrivateChatRoom: () => {},
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [privateChatRoom, setPrivateChatRoom] = useState<string | null>(null);
    const { user, isAuthenticated } = useUserAuthStore();
    const router = useRouter();
    useEffect(() => {
        // Only connect if user is authenticated
        if (!isAuthenticated || !user) {
            console.log('❌ User not authenticated, skipping socket connection');
            return;
        }

        // Connect with credentials to send cookies
        const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000', {
            // CRITICAL: This enables sending cookies
            withCredentials: true,
            
            // Auth can be empty since cookies will be sent automatically
            auth: {
                userId: user.id
            },
            
            // Transport options
            transports: ['websocket', 'polling'],
            
            // Reconnection settings
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            
            // Timeout settings
            timeout: 20000,
        });

        socketInstance.on('connect', () => {
            console.log('✅ Socket connected:', socketInstance.id);
            setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
            console.log('❌ Socket disconnected');
            setIsConnected(false);
        });

        socketInstance.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error.message);
        });

        socketInstance.on('error', (error) => {
            console.error('❌ Socket error event:', error);
        });

        socketInstance.on('connect-with-you',(data)=>
        {
                        
            const userId= data.userId
            setPrivateChatRoom(data.roomId)
            console.log("your idea working dude")
            router.push(`/chat?userId=${userId}`);
        })

    

        setSocket(socketInstance);

        return () => {
            socketInstance.close();
        };
    }, [user, isAuthenticated]);

    return (
        <SocketContext.Provider value={{ socket, isConnected, privateChatRoom, setPrivateChatRoom }}>
            {children}
        </SocketContext.Provider>
    );
}