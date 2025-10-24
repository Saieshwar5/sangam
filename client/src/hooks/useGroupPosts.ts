import { useUserGroupPostsStore } from "@/app/context/userGroupPostsStore";

export const useGroupPosts = () => {
    const { userGroupPosts, error, success, isUserGroupPostsLoaded, setUserGroupPosts, setError, setSuccess, setIsUserGroupPostsLoaded, clearUserGroupPosts } = useUserGroupPostsStore();
    return { userGroupPosts, error, success, isUserGroupPostsLoaded, setUserGroupPosts, setError, setSuccess, setIsUserGroupPostsLoaded, clearUserGroupPosts };
}

export const postInGroup = ()=>
{
    return useUserGroupPostsStore((state) => state.setUserGroupPosts);
}


export const getUserGroupPosts = ()=>
{
    return useUserGroupPostsStore((state) => state.userGroupPosts);
}


export const clearUserGroupPosts = ()=>
{
    return useUserGroupPostsStore((state) => state.clearUserGroupPosts);
}

export const loadUserGroupPosts = (groupId: string)=>
{
    return useUserGroupPostsStore((state) => state.loadUserGroupPosts(groupId));
}