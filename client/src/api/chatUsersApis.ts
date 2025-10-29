


export interface ChatUser {
    userId: string;
    chatUserId: string;
    chatUserName: string;
    chatUserAvatar?: string;
    timestamp?: string;
    isOnline?: boolean;
    unreadCount?: number;
    lastMessageTime?: string | null;
    lastMessage?: string | null;
}



export async function loadExistingChatUsers() {
    try{
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/users`, {
            credentials: "include",
        });
        return response.json();
    }
    catch(error){
        console.error(error);
        throw error;
    }
}


export async function addUserToChatStore(user: ChatUser) {
    try{
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/users`, {
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            method: "POST",
            body: JSON.stringify(user),
        });
        return response.json();
    }
    catch(error){
        console.error(error);
        throw error;
    }
}


export async function loadChatUserProfile(chatUserId: string) {
    try{
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat-users/load-chat-user-profile?chatUserId=${chatUserId}`, {
            credentials: "include",
        });
        return response.json();
    }
    catch(error){
        console.error(error);
        throw error;
    }
}