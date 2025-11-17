"use client"

import { useEffect ,useState} from 'react';
import { useRouter, useParams } from 'next/navigation';
import { loadProfileFromServer } from '@/api/profileApis';

interface PostComponentProps {
    postId: string;
    postType: string;
    postContent: string;
    postCreator: string;
    postCreatorName: string;
    createdAt: string;
    updatedAt: string;
    postIsActive: boolean;
    postIsDeleted: boolean;
    involve?: boolean;
}

export default function DiscussionPostComponent({
    postId,
    postType,
    postContent,
    postCreator,
    postCreatorName,
    createdAt,
    updatedAt,
    postIsActive,
    postIsDeleted,
    involve
}: PostComponentProps) {
    const [isLiked, setIsLiked] = useState(false);
    const [isClickedOnComment, setIsClickedOnComment] = useState(false);
    const [isPostPageLoading, setIsPostPageLoading] = useState(false);
    const [postCreatorProfile, setPostCreatorProfile] = useState<any>(null);
    const router = useRouter();
    const params = useParams();
    const groupId = params.groupId as string;
    const handleCommentClick = () => {
        setIsClickedOnComment(true);
        setIsPostPageLoading(true);
        router.push(`/main/groups/${groupId}/${postId}`);
    }
    const handlePostClick = () => {
        setIsPostPageLoading(true);
        router.push(`/main/groups/${groupId}/${postId}`);
    }
    const handleLikeClick = () => {
        setIsLiked(true);
    }
    const handleProfileClick = () => {
        router.push(`/profile/${postCreator}`);
    }
    useEffect(() => {
        const loadPostCreatorProfile = async () => {
            const response = await loadProfileFromServer(postCreator);
            if(response.success){
                setPostCreatorProfile(response.data);
            }
        }
        loadPostCreatorProfile();
    }, [postCreator]);






        if(isPostPageLoading || !postCreatorProfile) {
        return <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
    }



    return (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden">
            
            <div className="p-2 pb-4">
                {/* Post Creator */}
                <div className="flex flex-row items-center justify-between gap-3 mb-4">
                  <div className="flex flex-row items-center gap-3 cursor-pointer"
                  onClick={handleProfileClick}
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-md">
                        <img src={postCreatorProfile.profilePicture} alt={postCreatorProfile.name} className="w-10 h-10 rounded-full" />
                        
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800 text-sm">
                            {postCreatorProfile.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                            {new Date(createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>

                   </div>
    


                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                            {postType}
                        </span>
                    </div>
                </div>

                {/* Post Content */}
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-teal-400"
                onClick={handlePostClick}
                >
                    <p className="text-gray-700 text-sm leading-relaxed">
                        {postContent}
                    </p>
                </div>
            </div>

            {/* 📋 FOOTER SECTION - Comments, Likes, Actions */}
            <div className={`bg-gray-50 border-t border-gray-200 px-6 py-4 ${involve ? 'hidden' : ''}`}
            >
                <div className="flex items-center justify-between">
                    {/* Left side - Interaction buttons */}
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span className="text-xs font-medium">Like</span>
                        </button>
                        
                        <button className="flex items-center gap-1 text-gray-600 hover:text-green-600 transition-colors"
                        onClick={handleCommentClick}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span className="text-xs font-medium">Comment</span>
                        </button>
                        
                        <button className="flex items-center gap-1 text-gray-600 hover:text-purple-600 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                            </svg>
                            <span className="text-xs font-medium">Share</span>
                        </button>
                    </div>

                    {/* Right side - Status & Time */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                            {new Date(createdAt).toLocaleDateString()}
                        </span>
                        {postIsActive && (
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}