
"use client";

import { useState, useEffect } from 'react';
import UserList from './components/UserList';
import ChatWindow from './components/ChatWindow';
import { useSearchParams } from 'next/navigation';
import { useUserChatStore } from '@/app/context/userChatStore';
import type { ChatUser } from '@/app/context/userChatStore';
import { useUser } from '@/hooks/useAuth';
import { useMessageStore } from '@/app/context/userMessageStore';


export default function ChatPage() {
    const [selectedChatUser, setSelectedChatUser] = useState<string | null>(null);
    const [userLoaded, setUserLoaded] = useState(false)
    const searchParams = useSearchParams();
    const userId = searchParams.get('userId');
    const { loadUnreadMessages , unreadMessages} = useMessageStore();
    const user = useUser();
    const { 
        chatUsers, 
        error, 
        success, 
        isUserChatsLoaded, 
        loadUser, 
        loadExisitngChatUsers
        } = useUserChatStore();

    const handleUserSelect = (user: ChatUser) => {
        console.log("User selected", user.chatUserId);
        setSelectedChatUser(user.chatUserId);
    };

    useEffect(()=>
        {
            if(user?.id && isUserChatsLoaded==false){
                console.log("load existing chat users");
                loadExisitngChatUsers();
            }
        }, [user?.id, isUserChatsLoaded, loadExisitngChatUsers]);



    useEffect(() => {
        if(userId && userLoaded==false && isUserChatsLoaded==true){
            console.log( "we r loading individual user profile")
            loadUser(userId);
            setUserLoaded(true);
        };

     

        
    }, [userId, userLoaded, loadUser, isUserChatsLoaded]);

    useEffect(() => {
        if(user?.id){
            loadUnreadMessages();
        }
    }, [user?.id, loadUnreadMessages]);

    

    

    return (
        <div className="h-full w-full flex">
            <UserList 
                onUserSelect={handleUserSelect} 
                selectedUserId={selectedChatUser}
                chatUserList={chatUsers}
            />
            <ChatWindow selectedChatUser={selectedChatUser} />
        </div>
    );
}