"use client"

import { useState } from 'react';
import CommentComponent from './commentComponent';

interface Comment {
    commentId: string;
    userId: string;
    userName: string;
    commentText: string;
    createdAt: string;
    replies?: Comment[];
}

interface CommentsSectionProps {
    postId: string;
    comments: Comment[];
    onAddComment: (commentText: string) => void;
    onReplyToComment: (commentId: string, replyText: string) => void;
}

export default function CommentsSection({
    postId,
    comments,
    onAddComment,
    onReplyToComment
}: CommentsSectionProps) {
    const [showCommentBox, setShowCommentBox] = useState(false);
    const [commentText, setCommentText] = useState('');

    const handleSubmitComment = () => {
        if (commentText.trim()) {
            onAddComment(commentText);
            setCommentText('');
            setShowCommentBox(false);
        }
    };

    return (
        <div className="mt-6">
            {/* Comments Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                    Comments ({comments.length})
                </h2>
                <button
                    onClick={() => setShowCommentBox(!showCommentBox)}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    Add Comment
                </button>
            </div>

            {/* Add Comment Box */}
            {showCommentBox && (
                <div className="mb-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Write your comment..."
                        className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows={3}
                    />
                    <div className="flex gap-2 mt-3">
                        <button
                            onClick={handleSubmitComment}
                            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Post Comment
                        </button>
                        <button
                            onClick={() => {
                                setShowCommentBox(false);
                                setCommentText('');
                            }}
                            className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Comments List */}
            <div className="space-y-3">
                {comments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">No comments yet. Be the first to comment!</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <CommentComponent
                            key={comment.commentId}
                            commentId={comment.commentId}
                            userId={comment.userId}
                            userName={comment.userName}
                            commentText={comment.commentText}
                            createdAt={comment.createdAt}
                            replies={comment.replies || []}
                            depth={0}
                            onReply={onReplyToComment}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

