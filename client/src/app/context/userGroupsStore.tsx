import { create } from "zustand";
import { devtools } from "zustand/middleware";

// import { loadUserFollowedGroups, loadUserCreatedGroups, createGroup, updateGroup, deleteGroup, joinGroup, leaveGroup } from "@/api/groupsApis";

 import { createGroup, joinGroupApi, loadUserFollowedGroupsApi, loadUserCreatedGroupsApi, leaveGroupApi} from "@/api/groupsApis";


 export interface Group {
    groupId: string;
    groupName: string;
    description: string;
    logo: string | null;
    coverImage: string | null;
    uniqueName: string;
    vision: string | null;
    address: string | null;
    createdBy: string;
    youtubeUrl: string | null;
    twitterUrl: string | null;
    instagramUrl: string | null;
    isActive: boolean;
    isDeleted: boolean;
    isSuspended: boolean;
    isBanned: boolean;
    createdAt: string;
    updatedAt: string;
    logoKey?: string | null;
    coverImageKey?: string | null;
  }
interface UserGroups {
    userFollowedGroups: Group[];
    userCreatedGroups: Group[];
    error: string | null;
    success: string | null;
    isUserFollowedGroupsLoaded: boolean;
    isUserCreatedGroupsLoaded: boolean;
    isUserGroupsLoaded: boolean;

    createGroup: (group: FormData) => Promise<any>;
    joinGroup: (groupId: string) => Promise<boolean>;
    leaveGroup: (groupId: string) => void;
    loadUserFollowedGroups: () => Promise<boolean>;
    loadUserCreatedGroups: () => Promise<boolean>;
    
    setError: (error: string | null) => void;
    setSuccess: (success: string | null) => void;
    setIsUserFollowedGroupsLoaded: (isUserFollowedGroupsLoaded: boolean) => void;
    setIsUserCreatedGroupsLoaded: (isUserCreatedGroupsLoaded: boolean) => void;
    setIsUserGroupsLoaded: (isUserGroupsLoaded: boolean) => void;
    
    // ✅ CHANGED: Now accepts array
    setUserFollowedGroups: (groups: Group[]) => void;
    setUserCreatedGroups: (groups: Group[]) => void;
    
    // ✅ NEW: Add single items
    addUserFollowedGroup: (group: Group) => void;
    addUserCreatedGroup: (group: Group) => void;
    
    unfollowGroup: (groupId: string) => void;
    clearUserGroups: () => void;
}

export const useUserGroupsStore = create<UserGroups>()(
    devtools(
        (set, get) => ({
            userFollowedGroups: [],
            userCreatedGroups: [],
            error: null,
            success: null,
            isUserFollowedGroupsLoaded: false,
            isUserCreatedGroupsLoaded: false,
            isUserGroupsLoaded: false,

            setError: (error) => set({ error }),
            setSuccess: (success) => set({ success }),
            setIsUserFollowedGroupsLoaded: (isUserFollowedGroupsLoaded) => set({ isUserFollowedGroupsLoaded }),
            setIsUserCreatedGroupsLoaded: (isUserCreatedGroupsLoaded) => set({ isUserCreatedGroupsLoaded }),
            setIsUserGroupsLoaded: (isUserGroupsLoaded) => set({ isUserGroupsLoaded }),
            
            // ✅ FIXED: Replace entire array (for loading from server)
            setUserFollowedGroups: (groups: Group[]) => 
                set({ userFollowedGroups: groups }),
            
            // ✅ NEW: Add single group to array (for joining)
            addUserFollowedGroup: (group: Group) => 
                set({ userFollowedGroups: [...get().userFollowedGroups, group] }),
            
            // ✅ FIXED: Replace entire array (for loading from server)
            setUserCreatedGroups: (groups: Group[]) => 
                set({ userCreatedGroups: groups }),
            
            // ✅ NEW: Add single group to array (for creating)
            addUserCreatedGroup: (group: Group) => 
                set({ userCreatedGroups: [...get().userCreatedGroups, group] }),
            
            unfollowGroup: (groupId: string) => 
                set({ userFollowedGroups: get().userFollowedGroups.filter((group) => group.groupId !== groupId) }),
            
            clearUserGroups: () => set({
                userFollowedGroups: [],
                userCreatedGroups: [],
                error: null,
                success: null,
                isUserFollowedGroupsLoaded: false,
                isUserCreatedGroupsLoaded: false,
                isUserGroupsLoaded: false
            }),

            createGroup: async (group) => {
                try {
                    const response = await createGroup(group);
                    if (response.success) {
                        const newGroup = response.data;
                        const currentGroups = get().userCreatedGroups;
                        
                        set({
                            userCreatedGroups: [...currentGroups, newGroup], // ✅ Inline is fine here
                            isUserCreatedGroupsLoaded: true,
                            success: response.message
                        });
                        
                        return response;
                    } else {
                        set({ error: response.message });
                        return response;
                    }
                } catch (error) {
                    console.error(error);
                    set({ error: 'Failed to create group' });
                    return { success: false, message: 'Failed to create group', error: error };
                }
            },

            joinGroup: async (groupId) => {
                const { setSuccess, setError, addUserFollowedGroup, setIsUserFollowedGroupsLoaded } = useUserGroupsStore.getState();
                try {
                    setError(null);
                    setSuccess(null);
                    setIsUserFollowedGroupsLoaded(false);
                    const response = await joinGroupApi(groupId);
                    if (response.success) {
                        console.log("response", response);
                        console.log("response.data", response.data);
                        setSuccess('Group joined successfully');
                        addUserFollowedGroup(response.data); // ✅ Use addUserFollowedGroup
                        setIsUserFollowedGroupsLoaded(true);
                        return true;
                    } else {
                        setError(response.message);
                        return false;
                    }
                } catch (error) {
                    console.error(error);
                    setError('Failed to join group');
                    return false;
                }
            },

            loadUserFollowedGroups: async () => {
                const { setError, setSuccess, setIsUserFollowedGroupsLoaded, setUserFollowedGroups } = useUserGroupsStore.getState();
                setError(null);
                setSuccess(null);
                setIsUserFollowedGroupsLoaded(false);
                
                try {
                    const response = await loadUserFollowedGroupsApi();
                    if (response.success) {
                        setUserFollowedGroups(response.data); // ✅ Pass entire array
                        setIsUserFollowedGroupsLoaded(true);
                        setSuccess('User followed groups loaded successfully');
                        return true;
                    } else {
                        setError(response.message);
                        return false;
                    }
                } catch (error) {
                    console.error(error);
                    setError('Failed to load user followed groups');
                    return false;
                }
            },

            loadUserCreatedGroups: async () => {
                const { setError, setSuccess, setIsUserCreatedGroupsLoaded, setUserCreatedGroups } = useUserGroupsStore.getState();
                setError(null);
                setSuccess(null);
                setIsUserCreatedGroupsLoaded(false);
                
                try {
                    const response = await loadUserCreatedGroupsApi();
                    if (response.success) {
                        setUserCreatedGroups(response.data); // ✅ Pass entire array
                        setIsUserCreatedGroupsLoaded(true);
                        setSuccess('User created groups loaded successfully');
                        return true;
                    } else {
                        setError(response.message);
                        return false;
                    }
                } catch (error) {
                    console.error(error);
                    setError('Failed to load user created groups');
                    return false;
                }
            },

            leaveGroup: async (groupId: string) => {
                const { setError, setSuccess, unfollowGroup } = useUserGroupsStore.getState();
                setError(null);
                setSuccess(null);
                try {
                    const response = await leaveGroupApi(groupId);
                    if (response.success) {
                        setSuccess('Group left successfully');
                        unfollowGroup(groupId);
                    } else {
                        setError(response.message);
                    }
                } catch (error) {
                    console.error(error);
                    setError('Failed to leave group');
                }
            },
        })
    )
);