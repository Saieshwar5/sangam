import { useUserGroupPostsStore } from "@/app/context/userGroupPostsStore";

export const useGroupPosts = () => {
    const { userGroupPosts, error, success, isUserGroupPostsLoaded, setUserGroupPosts, setError, setSuccess, setIsUserGroupPostsLoaded, clearUserGroupPosts } = useUserGroupPostsStore();
    return { userGroupPosts, error, success, isUserGroupPostsLoaded, setUserGroupPosts, setError, setSuccess, setIsUserGroupPostsLoaded, clearUserGroupPosts };
}

export const usePostInGroup = ()=>
{
    return useUserGroupPostsStore((state) => state.setUserGroupPosts);
}


export const useGetUserGroupPosts = ()=>
{
    return useUserGroupPostsStore((state) => state.userGroupPosts);
}


export const useClearUserGroupPosts = ()=>
{
    return useUserGroupPostsStore((state) => state.clearUserGroupPosts);
}

export const useLoadUserGroupPosts = (groupId: string)=>
{
    return useUserGroupPostsStore((state) => state.loadUserGroupPosts(groupId));
}