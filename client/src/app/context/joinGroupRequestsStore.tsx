import { create } from 'zustand';
import { 
    loadJoinGroupRequestsApi, 
    joinGroupRequestApi, 
    rejectJoinGroupRequestApi, 
    acceptJoinGroupRequestApi 
} from '../../api/groupsApis';

interface UserBasicInfo {
    id: string;
    username: string;
    profile_picture: string;
    email?: string;
}

export interface JoinGroupRequest {
    id: number;
    groupId: string;
    userId: string;
    referrerId: string;
    isAccepted: boolean;
    isRejected: boolean;
    createdAt: string;
    user?: UserBasicInfo;
    referrer?: UserBasicInfo;
}

interface JoinGroupRequestsState {
    // Store requests mapped by groupId
    requestsByGroup: Record<string, JoinGroupRequest[]>;
    isLoading: boolean;
    error: string | null;
    
    // Actions
    loadRequests: (groupId: string) => Promise<void>;
    createRequest: (groupId: string, referrerId: string) => Promise<any>;
    acceptRequest: (requestId: string) => Promise<void>;
    rejectRequest: (requestId: string) => Promise<void>;
}

export const useJoinGroupRequestsStore = create<JoinGroupRequestsState>((set, get) => ({
    requestsByGroup: {},
    isLoading: false,
    error: null,

    loadRequests: async (groupId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await loadJoinGroupRequestsApi(groupId);
            if (response.success) {
                set((state) => ({
                    requestsByGroup: {
                        ...state.requestsByGroup,
                        [groupId]: response.data // Update only this group's requests
                    },
                    isLoading: false
                }));
            } else {
                set({ error: response.message, isLoading: false });
            }
        } catch (error: any) {
            set({ error: error.message || 'Failed to load requests', isLoading: false });
        }
    },

    createRequest: async (groupId: string, referrerId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await joinGroupRequestApi(groupId, referrerId);
            if (!response.success) {
                set({ error: response.message, isLoading: false });
            } else {
                set({ isLoading: false });
            }

            return response;
        } catch (error: any) {
            set({ error: error.message || 'Failed to create request', isLoading: false });
            return { success: false, message: error.message, error: error };
        }
    },

    acceptRequest: async (requestId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await acceptJoinGroupRequestApi(requestId);
            if (response.success) {
                const updatedRequest = response.data;
                const groupId = updatedRequest.groupId;

                set((state) => {
                    const currentGroupRequests = state.requestsByGroup[groupId] || [];
                    return {
                        requestsByGroup: {
                            ...state.requestsByGroup,
                            [groupId]: currentGroupRequests.filter(req => req.id.toString() !== requestId.toString())
                        },
                        isLoading: false
                    };
                });
            } else {
                set({ error: response.message, isLoading: false });
            }
        } catch (error: any) {
            set({ error: error.message || 'Failed to accept request', isLoading: false });
        }
    },

    rejectRequest: async (requestId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await rejectJoinGroupRequestApi(requestId);
            if (response.success) {
                const updatedRequest = response.data;
                const groupId = updatedRequest.groupId;

                set((state) => {
                    const currentGroupRequests = state.requestsByGroup[groupId] || [];
                    return {
                        requestsByGroup: {
                            ...state.requestsByGroup,
                            [groupId]: currentGroupRequests.filter(req => req.id.toString() !== requestId.toString())
                        },
                        isLoading: false
                    };
                });
            } else {
                set({ error: response.message, isLoading: false });
            }
        } catch (error: any) {
            set({ error: error.message || 'Failed to reject request', isLoading: false });
        }
    },
}));
