
"use client";

import { useState, useEffect, Suspense } from 'react';
import UserList from './components/UserList';
import ChatWindow from './components/ChatWindow';
import { useSearchParams, usePathname } from 'next/navigation';
import { useUserChatStore } from '@/app/context/userChatStore';
import type { ChatUser } from '@/app/context/userChatStore';
import { useUser, useIsAuthenticated  } from '@/hooks/useAuth';
import { useMessageStore } from '@/app/context/userMessageStore';
import { useNotification } from '@/app/context/socketContext';


function ChatForm() {
    const [selectedChatUser, setSelectedChatUser] = useState<string | null>(null);
    const [userLoaded, setUserLoaded] = useState(false)
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const isIndexPage = pathname === "/main/chat";
    const userId = searchParams.get('userId');
    const { loadUnreadMessages , unreadMessages} = useMessageStore();
    const user = useUser();
    const isAuthenticated = useIsAuthenticated();
    const { notification, changeNotification } = useNotification();
    const { 
        chatUsers, 
        error, 
        success, 
        isUserChatsLoaded, 
        loadUser, 
        loadExisitngChatUsers
        } = useUserChatStore();

    const handleUserSelect = (chatUser: ChatUser) => {

        if (chatUser.chatUserId === user?.id) {
            console.warn('⚠️ Cannot chat with yourself');
            return;
        }

        console.log("User selected", chatUser.chatUserId);
        setSelectedChatUser(chatUser.chatUserId);
    };

    useEffect(()=>
        {
            if(user?.id && isUserChatsLoaded===false){
                console.log("load existing chat users");
                loadExisitngChatUsers();
            }
        }, [user?.id, isUserChatsLoaded, loadExisitngChatUsers]);

    



    useEffect(() => {
        if(userId && userLoaded==false && isUserChatsLoaded==true){
            console.log( "we r loading individual user profile for userId", userId);
            loadUser(userId, user?.id || '');
            setUserLoaded(true);
        };

     

        
    }, [userId, userLoaded, loadUser, isUserChatsLoaded]);

    useEffect(() => {
        if(user?.id){
            loadUnreadMessages();
        }
    }, [user?.id, loadUnreadMessages]);


    useEffect(() => {
        if(notification){
            changeNotification(false);
        }
    }, [notification, changeNotification]);

    

    

    return (
        <div className="h-full w-full flex flex-col md:flex-row">
            <div className={`h-full w-full ${isIndexPage ? 'block' : 'hidden'}  md:block md:basis-2/5`}>
            <UserList 
                onUserSelect={handleUserSelect} 
                selectedUserId={selectedChatUser}
                chatUserList={chatUsers}
            />
            </div>
            <div className={`h-full w-full ${isIndexPage ? 'hidden' : 'block'} md:block md:basis-3/5`}>
            <ChatWindow selectedChatUser={selectedChatUser} />
        </div>
        </div>
    );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatForm />
    </Suspense>
  );
}