"use client";

import { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { useSocket } from '../context/socketContext';

// ✅ Step 1: Define the Context Type (Interface)
interface GroupJoinSocketRequestsContextType {
    hasPendingRequests: boolean; // Whether there are pending requests
    pendingRequestsCount: number; // Count of pending requests
    lastRequest: any | null; // Last received request data
    clearNotification: () => void; // Clear the notification badge
    setHasPendingRequests: (value: boolean) => void; // Manually set state
}

// ✅ Step 2: Create the Context with default values
const  GroupJoinSocketRequestsContext = createContext<GroupJoinSocketRequestsContextType>({
    hasPendingRequests: false,
    pendingRequestsCount: 0,
    lastRequest: null,
    clearNotification: () => {},
    setHasPendingRequests: () => {},
});

// ✅ Step 3: Create a custom hook to use the context
export const useGroupJoinSocketRequests = () => {
    return useContext(GroupJoinSocketRequestsContext);
};

// ✅ Step 4: Create the Provider Component
export function GroupJoinSocketRequestsProvider({ 
    children, 
    groupId 
}: { 
    children: ReactNode;
    groupId?: string; // Optional: if you want to filter by specific group
}) {
    const { socket, isConnected } = useSocket(); // Get socket from parent context
    const [hasPendingRequests, setHasPendingRequests] = useState(false);
    const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
    const [lastRequest, setLastRequest] = useState<any | null>(null);

    // ✅ Step 5: Set up socket listeners in useEffect
    useEffect(() => {
        if (!socket || !isConnected) {
            console.log('Socket not connected, skipping group join request listener');
            return;
        }

        // Listen for new join requests
        const handleNewJoinRequest = (data: { 
            groupId: string; 
            requesterId: string;
            requestId?: number;
            timestamp?: string;
        }) => {
            console.log('🔔 Received new join request notification:', data);
            
            // If groupId is provided, only show notification for that group
            if (groupId && data.groupId !== groupId) {
                return;
            }

            // Update state
            setHasPendingRequests(true);
            setPendingRequestsCount(prev => prev + 1);
            setLastRequest(data);
        };

        // Register the event listener
        socket.on('new_join_request', handleNewJoinRequest);

        // ✅ Step 6: Cleanup function (IMPORTANT!)
        return () => {
            socket.off('new_join_request', handleNewJoinRequest);
        };
    }, [socket, isConnected, groupId]);

    // Helper function to clear notification
    const clearNotification = () => {
        setHasPendingRequests(false);
        setPendingRequestsCount(0);
        setLastRequest(null);
    };

    // ✅ Step 7: Provide the context value
    return (
        <GroupJoinSocketRequestsContext.Provider 
            value={{
                hasPendingRequests,
                pendingRequestsCount,
                lastRequest,
                clearNotification,
                setHasPendingRequests,
            }}
        >
            {children}
        </GroupJoinSocketRequestsContext.Provider>
    );
}