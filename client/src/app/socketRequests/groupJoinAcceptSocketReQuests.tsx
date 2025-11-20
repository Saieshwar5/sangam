import { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { useSocket } from '../context/socketContext';


interface GroupJoinAcceptSocketRequestsContextType {
    acceptedRequest: any | null; // Last accepted request data
    hasAcceptedRequest: boolean; // Whether there's a new accepted request
    clearAcceptedNotification: () => void; // Clear the notification
}


const GroupJoinAcceptSocketRequestsContext = createContext<GroupJoinAcceptSocketRequestsContextType>({
    acceptedRequest: null,
    hasAcceptedRequest: false,
    clearAcceptedNotification: () => {},
});


export const useGroupJoinAcceptSocketRequests = () => {
    return useContext(GroupJoinAcceptSocketRequestsContext);
};


export function GroupJoinAcceptSocketRequestsProvider({ 
    children 
}: { 
    children: ReactNode;
}) {
    const { socket, isConnected } = useSocket();
    const [acceptedRequest, setAcceptedRequest] = useState<any | null>(null);
    const [hasAcceptedRequest, setHasAcceptedRequest] = useState(false);

    // ✅ Step 5: Set up socket listeners
    useEffect(() => {
        if (!socket || !isConnected) {
            console.log('Socket not connected, skipping group join accept listener');
            return;
        }

        // Listen for join request accepted events
        const handleJoinRequestAccepted = (data: { 
            groupId: string; 
            groupName: string;
            groupLogo?: string;
            requestId: number;
            timestamp?: string;
        }) => {
            console.log('🎉 Received join request accepted notification:', data);
            
            // Update state
            setAcceptedRequest(data);
            setHasAcceptedRequest(true);
        };

        // Register the event listener
        socket.on('join_request_accepted', handleJoinRequestAccepted);

        // ✅ Step 6: Cleanup function
        return () => {
            socket.off('join_request_accepted', handleJoinRequestAccepted);
        };
    }, [socket, isConnected]);

    // Helper function to clear notification
    const clearAcceptedNotification = () => {
        setAcceptedRequest(null);
        setHasAcceptedRequest(false);
    };

    // ✅ Step 7: Provide the context value
    return (
        <GroupJoinAcceptSocketRequestsContext.Provider 
            value={{
                acceptedRequest,
                hasAcceptedRequest,
                clearAcceptedNotification,
            }}
        >
            {children}
        </GroupJoinAcceptSocketRequestsContext.Provider>
    );
}