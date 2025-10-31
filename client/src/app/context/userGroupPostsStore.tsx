import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';



import { createGroupPost, getUserGroupPosts , voteOnPollPost, recordEventParticipationApi} from '@/api/groupPostApis';


interface PollOption {
    id: number;
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

interface SelectedOption {
    id: number;
    text: string;
}

interface UserPollParticipation {
    pollPostId: string;
    userId: string;
    selectedOptions: SelectedOption[];
}

interface UserEventParticipation {
    eventPostId: string;
    userId: string;
    isAccepted: boolean;
}


interface UserGroupPosts {
    userGroupPosts: GroupPost[];
    userPollsParticipated: UserPollParticipation[];
    userEventParticipated: UserEventParticipation[];
    error: string | null;
    success: string | null;
    isUserGroupPostsLoaded: boolean;
    setUserGroupPosts: (userGroupPost: FormData) => void;
    loadUserGroupPosts: (groupId: string) => void;
    setError: (error: string | null) => void;
    setSuccess: (success: string | null) => void;
    setIsUserGroupPostsLoaded: (isUserGroupPostsLoaded: boolean) => void;
    clearUserGroupPosts: () => void;
    setUserPollsParticipated: (userPollsParticipated: UserPollParticipation) => void;
    getUserPollsParticipated: () => UserPollParticipation[];
    voteOnPollPost: (voteData: any, postId: string) => Promise<any>;
    recordEventParticipation: (userId: string, postId: string) => Promise<any>;
    setUserEventParticipated: (userEventParticipated: UserEventParticipation) => void;
    addUserGroupPost: (userGroupPost: GroupPost) => void;
}



export const useUserGroupPostsStore = create<UserGroupPosts>()(
    devtools(
            (set, get) => ({
                userGroupPosts: [],
                userPollsParticipated: [],
                setUserPollsParticipated: (userPollsParticipated: any) => set({ userPollsParticipated: [...get().userPollsParticipated, userPollsParticipated] }),
                userEventParticipated: [],
                setUserEventParticipated: (userEventParticipated: any) => set({ userEventParticipated: [...get().userEventParticipated, userEventParticipated] }),
                error: null,
                success: null,
                isUserGroupPostsLoaded: false,
                clearUserGroupPosts: () => set({ userGroupPosts: [] }),
                setError: (error: string | null) => set({ error }),
                setSuccess: (success: string | null) => set({ success }),
                setIsUserGroupPostsLoaded: (isUserGroupPostsLoaded: boolean) => set({ isUserGroupPostsLoaded }),
                getUserPollsParticipated: () => get().userPollsParticipated,
                addUserGroupPost: (userGroupPost: GroupPost) => set({ userGroupPosts: [...get().userGroupPosts, userGroupPost] }),
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
                        const posts = response.data;
                        
                        // Extract user's poll votes from posts
                        const userVotes: UserPollParticipation[] = [];
                        const userInvitations: UserEventParticipation[] = [];
                        
                        posts.forEach((post: any) => {
                            // Extract votes if present
                            if (post.votes && post.votes.length > 0) {
                                post.votes.forEach((vote: any) => {
                                    userVotes.push({
                                        pollPostId: vote.pollPostId,
                                        userId: vote.userId,
                                        selectedOptions: vote.voteData?.selectedOptions || []
                                    });
                                });
                            }
                            
                            // Extract invitations if present
                            if (post.invitations && post.invitations.length > 0) {
                                post.invitations.forEach((invitation: any) => {
                                    userInvitations.push({
                                        eventPostId: invitation.eventPostId,
                                        userId: invitation.userId,
                                        isAccepted: invitation.isAccepted || false
                                    });
                                });
                            }
                        });
                        
                        // Save everything to store
                        set({ 
                            userGroupPosts: posts,
                            userPollsParticipated: userVotes,
                            userEventParticipated: userInvitations
                        });
                        
                        setIsUserGroupPostsLoaded(true);
                        setSuccess(response.message);
                        return true;
                    }
                    else{
                        setError(response.message);
                        setIsUserGroupPostsLoaded(false);
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

                 voteOnPollPost: async (voteData: any, postId: string) => {
                    const { setError, setSuccess, setUserPollsParticipated } = useUserGroupPostsStore.getState();
                    try{
                        setError(null);
                        setSuccess(null);

                        console.log("we are at the voteOnPollPost function");
                        const response = await voteOnPollPost(voteData, postId);
                        console.log("response from the voteOnPollPost function", response);
                        if(response.success){

                            const userPollsParticipated = {
                                pollPostId: postId,
                                userId: voteData.userId,
                                selectedOptions: voteData.selectedOptions,
                            };
                            setUserPollsParticipated(userPollsParticipated);
                            
                            // Update the post in userGroupPosts with the new pollData from server
                            const updatedPost = response.data;
                            if (updatedPost && updatedPost.pollData) {
                                set({
                                    userGroupPosts: get().userGroupPosts.map(p =>
                                        p.postId === updatedPost.postId 
                                            ? { ...p, pollData: updatedPost.pollData } 
                                            : p
                                    )
                                });
                            }
                            
                            setSuccess(response.message);
                            return response;
                        }
                        else{
                            setError(response.message);
                            console.log("error from the voteOnPollPost function", response.message);
                            return false;
                        }
                    }
                    catch(error){
                        console.error(error);
                        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
                        return false;
                    }
                 },    
                 
                 recordEventParticipation: async (userId: string, postId: string) => {
                    const { setError, setSuccess, setUserEventParticipated} = useUserGroupPostsStore.getState();
                    try{
                        setError(null);
                        setSuccess(null);

                        const response = await recordEventParticipationApi(userId, postId);
                        if(response.success){
                            setUserEventParticipated({ eventPostId: postId, userId: userId, isAccepted: true });
                            setSuccess(response.message);
                            return response;
                        }
                        else{
                            setError(response.message);
                            return false;
                        }
                    }
                    catch(error){
                        console.error(error);
                        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
                        return false;
                    }
                }



            }),
            
        
    )
)
