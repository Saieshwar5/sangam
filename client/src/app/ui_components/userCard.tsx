"use client";

import Image from 'next/image';
import { useState } from 'react';
import {
    FaCrown,
    FaShieldAlt,
    FaUserShield,
    FaUser,
    FaEnvelope,
    FaBriefcase,
    FaCalendarAlt,
    FaArrowRight,
    FaTimes,
    FaCheck
} from 'react-icons/fa';

import { CiMenuKebab } from "react-icons/ci";
import { updateUserRoleApi } from '@/api/membersApi';

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
    groupId: string;
    currentUserId?: string;
    isCurrentUserCreator?: boolean; // Pass this from parent
    onRoleUpdate?: (userId: string, newRoles: any) => void; // Callback to refresh data
}

export default function UserCard({ user, groupId, currentUserId, isCurrentUserCreator, onRoleUpdate }: UserCardProps) {
    const [showMenu, setShowMenu] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateError, setUpdateError] = useState<string | null>(null);
    const [updateSuccess, setUpdateSuccess] = useState(false);

    // Local state for role changes
    const [roles, setRoles] = useState({
        isLeader: user.isLeader || false,
        isModerator: user.isModerator || false,
        isMember: user.isMember || false,
    });

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

    // Check if current user can edit roles
    const canEditRoles = isCurrentUserCreator && !user.isCreator && user.userId !== currentUserId;

    const handleMenuClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowMenu(!showMenu);
    };

    const handleUpdateRoleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowMenu(false);
        setShowRoleModal(true);
        setUpdateError(null);
        setUpdateSuccess(false);
    };

    const handleRoleToggle = (roleKey: 'isLeader' | 'isModerator' | 'isMember') => {
        setRoles(prev => ({
            ...prev,
            [roleKey]: !prev[roleKey]
        }));
    };

    const handleSaveRoles = async () => {
        setIsUpdating(true);
        setUpdateError(null);
        setUpdateSuccess(false);

        try {
            const response = await updateUserRoleApi(groupId, user.userId, roles);
            
            if (response.success) {
                setUpdateSuccess(true);
                setTimeout(() => {
                    setShowRoleModal(false);
                    setUpdateSuccess(false);
                    // Notify parent to refresh data
                    if (onRoleUpdate) {
                        onRoleUpdate(user.userId, roles);
                    }
                }, 1500);
            } else {
                setUpdateError(response.message || 'Failed to update role');
            }
        } catch (error: any) {
            setUpdateError(error.message || 'An error occurred');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCloseModal = () => {
        setShowRoleModal(false);
        setUpdateError(null);
        setUpdateSuccess(false);
        // Reset to original values
        setRoles({
            isLeader: user.isLeader || false,
            isModerator: user.isModerator || false,
            isMember: user.isMember || false,
        });
    };

    return (
        <>
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

                    {/* Menu Button - Only show to creator */}
                    {canEditRoles && (
                        <div className="relative">
                            <button onClick={handleMenuClick} className="p-1 hover:bg-gray-100 rounded transition-colors">
                                <CiMenuKebab className="mt-1 h-4 w-4 flex-shrink-0 text-slate-400 hover:text-slate-600" />
                            </button>

                            {/* Dropdown Menu */}
                            {showMenu && (
                                <>
                                    {/* Backdrop to close menu */}
                                    <div 
                                        className="fixed inset-0 z-10" 
                                        onClick={() => setShowMenu(false)}
                                    />
                                    
                                    <div className="absolute right-0 top-8 z-20 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                                        <button
                                            onClick={handleUpdateRoleClick}
                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                        >
                                            <FaUserShield className="w-4 h-4 text-blue-500" />
                                            Update Role
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Role Update Modal */}
            {showRoleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
                        {/* Close Button */}
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <FaTimes className="w-5 h-5 text-gray-500" />
                        </button>

                        {/* Header */}
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Update User Role</h3>
                            <p className="text-sm text-gray-600">
                                Updating role for <span className="font-semibold">{displayName}</span>
                            </p>
                        </div>

                        {/* Role Toggles */}
                        <div className="space-y-4 mb-6">
                            {/* Leader Toggle */}
                            <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                <div className="flex items-center gap-3">
                                    <FaShieldAlt className="w-5 h-5 text-blue-500" />
                                    <div>
                                        <p className="font-medium text-gray-900">Leader</p>
                                        <p className="text-xs text-gray-500">Can manage group content</p>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={roles.isLeader}
                                    onChange={() => handleRoleToggle('isLeader')}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                            </label>

                            {/* Moderator Toggle */}
                            <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                <div className="flex items-center gap-3">
                                    <FaUserShield className="w-5 h-5 text-green-500" />
                                    <div>
                                        <p className="font-medium text-gray-900">Moderator</p>
                                        <p className="text-xs text-gray-500">Can moderate posts and members</p>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={roles.isModerator}
                                    onChange={() => handleRoleToggle('isModerator')}
                                    className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                                />
                            </label>

                            {/* Member Toggle */}
                            <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                <div className="flex items-center gap-3">
                                    <FaUser className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="font-medium text-gray-900">Member</p>
                                        <p className="text-xs text-gray-500">Basic member access</p>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={roles.isMember}
                                    onChange={() => handleRoleToggle('isMember')}
                                    className="w-5 h-5 text-gray-600 rounded focus:ring-2 focus:ring-gray-500"
                                />
                            </label>
                        </div>

                        {/* Error Message */}
                        {updateError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                                <FaTimes className="w-4 h-4 text-red-500 flex-shrink-0" />
                                <p className="text-sm text-red-700">{updateError}</p>
                            </div>
                        )}

                        {/* Success Message */}
                        {updateSuccess && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                                <FaCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                                <p className="text-sm text-green-700">Role updated successfully!</p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleCloseModal}
                                disabled={isUpdating}
                                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveRoles}
                                disabled={isUpdating}
                                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isUpdating ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <FaCheck className="w-4 h-4" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}