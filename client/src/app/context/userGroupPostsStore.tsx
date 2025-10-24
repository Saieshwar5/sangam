import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';



import { createGroupPost, getUserGroupPosts } from '@/api/groupPostApis';


interface PollOption {
    id: string;
    text: string;
    votes: number;
    percentage: number;
}

interface PollData {
    pollOptions: PollOption[];
    pollEndDate: string;
    allowMultipleVotes: boolean;
}

interface EventData {
    eventAddress: string;
    eventGoogleMapLink: string;
    eventDate: string;
    eventTime: string;
    eventContactInfo: string;
}

interface GroupPost {
    id: number;
    groupId: string;
    postId: string;
    postCreator: string;
    postCreatorPhotoURL?: string;
    postCreatorName: string;
    postType: string;
    postContent: string;
    postAttachments?: string[];
    createdAt: string;
    updatedAt: string;
    postIsActive: boolean;
    postIsDeleted: boolean;
    pollData?: PollData;
    eventData?: EventData;
}


interface UserGroupPosts {
    userGroupPosts: GroupPost[];
    error: string | null;
    success: string | null;
    isUserGroupPostsLoaded: boolean;
    setUserGroupPosts: (userGroupPost: FormData) => void;
    loadUserGroupPosts: (groupId: string) => void;
    setError: (error: string | null) => void;
    setSuccess: (success: string | null) => void;
    setIsUserGroupPostsLoaded: (isUserGroupPostsLoaded: boolean) => void;
    clearUserGroupPosts: () => void;
}



export const useUserGroupPostsStore = create<UserGroupPosts>()(
    devtools(
            (set, get) => ({
                userGroupPosts: [],
                error: null,
                success: null,
                isUserGroupPostsLoaded: false,
                clearUserGroupPosts: () => set({ userGroupPosts: [] }),
                setError: (error: string | null) => set({ error }),
                setSuccess: (success: string | null) => set({ success }),
                setIsUserGroupPostsLoaded: (isUserGroupPostsLoaded: boolean) => set({ isUserGroupPostsLoaded }),
                setUserGroupPosts: async (userGroupPost) =>{
                  

                    const {setError, setSuccess, setIsUserGroupPostsLoaded} = useUserGroupPostsStore.getState();
                    setError(null);

                    setSuccess(null);
                    setIsUserGroupPostsLoaded(false);
                    const currentUserGroupPosts = get().userGroupPosts;
                    try{
                     console.log("userGroupPost", userGroupPost);
                     console.log("currentUserGroupPosts", currentUserGroupPosts);
                    const response = await createGroupPost(userGroupPost);

                    console.log("server response for creating the post", response);
                    if(response.success){
                        set({ userGroupPosts: [...currentUserGroupPosts, response.data] });
                        setIsUserGroupPostsLoaded(true);
                        setSuccess(response.message);
                    }
                    else{
                        console.log(response);
                        console.log(response.message);
                        setError(response.message);
                        setIsUserGroupPostsLoaded(false);
                    }
                }
                catch(error){
                    console.error(error);
                    setError(error instanceof Error ? error.message : 'An unexpected error occurred');
                    setIsUserGroupPostsLoaded(false);
                }
                },

                loadUserGroupPosts: async (groupId: string) => {
                    const { setError, setSuccess, setIsUserGroupPostsLoaded } = useUserGroupPostsStore.getState();

                    try{
                    setError(null);
                    setSuccess(null);
                    setIsUserGroupPostsLoaded(false);
                    const response = await getUserGroupPosts(groupId);
                    if(response.success){
                        set({ userGroupPosts: response.data });
                        setIsUserGroupPostsLoaded(true);
                        setSuccess(response.message);
                        return true;
                    }
                    else{
                        setError(response.message);
                        setIsUserGroupPostsLoaded(false);
                        setError(response.message);
                        return false;
                    }
                }
                catch(error){
                    console.error(error);
                    setError(error instanceof Error ? error.message : 'An unexpected error occurred');
                    setIsUserGroupPostsLoaded(false);
                    return false;
                }
                },

                



            }),
            
        
    )
)
