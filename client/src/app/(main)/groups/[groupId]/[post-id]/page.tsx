"use client"

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useUserGroupPostsStore } from '@/app/context/userGroupPostsStore';
import { useUserGroupsStore } from '@/app/context/userGroupsStore';
import DiscussionPost from '../(components)/discusssionPostComponent';
import PollPostComponent from '../(components)/pollPostcomponent';
import VolunteerPostComponent from '../(components)/invitationPostComponent';

export default function PostDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { userGroupPosts, loadUserGroupPosts } = useUserGroupPostsStore();
    const { userCreatedGroups, userFollowedGroups } = useUserGroupsStore();
    
    const [post, setPost] = useState<any>(null);
    const [group, setGroup] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    
    const groupId = params.groupId as string;
    const postId = params['post-id'] as string;

    useEffect(() => {
        const loadPost = async () => {
            // Check if group exists
            const createdGroup = userCreatedGroups.find(g => g.groupId === groupId);
            const followedGroup = userFollowedGroups.find(g => g.groupId === groupId);
            const foundGroup = createdGroup || followedGroup;
            
            if (!foundGroup) {
                router.push('/groups');
                return;
            }
            
            setGroup(foundGroup);
            
            // Check if posts are already loaded
            if (userGroupPosts.length === 0) {
                await loadUserGroupPosts(groupId);
            }
            
            // Find the post
            const foundPost = userGroupPosts.find(p => p.postId === postId);
            
            // If not found, reload posts
            if (!foundPost) {
                const loaded = await loadUserGroupPosts(groupId);
                if (loaded) {
                    const postAfterReload = useUserGroupPostsStore.getState().userGroupPosts.find(p => p.postId === postId);
                    if (postAfterReload) {
                        setPost(postAfterReload);
                    } else {
                        router.push(`/groups/${groupId}`);
                    }
                }
            } else {
                setPost(foundPost);
            }
            
            setLoading(false);
        };
        
        loadPost();
    }, [groupId, postId, router]);

    useEffect(() => {
        // Update post if it changes in the store
        const foundPost = userGroupPosts.find(p => p.postId === postId);
        if (foundPost) {
            setPost(foundPost);
        }
    }, [userGroupPosts, postId]);

    const handleBack = () => {
        router.back();
    };

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading post...</p>
                </div>
            </div>
        );
    }

    if (!post || !group) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 text-lg font-semibold mb-4">Post not found</p>
                    <button 
                        onClick={() => router.push(`/groups/${groupId}`)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Back to Group
                    </button>
                </div>
            </div>
        );
    }

    // Render appropriate post component
    const renderPost = () => {
        const commonProps = {
            postId: post.postId,
            postType: post.postType,
            postContent: post.postContent,
            postCreator: post.postCreator,
            postCreatorName: post.postCreatorName,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            postIsActive: post.postIsActive,
            postIsDeleted: post.postIsDeleted,
        };

        if (post.postType === 'Discussion') {
            return <DiscussionPost {...commonProps} />;
        }
        
        if (post.postType === 'Poll') {
            return (
                <PollPostComponent 
                    {...commonProps}
                    pollData={post.pollData}
                    userSelectedOption={""}
                    userVoted={false}
                />
            );
        }
        
        if (['Call for Volunteers', 'Invitation', 'Event'].includes(post.postType)) {
            return (
                <VolunteerPostComponent 
                    {...commonProps}
                    eventData={post.eventData}
                />
            );
        }
        
        return <DiscussionPost {...commonProps} />;
    };

    return (
        <div className="w-full h-full flex flex-col bg-gray-50">
            {/* Header with Back Button */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
                <button
                    onClick={handleBack}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Go back"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
                <div>
                    <h1 className="text-xl font-semibold text-gray-800">Post Details</h1>
                    <p className="text-sm text-gray-500">{group.groupName}</p>
                </div>
            </div>

            {/* Post Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto">
                    {renderPost()}
                </div>
            </div>
        </div>
    );
}
