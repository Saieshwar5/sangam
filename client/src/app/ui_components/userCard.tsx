// client/src/app/ui_components/userCard.tsx

import Image from 'next/image';
import { FaCrown, FaShieldAlt, FaUserShield, FaUser } from 'react-icons/fa';

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

    return (
        <div className="w-full h-14 bg-white border-b border-gray-200 flex items-center px-4 hover:bg-gray-50 transition-colors cursor-pointer">
            {/* Profile Picture */}
            <div className="relative flex-shrink-0 mr-3">
                <Image 
                    src="/default-avater.svg" 
                    alt={displayName}
                    width={40} 
                    height={40}
                    className="rounded-full"
                />
                {user.isVerified && (
                    <div className="absolute -bottom-0.5 -right-0.5 bg-blue-500 rounded-full p-0.5">
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                )}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                            {displayName}
                        </h3>
                        {roleInfo.icon}
                    </div>
                    
                    <div className="text-right flex-shrink-0 ml-2">
                        <p className="text-xs text-gray-500">
                            {user.isCreator ? 'Creator' : 
                             user.isLeader ? 'Leader' : 
                             user.isModerator ? 'Moderator' : 'Member'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}