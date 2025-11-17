"use client"

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useAuth';
import { useUserGroupPostsStore } from '@/app/context/userGroupPostsStore';
import { loadProfileFromServer } from '@/api/profileApis';
import { useRouter } from 'next/navigation';
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
interface PollPostComponentProps {
    postId: string;
    postType: string;
    postContent: string; // This will be the poll question
    postCreator: string;
    postCreatorName: string;
    createdAt: string;
    updatedAt: string;
    postIsActive: boolean;
    postIsDeleted: boolean;
    pollData?: PollData;
    groupId: string;
}

interface SelectedOption {
    id: number;
    text: string;
}

export default function PollPostComponent({
    postId,
    postType,
    postContent,
    postCreator,
    postCreatorName,
    createdAt,
    updatedAt,
    postIsActive,
    postIsDeleted,
    pollData,
    groupId,
}: PollPostComponentProps) {
    const user = useUser();
    const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);
    const [hasVoted, setHasVoted] = useState(false);
    const [showResults, setShowResults] = useState(pollData?.pollOptions.some(option => option.votes > 0));
    const { voteOnPollPost, getUserPollsParticipatedByGroupId} = useUserGroupPostsStore();
    const [postCreatorProfile, setPostCreatorProfile] = useState<any>(null);
    const router = useRouter();
    useEffect(() => {
        const loadPostCreatorProfile = async () => {
            const response = await loadProfileFromServer(postCreator);
            if(response.success && response.data){
                setPostCreatorProfile(response.data);
            }
        }
        loadPostCreatorProfile();
    }, [postCreator]);

    // Calculate if poll has ended
    const isPollEnded = pollData?.pollEndDate ? new Date(pollData?.pollEndDate) < new Date() : false;
    const pollsForGroup=getUserPollsParticipatedByGroupId(groupId || '');

    useEffect(() => {
        const isVoted = pollsForGroup.some(p => p.pollPostId === postId);
        setHasVoted(isVoted);
      }, [pollsForGroup, postId]);
    const handleOptionSelect = (optionId: number) => {
        if (hasVoted || isPollEnded) return;

        const optionText = pollData?.pollOptions.find(option => option.id === optionId)?.text;

        if (pollData?.allowMultipleVotes) {
            setSelectedOptions(prev => [...prev, { id: optionId, text: optionText ?? '' }]);
        } else {
            setSelectedOptions([{ id: optionId, text: optionText ?? '' }]);
        }
    };

    const handleVote = async () => {
        if (selectedOptions.length === 0 || hasVoted || isPollEnded) return;

        try {
            // TODO: Implement API call to submit vote
            console.log('Voting for options:', selectedOptions);
            const voteData = {
                pollPostId: postId,
                userId: user?.id,
                selectedOptions: selectedOptions,
            };
          
            console.log("voteData ******************", voteData);
  
                const response = await voteOnPollPost(voteData, postId, groupId);
                if(response.success){
                    setHasVoted(true);
                    setShowResults(true);
                }
                else{
                    console.error('Error submitting vote:', response.message);
                }
            } catch (error) {
            console.error('Error submitting vote:', error);
        }
    };

    const formatTimeRemaining = (endDate: string) => {
        const now = new Date();
        const end = new Date(endDate);
        const diff = end.getTime() - now.getTime();
        
        if (diff <= 0) return 'Poll ended';
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) return `${days}d ${hours}h left`;
        if (hours > 0) return `${hours}h ${minutes}m left`;
        return `${minutes}m left`;
    };

    const handleProfileClick = () => {
        router.push(`/profile/${postCreator}`);
    }

    return (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden">
            
           
            <div className="p-6 pb-4">
                {/* Post Creator */}
                <div className="flex flex-row items-center gap-3 mb-4 justify-between
                cursor-pointer"
                onClick={handleProfileClick}
                >
                    <div className="flex flex-row items-center gap-3">
                    <img 
                                                src={postCreatorProfile?.profilePicture || '/default-avater.svg'} 
                                                alt={postCreatorProfile?.name || 'User'} 
                                                className="w-10 h-10 rounded-full" 
                                            />
                    <div>
                        <h3 className="font-semibold text-gray-800 text-sm">
                            {postCreatorProfile?.name}
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

                {/* Poll Question */}
                <div className="bg-teal-50 rounded-lg p-4 border-l-4 border-teal-400 mb-4">
                    <h2 className="text-gray-800 text-base font-semibold leading-relaxed">
                        {postContent}
                    </h2>
                    {pollData?.pollOptions.some(option => option.votes > 0) && (
                        <p className="text-xs text-gray-600 mt-2">
                            {pollData?.pollOptions.reduce((acc, option) => acc + option.votes, 0)} vote{pollData?.pollOptions.reduce((acc, option) => acc + option.votes, 0)!== 1 ? 's' : ''} total
                        </p>
                    )}
                </div>

                {/* Poll Options */}
                <div className="space-y-3">
                    {pollData?.pollOptions.map((option, index) => {
                        const isSelected = selectedOptions.some(selectedOption => selectedOption.id == option.id);
                        const isWinning = option.percentage === Math.max(...pollData?.pollOptions.map(o => o.percentage) || []) && option.percentage > 0;
                        
                        return (
                            <div key={option.id} className="relative">
                                <button
                                    onClick={() => handleOptionSelect(option.id)}
                                    disabled={hasVoted || isPollEnded}
                                    className={`
                                        w-full text-left p-3 rounded-lg border-2 transition-all duration-200
                                        ${hasVoted || isPollEnded 
                                            ? 'cursor-not-allowed opacity-75' 
                                            : 'cursor-pointer hover:shadow-md'
                                        }
                                        ${isSelected 
                                            ? 'border-teal-400 bg-teal-50' 
                                            : 'border-gray-200 bg-white hover:border-teal-300'
                                        }
                                    `}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {/* Option indicator */}
                                            <div className={`
                                                w-6 h-6 rounded-full border-2 flex items-center justify-center
                                                ${isSelected 
                                                    ? 'border-purple-400 bg-purple-400' 
                                                    : 'border-gray-300'
                                                }
                                            `}>
                                                {isSelected && (
                                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </div>
                                            <span className={`text-sm ${isSelected ? 'font-medium text-purple-800' : 'text-gray-700'}`}>
                                                {option.text}
                                            </span>
                                        </div>
                                        
                                        {/* Results display */}
                                        {showResults && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500">
                                                    {option.votes} votes
                                                </span>
                                                {isWinning && (
                                                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                                        Winner!
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Progress bar */}
                                    {showResults && (
                                        <div className="mt-2">
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className={`h-2 rounded-full transition-all duration-500 ${
                                                        isWinning ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : 'bg-purple-400'
                                                    }`}
                                                    style={{ width: `${option.percentage}%` }}
                                                ></div>
                                            </div>
                                            <div className="text-right mt-1">
                                                <span className="text-xs text-gray-500">
                                                    {option.percentage.toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Vote Button */}
                {!hasVoted && !isPollEnded && (
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={handleVote}
                            disabled={selectedOptions.length === 0}
                            className={`
                                px-6 py-2 rounded-lg font-medium text-sm transition-all duration-200
                                ${selectedOptions.length > 0
                                    ? 'bg-purple-500 hover:bg-purple-600 text-white shadow-md hover:shadow-lg'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }
                            `}
                        >
                            {pollData?.allowMultipleVotes ? 'Submit Votes' : 'Submit Vote'}
                        </button>
                    </div>
                )}

                {/* Poll ended message */}
                {isPollEnded && !hasVoted && (
                    <div className="mt-4 p-3 bg-gray-100 rounded-lg text-center">
                        <p className="text-sm text-gray-600">This poll has ended</p>
                    </div>
                )}
            </div>

            {/* 📋 FOOTER SECTION - Comments, Likes, Actions */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between hidden">
                    {/* Left side - Interaction buttons */}
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1 text-gray-600 hover:text-purple-600 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span className="text-xs font-medium">Like</span>
                        </button>
                        
                        <button className="flex items-center gap-1 text-gray-600 hover:text-green-600 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span className="text-xs font-medium">Comment</span>
                        </button>
                        
                        <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors">
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