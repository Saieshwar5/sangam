"use client";

import Image from 'next/image';
import {
    FaCrown,
    FaShieldAlt,
    FaUserShield,
    FaUser,
    FaEnvelope,
    FaBriefcase,
    FaCalendarAlt,
    FaArrowRight
} from 'react-icons/fa';

import { CiMenuKebab } from "react-icons/ci";

interface UserCardProps {
    user: {
        userId: string;
        name: string;
        displayName?: string;
        email: string;
        bio?: string;
        profession?: string;
        isVerified?: boolean;
        isCreator?: boolean;
        isLeader?: boolean;
        isModerator?: boolean;
        joinedAt?: string;
        profilePicture?: string;
    };
}

export default function UserCard({ user }: UserCardProps) {
    // Determine user role and icon
    const getRoleInfo = () => {
        if (user.isCreator) {
            return { 
                role: 'Creator', 
                icon: <FaCrown className="w-4 h-4 text-yellow-500" />,
                bgColor: 'bg-gradient-to-r from-yellow-50 to-yellow-100',
                borderColor: 'border-yellow-200'
            };
        }
        if (user.isLeader) {
            return { 
                role: 'Leader', 
                icon: <FaShieldAlt className="w-4 h-4 text-blue-500" />,
                bgColor: 'bg-gradient-to-r from-blue-50 to-blue-100',
                borderColor: 'border-blue-200'
            };
        }
        if (user.isModerator) {
            return { 
                role: 'Moderator', 
                icon: <FaUserShield className="w-4 h-4 text-green-500" />,
                bgColor: 'bg-gradient-to-r from-green-50 to-green-100',
                borderColor: 'border-green-200'
            };
        }
        return { 
            role: 'Member', 
            icon: <FaUser className="w-4 h-4 text-gray-500" />,
            bgColor: 'bg-gradient-to-r from-gray-50 to-gray-100',
            borderColor: 'border-gray-200'
        };
    };

    const roleInfo = getRoleInfo();
    const displayName = user.displayName || user.name || 'Unknown User';
    const profilePicture = user.profilePicture || '/default-avater.svg';

    const joinedDateLabel = (() => {
        if (!user.joinedAt) return null;
        const parsedDate = new Date(user.joinedAt);
        if (Number.isNaN(parsedDate.getTime())) return null;
        return new Intl.DateTimeFormat(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(parsedDate);
    })();

    return (
        <div className={`group relative w-full overflow-hidden rounded-xl border ${roleInfo.borderColor} bg-white/70 px-4 py-4 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-lg`}>
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/60 via-white/20 to-white/0 opacity-70 w-full" />

            <div className="relative z-10 flex items-start gap-4 w-full">
                {/* Profile Picture */}
                <div className="relative flex-shrink-0">
                    <img 
                        src={profilePicture || '/default-avater.svg'}
                        alt={displayName}
                        className="h-14 w-14 rounded-full border-2 border-white object-cover shadow-md"
                    />
                    {user.isVerified && (
                        <div className="absolute -bottom-0.5 -right-0.5 rounded-full bg-blue-500 p-1 shadow-sm">
                            <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                    )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-semibold text-slate-900 truncate">
                                    {displayName}
                                </h3>
                                {roleInfo.icon}
                            </div>
                            
                        </div>

                        <span
                            className={`inline-flex items-center gap-1 rounded-full border ${roleInfo.borderColor} ${roleInfo.bgColor} px-2.5 py-1 text-xs font-medium text-slate-700`}
                        >
                            {roleInfo.role}
                        </span>
                    </div>

                    

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        
                        {joinedDateLabel && (
                            <span className="flex items-center gap-1.5">
                                <FaCalendarAlt className="h-3.5 w-3.5 text-slate-400" />
                                Joined&nbsp;{joinedDateLabel}
                            </span>
                        )}
                    </div>
                </div>

                <button>
                    <CiMenuKebab className="mt-1 h-4 w-4 flex-shrink-0 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-slate-500" />
                </button>
            </div>
        </div>
    );
}