import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { itemsAPI, bidsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
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

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('items');
  const [myItems, setMyItems] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'items') {
        const response = await itemsAPI.getMyItems();
        setMyItems(response.data.items);
      } else {
        const response = await bidsAPI.getMyBids();
        setMyBids(response.data.bids);
      }
      setError(null);
    } catch (err) {
      setError('שגיאה בטעינת הנתונים');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return <LoadingSpinner size="xl" text="טוען נתונים..." />;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">הדשבורד שלי</h1>
        <p className="text-gray-600">נהל את הפריטים וההצעות שלך</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8 space-x-reverse">
          <button
            onClick={() => setActiveTab('items')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'items'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            הפריטים שלי ({myItems.length})
          </button>
          <button
            onClick={() => setActiveTab('bids')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'bids'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            ההצעות שלי ({myBids.length})
          </button>
        </nav>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* My Items Tab */}
      {activeTab === 'items' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">הפריטים שלי</h2>
            <Link
              to="/upload"
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              העלה פריט חדש
            </Link>
          </div>

          {myItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">אין לך פריטים עדיין</div>
              <Link
                to="/upload"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                העלה את הפריט הראשון שלך
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myItems.map(item => (
                <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <Link to={`/item/${item._id}`}>
                    <img
                      src={fixImageUrl(item.images[0])}
                      alt={item.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                  </Link>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <Link to={`/item/${item._id}`}>
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors">
                          {item.name}
                        </h3>
                      </Link>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {getStatusText(item.status)}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {item.description}
                    </p>
                    
                    <div className="flex justify-between items-center mb-3">
                      <div className="text-xl font-bold text-primary-600">
                        {item.currentPrice} ₪
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.bidsCount || 0} הצעות
                      </div>
                    </div>
                    
                    {item.status === 'approved' && new Date(item.endDate) > new Date() && (
                      <div className="text-sm text-blue-600 mb-2">
                        {formatTimeRemaining(item.endDate)}
                      </div>
                    )}
                    
                    {item.winnerId && (
                      <div className="text-sm text-green-600">
                        נמכר ל-{item.winnerId.name}
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(item.createdAt), { 
                        addSuffix: true, 
                        locale: he 
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* My Bids Tab */}
      {activeTab === 'bids' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">ההצעות שלי</h2>

          {myBids.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">אין לך הצעות עדיין</div>
              <Link
                to="/"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                חפש פריטים להציע עליהם
              </Link>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {myBids.map(bid => (
                  <li key={bid._id}>
                    <div className="px-4 py-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-16 w-16">
                          <img
                            className="h-16 w-16 rounded-lg object-cover"
                            src={fixImageUrl(bid.itemId?.images[0])}
                            alt={bid.itemId?.name}
                            onError={(e) => {
                              e.target.src = '/placeholder-image.jpg';
                            }}
                          />
                        </div>
                        <div className="mr-4">
                          <Link
                            to={`/item/${bid.itemId?._id}`}
                            className="text-lg font-medium text-gray-900 hover:text-primary-600 transition-colors"
                          >
                            {bid.itemId?.name}
                          </Link>
                          <div className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(bid.createdAt), { 
                              addSuffix: true, 
                              locale: he 
                            })}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 space-x-reverse">
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">
                            {bid.amount} ₪
                          </div>
                          <div className="text-sm text-gray-500">
                            {bid.isWinning ? 'הצעה מובילה' : 'לא מובילה'}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className={`text-sm font-medium ${
                            bid.itemId?.status === 'ended' 
                              ? 'text-gray-500' 
                              : 'text-green-600'
                          }`}>
                            {bid.itemId?.status === 'ended' ? 'הסתיים' : 'פעיל'}
                          </div>
                          {bid.itemId?.winnerId && (
                            <div className="text-sm text-gray-500">
                              {bid.itemId.winnerId._id === bid.userId ? 'זכית!' : 'לא זכית'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;