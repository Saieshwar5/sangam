"use client";

import { FaCheck, FaCheckDouble } from 'react-icons/fa';

interface Message {
    id: string;
    text: string;
    timestamp: string;
    isSent: boolean;
    isRead: boolean;
}

interface MessageBubbleProps {
    message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
    return (
        <div className={`flex ${message.isSent ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                message.isSent 
                    ? 'bg-teal-500 text-white rounded-br-md' 
                    : 'bg-gray-200 text-gray-800 rounded-bl-md'
            }`}>
                <p className="text-sm">{message.text}</p>
                <div className={`flex items-center justify-end mt-1 ${
                    message.isSent ? 'text-teal-100' : 'text-gray-500'
                }`}>
                    <span className="text-xs">{message.timestamp}</span>
                    {message.isSent && (
                        <span className="ml-1">
                            {message.isRead ? (
                                <FaCheckDouble className="text-blue-300 text-xs" />
                            ) : (
                                <FaCheck className="text-xs" />
                            )}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
