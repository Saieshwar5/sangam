import React, { useEffect } from 'react';
import { useJoinGroupRequestsStore } from '@/app/context/joinGroupRequestsStore';

interface JoinGroupRequestsModalProps {
    isOpen: boolean;
    onClose: () => void;
    groupId: string;
}

export default function JoinGroupRequestsModal({ isOpen, onClose, groupId }: JoinGroupRequestsModalProps) {
    const { 
        requestsByGroup, 
        loadRequests, 
        acceptRequest, 
        rejectRequest, 
        isLoading, 
        error 
    } = useJoinGroupRequestsStore();

    const requests = requestsByGroup[groupId] || [];

    useEffect(() => {
        if (isOpen && groupId) {
            loadRequests(groupId);
        }
    }, [isOpen, groupId, loadRequests]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800">Join Requests</h2>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {isLoading && requests.length === 0 ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-500 py-4">
                            {error}
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            No pending requests
                        </div>
                    ) : (
                        requests.map((request) => (
                            <div key={request.id} className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-3">
                                    {/* User Avatar */}
                                    <div className="flex-shrink-0">
                                        {request.user?.profile_picture ? (
                                            <img 
                                                src={request.user.profile_picture} 
                                                alt={request.user.username} 
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                                                {request.user?.username?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>

                                    {/* Request Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-medium text-gray-900 truncate">
                                                    {request.user?.username}
                                                </h3>
                                                <p className="text-xs text-gray-500">
                                                    Referred by: <span className="font-medium text-indigo-600">@{request.referrer?.username || 'Unknown'}</span>
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {new Date(request.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {/* Action Buttons */}
                                        <div className="flex gap-2 mt-3">
                                            <button
                                                onClick={() => acceptRequest(request.id.toString())}
                                                className="flex-1 px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => rejectRequest(request.id.toString())}
                                                className="flex-1 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
