"use client"

import { useState ,useEffect} from 'react';
import { MdClose, MdImage, MdSend, MdVideoLibrary, MdAttachFile, MdLink, MdDelete } from 'react-icons/md';

import { useGroupPosts } from '@/hooks/useGroupPosts';
import { useUser } from '@/hooks/useAuth';
import { profileName as getProfileName } from '@/hooks/useProfile';

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    groupId: string;
    groupName: string;
}

const postTypes = {
    "Discussion": "discuss with your coomunity members and get their feedback",
    "Poll": "Poll",
    "Event": "Event",
    "Call for Volunteers": "call for volunteers",
    "report an Issue": "report an Issue",
    "Question/ask": "ask a question and get the answers from the community",
    "news/article": "news/article",
    "Announcement": "announce something to the community",
    "notification": "notification to the community",
    "alert": "alert to the community",
    "suggestion": "suggest something to the community",
    "survey": "survey",
    "feedback": "give feedback to the community",
    "request": "request",
    "invitation": "invitation to the community",
    "appretiation": "appretiation anything or anyone in the community",
    "project progress": "update the community about the progress of your project",
    "Other": "Other",
}

interface Attachment {
    file?: File;
    preview?: string;
    type: 'image' | 'video' | 'document' | 'url';
    url?: string;
    name: string;
}

interface PollOption {
    id: number;
    text: string;
    votes: number;
    percentage: number;
}
const newPollOption = (id: number): PollOption => ({
    id: id,
    text: '',
    votes: 0,
    percentage: 0
  });

  let minimumPollOptions = 2;
  

  
export default function CreatePostModal({ isOpen, onClose, groupId, groupName }: CreatePostModalProps) {
    const { setUserGroupPosts, userGroupPosts, error, success, isUserGroupPostsLoaded } = useGroupPosts();
    const user = useUser();
    const profileName = getProfileName();
    const [postContent, setPostContent] = useState('');
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [postType, setPostType] = useState('Discussion');
    const [urlInput, setUrlInput] = useState('');
    const [showUrlInput, setShowUrlInput] = useState(false);
    const [pollOptions, setPollOptions] = useState<PollOption[]>([newPollOption(1), newPollOption(2)]);
    const [pollEndDate, setPollEndDate] = useState('');
    const [allowMultipleVotes, setAllowMultipleVotes] = useState(false);
    const [eventAddress, setEventAddress] = useState('');
    const [eventGoogleMapLink, setEventGoogleMapLink] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [eventTime, setEventTime] = useState('');
    const [eventContactInfo, setEventContactInfo] = useState('');
    let minimumPollOptions = 2;

    const addPollOption = () => {
        setPollOptions(prev => [...prev, newPollOption(prev.length + 1)]);
      };

    useEffect(() => {
        if(success) {
             // Reset form
             setPostContent('');
             setAttachments([]);
             setPollOptions([
                 newPollOption(1),
                 newPollOption(2)
             ]);
             minimumPollOptions = 2;
             setPollEndDate('');
             setAllowMultipleVotes(false);
             setEventAddress('');
             setEventGoogleMapLink('');
             setEventDate('');
             setEventTime('');
             setEventContactInfo('');
             handleClose();  
        }

        if(error) {
            console.log(error);
        }
    }, [success,error]);


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'document') => {
        const files = Array.from(e.target.files || []);
        
        files.forEach(file => {
            const newAttachment: Attachment = {
                file,
                type,
                name: file.name
            };

            // Create preview for images and videos
            if (type === 'image' || type === 'video') {
                const reader = new FileReader();
                reader.onload = (e) => {
                    newAttachment.preview = e.target?.result as string;
                    setAttachments(prev => [...prev, newAttachment]);
                };
                reader.readAsDataURL(file);
            } else {
                setAttachments(prev => [...prev, newAttachment]);
            }
        });

        // Reset input
        e.target.value = '';
    };

    const handleAddUrl = () => {
        if (urlInput.trim()) {
            const newAttachment: Attachment = {
                type: 'url',
                url: urlInput,
                name: urlInput
            };
            setAttachments(prev => [...prev, newAttachment]);
            setUrlInput('');
            setShowUrlInput(false);
        }
    };

    const handleRemoveAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!postContent.trim()) return;

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            
            // Common fields
            formData.append('postContent', postContent);
            formData.append('groupId', groupId);
            formData.append('postType', postType);
            formData.append('postCreator', user?.id || '');
            formData.append('postCreatorName', profileName || '');

            console.log('postCreatorName', profileName);
            
            // Type-specific data as JSON objects
            switch(postType) {
                case 'Poll':
                    const pollData = {
                        pollOptions: pollOptions,
                        pollEndDate: pollEndDate,
                        allowMultipleVotes: allowMultipleVotes
                    };
                    console.log('pollData ******************', pollData);
                    formData.append('pollData', JSON.stringify(pollData));
                    break;
                    
                case 'Event':
                case 'Call for Volunteers':
                case 'invitation':
                    const eventData = {
                        eventAddress: eventAddress,
                        eventGoogleMapLink: eventGoogleMapLink,
                        eventDate: eventDate,
                        eventTime: eventTime,
                        eventContactInfo: eventContactInfo
                    };
                    formData.append('eventData', JSON.stringify(eventData));
                    break;
            }
            
            // Add file attachments
            attachments.forEach((attachment, index) => {
                if (attachment.file) {
                    formData.append(`attachments`, attachment.file);
                }
            });
            
            await setUserGroupPosts(formData);
            
        } catch (error) {
            console.error('Error creating post:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setPostContent('');
        setAttachments([]);
        setUrlInput('');
        setShowUrlInput(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-opacity-50 z-50 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={handleClose}
            >
                {/* Modal Content */}
                <div 
                    className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Create Post in {groupName}
                        </h2>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <MdClose className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-4">
                        {/* Post Type */}
                        <div className="mb-4">
                            <label htmlFor="postType" className="block text-sm font-medium text-gray-700 mb-2">
                                Post Type
                            </label>
                            <select
                                id="postType"
                                value={postType}
                                onChange={(e) => setPostType(e.target.value)}
                                className="w-full md:w-1/2 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {Object.entries(postTypes).map(([key, value]) => (
                                    <option key={key} value={key}>
                                        {key}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Post Content */}
                        <textarea
                            value={postContent}
                            onChange={(e) => setPostContent(e.target.value)}
                            placeholder={postTypes[postType as keyof typeof postTypes]}
                            className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            maxLength={500}
                        />
                        
                        {/* Character count */}
                        <div className="text-right text-sm text-gray-500 mt-1">
                            {postContent.length}/500
                        </div>
                       {/* Poll Options */}
                       {postType === 'Poll' && (
                            <div>
                            <div className="mt-4">
                                <h2 className="text-sm font-medium text-gray-700 mb-2">Poll Options</h2>
                                {pollOptions.map((option, index) => (
                                    <div key={option.id} className="flex items-center gap-2 mb-2">
                                        <input 
                                            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                                            type="text" 
                                            placeholder={`Option ${index + 1}`}
                                            value={option.text} 
                                            onChange={(e) => setPollOptions(prev => 
                                                prev.map(o => o.id === option.id ? { ...o, text: e.target.value } : o)
                                            )} 
                                        />
                                        
                                        {/* Delete button - only show if more than 2 options */}
                                        {pollOptions.length > 2 && (
                                            <button
                                                type="button"
                                                onClick={() => setPollOptions(prev => 
                                                    prev.filter(o => o.id !== option.id)
                                                )}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete option"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                        
                                        {/* Placeholder for alignment when delete button is hidden */}
                                        {pollOptions.length <= 2 && (
                                            <div className="w-9"></div>
                                        )}
                                    </div>
                                ))}
                                
                                <button 
                                    type="button"
                                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2" 
                                    onClick={addPollOption}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Option
                                </button>
                                
                                {pollOptions.length < 2 && (
                                    <p className="text-xs text-red-600 mt-1">
                                        ⚠️ Polls must have at least 2 options
                                    </p>
                                )}
                            </div>

                            <div className="mt-4">
                                <h2 className="text-sm font-medium text-gray-700">Poll End Date</h2>
                                <input 
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent my-2" 
                                    type="date" 
                                    value={pollEndDate} 
                                    onChange={(e) => setPollEndDate(e.target.value)} 
                                />
                            </div>

                            <div className="mt-4 flex items-center gap-2">
                                <input 
                                    className="w-4 h-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                    type="checkbox" 
                                    id="multipleVotes"
                                    checked={allowMultipleVotes} 
                                    onChange={(e) => setAllowMultipleVotes(e.target.checked)} 
                                />
                                <label htmlFor="multipleVotes" className="text-sm font-medium text-gray-700 cursor-pointer">
                                    Allow Multiple Votes
                                </label>
                            </div>

                            </div>
                            
                        )}

                        {/* Event Details or volunteer invitation or invitation */}
                        {(postType === 'Event' || postType === 'Call for Volunteers' || postType === 'invitation') && (
                            <div>
                                <h2 className="text-sm font-medium text-gray-700">Event Details</h2>
        
                                <input className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent my-2" type="text" placeholder="Event address" value={eventAddress} onChange={(e) => setEventAddress(e.target.value)} />
                                <input className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent my-2" type="url" placeholder="google map link" value={eventGoogleMapLink} onChange={(e) => setEventGoogleMapLink(e.target.value)} />   
                                <input className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent my-2" type="date" placeholder="Event Date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
                                <input className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent my-2" type="time" placeholder="Event Time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} />
                                <input className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent my-2" type="text" placeholder="Event Contact Info" value={eventContactInfo} onChange={(e) => setEventContactInfo(e.target.value)} />
                                
                            </div>
                        )}

                        {/* Attachments Preview */}
                        {attachments.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <h3 className="text-sm font-medium text-gray-700">Attachments ({attachments.length})</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {attachments.map((attachment, index) => (
                                        <div key={index} className="relative group">
                                            {/* Image Preview */}
                                            {attachment.type === 'image' && attachment.preview && (
                                                <div className="relative">
                                                    <img
                                                        src={attachment.preview}
                                                        alt={`Attachment ${index + 1}`}
                                                        className="w-full h-32 object-cover rounded-lg"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveAttachment(index)}
                                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <MdDelete className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}

                                            {/* Video Preview */}
                                            {attachment.type === 'video' && attachment.preview && (
                                                <div className="relative">
                                                    <video
                                                        src={attachment.preview}
                                                        className="w-full h-32 object-cover rounded-lg"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
                                                        <MdVideoLibrary className="w-8 h-8 text-white" />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveAttachment(index)}
                                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <MdDelete className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}

                                            {/* Document Preview */}
                                            {attachment.type === 'document' && (
                                                <div className="relative p-3 bg-gray-100 rounded-lg flex items-center gap-2">
                                                    <MdAttachFile className="w-5 h-5 text-gray-600 flex-shrink-0" />
                                                    <span className="text-sm text-gray-700 truncate flex-1">
                                                        {attachment.name}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveAttachment(index)}
                                                        className="p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                                    >
                                                        <MdDelete className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}

                                            {/* URL Preview */}
                                            {attachment.type === 'url' && (
                                                <div className="relative p-3 bg-blue-50 rounded-lg flex items-center gap-2">
                                                    <MdLink className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                                    <span className="text-sm text-blue-700 truncate flex-1">
                                                        {attachment.url}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveAttachment(index)}
                                                        className="p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                                    >
                                                        <MdDelete className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* URL Input */}
                        {showUrlInput && (
                            <div className="mt-4 flex gap-2">
                                <input
                                    type="url"
                                    value={urlInput}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                    placeholder="Enter URL (e.g., https://example.com)"
                                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddUrl}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Add
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowUrlInput(false);
                                        setUrlInput('');
                                    }}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}

                        {/* Attachment Buttons */}
                        <div className="mt-4 flex flex-wrap gap-2">
                            {/* Image Upload */}
                            <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                <MdImage className="w-5 h-5 text-blue-500" />
                                <span className="text-sm text-gray-700">Image</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => handleFileChange(e, 'image')}
                                    className="hidden"
                                />
                            </label>

                            {/* Video Upload */}
                            <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                <MdVideoLibrary className="w-5 h-5 text-purple-500" />
                                <span className="text-sm text-gray-700">Video</span>
                                <input
                                    type="file"
                                    accept="video/*"
                                    multiple
                                    onChange={(e) => handleFileChange(e, 'video')}
                                    className="hidden"
                                />
                            </label>

                            {/* Document Upload */}
                            <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                <MdAttachFile className="w-5 h-5 text-green-500" />
                                <span className="text-sm text-gray-700">Document</span>
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                                    multiple
                                    onChange={(e) => handleFileChange(e, 'document')}
                                    className="hidden"
                                />
                            </label>

                            {/* URL Button */}
                            <button
                                type="button"
                                onClick={() => setShowUrlInput(!showUrlInput)}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <MdLink className="w-5 h-5 text-orange-500" />
                                <span className="text-sm text-gray-700">URL</span>
                            </button>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end mt-6">
                            <button
                                type="submit"
                                disabled={!postContent.trim() || isSubmitting}
                                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Posting...
                                    </>
                                ) : (
                                    <>
                                        <MdSend className="w-4 h-4" />
                                        Post
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
