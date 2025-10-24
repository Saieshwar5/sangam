"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { FaPaperPlane, FaPaperclip, FaSmile, FaEllipsisV } from 'react-icons/fa';
import MessageBubble from './MessageBubble';

interface User {
    id: string;
    name: string;
    avatar: string;
    isOnline: boolean;
    lastSeen?: string;
}

interface Message {
    id: string;
    text: string;
    timestamp: string;
    isSent: boolean;
    isRead: boolean;
}

interface ChatWindowProps {
    selectedUser: User | null;
}

export default function ChatWindow({ selectedUser }: ChatWindowProps) {
    const [newMessage, setNewMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Dummy messages for the selected user
    const dummyMessages: Record<string, Message[]> = {
        '1': [
            { id: '1', text: 'Hey! How are you doing today?', timestamp: '2:25 PM', isSent: false, isRead: true },
            { id: '2', text: 'I\'m doing great, thanks for asking! How about you?', timestamp: '2:26 PM', isSent: true, isRead: true },
            { id: '3', text: 'Pretty good! Just working on some projects', timestamp: '2:28 PM', isSent: false, isRead: true },
            { id: '4', text: 'That sounds interesting! What kind of projects?', timestamp: '2:30 PM', isSent: true, isRead: false },
        ],
        '2': [
            { id: '1', text: 'Thanks for helping me with the presentation!', timestamp: '1:10 PM', isSent: false, isRead: true },
            { id: '2', text: 'No problem at all! Happy to help', timestamp: '1:12 PM', isSent: true, isRead: true },
            { id: '3', text: 'Your tips really made a difference', timestamp: '1:15 PM', isSent: false, isRead: true },
        ],
        '3': [
            { id: '1', text: 'See you tomorrow at the meeting', timestamp: '12:40 PM', isSent: false, isRead: true },
            { id: '2', text: 'Perfect! Looking forward to it', timestamp: '12:45 PM', isSent: true, isRead: true },
        ],
        '4': [
            { id: '1', text: 'The meeting was really productive today', timestamp: '11:25 AM', isSent: false, isRead: true },
            { id: '2', text: 'I agree! Great discussion and decisions made', timestamp: '11:30 AM', isSent: true, isRead: true },
        ],
        '5': [
            { id: '1', text: 'Can you send me the project files?', timestamp: '10:15 AM', isSent: false, isRead: true },
            { id: '2', text: 'Sure! I\'ll send them over in a few minutes', timestamp: '10:20 AM', isSent: true, isRead: true },
        ],
        '6': [
            { id: '1', text: 'Perfect! Let me know when you\'re ready', timestamp: '9:10 AM', isSent: false, isRead: true },
            { id: '2', text: 'Will do! Thanks for your patience', timestamp: '9:15 AM', isSent: true, isRead: true },
        ]
    };

    useEffect(() => {
        if (selectedUser) {
            setMessages(dummyMessages[selectedUser.id] || []);
        }
    }, [selectedUser]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = () => {
        if (newMessage.trim() && selectedUser) {
            const message: Message = {
                id: Date.now().toString(),
                text: newMessage.trim(),
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isSent: true,
                isRead: false
            };
            setMessages([...messages, message]);
            setNewMessage('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (!selectedUser) {
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
        <div className="flex-1 flex flex-col bg-gray-50">
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <Image
                            src={selectedUser.avatar}
                            alt={selectedUser.name}
                            width={40}
                            height={40}
                            className="rounded-full"
                        />
                        {selectedUser.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{selectedUser.name}</h3>
                        <p className="text-sm text-gray-500">
                            {selectedUser.isOnline ? 'Online' : selectedUser.lastSeen || 'Offline'}
                        </p>
                    </div>
                </div>
                <button className="text-gray-500 hover:text-gray-700 transition-colors">
                    <FaEllipsisV className="text-lg" />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
                {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                ))}
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
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type a message..."
                            className="w-full px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                        <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors">
                            <FaSmile className="text-lg" />
                        </button>
                    </div>
                    <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="bg-teal-500 text-white p-2 rounded-full hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaPaperPlane className="text-lg" />
                    </button>
                </div>
            </div>
        </div>
    );
}
