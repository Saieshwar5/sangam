"use client"

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { useUserGroupsStore } from '@/app/context/userGroupsStore';
import { useAuth } from '@/hooks/useAuth';
import ChatPageHeader from './(components)/chatPageHeader';
import ContentSection from './(components)/contentSection';
import GroupShareModal from './(components)/groupShareModal';

export default function GroupDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { userCreatedGroups, userFollowedGroups } = useUserGroupsStore();
    
    const [loading, setLoading] = useState(true);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    const groupId = params.groupId as string;

    // Derive group from stores using useMemo
    const group = useMemo(() => {
        const createdGroup = userCreatedGroups.find(g => g.groupId === groupId);
        const followedGroup = userFollowedGroups.find(g => g.groupId === groupId);
        return createdGroup || followedGroup || null;
    }, [groupId, userCreatedGroups, userFollowedGroups]);

    // Handle side effects (navigation, loading state)
    useEffect(() => {
        if (!group) {
            router.push('/groups');
        }
        setLoading(false);
    }, [group, router]);

    const handleBack = () => {
        router.back();
    };

    const handleShare = () => {
        setIsShareModalOpen(true);
    };

    const handleHeaderClick = () => {
        console.log('Opening group info');
        if (group) {
            router.push(`/${group.groupId}`);
        }
    };

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading group...</p>
                </div>
            </div>
        );
    }

    if (!group) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 text-lg font-semibold mb-4">Group not found</p>
                    <button 
                        onClick={() => router.push('/groups')}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Back to Groups
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className='w-full h-full flex flex-col'>
                <div className='w-full h-[10%]'>
                    <ChatPageHeader 
                        group={group}
                        onBack={handleBack}
                        onShare={handleShare}
                        onHeaderClick={handleHeaderClick}
                    />
                </div>
                
                <div className='w-full z-0 h-[95%]'>
                    <ContentSection 
                        groupId={group.groupId}
                        groupName={group.groupName}
                    />
                </div>
            </div>

            {/* Share Modal */}
            <GroupShareModal 
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                group={group}
            />
        </>
    )
}





    