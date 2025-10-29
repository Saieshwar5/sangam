"use client";

import { useState } from 'react';
import Image from 'next/image';
import { FaSearch, FaEllipsisV, FaCheck, FaCheckDouble } from 'react-icons/fa';
import { ChatUser } from '@/app/context/userChatStore';

interface UserListProps {
    onUserSelect: (user: ChatUser) => void;
    selectedUserId: string | null;
    chatUserList: ChatUser[];
}

export default function UserList({ onUserSelect, selectedUserId, chatUserList }: UserListProps) {
    const [searchTerm, setSearchTerm] = useState('');

    // Filter users based on search term
    const filteredUsers = chatUserList.filter(user =>
        user.chatUserName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col h-full">
            {/* Header */}
            <div className="bg-teal-500 px-4 py-4 flex items-center justify-between">
                <h2 className="text-white font-semibold text-lg">Chats</h2>
                <button className="text-white hover:text-teal-100 transition-colors">
                    <FaEllipsisV className="text-lg" />
                </button>
            </div>

            {/* Search Bar */}
            <div className="px-4 py-3 bg-gray-50">
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
                {filteredUsers.map((user) => (
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
                                <Image
                                    src={user.chatUserAvatar || '/default-avatar.png'}
                                    alt={user.chatUserName}
                                    width={50}
                                    height={50}
                                    className="rounded-full"
                                />
                                {/* Online Status Indicator */}
                                {user.isOnline && (
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                )}
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
                                        {user.unreadCount && user.unreadCount > 0 && (
                                            <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                                                {user.unreadCount > 99 ? '99+' : user.unreadCount}
                                            </span>
                                        )}
                                        <span className="text-xs text-gray-500 whitespace-nowrap">
                                            {user.lastMessageTime}
                                        </span>
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
                ))}
            </div>
        </div>
    );
}