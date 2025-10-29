import { Message } from '@/app/context/userMessageStore';




export interface UnreadBySender {
    count: number;
    messages: Message[];
    latestMessage: string;
    latestMessageTime: string;
    roomId?: string;
}

export interface UnreadMessagesResponse {
    success: boolean;
    message?: string;
    data: {
        totalUnread: number;
        unreadBySender: UnreadBySender[];
        details: UnreadBySender[];
    };
}

export interface UnreadCountResponse {
    success: boolean;
    message?: string;
    data: {
        userId: string;
        unreadCount: number;
    };
}


interface SaveMessagePayload {
    id?: string;
    messageId?: string;
    text: string;
    timestamp?: string;
    userId: string;
    sendTo: string;
    isRead: boolean;
    isSent: boolean;
    roomId?: string;
}


interface LoadMessagesResponse {
    success: boolean;
    message?: string;
    data?: Message[];
}

interface SaveMessageResponse {
    success: boolean;
    message?: string;
    data?: Message;
}

/**
 * Save a message to the server/database
 */
export async function saveMessageToServer(
    messageData: SaveMessagePayload
): Promise<SaveMessageResponse> {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/messages`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(messageData),
            }
        );

        return await response.json();
    } catch (error) {
        console.error('Error saving message:', error);
        throw error;
    }
}

/**
 * Load messages from the server for a specific room
 */
export async function loadMessagesFromServer(
    roomId: string,
    limit: number = 50,
    offset: number = 0
): Promise<LoadMessagesResponse> {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/messages/room/${roomId}?limit=${limit}&offset=${offset}`,
            {
                method: 'GET',
                credentials: 'include',
            }
        );

        return await response.json();
    } catch (error) {
        console.error('Error loading messages:', error);
        throw error;
    }
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(
    messageIds: string[],
    roomId: string
): Promise<{ success: boolean; message?: string }> {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/messages/mark-read`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ messageIds, roomId }),
            }
        );

        return await response.json();
    } catch (error) {
        console.error('Error marking messages as read:', error);
        throw error;
    }
}

/**
 * Delete a message
 */
export async function deleteMessage(messageId: string): Promise<{ success: boolean; message?: string }> {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/messages/${messageId}`,
            {
                method: 'DELETE',
                credentials: 'include',
            }
        );

        return await response.json();
    } catch (error) {
        console.error('Error deleting message:', error);
        throw error;
    }
}




// In your client API file (messageApis.ts)

export async function getUnreadMessages() {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/unread-messages`,
            {
                credentials: 'include'
            }
        );
        return await response.json();
    } catch (error) {
        console.error('Error fetching unread messages:', error);
        throw error;
    }
}

export async function getUnreadCount() {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/unread-count`,
            {
                credentials: 'include'
            }
        );
        return await response.json();
    } catch (error) {
        console.error('Error fetching unread count:', error);
        throw error;
    }
}

export async function markSenderMessagesAsRead(userId: string, senderId: string) {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/mark-sender-read/${userId}`,
            {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ senderId })
            }
        );
        return await response.json();
    } catch (error) {
        console.error('Error marking messages as read:', error);
        throw error;
    }
}