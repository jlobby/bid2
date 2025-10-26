import React from 'react';

const Logo = ({ size = 'md', showText = false, className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-3xl',
    xl: 'w-20 h-20 text-4xl'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Icon */}
      <div className={`${sizeClasses[size]} relative`}>
        {/* Main Circle */}
        <div className="relative w-full h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
          {/* Number 2 */}
          <span className="relative text-white font-bold" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            2
          </span>
        </div>
      </div>

      {/* Text */}
      {showText && (
        <div className="flex items-center gap-2">
          <span className={`${textSizeClasses[size]} font-bold text-gray-900`} style={{ fontFamily: 'Fredoka, sans-serif' }}>
            BID
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
