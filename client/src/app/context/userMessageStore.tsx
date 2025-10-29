import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { 
    saveMessageToServer, 
    loadMessagesFromServer,
    getUnreadMessages,
    getUnreadCount,
    markSenderMessagesAsRead,
    type UnreadBySender
} from "@/api/messageApis";

export interface Message {
    id?: string;
    messageId?: string;
    text: string;
    timestamp?: string;
    userId: string;
    sendTo: string;
    isRead: boolean;
    isSent: boolean;
    roomId?: string;

}

interface UnreadMessagesForEachChatUser {
    chatUserId: string;
    unreadMessages: Message[];
    unreadCount: number;
    
}



interface MessageState {
    // State
    messages: Record<string, Message[]>; // key: roomId, value: messages[]

    unreadMessages: UnreadMessagesForEachChatUser[];
    
    unreadCount: number;
    isLoadingUnread: boolean;
    isLoading: boolean;
    error: string | null;
    success: string | null;
    
    // Actions
    addMessage: (message: Message) => void;
    addMessages: (roomId: string, messages: Message[]) => void;
    clearMessages: (roomId: string) => void;
    getMessagesForRoom: (roomId: string) => Message[];

    loadUnreadMessages: () => Promise<void>;
    loadUnreadCount: (userId: string) => Promise<void>;
    markSenderAsRead: (userId: string, senderId: string) => Promise<void>;
    updateUnreadCount: (count: number) => void;
    clearUnreadMessages: () => void;
    
    // API Actions
    sendMessage: (messageData: Message) => Promise<void>;
    loadMessages: (roomId: string, limit?: number) => Promise<void>;
    
    // Setters
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setSuccess: (success: string | null) => void;
}

export const useMessageStore = create<MessageState>()(
    devtools(
    
            (set, get) => ({
                // Initial State
                messages: [],
                unreadMessages: [],
                unreadCount: 0,

                isLoadingUnread: false,
                isLoading: false,
                error: null,
                success: null,

                // Set loading state
                setLoading: (loading: boolean) => set({ isLoading: loading }),

                // Set error
                setError: (error: string | null) => set({ error }),

                // Set success
                setSuccess: (success: string | null) => set({ success }),

                // Add single message to a room
                addMessage: (message: Message) => {
                    const roomId = message.roomId || 'default';
                    const currentMessages = get().messages[roomId] || [];
                    
                    // ✅ PREVENT DUPLICATES
                    const isDuplicate = currentMessages.some(
                        m => m.messageId === message.messageId
                    );
                    
                    if (!isDuplicate) {
                        set({
                            messages: {
                                ...get().messages,
                                [roomId]: [...currentMessages, message]
                            }
                        });
                    }
                },

                // Add multiple messages to a room
                addMessages: (roomId: string, messages: Message[]) => {
                    const currentMessages = get().messages[roomId] || [];
                    
                    set({
                        messages: {
                            ...get().messages,
                            [roomId]: [...currentMessages, ...messages]
                        }
                    });
                },

                getMessagesForRoom: (roomId: string) => {
                    return get().messages[roomId] || [];
                },
    
                // Clear messages for a room
                clearMessages: (roomId: string) => {
                    const messages = { ...get().messages };
                    delete messages[roomId];
                    set({ messages });
                },

                // Send message to server
                sendMessage: async (messageData: Message) => {
                    try {
                        set({ isLoading: true, error: null });
                        
                        const response = await saveMessageToServer(messageData);
                        
                        if (response.success) {
                            set({ 
                                success: response.message || 'Message sent successfully',
                                isLoading: false 
                            });
                        } else {
                            set({ 
                                error: response.message || 'Failed to send message',
                                isLoading: false 
                            });
                        }
                    } catch (error) {
                        console.error('Error sending message:', error);
                        set({ 
                            error: (error as Error).message,
                            isLoading: false 
                        });
                    }
                },

                // Load messages from server
                loadMessages: async (roomId: string, limit = 50) => {
                    try {
                        set({ isLoading: true, error: null });
                        
                        const response = await loadMessagesFromServer(roomId, limit);
                        
                        if (response.success) {
                            const newMessages = response.data || [];
                            
                            // ✅ REPLACE messages for this room, don't append
                            set({
                                messages: {
                                    ...get().messages,
                                    [roomId]: newMessages
                                },
                                isLoading: false,
                                success: response.message || 'Messages loaded'
                            });
                        } else {
                            set({ 
                                error: response.message || 'Failed to load messages',
                                isLoading: false 
                            });
                        }
                    } catch (error) {
                        console.error('Error loading messages:', error);
                        set({ 
                            error: (error as Error).message,
                            isLoading: false 
                        });
                    }
                },

                 // ✅ NEW: Load unread messages from server
                 loadUnreadMessages: async () => {
                    try {
                        set({ isLoadingUnread: true, error: null });
                        
                        console.log("Loading unread messages from server");
                        const response = await getUnreadMessages();
                        
                        if (response.success) {

                            console.log("Unread messages:", response.data.unreadBySender);
                            set({
                                unreadMessages: response.data.unreadBySender,
                                unreadCount: response.data.totalUnread,
                                isLoadingUnread: false,
                                success: response.message || 'Unread messages loaded'
                            });
                        } else {
                            set({ 
                                error: response.message || 'Failed to load unread messages',
                                isLoadingUnread: false 
                            });
                        }
                    } catch (error) {
                        console.error('Error loading unread messages:', error);
                        set({ 
                            error: (error as Error).message,
                            isLoadingUnread: false 
                        });
                    }
                },

                // ✅ NEW: Load just the unread count (faster)
                loadUnreadCount: async () => {
                    try {
                        const response = await getUnreadCount();
                        
                        if (response.success) {
                            set({
                                unreadCount: response.data.unreadCount,
                                success: 'Unread count updated'
                            });
                        }
                    } catch (error) {
                        console.error('Error loading unread count:', error);
                    }
                },

                // ✅ NEW: Mark messages from a sender as read
                markSenderAsRead: async (userId: string, senderId: string) => {
                    try {
                        const response = await markSenderMessagesAsRead(userId, senderId);
                        
                        if (response.success) {
                            const sender = get().unreadMessages.find(u => u.chatUserId === senderId);
                            const countToRemove = sender ? sender.unreadCount : 0;
                            
                            set({ 
                                unreadCount: Math.max(0, get().unreadCount - countToRemove),
                                unreadMessages: get().unreadMessages.filter(u => u.chatUserId !== senderId),
                                success: response.message || 'Messages marked as read'
                            });
                        }
                    } catch (error) {
                        console.error('Error marking sender messages as read:', error);
                        set({ error: (error as Error).message });
                    }
                },
    
                updateUnreadCount: (count: number) => {
                    set({ unreadCount: count });
                },
    
                clearUnreadMessages: () => {
                    set({ 
                        unreadMessages: [],
                        unreadCount: 0
                    });
                },
            }),
        ),
        
    
);