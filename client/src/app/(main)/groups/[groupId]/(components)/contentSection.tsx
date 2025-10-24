

"use client"

import { useState, useEffect } from 'react';
import { useUserGroupsStore } from '@/app/context/userGroupsStore';
import { MdAdd } from 'react-icons/md';
import CreatePostModal from './createPostModal';
import PollPostComponent from './pollPostcomponent';
import VolunteerPostComponent from './invitationPostComponent';

import { useGroupPosts} from '@/hooks/useGroupPosts';
import { useUserGroupPostsStore } from '@/app/context/userGroupPostsStore';



import DiscussionPost from './discusssionPostComponent';

interface ContentSectionProps {
    groupId: string;

    groupName: string;
}

export default function ContentSection({ groupId, groupName }: ContentSectionProps) {
    const { userCreatedGroups, userFollowedGroups } = useUserGroupsStore();
    const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
    const { userGroupPosts } = useGroupPosts();
    const { isUserGroupPostsLoaded, error, success, loadUserGroupPosts } = useUserGroupPostsStore();


   
    useEffect(() => {
        loadUserGroupPosts(groupId);
    }, [groupId]);
    
    
  

    const handleCreatePost = () => {
        setIsCreatePostModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsCreatePostModalOpen(false);
    };


    return (
        <div className="w-full h-full flex flex-col relative">
        {/* Scrollable content area */}
        <div className="absolute inset-0 overflow-y-auto overflow-x-hidden p-6">
            <div className="flex flex-col gap-6 pb-20">
            {userGroupPosts.map((post) => {
    if (post.postType === 'Discussion') {
        return <DiscussionPost key={post.postId} {...post}/>;
    }
    if (post.postType === 'Poll') {
        return <PollPostComponent key={post.postId} {...post}/>;
    }
    if (post.postType === 'Call for Volunteers') {
        return <VolunteerPostComponent key={post.postId} {...post}/>;
    }
    if (post.postType === 'Invitation') {
        return <VolunteerPostComponent key={post.postId} {...post}/>;
    }
    if (post.postType === 'Event') {
        return <VolunteerPostComponent key={post.postId} {...post}/>;
    }
    else {
        return <DiscussionPost key={post.postId} {...post}/>;
    }
    return null;
})}
            </div>
        </div>
                


            {/* Floating Post Button */}
            <div className="fixed bottom-6 right-6 z-40">
                <button 
                    onClick={handleCreatePost}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-colors duration-200 flex items-center justify-center"
                    title="Create Post"
                >
                    <MdAdd className="w-6 h-6" />
                </button>
            </div>

            {/* Create Post Modal */}
            <CreatePostModal
                isOpen={isCreatePostModalOpen}
                onClose={handleCloseModal}
                groupId={groupId}
                groupName={groupName}
            />
        </div>
    );
}