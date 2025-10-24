import { useUserGroupsStore } from "@/app/context/userGroupsStore";

export const useUserGroups = () => {
    const { userFollowedGroups, userCreatedGroups, error, success, isUserFollowedGroupsLoaded, isUserCreatedGroupsLoaded, isUserGroupsLoaded, createGroup, setError, setSuccess, setIsUserFollowedGroupsLoaded, setIsUserCreatedGroupsLoaded, setIsUserGroupsLoaded, clearUserGroups } = useUserGroupsStore();
    return { userFollowedGroups, userCreatedGroups, error, success, isUserFollowedGroupsLoaded, isUserCreatedGroupsLoaded, isUserGroupsLoaded, createGroup, setError, setSuccess, setIsUserFollowedGroupsLoaded, setIsUserCreatedGroupsLoaded, setIsUserGroupsLoaded, clearUserGroups };
}

export const createGroup = (group: FormData) => {
    return useUserGroupsStore((state) => state.createGroup);
}


export const clearUserGroups = () => {
    return useUserGroupsStore((state) => state.clearUserGroups);
}

export const joinGroup = () => {
    return useUserGroupsStore((state) => state.joinGroup);
}

export const leaveGroup = (groupId: string) => {
    return useUserGroupsStore((state) => state.leaveGroup);
}



export const unfollowGroup = (groupId: string) => {
    return useUserGroupsStore((state) => state.unfollowGroup);
}