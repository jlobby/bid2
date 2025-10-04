import React from 'react';

const LoadingSpinner = ({ size = 'md', text = 'טוען...' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      {/* Animated Spinner */}
      <div className="relative">
        <div className={`${sizeClasses[size]} rounded-full border-4 border-gray-200`}></div>
        <div className={`${sizeClasses[size]} rounded-full border-4 border-transparent border-t-blue-600 animate-spin absolute top-0 left-0`}></div>
        <div className={`${sizeClasses[size]} rounded-full border-4 border-transparent border-r-purple-600 animate-spin absolute top-0 left-0`} style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>
      
      {/* Loading Text */}
      {text && (
        <div className="mt-6 text-center">
          <p className={`${textSizeClasses[size]} text-gray-600 font-medium mb-2`}>{text}</p>
          <div className="flex space-x-1 space-x-reverse justify-center">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;

