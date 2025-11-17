"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useUserAuthStore } from '@/app/context/userAuthStore';
import { useRouter } from 'next/navigation';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    notification:boolean;
    changeNotification:(notification: boolean) => void;
    privateChatRooms: Map<string, string>;
    setPrivateChatRoom:(roomId: string, userId: string) => void;
    getPrivateChatRoom:(userId: string) => string | undefined;
    removePrivateChatRoom:(userId: string) => void;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    notification: false,
    changeNotification: () => {},
    privateChatRooms: new Map(),
    setPrivateChatRoom: () => {},
    getPrivateChatRoom: () => undefined,
    removePrivateChatRoom: () => {},
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [privateChatRooms, setPrivateChatRooms] = useState<Map<string, string>>(new Map());
    const [notification, setNotification] = useState(false);
    const { user, isAuthenticated } = useUserAuthStore();
    const router = useRouter();

    const changeNotification = (notification: boolean) => {
        setNotification(notification);
    };



    const setPrivateChatRoom = (userId: string, roomId: string) => {
        setPrivateChatRooms(prev => {
            const newMap = new Map(prev);
            newMap.set(userId, roomId);
            console.log(`✅ Stored room for user ${userId}:`, roomId);
            return newMap;
        });
    };


    const getPrivateChatRoom = (userId: string): string | undefined => {
        return privateChatRooms.get(userId);
    };

    const removePrivateChatRoom = (userId: string) => {
        setPrivateChatRooms(prev => {
            const newMap = new Map(prev);
            newMap.delete(userId);
            console.log(`🗑️ Removed room for user ${userId}`);
            return newMap;
        });
    };

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

        socketInstance.on('chat-error', (data: { message: string; error: string }) => {
            console.error('❌ Chat error:', data.message);
            console.log('❌ Chat error:', data);
        });


        socketInstance.on('private-chat-request', (data: { fromUserId: string; roomId: string; timestamp: string }) => {
            console.log('🔔 Global: Incoming chat request from', data.fromUserId);
            
            // Auto-accept the chat (join the room)
            socketInstance.emit('accept-private-chat', { roomId: data.roomId });
            
            // ✅ Store room mapped to the user who initiated it
            setPrivateChatRoom(data.fromUserId, data.roomId);
            
            console.log('✅ Global: Auto-accepted chat request, room:', data.roomId);
        });

        socketInstance.on('private-message-notification', (data: { 
            fromUserId: string; 
            fromUserName: string; 
            message: string; 
            timestamp: string; 
            roomId: string 
        }) => {
            console.log('🔔 New message notification from', data.fromUserId);
            
            // Check if user is currently on chat page
            const isOnChatPage = window.location.pathname.includes('/main/chat');
            
            // Only increment if NOT on chat page or NOT viewing this specific user's chat
            const currentChatUserId = new URLSearchParams(window.location.search).get('userId');
            const isViewingThisChat = isOnChatPage && currentChatUserId === data.fromUserId;
            
            if (!isViewingThisChat) {
                setNotification(true);
            }
        });



        
    

        setSocket(socketInstance);

        return () => {
            socketInstance.close();
        };
    }, [user, isAuthenticated]);

    return (
        <SocketContext.Provider value={{ socket, isConnected, notification, privateChatRooms, setPrivateChatRoom, getPrivateChatRoom, removePrivateChatRoom, changeNotification }}>
            {children}
        </SocketContext.Provider>
    );
}


export const useNotification = () => {
    const { notification, changeNotification } = useSocket();
    return { notification, changeNotification };
};