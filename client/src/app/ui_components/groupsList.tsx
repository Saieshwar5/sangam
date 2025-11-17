"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { useUserGroupsStore } from "@/app/context/userGroupsStore"
import { IoMdSearch } from "react-icons/io";

import { Group } from "@/app/context/userGroupsStore"

export default function GroupsList({signedIn}: {signedIn: boolean}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { userCreatedGroups, userFollowedGroups, isUserCreatedGroupsLoaded, isUserFollowedGroupsLoaded, loadUserFollowedGroups, loadUserCreatedGroups } = useUserGroupsStore();
    const message = searchParams.get('message');
    const success = searchParams.get('success');
    const follow = searchParams.get('follow');
    const created = searchParams.get('created');
    const groupId = searchParams.get('groupId');

    // ✅ State for active tab (following vs created)
    const [activeTab, setActiveTab] = useState<'following' | 'created'>('created');
    const [currentGroups, setCurrentGroups] = useState<Group[]>(userCreatedGroups);
    const [isLoaded, setIsLoaded] = useState(false);

  


    useEffect(() => {
        setCurrentGroups(activeTab === 'created' ? userCreatedGroups : userFollowedGroups);
        setIsLoaded(activeTab === 'created' ? isUserCreatedGroupsLoaded : isUserFollowedGroupsLoaded);
    }, [activeTab, userCreatedGroups, userFollowedGroups, isUserCreatedGroupsLoaded, isUserFollowedGroupsLoaded, router])


    useEffect(() => {
        if(message && success && follow){
            setActiveTab(follow === 'true' ? 'following' : 'created');
        }
        if(message && success && created){
            setActiveTab('created');
            router.push(`/main/groups/${groupId}`);
        }
    }, [message, success, follow, searchParams, created, groupId])

    
    useEffect(() => {
        if(signedIn){
            loadGroups();
        }
    }, []);
    useEffect(() => {
        if (groupId) return; // URL already points at a group
    
        const isDesktop = window.matchMedia('(min-width: 768px)').matches;

        if(!isDesktop) return;
        
        if (isUserCreatedGroupsLoaded && userCreatedGroups.length > 0) {
            router.replace(`/main/groups/${userCreatedGroups[0].groupId}`);
            return;
        }
    
        if (isUserFollowedGroupsLoaded && userFollowedGroups.length > 0) {
            router.replace(`/main/groups/${userFollowedGroups[0].groupId}`);
        }
    }, [
        groupId,
        isUserCreatedGroupsLoaded,
        userCreatedGroups,
        isUserFollowedGroupsLoaded,
        userFollowedGroups,
        router,
    ]);
  

   


   async function loadGroups()
   {
    try{
        await Promise.allSettled([
            loadUserFollowedGroups(),
            loadUserCreatedGroups()
        ])
    }
    catch(error){
        console.error(error);
    }
   }

   



    const createGroup = () => {
        router.push("/create_group")
    }

    const handleGroupClick = (groupId: string) => {
        router.push(`/main/groups/${groupId}`);
    }



    return (
        <Suspense fallback={<div>Loading...</div>}>
        <div className="w-full h-full bg-teal-100 flex flex-col pt-1.5 pr-1.5 gap-1.5 border-1 border-l-0 border-t-0 border-black">
            <div className="w-full h-12 bg-white rounded-lg gap-1.5 border-1 border-black flex items-center justify-center">
                <input type="text" placeholder="Search groups" className="w-full h-full outline-none text-sm px-2" />
                <button className="w-10 h-[100%] rounded-lg flex items-center justify-center bg-teal-600 hover:bg-teal-400 text-white font-bold transition-colors">
                    <IoMdSearch className="w-5 h-5" />
                </button>
            </div>  
            
            {/* ✅ Tab buttons */}
            <div className="w-full h-10 rounded-lg flex items-center justify-between flex-row gap-1">
                <button 
                    className={`h-full text-sm font-bold flex-1 rounded-l-lg border-1 transition-colors ${
                        activeTab === 'following' 
                            ? 'bg-teal-500 text-white' 
                            : 'bg-teal-500 hover:bg-teal-600'
                    }`}
                    onClick={() => setActiveTab('following')}
                >
                    Following ({Array.isArray(userFollowedGroups) ? userFollowedGroups.length : 0})
                </button>
                <button 
                    className={`h-full text-sm font-bold flex-1 rounded-r-lg border-1 transition-colors ${
                        activeTab === 'created' 
                            ? 'bg-teal-500 text-white' 
                            : 'bg-teal-500 hover:bg-teal-600'
                    }`}
                    onClick={() => setActiveTab('created')}
                >
                    Created ({Array.isArray(userCreatedGroups) ? userCreatedGroups.length : 0})
                </button>
            </div>

            <div className="bg-white w-full h-full rounded-lg flex items-center justify-start flex-col border-1 border-black p-2 gap-1 overflow-y-scroll">
                {/* ✅ Loading state */}
                {!isLoaded && (
                    <div className="w-full h-16 rounded-lg flex items-center justify-center border-1 border-black">
                        <p className="text-sm text-gray-500">Loading groups...</p>
                    </div>
                )}

                {/* ✅ Empty state */}
                {isLoaded && currentGroups.length === 0 && (
                    <div className="w-full h-16 rounded-lg flex items-center justify-center border-1 border-black">
                        <p className="text-sm text-gray-500">
                            No {activeTab} groups found
                        </p>
                    </div>
                )}

                {/* ✅ Render actual groups from store */}
                {isLoaded && currentGroups.map((group, index) => (
                    
                    <div key={group.groupId || index} className="w-full h-16 rounded-lg flex items-center justify-between flex-row gap-1 border-1 border-black hover:bg-gray-50 transition-colors
                    cursor-pointer"
                    onClick={() => handleGroupClick(group.groupId || '')}
                    >
                        {/* Group Logo */}
                        <div className="w-16 h-16 rounded-lg flex items-center justify-center">
                            {group.logo ? (
                                <img 
                                    src={group.logo || ''} 
                                    alt={group.groupName} 
                                    className="w-12 h-12 object-cover rounded-lg"
                                    onError={(e) => {
                                        // Fallback to default icon if image fails to load
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                    }}
                                />
                            ) : null}
                            <svg className={`w-8 h-8 text-gray-400 ${group.logo ? 'hidden' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>

                        {/* Group Info */}
                        <div className="flex-1 h-full flex flex-col justify-center px-2">
                            <p className="text-sm font-bold truncate">{group.groupName}</p>
                            {group.description && (
                                <p className="text-xs text-gray-500 truncate">{group.description}</p>
                            )}
                        </div>

                        {/* Group Actions (Optional - for future use) */}
                        <div className="w-8 h-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                ))}

                {/* ✅ Create Group Button */}
                <button 
                    className="w-full h-16 rounded-lg flex items-center justify-center flex-row gap-2 border-1 border-black bg-teal-500 hover:bg-teal-600 hover:cursor-pointer hover:text-gray-200  text-white font-bold transition-colors"
                   
                    onClick={createGroup}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Group
                </button>
            </div>
        </div>
        </Suspense>
    )
}