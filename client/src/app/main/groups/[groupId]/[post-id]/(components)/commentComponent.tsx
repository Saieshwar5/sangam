"use client"

import { useState, useEffect } from 'react';
import { loadProfileFromServer } from '@/api/profileApis';

interface Reply {
    commentId: string;
    userId: string;
    userName: string;
    commentText: string;
    createdAt: string;
    replies?: Reply[];
}

interface CommentComponentProps {
    commentId: string;
    userId: string;
    userName: string;
    commentText: string;
    createdAt: string;
    replies?: Reply[];
    depth?: number;
    onReply: (parentCommentId: string, replyText: string) => void;
}

export default function CommentComponent({
    commentId,
    userId,
    userName,
    commentText,
    createdAt,
    replies = [],
    depth = 0,
    onReply
}: CommentComponentProps) {
    const [showReplyBox, setShowReplyBox] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [collapsed, setCollapsed] = useState(false);
    const [commentCreatorProfile, setCommentCreatorProfile] = useState<any>(null);
    const [isCommentCreatorProfileLoaded, setIsCommentCreatorProfileLoaded] = useState(false);
    useEffect(() => {
        const loadCommentCreatorProfile = async () => {
            const response = await loadProfileFromServer(userId);
            if(response.success){
                setCommentCreatorProfile(response.data);
                setIsCommentCreatorProfileLoaded(true);
            }
        }
        loadCommentCreatorProfile();
    }, [userId]);
    const handleReplySubmit = () => {
        if (replyText.trim()) {
            onReply(commentId, replyText);
            setReplyText('');
            setShowReplyBox(false);
        }
    };

    // Limit depth to prevent too much nesting
    const maxDepth = 5;
    const isMaxDepth = depth >= maxDepth;
    
    // Calculate left border and padding based on depth
    const leftBorderStyle = depth > 0 ? 'border-l-2 border-gray-300 pl-4' : '';

    return (
        <div className={`mb-3 ${leftBorderStyle}`}>
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                {/* Comment Header */}
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                        <img src={isCommentCreatorProfileLoaded ? commentCreatorProfile.profilePicture : '/default-avater.svg'} 
                        alt={isCommentCreatorProfileLoaded ? commentCreatorProfile.name : 'Unknown User'} 
                        className="w-7 h-7 rounded-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-gray-800 text-sm">{userName}</h4>
                            <span className="text-xs text-gray-400">•</span>
                            <p className="text-xs text-gray-500">
                                {new Date(createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </div>
                    {/* Collapse button if has replies */}
                    {replies.length > 0 && (
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
                        >
                            {collapsed ? `[+] ${replies.length}` : '[-]'}
                        </button>
                    )}
                </div>

                {/* Comment Text */}
                {!collapsed && (
                    <>
                        <p className="text-gray-700 text-sm mb-2 ml-9">{commentText}</p>

                        {/* Reply Button */}
                        {!isMaxDepth && (
                            <div className="ml-9 flex items-center gap-3">
                                <button
                                    onClick={() => setShowReplyBox(!showReplyBox)}
                                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                    </svg>
                                    Reply
                                </button>
                                {replies.length > 0 && (
                                    <span className="text-xs text-gray-400">
                                        {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Reply Input Box */}
                        {showReplyBox && (
                            <div className="ml-9 mt-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Write a reply..."
                                    className="w-full p-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    rows={2}
                                    autoFocus
                                />
                                <div className="flex gap-2 mt-2">
                                    <button
                                        onClick={handleReplySubmit}
                                        className="px-3 py-1 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 transition-colors"
                                    >
                                        Reply
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowReplyBox(false);
                                            setReplyText('');
                                        }}
                                        className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-lg hover:bg-gray-300 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Nested Replies - Reddit style with left border */}
            {!collapsed && replies.length > 0 && (
                <div className="mt-2">
                    {replies.map((reply) => (
                        <CommentComponent
                            key={reply.commentId}
                            commentId={reply.commentId}
                            userId={reply.userId}
                            userName={reply.userName}
                            commentText={reply.commentText}
                            createdAt={reply.createdAt}
                            replies={reply.replies}
                            depth={depth + 1}
                            onReply={onReply}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

