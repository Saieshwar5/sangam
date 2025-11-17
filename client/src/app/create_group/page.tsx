"use client"

import { useState, useEffect } from 'react';

import { useUser } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

;


import { useUserGroupsStore } from '@/app/context/userGroupsStore';

export default function CreateGroupPage() {
    const  user  = useUser();
    const router = useRouter();
    const [formData, setFormData] = useState({
        groupName: '',
        description: '',
        coverImage: null as File | null,
        logo: null as File | null,
        uniqueName: '',
        vision: '',
        address: '',
        // ✅ Add social media fields
        youtubeUrl: '',
        twitterUrl: '',
        instagramUrl: '',
    });

    const { createGroup, error, success, isUserGroupsLoaded } = useUserGroupsStore();

    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, coverImage: file }));
            
            // Create preview
            const reader = new FileReader();
            reader.onload = () => setCoverPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, logo: file }));
            
            // Create preview
            const reader = new FileReader();
            reader.onload = () => setLogoPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('groupName', formData.groupName);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('createdBy', user?.id || '');
            formDataToSend.append('uniqueName', formData.uniqueName);
            formDataToSend.append('vision', formData.vision);
            formDataToSend.append('address', formData.address);
            // ✅ Add social media URLs
            formDataToSend.append('youtubeUrl', formData.youtubeUrl);
            formDataToSend.append('twitterUrl', formData.twitterUrl);
            formDataToSend.append('instagramUrl', formData.instagramUrl);
            
            if (formData.coverImage) {
                formDataToSend.append('coverImage', formData.coverImage);
            }
            
            if (formData.logo) {
                formDataToSend.append('logo', formData.logo);
            }

            console.log('Creating group:', formData);
            
            // ✅ Use the response directly
            const response = await createGroup(formDataToSend);

            if (response.success) {
                alert('Group created successfully!');
                const groupId= response.data.groupId;
                console.log('✅ Group created with ID:', groupId); // Debug log



                setTimeout(() => {
                    router.push(`/main/groups/${groupId}`);
                }, 5000); // Small delay to ensure store propagation
                
            
            // ✅ FIXED: Use template literal with ${groupId}
            router.push(`/main/groups/${groupId}`);
            } else {
                alert(`Failed to create group: ${response.message}`);
            }
            
        } catch (error) {
            console.error('Error creating group:', error);
            alert('Failed to create group');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Group</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Cover Image */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Group Cover Image
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleCoverImageChange}
                            className="hidden"
                            id="coverImage"
                        />
                        <label htmlFor="coverImage" className="cursor-pointer">
                            {coverPreview ? (
                                <div className="space-y-2">
                                    <img 
                                        src={coverPreview} 
                                        alt="Cover preview" 
                                        className="mx-auto h-32 w-full object-cover rounded-lg"
                                    />
                                    <p className="text-sm text-gray-600">Click to change cover image</p>
                                </div>
                            ) : (
                                <div>
                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <p className="mt-2 text-sm text-gray-600">Upload cover image</p>
                                </div>
                            )}
                        </label>
                    </div>
                </div>

                {/* Group Logo and Name Row */}
                <div className="flex gap-6 items-start">
                    {/* Group Logo */}
                    <div className="flex-shrink-0">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Group Logo
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoChange}
                                className="hidden"
                                id="logo"
                            />
                            <label htmlFor="logo" className="cursor-pointer">
                                <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                                    {logoPreview ? (
                                        <img 
                                            src={logoPreview} 
                                            alt="Logo preview" 
                                            className="w-full h-full object-cover rounded-full"
                                        />
                                    ) : (
                                        <div className="text-center">
                                            <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            <p className="text-xs text-gray-500 mt-1">Logo</p>
                                        </div>
                                    )}
                                </div>
                            </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 text-center">Click to upload</p>
                    </div>

                    {/* Group Name */}
                    <div className="flex-1">
                        <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">
                            Group Name *
                        </label>
                        <input
                            type="text"
                            id="groupName"
                            name="groupName"
                            value={formData.groupName}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            placeholder="Enter group name"
                        />
                    </div>
                </div>

                {/* Group Unique Name */}
                <div>
                    <label htmlFor="uniqueName" className="block text-sm font-medium text-gray-700 mb-1">Unique Name *</label>
                    <input
                        id="uniqueName"
                        name="uniqueName"
                        value={formData.uniqueName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        placeholder="Enter group unique name"
                    />
                </div>

                {/* Description */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        placeholder="Describe your group..."
                    />
                </div>

                {/* Group Vision */}
                <div>
                    <label htmlFor="vision" className="block text-sm font-medium text-gray-700 mb-1">Group Vision</label>
                    <textarea
                        id="vision"
                        name="vision"
                        value={formData.vision}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        placeholder="Describe your group vision..."
                    />
                </div> 

                {/* Address */}
                <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        placeholder="Enter your group address..."
                    />
                </div>

                {/* ✅ Social Media Links Section */}
                <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media Links (Optional)</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* YouTube URL */}
                        <div>
                            <label htmlFor="youtubeUrl" className="block text-sm font-medium text-gray-700 mb-1">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                    </svg>
                                    YouTube URL
                                </div>
                            </label>
                            <input
                                type="url"
                                id="youtubeUrl"
                                name="youtubeUrl"
                                value={formData.youtubeUrl}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                placeholder="https://youtube.com/@yourchannel"
                            />
                        </div>

                        {/* Twitter/X URL */}
                        <div>
                            <label htmlFor="twitterUrl" className="block text-sm font-medium text-gray-700 mb-1">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                    </svg>
                                    X (Twitter) URL
                                </div>
                            </label>
                            <input
                                type="url"
                                id="twitterUrl"
                                name="twitterUrl"
                                value={formData.twitterUrl}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                placeholder="https://x.com/yourusername"
                            />
                        </div>

                        {/* Instagram URL */}
                        <div>
                            <label htmlFor="instagramUrl" className="block text-sm font-medium text-gray-700 mb-1">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                    </svg>
                                    Instagram URL
                                </div>
                            </label>
                            <input
                                type="url"
                                id="instagramUrl"
                                name="instagramUrl"
                                value={formData.instagramUrl}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                placeholder="https://instagram.com/yourusername"
                            />
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !formData.groupName.trim()}
                        className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating...' : 'Create Group'}
                    </button>
                </div>
            </form>
        </div>
    );
}