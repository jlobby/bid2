import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

// פונקציה לתיקון URL של תמונות
const fixImageUrl = (url) => {
  if (!url) return '/placeholder-image.jpg';
  
  // אם זה כבר URL מלא (Cloudinary)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // אם זה נתיב יחסי (תמונות ישנות)
  return `${process.env.REACT_APP_API_URL || 'https://bid2-1.onrender.com'}${url}`;
};

const ItemCard = ({ item }) => {
  const formatTimeRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;
    
    if (diff <= 0) return 'המכירה הסתיימה';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days} ימים, ${hours} שעות`;
    if (hours > 0) return `${hours} שעות, ${minutes} דקות`;
    return `${minutes} דקות`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'ended':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return 'מאושר';
      case 'pending':
        return 'ממתין לאישור';
      case 'rejected':
        return 'נדחה';
      case 'ended':
        return 'הסתיים';
      default:
        return 'לא ידוע';
    }
  };

  return (
    <div className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
      <Link to={`/item/${item._id}`}>
        <div className="relative overflow-hidden">
          <img
            src={fixImageUrl(item.images[0])}
            alt={item.name}
            className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.src = '/placeholder-image.jpg';
            }}
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm ${getStatusColor(item.status)}`}>
              {getStatusText(item.status)}
            </span>
          </div>
          
          {/* Time Remaining */}
          {item.status === 'approved' && new Date(item.endDate) > new Date() && (
            <div className="absolute bottom-3 right-3 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatTimeRemaining(item.endDate)}
              </div>
            </div>
          )}
          
          {/* Bids Count */}
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
              {item.bidsCount || 0} הצעות
            </div>
          </div>
        </div>
      </Link>
      
      <div className="p-6">
        <Link to={`/item/${item._id}`}>
          <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors line-clamp-2 group-hover:text-blue-600">
            {item.name}
          </h3>
        </Link>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {item.description}
        </p>
        
        {/* Price Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {item.currentPrice} ₪
            </div>
            <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
              מחיר נוכחי
            </div>
          </div>
        </div>
        
        {/* Location and Time */}
        <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {item.location}
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatDistanceToNow(new Date(item.createdAt), { 
              addSuffix: true, 
              locale: he 
            })}
          </div>
        </div>
        
        {/* Seller Info */}
        {item.userId && (
          <div className="flex items-center gap-2 text-sm text-gray-500 pt-3 border-t border-gray-100">
            <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-xs">
                {item.userId.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <span>מוכר: {item.userId.name}</span>
          </div>
        )}
        
        {/* View Button */}
        <div className="mt-4">
          <Link
            to={`/item/${item._id}`}
            className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold text-center hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            צפה בפריט
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;