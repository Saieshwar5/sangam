"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useUserProfileStore } from '@/app/context/userProfileStore';
import { FaUser, FaEnvelope, FaPhone, FaBriefcase, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaCommentDots } from 'react-icons/fa';

export default function UserProfilePage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.userId as string;
    
    const { 
        profile, 
        loadProfile, 
        isProfileLoaded, 
        error, 
        success 
    } = useUserProfileStore();
    
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (userId) {
            if (!isProfileLoaded || profile.userId !== userId) {
                setIsLoading(true);
                loadProfile(userId).finally(() => setIsLoading(false));
            }
        }
    }, [userId, isProfileLoaded, profile.userId, loadProfile]);

    const handleMessageClick = () => {
        router.push(`/main/chat?userId=${userId}`);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin mx-auto" style={{animationDirection: 'reverse', animationDuration: '0.8s'}}></div>
                    </div>
                    <p className="mt-6 text-slate-600 font-medium">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="text-center bg-white p-8 rounded-2xl shadow-xl border border-red-100 max-w-md mx-4">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaTimesCircle className="text-red-500 text-3xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Error Loading Profile</h2>
                    <p className="text-slate-600">{error}</p>
                </div>
            </div>
        );
    }

    if (!isProfileLoaded || !profile.userId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="text-center bg-white p-8 rounded-2xl shadow-xl border border-slate-100 max-w-md mx-4">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaUser className="text-slate-400 text-3xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Profile Not Found</h2>
                    <p className="text-slate-600">No profile found for the requested user.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent">
            {/* Profile Content */}
            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
                    {/* Profile Header */}
                    <div className="relative bg-teal-500 px-8 py-12">
                        <div className="absolute inset-0 bg-black opacity-10"></div>
                        <div className="relative flex flex-col lg:flex-row items-center lg:items-end space-y-6 lg:space-y-0 lg:space-x-8">
                            {/* Profile Picture */}
                            <div className="relative group">
                                <div className="absolute -inset-1 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
                                <div className="relative">
                                    <img
                                        src={profile.profilePicture || '/default-avatar.png'}
                                        alt={profile.displayName || profile.name}
                                        width={140}
                                        height={140}
                                        className="rounded-full border-4 border-white shadow-2xl"
                                    />
                                    {profile.isVerified && (
                                        <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-3 border-4 border-white shadow-lg">
                                            <FaCheckCircle className="text-white text-xl" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* User Info */}
                            <div className="text-center lg:text-left text-white flex-1">
                                <h2 className="text-4xl font-bold mb-3 tracking-tight">
                                    {profile.displayName || profile.name || 'Unknown User'}
                                </h2>
                                {profile.profession && (
                                    <p className="text-blue-100 text-xl mb-4 font-medium">{profile.profession}</p>
                                )}
                                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                                    <span className={`px-4 py-2 rounded-full text-sm font-semibold shadow-lg ${
                                        profile.isActive ? 'bg-emerald-500' : 'bg-red-500'
                                    }`}>
                                        {profile.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                    {profile.isVerified && (
                                        <span className="bg-blue-500 px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                                            Verified
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Chat Button */}
                            <button
                                onClick={handleMessageClick}
                                className="group relative inline-flex items-center gap-3 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-2xl hover:bg-white/30 transition-all duration-300 shadow-lg border border-white/20 hover:shadow-xl hover:scale-105"
                            >
                                <div className="absolute inset-0 bg-white/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                                <FaCommentDots className="text-xl relative z-10" />
                                <span className="font-semibold relative z-10">Chat</span>
                            </button>
                        </div>
                    </div>

                    {/* Profile Details */}
                    <div className="px-8 py-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {/* Contact Information */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                                <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mr-3">
                                        <FaEnvelope className="text-white text-lg" />
                                    </div>
                                    Contact Information
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                                            <FaEnvelope className="text-blue-600" />
                                        </div>
                                        <span className="text-slate-700 font-medium">{profile.email}</span>
                                    </div>
                                    {profile.phoneNumber && (
                                        <div className="flex items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                                                <FaPhone className="text-green-600" />
                                            </div>
                                            <span className="text-slate-700 font-medium">{profile.phoneNumber}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Professional Information */}
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
                                <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                                    <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center mr-3">
                                        <FaBriefcase className="text-white text-lg" />
                                    </div>
                                    Professional Information
                                </h3>
                                <div className="space-y-4">
                                    {profile.profession && (
                                        <div className="flex items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                                                <FaBriefcase className="text-purple-600" />
                                            </div>
                                            <span className="text-slate-700 font-medium">{profile.profession}</span>
                                        </div>
                                    )}
                                    {profile.createdAt && (
                                        <div className="flex items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                                                <FaCalendarAlt className="text-orange-600" />
                                            </div>
                                            <span className="text-slate-700 font-medium">
                                                Joined {new Date(profile.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Bio Section */}
                        {profile.bio && (
                            <div className="mt-10 bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-2xl border border-emerald-100">
                                <h3 className="text-2xl font-bold text-slate-900 mb-4">About</h3>
                                <p className="text-slate-700 leading-relaxed text-lg bg-white p-6 rounded-xl shadow-sm border border-slate-100">{profile.bio}</p>
                            </div>
                        )}

                        
                    </div>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="mt-6 p-6 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl shadow-lg">
                        <p className="text-emerald-800 font-medium text-lg">{success}</p>
                    </div>
                )}
            </div>
        </div>
    );
}