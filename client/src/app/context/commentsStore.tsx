import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { getPostComments, addComment, addReply } from '@/api/commentsApis';

interface Reply {
    commentId: string;
    userId: string;
    userName: string;
    commentText: string;
    createdAt: string;
    updatedAt: string;
    replies?: Reply[];
}

interface Comment {
    commentId: string;
    postId: string;
    userId: string;
    userName: string;
    commentText: string;
    createdAt: string;
    updatedAt: string;
    replies?: Reply[];
}

interface CommentsStore {
    // State
    commentsByPost: Record<string, Comment[]>;
    loading: boolean;
    error: string | null;
    success: string | null;

    // Actions
    loadCommentsForPost: (postId: string) => Promise<boolean>;
    addCommentToPost: (postId: string, commentText: string, userId: string, userName: string) => Promise<boolean>;
    addReplyToComment: (postId: string, parentCommentId: string, replyText: string, userId: string, userName: string) => Promise<boolean>;
    getCommentsForPost: (postId: string) => Comment[];
    clearError: () => void;
    clearSuccess: () => void;
}

export const useCommentsStore = create<CommentsStore>()(
    devtools(
        (set, get) => ({
            // Initial state
            commentsByPost: {},
            loading: false,
            error: null,
            success: null,

            // Load comments for a specific post
            loadCommentsForPost: async (postId: string) => {
                set({ loading: true, error: null, success: null });
                try {
                    const response = await getPostComments(postId);
                    
                    if (response.success) {
                        set((state) => ({
                            commentsByPost: {
                                ...state.commentsByPost,
                                [postId]: response.data
                            },
                            loading: false,
                            success: 'Comments loaded successfully'
                        }));
                        return true;
                    } else {
                        set({ 
                            loading: false, 
                            error: response.message || 'Failed to load comments' 
                        });
                        return false;
                    }
                } catch (error) {
                    set({ 
                        loading: false, 
                        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
                    });
                    return false;
                }
            },

            // Add a new comment to a post
            addCommentToPost: async (postId: string, commentText: string, userId: string, userName: string) => {
                set({ loading: true, error: null, success: null });
                try {

                    console.log('Adding comment to post:', postId, commentText, userId, userName);
                    const response = await addComment(postId, commentText, userId);

                    if (response.success) {
                        const newComment: Comment = {
                            commentId: response.data.commentId || `comment-${Date.now()}`,
                            postId,
                            userId,
                            userName,
                            commentText,
                            createdAt: response.data.createdAt || new Date().toISOString(),
                            updatedAt: response.data.updatedAt || new Date().toISOString(),
                            replies: []
                        };

                        set((state) => ({
                            commentsByPost: {
                                ...state.commentsByPost,
                                [postId]: [...(state.commentsByPost[postId] || []), newComment]
                            },
                            loading: false,
                            success: 'Comment added successfully'
                        }));
                        return true;
                    } else {
                        set({ 
                            loading: false, 
                            error: response.message || 'Failed to add comment' 
                        });
                        return false;
                    }
                } catch (error) {
                    // Optimistic update for local testing
                    const newComment: Comment = {
                        commentId: `comment-${Date.now()}`,
                        postId,
                        userId,
                        userName,
                        commentText,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        replies: []
                    };

                    set((state) => ({
                        commentsByPost: {
                            ...state.commentsByPost,
                            [postId]: [...(state.commentsByPost[postId] || []), newComment]
                        },
                        loading: false,
                        success: 'Comment added (local)'
                    }));
                    console.warn('Comment added locally (API not available):', error);
                    return true;
                }
            },

            // Add a reply to a comment (nested)
            addReplyToComment: async (postId: string, parentCommentId: string, replyText: string, userId: string, userName: string) => {
                set({ loading: true, error: null, success: null });
                try {
                    const response = await addReply(postId, parentCommentId, replyText, userId);

                    const newReply: Reply = {
                        commentId: response.data?.commentId || `reply-${Date.now()}`,
                        userId,
                        userName,
                        commentText: replyText,
                        createdAt: response.data?.createdAt || new Date().toISOString(),
                        updatedAt: response.data?.updatedAt || new Date().toISOString(),
                        replies: []
                    };

                    // Recursive function to add reply to the correct parent
                    const addReplyToComment = (comments: Comment[]): Comment[] => {
                        return comments.map(comment => {
                            if (comment.commentId === parentCommentId) {
                                return {
                                    ...comment,
                                    replies: [...(comment.replies || []), newReply]
                                };
                            }
                            if (comment.replies && comment.replies.length > 0) {
                                return {
                                    ...comment,
                                    replies: addReplyToComment(comment.replies as Comment[])
                                };
                            }
                            return comment;
                        });
                    };

                    set((state) => ({
                        commentsByPost: {
                            ...state.commentsByPost,
                            [postId]: addReplyToComment(state.commentsByPost[postId] || [])
                        },
                        loading: false,
                        success: response.success ? 'Reply added successfully' : 'Reply added (local)'
                    }));
                    return true;
                } catch (error) {
                    // Optimistic update for local testing
                    const newReply: Reply = {
                        commentId: `reply-${Date.now()}`,
                        userId,
                        userName,
                        commentText: replyText,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        replies: []
                    };

                    const addReplyToComment = (comments: Comment[]): Comment[] => {
                        return comments.map(comment => {
                            if (comment.commentId === parentCommentId) {
                                return {
                                    ...comment,
                                    replies: [...(comment.replies || []), newReply]
                                };
                            }
                            if (comment.replies && comment.replies.length > 0) {
                                return {
                                    ...comment,
                                    replies: addReplyToComment(comment.replies as Comment[])
                                };
                            }
                            return comment;
                        });
                    };

                    set((state) => ({
                        commentsByPost: {
                            ...state.commentsByPost,
                            [postId]: addReplyToComment(state.commentsByPost[postId] || [])
                        },
                        loading: false,
                        success: 'Reply added (local)'
                    }));
                    console.warn('Reply added locally (API not available):', error);
                    return true;
                }
            },

            // Get comments for a specific post
            getCommentsForPost: (postId: string) => {
                return get().commentsByPost[postId] || [];
            },

            // Clear error message
            clearError: () => set({ error: null }),

            // Clear success message
            clearSuccess: () => set({ success: null }),
        })
    )
);

