"use client";

import { useState, useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { FaPaperPlane, FaPaperclip, FaSmile, FaEllipsisV } from 'react-icons/fa';
import MessageBubble from './MessageBubble';
import { useSocket } from '@/app/context/socketContext';
import { useUserAuthStore } from '@/app/context/userAuthStore';
import { useMessageStore, Message } from '@/app/context/userMessageStore';
import { ChatUser } from '@/app/context/userChatStore';
import { useUserChatStore } from '@/app/context/userChatStore';
import { useUserProfileStore } from '@/app/context/userProfileStore';


interface User {
    userId: string;
    userName: string;
    userAvatar: string;
    isOnline: boolean;
    lastSeen?: string;
}

interface ChatWindowProps {
    selectedChatUser: string | null;
}



export default function ChatWindow({ selectedChatUser: selectedChatUserId }: ChatWindowProps) {
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isUserOnline, setIsUserOnline] = useState(false);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const [isUserTyping, setIsUserTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    const { 
        messages, 
        addMessage, 
        sendMessage: saveMessageToDB, 
        isLoading, 
        error, 
        success, 
        loadMessages,
        markSenderAsRead,
        unreadMessages,
        loadUnreadMessages,
        getMessagesForRoom  // ✅ NEW
    } = useMessageStore();
    const { socket, isConnected, privateChatRooms, setPrivateChatRoom, getPrivateChatRoom, removePrivateChatRoom } = useSocket();
    const { user } = useUserAuthStore();
    
    const profile = useUserProfileStore(state => state.profile);
    const [hasLoadedHistory, setHasLoadedHistory] = useState(false); 
    // Get messages for current room

    const { chatUsers, 
        loadUser, 
        checkUserHasMessages, 
        addUserToChatStore, 
        addInChatUserChatStore,
        setUserOnlineStatus 
    } = useUserChatStore();

    


    const selectedChatUser = useMemo(() => {
        if (!selectedChatUserId) return null;
        return chatUsers.find(u => u.chatUserId === selectedChatUserId) || null;
    }, [selectedChatUserId, chatUsers]);



    const privateChatRoom = useMemo(() => selectedChatUser 
    ? getPrivateChatRoom(selectedChatUser.chatUserId) 
    : undefined, [selectedChatUser, getPrivateChatRoom, privateChatRooms]);

    console.log(" privateChatRoom ##########################################", privateChatRoom);

    const roomMessages = privateChatRoom ? getMessagesForRoom(privateChatRoom) : [];


    
    // ✅ Get unread messages from current sender
    const unreadFromSender = unreadMessages.find(u => u.chatUserId === selectedChatUser?.chatUserId);
    const unreadMessagesList = unreadFromSender?.unreadMessages || [];
    

    const sortedMessages = useMemo(() => {
        // Combine room messages and unread messages
        const allMessages = [...roomMessages, ...unreadMessagesList];
        
        // Remove duplicates based on messageId
        const uniqueMessages = Array.from(
            new Map(allMessages.map(msg => [msg.messageId, msg])).values()
        );
        
        // Sort by timestamp (oldest first)
        return uniqueMessages.sort((a, b) => {
            const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
            const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
            return timeA - timeB;
        });
    }, [roomMessages, unreadMessagesList]);



    useEffect(() => {
        if (!socket || !selectedChatUser || !user) return;

      {/*
        if (privateChatRoom) {
            console.log('Room already exists for user', selectedChatUser.chatUserId, ':', privateChatRoom);
            return;
        }
         */}

        console.log("Initializing private chat", selectedChatUser.chatUserId);
        
        // Check user online status
        socket.emit('check-user-online', { userId: selectedChatUser.chatUserId });

        // Initialize private chat


        console.log(" we r sending init-private-chat to server   **********")
        socket.emit('init-private-chat', {
            targetUserId: selectedChatUser.chatUserId
        });

        // Handle private chat started event
        const handlePrivateChatStarted = (data: { roomId: string, targetUserId: string }) => {
            console.log('Private chat started, room:', data.roomId);
            setPrivateChatRoom(data.targetUserId, data.roomId);
            socket.emit('accept-private-chat', { roomId: data.roomId });
        };

        // Handle private chat request event
        

        // Register listeners
        socket.on('private-chat-started', handlePrivateChatStarted);
        
        // Cleanup: Remove listeners and leave room
        return () => {
            socket.off('private-chat-started', handlePrivateChatStarted);
        
            
        };
    }, [socket, selectedChatUser, user, privateChatRoom]);


    useEffect(() => {
        if (privateChatRoom && !hasLoadedHistory) {
            console.log('Loading messages for room:', privateChatRoom);
            loadMessages(privateChatRoom);
            setHasLoadedHistory(true);
        }
    }, [privateChatRoom, hasLoadedHistory]);


    useEffect(() => {
        return () => {
            if (privateChatRoom && selectedChatUser) {
                socket?.emit('leave-private-chat', { roomId: privateChatRoom });
                console.log('Left room:', privateChatRoom);
            }
        };
    }, [privateChatRoom, selectedChatUser, socket]);

    useEffect(() => {
        if (selectedChatUser && user?.id && privateChatRoom) {
            markSenderAsRead(user.id, selectedChatUser.chatUserId);
        }
    }, [selectedChatUser, user?.id, privateChatRoom, markSenderAsRead]);
 

    // Listen for new messages
    useEffect(() => {
        if (!socket || !privateChatRoom) return;

        const handleNewMessage = (messageData: any) => {

            if (messageData.userId === user?.id) {
                console.log('Skipping own message from broadcast');
                return;
            }
            const isMessageFromCurrentUser = messageData.userId === user?.id;
            const sendToUserId = isMessageFromCurrentUser 
                ? (selectedChatUser?.chatUserId || '') 
                : (user?.id || '');


            console.log(" we are received message from user  ##########################################", messageData);
            
            addMessage({
                id: messageData.id,
                messageId: messageData.messageId,
                text: messageData.text,
                timestamp: messageData.timestamp,
                userId: messageData.userId,
                sendTo: sendToUserId,
                isRead: true,
                isSent: isMessageFromCurrentUser,
                roomId: privateChatRoom,
            });


        };

        socket.on('new-private-message', handleNewMessage);

        return () => {
            socket.off('new-private-message', handleNewMessage);
        };
    }, [socket, user, privateChatRoom, selectedChatUser, addMessage]);

    // Typing indicator
    useEffect(() => {
        if (!socket) return;

        socket.on('user-typing-indicator', (data: { userId: string; userName: string; isTyping: boolean }) => {
            if (data.userId !== user?.id) {
                if (data.isTyping) {
                    setTypingUsers(prev => [...new Set([...prev, data.userName])]);
                } else {
                    setTypingUsers(prev => prev.filter(name => name !== data.userName));
                }
            }
        });

        return () => {
            socket.off('user-typing-indicator');
        };
    }, [socket, user]);

   

    useEffect(() => {
        scrollToBottom();
    }, [sortedMessages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedChatUser || !socket) return;

        if (!privateChatRoom) {
            console.warn('⚠️ Cannot send message: Chat room not initialized yet');
            return;
        }

        if(selectedChatUser.lastMessage === null || selectedChatUser.lastMessage === undefined || selectedChatUser.lastMessage === ''){
            console.log("Adding user to chat store", selectedChatUser.chatUserId);

            socket.emit('check-user-online', { userId: selectedChatUser.chatUserId });
            addUserToChatStore({
                userId: user?.id || '' ,
                chatUserId: selectedChatUser.chatUserId,
                lastMessage: newMessage.trim(),
                isOnline: isUserOnline,
                unreadCount: 0,
                lastMessageTime: new Date().toISOString()
            });
            addInChatUserChatStore({
                userId: selectedChatUser.chatUserId ,
                chatUserId: user?.id || '',
                lastMessage: newMessage.trim(),
                lastMessageTime: new Date().toISOString(),
                isOnline: false,
                unreadCount: 0
                
            });
        }


    

        const message: Message = {
            text: newMessage.trim(),
            userId: user?.id || '',
            sendTo: selectedChatUser.chatUserId,
            isRead: false,
            isSent: true,
            roomId: privateChatRoom || ''
        };

        console.log("Adding message to store", message);

        // Add message to store (optimistic update)
        addMessage({
            ...message,
            id: Date.now().toString(),
            messageId: Date.now().toString(),
            timestamp: new Date().toISOString(),
        });
     
         console.log( " we r adding the message to the database ##########################################", message);
        // Save message to database
        await saveMessageToDB({
            ...message,
            timestamp: new Date().toISOString(),
        });

        // Send message via socket



        if(privateChatRoom && socket && selectedChatUser){
            console.log(" we r sending message through active socket    **********")
                        socket.emit('send-private-chat-message', {
                            roomId: privateChatRoom,
                            message: message.text,
                            targetUserId: selectedChatUser.chatUserId
                        });
             }
        setNewMessage('');
        setIsUserTyping(false);
        
        // Stop typing indicator
        socket.emit('private-chat-typing', {
            roomId: privateChatRoom,
            isTyping: false,
            targetUserId: selectedChatUser.chatUserId
        });
    };

    const handleTyping = () => {
        if (!socket || !privateChatRoom || !selectedChatUser) return;

        if (!isUserTyping) {
            setIsUserTyping(true);
            socket.emit('private-chat-typing', {
                roomId: privateChatRoom,
                isTyping: true,
                targetUserId: selectedChatUser.chatUserId
            });
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing
        typingTimeoutRef.current = setTimeout(() => {
            setIsUserTyping(false);
            socket.emit('private-chat-typing', {
                roomId: privateChatRoom,
                isTyping: false,
                targetUserId: selectedChatUser.chatUserId
            });
        }, 3000);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        } else {
            handleTyping();
        }
    };

    useEffect(() => {
        if (!socket) return;

        const handleUserOnlineStatus = (data: { userId: string; isOnline: boolean; timestamp: string }) => {
            console.log('User online status:', data);
            setIsUserOnline(data.isOnline);
           // setUserOnlineStatus(selectedChatUser?.chatUserId || '', data.isOnline);
        };

        socket.on('user-online-status', handleUserOnlineStatus);

        return () => {
            socket.off('user-online-status', handleUserOnlineStatus);
        };
    }, [socket]);



    if (!selectedChatUser) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a chat to start messaging</h3>
                    <p className="text-gray-500">Choose a conversation from the list to begin chatting</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <img
                            src={selectedChatUser.chatUserAvatar || ''}
                            alt={selectedChatUser.chatUserName}
                            className="w-10 h-10 rounded-full"
                        />
                        {isUserOnline && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                        {!isConnected && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{selectedChatUser.chatUserName}</h3>
                        <p className="text-sm text-gray-500">
                            {isUserOnline ? 'Online' : 'Offline'}
                        </p>
                    </div>
                </div>
                <button className="text-gray-500 hover:text-gray-700 transition-colors">
                    <FaEllipsisV className="text-lg" />
                </button>
            </div>

            {/* Unread Messages Banner */}
            {unreadFromSender && unreadFromSender.unreadCount > 0 && (
                <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 text-center">
                    <p className="text-sm text-blue-700 font-medium">
                        {unreadFromSender.unreadCount} new {unreadFromSender.unreadCount === 1 ? 'message' : 'messages'}
                    </p>
                    {unreadFromSender?.unreadMessages && unreadFromSender.unreadMessages.length > 0 && (
                        <p className="text-xs text-blue-500 mt-1">
                            Latest: {unreadFromSender.unreadMessages[0].text}
                        </p>
                    )}
                </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
                {sortedMessages.map((message) => (
                    <MessageBubble key={message.id || message.messageId} message={message} />
                ))}
                {typingUsers.length > 0 && (
                    <div className="text-sm text-gray-500 italic mb-4">
                        {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 px-4 py-3">
                <div className="flex items-center space-x-3">
                    <button className="text-gray-500 hover:text-gray-700 transition-colors">
                        <FaPaperclip className="text-lg" />
                    </button>
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => {
                                setNewMessage(e.target.value);
                                handleTyping();
                            }}
                            onKeyPress={handleKeyPress}
                            placeholder="Type a message..."
                            className="w-full px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            disabled={!isConnected}
                        />
                        <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors">
                            <FaSmile className="text-lg" />
                        </button>
                    </div>
                    <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || !isConnected}
                        className="bg-teal-500 text-white p-2 rounded-full hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaPaperPlane className="text-lg" />
                    </button>
                </div>
            </div>
        </div>
    );
}