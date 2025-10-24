"use client"

import React from 'react';

interface SuccessCardProps {
  title: string;
  message: string;
  buttonText?: string;
  buttonHref?: string;
  onButtonClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export default function SuccessCard({
  title,
  message,
  buttonText,
  buttonHref,
  onButtonClick,
  icon,
  className = ""
}: SuccessCardProps) {
  
  const defaultIcon = (
    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else if (buttonHref) {
      window.location.href = buttonHref;
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 ${className}`}>
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="text-green-600 mb-4">
          {icon || defaultIcon}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        
        {buttonText && (
          <button
            onClick={handleButtonClick}
            className="bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
}
