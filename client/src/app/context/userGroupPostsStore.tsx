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
    userGroupPosts: Record<string, GroupPost[]>;
    userPollsParticipated: Record<string, UserPollParticipation[]>;
    userEventParticipated: Record<string, UserEventParticipation[]>;
    error: string | null;
    success: string | null;
    isUserGroupPostsLoaded: boolean;
    setUserGroupPosts: (userGroupPost: FormData) => void;
    loadUserGroupPosts: (groupId: string) => void;
    setError: (error: string | null) => void;
    setSuccess: (success: string | null) => void;
    setIsUserGroupPostsLoaded: (isUserGroupPostsLoaded: boolean) => void;
    clearUserGroupPosts: () => void;
    setUserPollsParticipated: ( groupId: string, userPollsParticipated: UserPollParticipation) => void;
    getUserPollsParticipatedByGroupId: (groupId: string) => UserPollParticipation[];
    getUserEventParticipatedByGroupId: (groupId: string) => UserEventParticipation[];
    voteOnPollPost: (voteData: any, postId: string, groupId: string) => Promise<any>;
    recordEventParticipation: (userId: string, postId: string, groupId: string) => Promise<any>;
    setUserEventParticipated: (groupId: string, userEventParticipated: UserEventParticipation) => void;
    addUserGroupPost: (userGroupPost: GroupPost) => void;
    getPostsByGroupId: (groupId: string) => GroupPost[];
    setPostsByGroupId: (groupId: string, posts: GroupPost[]) => void;
}



export const useUserGroupPostsStore = create<UserGroupPosts>()(
    devtools(
            (set, get) => ({
                userGroupPosts: {},
                userPollsParticipated: {},
                userEventParticipated: {},
                error: null,
                success: null,
                isUserGroupPostsLoaded: false,
                clearUserGroupPosts: () => set({ userGroupPosts: {} }),
                setError: (error: string | null) => set({ error }),
                setSuccess: (success: string | null) => set({ success }),
                setIsUserGroupPostsLoaded: (isUserGroupPostsLoaded: boolean) => set({ isUserGroupPostsLoaded }),
                getUserPollsParticipatedByGroupId: (groupId: string) => get().userPollsParticipated[groupId] || [],
                getUserEventParticipatedByGroupId: (groupId: string) => get().userEventParticipated[groupId] || [],
                getPostsByGroupId: (groupId: string) => get().userGroupPosts[groupId] || [],
                setUserPollsParticipated: (groupId: string, userPollsParticipated: UserPollParticipation) => {
                    const currentPolls = get().userPollsParticipated;
                    set({
                        userPollsParticipated: {
                            ...currentPolls,
                            [groupId]: [...(currentPolls[groupId] || []), userPollsParticipated]
                        }
                    });
                },
                setUserEventParticipated: (groupId: string, userEventParticipated: UserEventParticipation) => {
                    const currentEvents = get().userEventParticipated;
                    set({
                        userEventParticipated: {
                            ...currentEvents,
                            [groupId]: [...(currentEvents[groupId] || []), userEventParticipated]
                        }
                    });
                },

                addUserGroupPost: (userGroupPost: GroupPost) => {
                    const currentPosts = get().userGroupPosts;
                    const groupId = userGroupPost.groupId;
                    set({ 
                        userGroupPosts: {
                            ...currentPosts,
                            [groupId]: [...(currentPosts[groupId] || []), userGroupPost]
                        }
                    });
                },
                


                setUserGroupPosts: async (userGroupPost) =>{
                  

                    const {setError, setSuccess, setIsUserGroupPostsLoaded} = useUserGroupPostsStore.getState();
                    setError(null);

                    setSuccess(null);
                    setIsUserGroupPostsLoaded(false);
                    
                    try{
                     console.log("userGroupPost", userGroupPost);
                    const response = await createGroupPost(userGroupPost);

                    console.log("server response for creating the post", response);
                    if(response.success){
                        const newPost = response.data;
                        const groupId = newPost.groupId;
                        const currentPosts = get().userGroupPosts;
                        set({
                            userGroupPosts: {
                                ...currentPosts,
                                [groupId]: [...(currentPosts[groupId] || []), newPost]
                            }
                        });
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
                        
                         const currentPosts = get().userGroupPosts;
                         const currentPolls = get().userPollsParticipated;
                         const currentEvents = get().userEventParticipated;
                        // Save everything to store
                         set({
                            userGroupPosts: {
                                ...currentPosts,
                                [groupId]: posts
                            },
                            userPollsParticipated: {
                                ...currentPolls,
                                [groupId]: userVotes
                            },
                            userEventParticipated: {
                                ...currentEvents,
                                [groupId]: userInvitations
                            }
                         })
                        
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

                 voteOnPollPost: async (voteData: any, postId: string, groupId: string) => {
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
                            setUserPollsParticipated(groupId, userPollsParticipated);
                            
                            // Update the post in userGroupPosts with the new pollData from server
                            const updatedPost = response.data;
                            if (updatedPost && updatedPost.pollData) {
                                const currentPosts = get().userGroupPosts;
                                set({
                                    userGroupPosts: {
                                        ...currentPosts,
                                        [groupId]: currentPosts[groupId].map((p: GroupPost) =>
                                            p.postId === updatedPost.postId 
                                            ? { ...p, pollData: updatedPost.pollData } 
                                            : p
                                        )
                                    }
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
                 
                 recordEventParticipation: async (userId: string, postId: string, groupId: string) => {
                    const { setError, setSuccess, setUserEventParticipated} = useUserGroupPostsStore.getState();
                    try{
                        setError(null);
                        setSuccess(null);

                        const response = await recordEventParticipationApi(userId, postId);
                        if(response.success){
                            setUserEventParticipated(groupId, { eventPostId: postId, userId: userId, isAccepted: true });
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
