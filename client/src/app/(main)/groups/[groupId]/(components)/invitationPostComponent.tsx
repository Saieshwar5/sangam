"use client"

import { useMemo, useState , useEffect} from 'react';

import { useUser } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useUserGroupPostsStore } from '@/app/context/userGroupPostsStore';

interface EventData {
    eventAddress: string;
    eventGoogleMapLink: string;
    eventDate: string;
    eventTime: string;
    eventContactInfo: string;
}

// Event/Invitation data interface that matches your createPostModal
interface EventInvitationData {
    eventAddress: string;
    eventGoogleMapLink: string;
    eventDate: string;
    eventTime: string;
    eventContactInfo: string;
}

interface InvitationPostComponentProps {
    postId: string;
    postType: string;
    postContent: string;
    postCreator: string;
    postCreatorName: string;
    createdAt: string;
    updatedAt: string;
    postIsActive: boolean;
    postIsDeleted: boolean;
    eventData: EventData;
}

export default function InvitationPostComponent({
    postId,
    postType,
    postContent,
    postCreator,
    postCreatorName,
    createdAt,
    updatedAt,
    postIsActive,
    postIsDeleted,
    eventData
}: InvitationPostComponentProps) {

    const user = useUser();
    const router = useRouter();
    const { recordEventParticipation , userEventParticipated} = useUserGroupPostsStore();
    const isRSVPed = useMemo(
        () => userEventParticipated.some(participation => participation.eventPostId === postId),
        [userEventParticipated, postId]
    );



    const handleRSVP = async () => {
        console.log("RSVP clicked");
        
        const response = await recordEventParticipation(user?.id || '', postId);
        // UI will reflect isRSVPed from store update
    }

    const handleProfileClick = () => {
        console.log("Profile clicked");
        console.log("user", user);
        router.push(`/profile/${postCreator}`);
    }


    
    return (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden">
            
            
            <div className="p-6 pb-4">
                {/* Post Creator */}
                <div className="flex flex-row items-center gap-3 mb-4 justify-between"
                
                >
                    <div className="flex flex-row items-center gap-3 cursor-pointer"
                    onClick={handleProfileClick}
                    >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center shadow-md">
                        <span className="text-white font-bold text-sm">
                            {postCreatorName.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800 text-sm">
                            {postCreatorName}
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

                {/* Event/Invitation Message */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border-l-4 border-indigo-400 mb-4">
                    <p className="text-gray-700 text-sm leading-relaxed">
                        {postContent}
                    </p>
                </div>

                {/* Event Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Date & Time */}
                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="font-semibold text-sm text-gray-700">Date & Time</span>
                        </div>
                        <p className="text-sm text-gray-600">
                            {eventData?.eventDate ? new Date(eventData?.eventDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            }) : 'Date not specified'}
                        </p>
                        {eventData?.eventTime && (
                            <p className="text-sm text-gray-600 mt-1">
                                {eventData?.eventTime}
                            </p>
                        )}
                    </div>

                    {/* Location */}
                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="font-semibold text-sm text-gray-700">Location</span>
                        </div>
                        <p className="text-sm text-gray-600">
                            {eventData?.eventAddress || 'Address not provided'}
                        </p>
                        {eventData?.eventGoogleMapLink && (
                            <a 
                                href={eventData?.eventGoogleMapLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800 mt-1 inline-flex items-center gap-1"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                View on Map
                            </a>
                        )}
                    </div>
                </div>

                {/* Contact Information */}
                {eventData?.eventContactInfo && (
                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="font-semibold text-sm text-gray-700">Contact</span>
                        </div>
                        <p className="text-sm text-gray-600">
                            {eventData?.eventContactInfo}
                        </p>
                    </div>
                )}

                {/* RSVP Button */}
                <div className="flex justify-center mt-4">
                    <button
                        className={`px-8 py-3 rounded-lg font-medium text-sm transition-all duration-200 shadow-md hover:shadow-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white ${isRSVPed ? 'opacity-50 cursor-not-allowed' : ''} ${isRSVPed ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        disabled={isRSVPed}
                        
                        onClick={handleRSVP}
                       
                    >
                        {isRSVPed ? "accepted" : "RSVP / Accept Invitation"}
                    </button>
                </div>
            </div>

            {/* 📋 FOOTER SECTION */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 hidden"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span className="text-xs font-medium">Like</span>
                        </button>
                        
                        
                        
                        <button className="flex items-center gap-1 text-gray-600 hover:text-purple-600 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                            </svg>
                            <span className="text-xs font-medium">quote</span>
                        </button>
                    </div>

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