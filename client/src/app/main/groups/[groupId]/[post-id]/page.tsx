"use client"

import { useParams, useRouter} from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { useUserGroupPostsStore } from '@/app/context/userGroupPostsStore';
import { useUserGroupsStore } from '@/app/context/userGroupsStore';
import { useCommentsStore } from '@/app/context/commentsStore';
import { useUser } from '@/hooks/useAuth';
import DiscussionPost from '../(components)/discusssionPostComponent';
import PollPostComponent from '../(components)/pollPostcomponent';
import VolunteerPostComponent from '../(components)/invitationPostComponent';
import CommentsSection from './(components)/commentsSection';

export default function PostDetailPage() {
    const params = useParams();
    const router = useRouter();
    const user = useUser();
    const { userGroupPosts, loadUserGroupPosts } = useUserGroupPostsStore();
    const { userCreatedGroups, userFollowedGroups } = useUserGroupsStore();
    const { 
        getCommentsForPost, 
        loadCommentsForPost, 
        addCommentToPost, 
        addReplyToComment 
    } = useCommentsStore();
    
    const [loading, setLoading] = useState(true);
    
    const groupId = params.groupId as string;
    const postId = params['post-id'] as string;

    // Get comments from store
    const commentsByPost = useCommentsStore((state) => state.commentsByPost);
const comments = useMemo(() => commentsByPost[postId] || [], [commentsByPost, postId]);

const post = useMemo(
    () => userGroupPosts[groupId]?.find(p => p.postId === postId),
    [userGroupPosts, groupId, postId]
);

      useEffect(() => {
        if(post){
            setLoading(false);
            // Load comments for this post
            loadCommentsForPost(postId);
        }
      }, [post, postId, loadCommentsForPost]);

   

    const handleBack = () => {
        router.back();
    };

    const handleAddComment = async (commentText: string) => {
        const userId = user?.id || '';
        const userName = user?.email?.split('@')[0] || 'Anonymous';
        
        await addCommentToPost(postId, commentText, userId, userName);
        console.log('New comment added');
    };

    const handleReplyToComment = async (parentCommentId: string, replyText: string) => {
        const userId = user?.id || '';
        const userName = user?.email?.split('@')[0] || 'Anonymous';
        
        await addReplyToComment(postId, parentCommentId, replyText, userId, userName);
        console.log('Reply added to comment:', parentCommentId);
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

    if (!post) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 text-lg font-semibold mb-4">Post not found</p>
                    <button 
                        onClick={() => router.push(`/main/groups/${groupId}`)}
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
            involve: true,
        };

        if (post.postType === 'Discussion') {
            return <DiscussionPost {...commonProps} />;
        }
        
       
        
        
        
        return <DiscussionPost {...commonProps} />;
    };


     
    return (
        <div className="w-full h-full flex flex-col bg-gray-50">
            

            
            <div className="flex-1 overflow-y-auto ">
                       
                <div className="max-w-4xl mx-auto">
                    {/* Sticky post container - stays at top when scrolling */}
                    <div className="sticky top-0 z-10 bg-gray-50 pb-4">

                    <button
                    onClick={handleBack}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Go back"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
                        {renderPost()}
                    </div>
                    
                    {/* comments section */}
                    <div className="px-4">
                        <CommentsSection
                            postId={postId}
                            comments={comments}
                            onAddComment={handleAddComment}
                            onReplyToComment={handleReplyToComment}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
