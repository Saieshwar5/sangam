"use client"

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useUserGroupsStore } from '@/app/context/userGroupsStore';
import { useAuth } from '@/hooks/useAuth';
import { useJoinGroup } from '@/hooks/userGroups';
import { MdModeEditOutline, MdLocationOn } from "react-icons/md";
import { FaUsers, FaImages } from "react-icons/fa";
import { loadGroupInfoApi } from '@/api/groupsApis';
import { loadMembersApi } from '@/api/membersApi';


import styles from './groupDetails.module.css';

import UserCard from '@/app/ui_components/userCard';



export default function GroupDetailPage() {
    const joinGroupHook = useJoinGroup();
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { userCreatedGroups, userFollowedGroups } = useUserGroupsStore();
    
    const [group, setGroup] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'gallery' | 'members'>('gallery');
    const [members, setMembers] = useState<any[]>([]);
    const [gallery, setGallery] = useState<any[]>([]);
    const [isMembersLoaded, setIsMembersLoaded] = useState(false);
    const [isGalleryLoaded, setIsGalleryLoaded] = useState(false);

    const groupId = params.groupId as string;

    useEffect(() => {
        const loadGroupAndFindGroup = async () => {
            try{
                setLoading(true);
        const createdGroup = userCreatedGroups.find(g => g.groupId === groupId);
        const followedGroup = userFollowedGroups.find(g => g.groupId === groupId);
        await loadMembers();
        
        const foundGroup = createdGroup || followedGroup;
        if(foundGroup){
            setGroup(foundGroup);
            setLoading(false);
            console.log("we found group in internal memory")
            return;
        }
        else{
           const loadedGroup= await loadGroupFromServer();
         
            
           if(!loadedGroup){  // ✅ Check the returned data, not state
            router.push('/groups');
          }
        }
    }
    catch(error){
        console.error(error);
        setLoading(false);
        router.push('/groups');
    }
 }
        loadGroupAndFindGroup();
    }, [groupId, router]);


    const handleGroupJoin = async () => {
        try {
            if (user && user.id) {
                const response = await joinGroupHook(groupId);
                if (response) {
                    setLoading(false);
                    router.push('/groups?message=Group joined successfully&success=true&follow=true');
                } else {
                    router.push('/groups');
                }
            } else {
                router.push(`/auth/sign-up?groupId=${groupId}&redirect=join`);
            }
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };


    const loadGroupFromServer = async () => {
        try {
            const response = await loadGroupInfoApi(groupId);
            if (response.success) {
                setGroup(response.data);
                setLoading(false);
                return response.data;
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error(error);
            throw new Error('Failed to load group');
        }
    }

    const loadMembers = async () => {
        try{
            console.log("Loading members for group:", groupId);
            const response = await loadMembersApi(groupId);
            if(response.success){
                setMembers(response.data || []);
                setIsMembersLoaded(true);
                console.log("Members loaded:", response.data);
                return response.data;
            } else {
                console.error("Failed to load members:", response.message);
                throw new Error(response.message);
            }
        }
        catch(error){
            console.error(error);
            throw new Error('Failed to load members');
        }
    }


    const openUserProfile = (userId: string) => {
        router.push(`/profile/${userId}`);
    }

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loader}>
                    <div className={styles.loaderSpinner}></div>
                    <p className={styles.loadingText}>Loading group...</p>
                </div>
            </div>
        );
    }

    if (!group) {
        return (
            <div className={styles.errorContainer}>
                <div className={styles.errorContent}>
                    <div className={styles.errorIcon}>❌</div>
                    <h2 className={styles.errorTitle}>Group not found</h2>
                    <p className={styles.errorMessage}>The group you're looking for doesn't exist or has been removed.</p>
                    <button 
                        onClick={() => router.push('/groups')}
                        className={styles.errorButton}
                    >
                        Back to Groups
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            {/* ✨ Desktop Layout - Enhanced Header with Cover & Logo */}
            <div className={styles.desktopHeader}>
                {/* Cover Image with Gradient Overlay */}
                <div className={styles.coverImageContainer}>
                    {group.coverImage ? (
                        <img 
                            src={`/uploads/${group.coverImage}`}
                            alt={`${group.groupName} cover`}
                            className={styles.coverImage}
                        />
                    ) : (
                        <div className={styles.coverPlaceholder}>
                            <div className={styles.coverPattern}></div>
                        </div>
                    )}
                    <div className={styles.coverGradient}></div>
                
                
                {/* Group Info Card (Glassmorphism) */}
                <div className={styles.groupInfoCard}>
                    <div className={styles.groupInfoLeft}>
                        {/* Logo */}
                        <div className={styles.groupLogoContainer}>
                            {group.logo ? (
                                <img 
                                    src={`/uploads/${group.logo}`}
                                    alt={group.groupName}
                                    className={styles.groupLogo}
                                />
                            ) : (
                                <div className={styles.groupLogoPlaceholder}>
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        
                        {/* Group Name & ID */}
                        <div className={styles.groupNameSection}>
                            <h1 className={styles.groupName}>{group.groupName}</h1>
                            <div className={styles.groupIdBadge}>
                                <span className={styles.groupIdLabel}>@{group.uniqueName}</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className={styles.groupActions}>
                        <button 
                            className={styles.editButton}
                            title="Edit Group"
                        >
                            <MdModeEditOutline />
                        </button>
                        <button 
                            className={styles.joinButton}
                            onClick={handleGroupJoin}
                        >
                            <span>Join Group</span>
                            <svg className={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </button>
                    </div>
                </div>
                </div>
            </div>

            {/* ✨ Mobile Layout - Simple Header */}
            <div className={styles.mobileHeader}>
                <div className={styles.mobileGroupInfo}>
                    <div className={styles.mobileLogoContainer}>
                        {group.logo ? (
                            <img 
                                src={`/uploads/${group.logo}`}
                                alt={group.groupName}
                                className={styles.mobileLogo}
                            />
                        ) : (
                            <div className={styles.mobileLogoPlaceholder}>
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        )}
                    </div>
                    <div className={styles.mobileGroupDetails}>
                        <h1 className={styles.mobileGroupName}>{group.groupName}</h1>
                        <p className={styles.mobileGroupId}>@{group.uniqueName}</p>
                    </div>
                    <button 
                        className={styles.mobileJoinButton}
                        onClick={handleGroupJoin}
                    >
                        Join
                    </button>
                </div>
            </div>

            {/* ✨ Desktop Layout - Two Column */}
            <div className={styles.desktopLayout}>
                {/* Left Column - Info Cards */}
                <div className={styles.leftColumn}>
                    {/* Description Card */}
                    <div className={styles.infoCard}>
                        <h2 className={styles.cardTitle}>
                            <span className={styles.cardIcon}>📝</span>
                            About This Group
                        </h2>
                        <p className={styles.cardText}>{group.description}</p>
                    </div>

                    {/* Vision Card */}
                    {group.vision && (
                        <div className={styles.infoCard}>
                            <h2 className={styles.cardTitle}>
                                <span className={styles.cardIcon}>🎯</span>
                                Our Vision
                            </h2>
                            <p className={styles.cardText}>{group.vision}</p>
                        </div>
                    )}

                    {/* Address Card */}
                    {group.address && (
                        <div className={styles.infoCard}>
                            <h2 className={styles.cardTitle}>
                                <MdLocationOn className={styles.cardIconSvg} />
                                Location
                            </h2>
                            <p className={styles.cardText}>{group.address}</p>
                        </div>
                    )}

                    {/* Social Media Card */}
                    {(group.youtubeUrl || group.twitterUrl || group.instagramUrl) && (
                        <div className={styles.socialCard}>
                            <h3 className={styles.cardTitle}>
                                <span className={styles.cardIcon}>🔗</span>
                                Connect With Us
                            </h3>
                            <div className={styles.socialLinks}>
                                {group.youtubeUrl && (
                                    <a 
                                        href={group.youtubeUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className={`${styles.socialButton} ${styles.youtube}`}
                                    >
                                        <svg className={styles.socialIcon} fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                        </svg>
                                        YouTube
                                    </a>
                                )}
                                {group.twitterUrl && (
                                    <a 
                                        href={group.twitterUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className={`${styles.socialButton} ${styles.twitter}`}
                                    >
                                        <svg className={styles.socialIcon} fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                        </svg>
                                        X
                                    </a>
                                )}
                                {group.instagramUrl && (
                                    <a 
                                        href={group.instagramUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className={`${styles.socialButton} ${styles.instagram}`}
                                    >
                                        <svg className={styles.socialIcon} fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                        </svg>
                                        Instagram
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column -/Members Tabs */}
                <div className={styles.rightColumn}>
                    
                        <div className={styles.membersHeader}>
                           
                                <FaUsers className={styles.tabIcon} />
                                <span>Members</span>

                        </div>

                        {/* Tab Content */}
                        <div className={styles.membersContent}>

                            {members.map((member) => (
                                <div onClick={() => openUserProfile(member.userId)}>
                                <UserCard key={member.id} user={member} />
                                    </div>
                            ))}
                               
                        </div>
                    
                </div>
            </div>

            <div className={styles.deskTopGallerySection}>
                    <div className={styles.galleryCard}>
                        {/* Tab Headers */}
                        <div className={styles.tabHeaders}>
                            <button 
                                className={`${styles.tabButton} ${activeTab === 'gallery' ? styles.tabActive : ''}`}
                                onClick={() => setActiveTab('gallery')}
                            >
                                <FaImages className={styles.tabIcon} />
                                <span>Gallery</span>
                            </button>
                        </div>

                        {/* Tab Content - Scrollable */}
                        <div className={styles.tabContentScrollable}>
                            {activeTab === 'gallery' ? (
                                <div className={styles.emptyState}>
                                    <FaImages className={styles.emptyIcon} />
                                    <p className={styles.emptyText}>No photos yet</p>
                                    <p className={styles.emptySubtext}>Gallery will appear here</p>
                                </div>
                            ) : (
                                <div className={styles.emptyState}>
                                    <FaUsers className={styles.emptyIcon} />
                                    <p className={styles.emptyText}>No members to show</p>
                                    <p className={styles.emptySubtext}>Members will appear here</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            {/* ✨ Mobile Layout - Single Column */}
            <div className={styles.mobileLayout}>
                {/* Info Cards Section */}
                <div className={styles.infoCardsSection}>
                    {/* Description Card */}
                    <div className={styles.infoCard}>
                        <h2 className={styles.cardTitle}>
                            <span className={styles.cardIcon}>📝</span>
                            About This Group
                        </h2>
                        <p className={styles.cardText}>{group.description}</p>
                    </div>

                    {/* Vision Card */}
                    {group.vision && (
                        <div className={styles.infoCard}>
                            <h2 className={styles.cardTitle}>
                                <span className={styles.cardIcon}>🎯</span>
                                Our Vision
                            </h2>
                            <p className={styles.cardText}>{group.vision}</p>
                        </div>
                    )}

                    {/* Address Card */}
                    {group.address && (
                        <div className={styles.infoCard}>
                            <h2 className={styles.cardTitle}>
                                <MdLocationOn className={styles.cardIconSvg} />
                                Location
                            </h2>
                            <p className={styles.cardText}>{group.address}</p>
                        </div>
                    )}

                    {/* Social Media Card */}
                    {(group.youtubeUrl || group.twitterUrl || group.instagramUrl) && (
                        <div className={styles.socialCard}>
                            <h3 className={styles.cardTitle}>
                                <span className={styles.cardIcon}>🔗</span>
                                Connect With Us
                            </h3>
                            <div className={styles.socialLinks}>
                                {group.youtubeUrl && (
                                    <a 
                                        href={group.youtubeUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className={`${styles.socialButton} ${styles.youtube}`}
                                    >
                                        <svg className={styles.socialIcon} fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                        </svg>
                                        YouTube
                                    </a>
                                )}
                                {group.twitterUrl && (
                                    <a 
                                        href={group.twitterUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className={`${styles.socialButton} ${styles.twitter}`}
                                    >
                                        <svg className={styles.socialIcon} fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                        </svg>
                                        X
                                    </a>
                                )}
                                {group.instagramUrl && (
                                    <a 
                                        href={group.instagramUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className={`${styles.socialButton} ${styles.instagram}`}
                                    >
                                        <svg className={styles.socialIcon} fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                        </svg>
                                        Instagram
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Full Width Gallery/Members Section at Bottom */}
                <div className={styles.fullWidthSection}>
                    <div className={styles.tabCard}>
                        {/* Tab Headers */}
                        <div className={styles.tabHeaders}>
                            <button 
                                className={`${styles.tabButton} ${activeTab === 'gallery' ? styles.tabActive : ''}`}
                                onClick={() => setActiveTab('gallery')}
                            >
                                <FaImages className={styles.tabIcon} />
                                <span>Gallery</span>
                            </button>
                            <button 
                                className={`${styles.tabButton} ${activeTab === 'members' ? styles.tabActive : ''}`}
                                onClick={() => setActiveTab('members')}
                            >
                                <FaUsers className={styles.tabIcon} />
                                <span>Members</span>
                            </button>
                        </div>

                        {/* Tab Content - Scrollable */}
                        <div className={styles.tabContentScrollable}>
                            {activeTab === 'gallery' ? (
                                <div className={styles.emptyState}>
                                    <FaImages className={styles.emptyIcon} />
                                    <p className={styles.emptyText}>No photos yet</p>
                                    <p className={styles.emptySubtext}>Gallery will appear here</p>
                                </div>
                            ) : (
                                <div className={styles.emptyState}>
                                    <FaUsers className={styles.emptyIcon} />
                                    <p className={styles.emptyText}>No members to show</p>
                                    <p className={styles.emptySubtext}>Members will appear here</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
