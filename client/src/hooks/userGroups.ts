import { useUserGroupsStore } from "@/app/context/userGroupsStore";

export const useUserGroups = () => {
    const { userFollowedGroups, userCreatedGroups, error, success, isUserFollowedGroupsLoaded, isUserCreatedGroupsLoaded, isUserGroupsLoaded, createGroup, setError, setSuccess, setIsUserFollowedGroupsLoaded, setIsUserCreatedGroupsLoaded, setIsUserGroupsLoaded, clearUserGroups } = useUserGroupsStore();
    return { userFollowedGroups, userCreatedGroups, error, success, isUserFollowedGroupsLoaded, isUserCreatedGroupsLoaded, isUserGroupsLoaded, createGroup, setError, setSuccess, setIsUserFollowedGroupsLoaded, setIsUserCreatedGroupsLoaded, setIsUserGroupsLoaded, clearUserGroups };
}

export const useCreateGroup = () => {
    return useUserGroupsStore((state) => state.createGroup);
}


export const useClearUserGroups = () => {
    return useUserGroupsStore((state) => state.clearUserGroups);
}

export const useJoinGroup = () => {
    return useUserGroupsStore((state) => state.joinGroup);
}

export const useLeaveGroup = () => {
    return useUserGroupsStore((state) => state.leaveGroup);
}



export const useUnfollowGroup = () => {
    return useUserGroupsStore((state) => state.unfollowGroup);
}