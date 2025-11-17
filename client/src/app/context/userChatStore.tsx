import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { loadProfileFromServer } from "@/api/profileApis";
import { addUserToChatStore, loadExistingChatUsers, loadChatUserProfile } from "@/api/chatUsersApis";




export interface ChatUser {
    userId: string;
    chatUserId: string;
    chatUserName?: string;
    chatUserAvatar?: string;
    timestamp?: string;
    isOnline?: boolean;
    unreadCount?: number;
    lastMessageTime?: string | null;
    lastMessage?: string | null;
}



interface UserChatStore{
    chatUsers: ChatUser[];
    error: string | null;
    success: string | null;
    setError: (error: string | null) => void;
    setSuccess: (success: string | null) => void;
    isUserChatsLoaded: boolean;
    setIsUserChatsLoaded: (isUserChatsLoaded: boolean) => void;
    loadUser: (userId: string) => Promise<void>;
    addUserToChatStore: (chatUser: ChatUser) => Promise<void>;
    loadExisitngChatUsers: () => Promise<void>;
    checkUserHasMessages: (chatUserId: string) => boolean;
    addInChatUserChatStore: (chatUser: ChatUser) => Promise<void>;
    setUserOnlineStatus: (chatUserId: string, isOnline: boolean) => void;
}


export const useUserChatStore= create<UserChatStore>()(
    devtools(
        (set, get) => ({
            chatUsers: [],
            error: null,
            success: null,
            isUserChatsLoaded: false,
            setError: (error: string | null) => set({ error }),
            setSuccess: (success: string | null) => set({ success }),
            setIsUserChatsLoaded: (isUserChatsLoaded: boolean) => set({ isUserChatsLoaded }),
            loadUser: async (chatUserId: string) => {
               
                   // set({ isUserChatsLoaded: false });
                    set({ error: null });
                    set({ success: null });
                    try{

                        console.log("Loading user profile from server", chatUserId);
                    const response = await loadChatUserProfile(chatUserId);
                    if(response.success) {
                        const user = response.data;
                        const chatUser = {
                            userId: user.userId || '',
                            chatUserId: user.chatUserId,
                            chatUserName: user.chatUserName,
                            chatUserAvatar: user.chatUserAvatar,
                            timestamp:  new Date().toISOString(),
                            isOnline: false,
                            unreadCount: 0,
                            lastMessageTime: null,
                            lastMessage: null,
                        };
                
                        // ✅ FIX: Remove duplicates using Set
                        const currentUsers = get().chatUsers;
                        const uniqueUsers = Array.from(
                            new Map([...currentUsers, chatUser].map(u => [u.chatUserId, u])).values()
                        );
                        
                        set({ chatUsers: uniqueUsers });
                      //  set({ isUserChatsLoaded: true });
                        set({ success: response.message });
                    }
                    else{
                        set({ error: response.message });
                    }
                }
                catch(error){
                    console.error(error);
                    set({ error: (error as Error).message });
                    } finally{
                        //set({ isUserChatsLoaded: true });
                    }
            },

            addUserToChatStore: async (chatUser: ChatUser) => {
                try{
                    const response = await addUserToChatStore(chatUser);
                    if(response.success){
                        set({ success: response.message });
                        const user = response.data;
                        console.log("Adding user to chat store", user);
                        const chatUser = {
                            userId: user.userId || '',
                            chatUserId: user.chatUserId,
                            chatUserName: user.chatUserName,
                            chatUserAvatar: user.chatUserAvatar || '',
                            timestamp: user.timestamp,
                            isOnline: user.isOnline,
                            unreadCount: user.unreadCount,
                            lastMessageTime: user.lastMessageTime,
                            lastMessage: user.lastMessage,
                        };
                        const currentUsers = get().chatUsers;
                        console.log('🟡 Current users before merge:', currentUsers);
                        const uniqueUsers = Array.from(
                            new Map([...currentUsers, chatUser].map(u => [u.chatUserId, u])).values()
                        );
                        console.log('🟣 Unique users after merge:', uniqueUsers);
                        set({ chatUsers: uniqueUsers });
                        console.log('🔴 AFTER setState - users:', get().chatUsers.length);
                       // set({ isUserChatsLoaded: true });
                        set({ success: response.message });
                    }
                    else{
                        set({ error: response.message });
                    }
                }
                catch(error){
                    console.error(error);
                    set({ error: (error as Error).message });
                }
            },

            loadExisitngChatUsers: async () => {
                try{
                    set({ isUserChatsLoaded: false });
                    set({ error: null });
                    set({ success: null });
                    const response = await loadExistingChatUsers();
                if(response.success){
                    console.log("Loading existing chat users", response.data);
                    set({ chatUsers: response.data });
                    set({ isUserChatsLoaded: true });
                    set({ success: response.message });
                }
                else{
                    set({ error: response.message });
                }
            }
            catch(error){
                console.error(error);
                set({ error: (error as Error).message });
            }

            finally{
                set({ isUserChatsLoaded: true });
            }
        },


        checkUserHasMessages: (chatUserId: string) => {
            try{
                const chatUsers = get().chatUsers;
                const chatUser = chatUsers.find(user => user.chatUserId === chatUserId);
                if(chatUser){
                    return chatUser.lastMessage !== null;
                }
                return false;
            }
            catch(error){
                console.error(error);
                return false;
            }
        },

        addInChatUserChatStore: async (chatUser: ChatUser) => {
            try{
                const response = await addUserToChatStore(chatUser);
                if(response.success){
                    console.log("adding user to opposite user chat store", response.data);
                    set({ success: response.message });
                }
                else{
                    set({ error: response.message });
                }
                
            }
            catch(error){
                console.error(error);
                set({ error: (error as Error).message });
            }
        },

        setUserOnlineStatus: (chatUserId: string, isOnline: boolean) => {
            set(state => ({
                chatUsers: state.chatUsers.map(user => 
                    user.chatUserId === chatUserId 
                        ? { ...user, isOnline } 
                        : user
                )
            }));
        }
        })
    )
)
