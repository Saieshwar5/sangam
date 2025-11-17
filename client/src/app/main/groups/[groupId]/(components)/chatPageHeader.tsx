"use client"

import { useState } from 'react';

interface Group {
    groupId: string;
    groupName: string;
    description?: string;
    logo?: string;
    coverImage?: string;
    uniqueName?: string;
    vision?: string;
    address?: string;
    youtubeUrl?: string;
    twitterUrl?: string;
    instagramUrl?: string;
    createdBy?: string;
}

interface ChatPageHeaderProps {
    group: Group;
    onBack?: () => void;
    onShare?: () => void;
    onHeaderClick?: () => void; // ✅ Add this prop
}

export default function ChatPageHeader({ group, onBack, onShare, onHeaderClick }: ChatPageHeaderProps) {
    const [showMenu, setShowMenu] = useState(false);

    const handleShare = (e: React.MouseEvent) => {
        e.stopPropagation(); // ✅ Prevent header click
        if (onShare) {
            onShare();
        } else {
            // Default share functionality
            if (navigator.share) {
                navigator.share({
                    title: group.groupName,
                    text: group.description || `Join ${group.groupName}`,
                    url: window.location.href,
                });
            } else {
                // Fallback: copy to clipboard
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
            }
        }
    };

    const handleMenuToggle = (e: React.MouseEvent) => {
        e.stopPropagation(); // ✅ Prevent header click
        setShowMenu(!showMenu);
    };

    const handleHeaderClick = () => {
        if (onHeaderClick) {
            onHeaderClick();
        }
    };

    const menuItems = [
        { label: 'Group Info', action: () => console.log('Group Info') },
        { label: 'Members', action: () => console.log('Members') },
        { label: 'Settings', action: () => console.log('Settings') },
        { label: 'Notifications', action: () => console.log('Notifications') },
        { label: 'Report Group', action: () => console.log('Report Group') },
    ];

    return (
        <div 
            className="w-full h-full bg-white border-b border-gray-200 flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={handleHeaderClick} // ✅ Make header clickable
        >
           {/* Left Section - Back Button + Group Info */}
           
             <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Back Button - commented out as in your code
                <button 
                    onClick={onBack}
                    className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                */}

                {/* Group Logo */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                    {group.logo ? (
                        <img 
                            src={group.logo || ''}
                            alt={group.groupName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                        />
                    ) : null}
                    <div className={`w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center ${group.logo ? 'hidden' : ''}`}>
                        <span className="text-white font-bold text-lg">
                            {group.groupName?.charAt(0)?.toUpperCase() || 'G'}
                        </span>
                    </div>
                </div>

                {/* Group Details */}
                <div className="flex-1 min-w-0">
                    <h1 className="text-lg font-semibold text-gray-900 truncate">
                        {group.groupName}
                    </h1>
                    <p className="text-sm text-gray-500 truncate">
                        {group.uniqueName ? `@${group.uniqueName}` : 'Group Chat'}
                    </p>
                </div>
            </div>

            {/* Right Section - Share Button + Menu */}
            <div className="flex items-center gap-2 flex-shrink-0">
                {/* Share Button */}
                <button 
                    onClick={handleShare} // ✅ Now with stopPropagation
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    title="Share Group"
                >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                </button>

                {/* Three Dots Menu */}
                <div className="relative">
                    <button 
                        onClick={handleMenuToggle} // ✅ Now with stopPropagation
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        title="More Options"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {showMenu && (
                        <>
                            {/* Backdrop */}
                            <div 
                                className="fixed inset-0 z-10" 
                                onClick={(e) => {
                                    e.stopPropagation(); // ✅ Prevent header click
                                    setShowMenu(false);
                                }}
                            />
                            
                            {/* Menu */}
                            <div 
                                className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20"
                                onClick={(e) => e.stopPropagation()} // ✅ Prevent header click
                            >
                                <div className="py-1">
                                    {menuItems.map((item, index) => (
                                        <button
                                            key={index}
                                            onClick={(e) => {
                                                e.stopPropagation(); // ✅ Prevent header click
                                                item.action();
                                                setShowMenu(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                                
                                {/* Divider */}
                                <div className="border-t border-gray-100"></div>
                                
                                {/* Additional Actions */}
                                <div className="py-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation(); // ✅ Prevent header click
                                            console.log('Leave Group');
                                            setShowMenu(false);
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        Leave Group
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}