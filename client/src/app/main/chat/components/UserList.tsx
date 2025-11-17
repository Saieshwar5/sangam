"use client";

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { FaSearch, FaEllipsisV, FaCheck, FaCheckDouble } from 'react-icons/fa';
import { ChatUser } from '@/app/context/userChatStore';

import { useMessageStore } from '@/app/context/userMessageStore';


interface UserListProps {
    onUserSelect: (user: ChatUser) => void;
    selectedUserId: string | null;
    chatUserList: ChatUser[];
}

export default function UserList({ onUserSelect, selectedUserId, chatUserList }: UserListProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const { unreadMessages } = useMessageStore();

    const unreadCountMap = useMemo(() => {
        const map = new Map<string, number>();
        unreadMessages.forEach(item => {
            map.set(item.senderId, item.count);
        });
        console.log("unreadCountMap ##########################################", map);
        return map;
    }, [unreadMessages]);

    useEffect(() => {
        console.log("unreadMessages ##########################################", unreadMessages);
    }, [unreadMessages]);


    // Filter users based on search term
    const filteredUsers = chatUserList.filter(user =>
        user.chatUserName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white border-r border-gray-200 flex flex-col h-full">
            {/* Header */}
            <div className=" hidden md:flex bg-teal-500 px-4 py-4 flex items-center justify-between">
                <h2 className="text-white font-semibold text-lg">Chats</h2>
                <button className="text-white hover:text-teal-100 transition-colors">
                    <FaEllipsisV className="text-lg" />
                </button>
            </div>

            {/* Search Bar */}
            <div className="hidden md:block px-4 py-3 bg-gray-50">
                <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform感激-y-1/2 text-gray-400 text-sm" />
                    <input
                        type="text"
                        placeholder="Search or start new chat"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-trans herman"
                    />
                </div>
            </div>

            {/* Users List */}
            <div className="flex-1 overflow-y-auto">
                {filteredUsers.map((user) => {
                    const unreadCount = unreadCountMap.get(user.chatUserId) || 0;
                    return (
                    <div
                        key={user.chatUserId}
                        onClick={() => onUserSelect(user)}
                        className={`px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors relative ${
                            selectedUserId === user.chatUserId ? 'bg-teal-50 border-r-4 border-r-teal-500' : ''
                        }`}
                    >
                        <div className="flex items-center space-x-3">
                            {/* Avatar */}
                            <div className="relative">
                                <img
                                    src={user.chatUserAvatar || '/default-avatar.png'}
                                    alt={user.chatUserName}
                                    className="w-10 h-10 rounded-full"
                                />
                                
                            </div>

                            {/* User Info */}
                            <div className="flex-1 min-w-0">
                                {/* Name and Timestamp Row */}
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                                        {user.chatUserName}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        {/* Unread Count Badge - Next to Timestamp */}
                                        {unreadCount > 0 && (
                                            <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                                                {unreadCount > 99 ? '99+' : unreadCount}
                                            </span>
                                        )}
                                        
                                    </div>
                                </div>
                                
                                {/* Last Message Preview */}
                                <div className="flex items-center mt-1">
                                    <p className="text-xs text-gray-500 truncate flex-1">
                                        {user.lastMessage || 'No messages yet'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
                })}
            </div>
        </div>
    );
}