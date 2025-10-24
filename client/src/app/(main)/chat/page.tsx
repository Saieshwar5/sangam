
"use client";

import { useState, useEffect } from 'react';
import UserList from './components/UserList';
import ChatWindow from './components/ChatWindow';
import { useSearchParams } from 'next/navigation';
import { useUserChatStore } from '@/app/context/userChatStore';



interface User {
    userId: string;
    userName: string;
    userAvatar: string;
    timestamp: string;
    isOnline: boolean;
}

export default function ChatPage() {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userLoaded, setUserLoaded] = useState(false)
    const searchParams = useSearchParams();
    const userId = searchParams.get('userId');

    const { users, error, success, isUserChatsLoaded, loadUser } = useUserChatStore();

    const handleUserSelect = (user: User) => {
        setSelectedUser(user);
    };

    useEffect(() => {
        if(userId && userLoaded==false){
            loadUser(userId);
        };

        setUserLoaded(true);

        
    }, []);

    return (
        <div className="h-full w-full flex">
            <UserList 
                onUserSelect={handleUserSelect} 
                selectedUserId={selectedUser?.userId}
                users={users}
            />
            <ChatWindow selectedUser={selectedUser} />
        </div>
    );
}