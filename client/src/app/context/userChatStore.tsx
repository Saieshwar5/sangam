import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { loadProfileFromServer } from "@/api/profileApis";




interface ChatUser {
    userId: string;
    userName: string;
    userAvatar: string;
    timestamp: string;
    isOnline: boolean;
   
   
}


interface UserChatStore{
    users: ChatUser[];
    error: string | null;
    success: string | null;
    setError: (error: string | null) => void;
    setSuccess: (success: string | null) => void;
    isUserChatsLoaded: boolean;
    setIsUserChatsLoaded: (isUserChatsLoaded: boolean) => void;
    loadUser: (userId: string) => Promise<void>;
}


export const useUserChatStore= create<UserChatStore>()(
    devtools(
        (set, get) => ({
            users: [],
            error: null,
            success: null,
            isUserChatsLoaded: false,
            setError: (error: string | null) => set({ error }),
            setSuccess: (success: string | null) => set({ success }),
            setIsUserChatsLoaded: (isUserChatsLoaded: boolean) => set({ isUserChatsLoaded }),
            loadUser: async (userId: string) => {
               
                    set({ isUserChatsLoaded: false });
                    set({ error: null });
                    set({ success: null });
                    try{

                        console.log("Loading user profile from server", userId);
                    const response = await loadProfileFromServer(userId);
                    if(response.success){

                        const user = response.data;
                        const userChat = {
                            userId: user.userId,
                            userName: user.name,
                            userAvatar: "/default-avatar.png",
                            timestamp: "2.30 PM",
                            isOnline: false,
                        }

                        set({ users: [...get().users, userChat] });
                        set({ isUserChatsLoaded: true });
                        set({ success: response.message });
                    }
                    else{
                        set({ error: response.message });
                    }
                }
                catch(error){
                    console.error(error);
                    set({ error: error.message });
                } finally{
                    set({ isUserChatsLoaded: true });
                }
            }

            
        })
    )
)
