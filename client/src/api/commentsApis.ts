//const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Get all comments for a specific post
export const getPostComments = async (postId: string) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comments/post/${postId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching comments:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to fetch comments',
            data: []
        };
    }
};

// Add a new comment to a post
export const addComment = async (postId: string, commentText: string, userId: string) => {
    try {

        console.log("we are sending requests to server to add a comment");
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comments/post/${postId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                commentText,
                userId
            }),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error adding comment:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to add comment',
            data: null
        };
    }
};

// Add a reply to a comment
export const addReply = async (postId: string, parentCommentId: string, replyText: string, userId: string) => {
    try {
        console.log("we are sending requests to server to add a reply");
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comments/${parentCommentId}/reply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                postId,
                replyText,
                userId
            }),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error adding reply:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to add reply',
            data: null
        };
    }
};

// Update a comment
export const updateComment = async (commentId: string, commentText: string) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comments/${commentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                commentText
            }),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error updating comment:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to update comment',
            data: null
        };
    }
};

// Delete a comment
export const deleteComment = async (commentId: string) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comments/${commentId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error deleting comment:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to delete comment',
            data: null
        };
    }
};

