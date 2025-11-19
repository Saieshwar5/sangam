"use client"

import { useState, useRef } from 'react';
import { MdClose, MdContentCopy, MdCheck, MdShare, MdDownload, MdQrCode } from 'react-icons/md';
import { QRCodeSVG } from 'qrcode.react';

interface GroupShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    group: {
        groupId: string;
        groupName: string;
        description?: string;
        logo?: string;
    };
    currentUserId: string;
}

export default function GroupShareModal({ isOpen, onClose, group, currentUserId }: GroupShareModalProps) {
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'link' | 'qr'>('link');
    const qrRef = useRef<HTMLDivElement>(null);
    
    const baseUrl = typeof window !== 'undefined' ? `${window.location.origin}/${group.groupId}` : '';
    const groupUrl = currentUserId ? `${baseUrl}?referrerId=${currentUserId}` : baseUrl;

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(groupUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: group.groupName,
                    text: group.description || `Join ${group.groupName}`,
                    url: groupUrl,
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        }
    };

    const handleDownloadQR = () => {
        const svg = qrRef.current?.querySelector('svg');
        if (!svg) return;

        // Create a canvas to convert SVG to PNG
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const svgData = new XMLSerializer().serializeToString(svg);
        const img = new Image();
        
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            
            // Download the image
            canvas.toBlob((blob) => {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.download = `${group.groupName}-qr-code.png`;
                    link.href = url;
                    link.click();
                    URL.revokeObjectURL(url);
                }
            });
        };
        
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-opacity-50 z-50 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={onClose}
            >
                {/* Modal Content */}
                <div 
                    className="bg-white rounded-lg shadow-xl w-full max-w-md"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Share Group
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <MdClose className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('link')}
                            className={`flex-1 py-3 px-4 font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
                                activeTab === 'link'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <MdShare className="w-5 h-5" />
                            Share Link
                        </button>
                        <button
                            onClick={() => setActiveTab('qr')}
                            className={`flex-1 py-3 px-4 font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
                                activeTab === 'qr'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <MdQrCode className="w-5 h-5" />
                            QR Code
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {/* Group Info */}
                        <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-lg">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                                {group.logo ? (
                                    <img 
                                        src={group.logo}
                                        alt={group.groupName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                        <span className="text-white font-bold text-xl">
                                            {group.groupName?.charAt(0)?.toUpperCase() || 'G'}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 truncate">
                                    {group.groupName}
                                </h3>
                                <p className="text-sm text-gray-500 truncate">
                                    {group.description || 'Join this group'}
                                </p>
                            </div>
                        </div>

                        {/* Link Tab Content */}
                        {activeTab === 'link' && (
                            <>
                                {/* URL Input with Copy Button */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Group Link
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={groupUrl}
                                            readOnly
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            onClick={handleCopyLink}
                                            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                                                copied 
                                                    ? 'bg-green-500 text-white' 
                                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                            }`}
                                        >
                                            {copied ? (
                                                <>
                                                    <MdCheck className="w-5 h-5" />
                                                    Copied!
                                                </>
                                            ) : (
                                                <>
                                                    <MdContentCopy className="w-5 h-5" />
                                                    Copy
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Native Share Button (Mobile) */}
                                {typeof window !== 'undefined' && 'share' in navigator && (
                                    <div className="mt-4">
                                        <button
                                            onClick={handleNativeShare}
                                            className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                        >
                                            <MdShare className="w-5 h-5" />
                                            Share via...
                                        </button>
                                    </div>
                                )}

                                {/* Social Share Options */}
                                <div className="mt-6">
                                    <p className="text-sm font-medium text-gray-700 mb-3">
                                        Or share on social media
                                    </p>
                                    <div className="grid grid-cols-4 gap-3">
                                        {/* WhatsApp */}
                                        <a
                                            href={`https://wa.me/?text=${encodeURIComponent(`Join ${group.groupName}: ${groupUrl}`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                                        >
                                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                                </svg>
                                            </div>
                                            <span className="text-xs text-gray-600">WhatsApp</span>
                                        </a>

                                        {/* Twitter/X */}
                                        <a
                                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Join ${group.groupName}`)}&url=${encodeURIComponent(groupUrl)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                                        >
                                            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                                </svg>
                                            </div>
                                            <span className="text-xs text-gray-600">Twitter</span>
                                        </a>

                                        {/* Facebook */}
                                        <a
                                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(groupUrl)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                                        >
                                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                                </svg>
                                            </div>
                                            <span className="text-xs text-gray-600">Facebook</span>
                                        </a>

                                        {/* Telegram */}
                                        <a
                                            href={`https://t.me/share/url?url=${encodeURIComponent(groupUrl)}&text=${encodeURIComponent(`Join ${group.groupName}`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                                        >
                                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                                                </svg>
                                            </div>
                                            <span className="text-xs text-gray-600">Telegram</span>
                                        </a>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* QR Code Tab Content */}
                        {activeTab === 'qr' && (
                            <div className="flex flex-col items-center">
                                <p className="text-sm text-gray-600 mb-4 text-center">
                                    Scan this QR code to join the group
                                </p>
                                
                                {/* QR Code */}
                                <div 
                                    ref={qrRef}
                                    className="bg-white p-6 rounded-lg border-2 border-gray-200 mb-6"
                                >
                                    <QRCodeSVG
                                        value={groupUrl}
                                        size={200}
                                        level="H"
                                        includeMargin={true}
                                        imageSettings={{
                                            src: group.logo ? `/uploads/${group.logo}` : '',
                                            height: 40,
                                            width: 40,
                                            excavate: true,
                                        }}
                                    />
                                </div>

                                {/* Download Button */}
                                <button
                                    onClick={handleDownloadQR}
                                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <MdDownload className="w-5 h-5" />
                                    Download QR Code
                                </button>

                                {/* Info Text */}
                                <p className="text-xs text-gray-500 mt-4 text-center">
                                    Share this QR code in posters, flyers, or presentations
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
