import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { itemsAPI, bidsAPI } from '../services/api';
import BidForm from '../components/BidForm';
import ShareButtons from '../components/ShareButtons';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

const ItemPage = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      setLoading(true);
      const response = await itemsAPI.getItem(id);
      setItem(response.data.item);
      setBids(response.data.bids || []);
      setError(null);
    } catch (err) {
      setError('שגיאה בטעינת הפריט');
      console.error('Error fetching item:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBidSuccess = () => {
    fetchItem(); // Refresh item data to get updated price and bids
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

  const getConditionText = (condition) => {
    const conditions = {
      excellent: 'מצוין',
      good: 'טוב',
      fair: 'סביר',
      poor: 'גרוע'
    };
    return conditions[condition] || condition;
  };

  const getCategoryText = (category) => {
    const categories = {
      electronics: 'אלקטרוניקה',
      furniture: 'ריהוט',
      clothing: 'ביגוד',
      books: 'ספרים',
      sports: 'ספורט',
      jewelry: 'תכשיטים',
      art: 'אמנות',
      other: 'אחר'
    };
    return categories[category] || category;
  };

  if (loading) {
    return <LoadingSpinner size="xl" text="טוען פריט..." />;
  }

  if (error || !item) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">שגיאה</h1>
          <p className="text-gray-600">{error || 'הפריט לא נמצא'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={item.images[currentImageIndex] ? `${process.env.REACT_APP_API_URL || 'https://bid2-1.onrender.com'}${item.images[currentImageIndex]}` : '/placeholder-image.jpg'}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/placeholder-image.jpg';
              }}
            />
          </div>
          
          {item.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {item.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`aspect-square rounded-lg overflow-hidden ${
                    currentImageIndex === index ? 'ring-2 ring-primary-500' : ''
                  }`}
                >
                  <img
                    src={`${process.env.REACT_APP_API_URL || 'https://bid2-1.onrender.com'}${image}`}
                    alt={`${item.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Item Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.name}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <span>קטגוריה: {getCategoryText(item.category)}</span>
              <span>מצב: {getConditionText(item.condition)}</span>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-medium text-gray-700">מחיר נוכחי:</span>
              <span className="text-3xl font-bold text-primary-600">{item.currentPrice} ₪</span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>מחיר פתיחה:</span>
              <span>{item.startPrice} ₪</span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>מספר הצעות:</span>
              <span>{bids.length}</span>
            </div>
          </div>

          {item.status === 'approved' && new Date(item.endDate) > new Date() && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span className="font-medium text-blue-900">זמן נותר:</span>
              </div>
              <p className="text-blue-800">{formatTimeRemaining(item.endDate)}</p>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">תיאור:</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{item.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">מיקום איסוף:</span>
              <p className="text-gray-600">{item.location}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">תאריך סיום:</span>
              <p className="text-gray-600">
                {new Date(item.endDate).toLocaleDateString('he-IL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {item.userId && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">פרטי המוכר:</h4>
              <p className="text-gray-700">שם: {item.userId.name}</p>
              {item.userId.email && (
                <p className="text-gray-700">אימייל: {item.userId.email}</p>
              )}
              {item.userId.phone && (
                <p className="text-gray-700">טלפון: {item.userId.phone}</p>
              )}
            </div>
          )}

          {/* Bid Form or Status */}
          <div className="lg:col-span-2">
            {item.status === 'approved' && new Date(item.endDate) > new Date() ? (
              <BidForm item={item} onBidSuccess={handleBidSuccess} />
            ) : item.status === 'ended' ? (
              <div className="bg-gray-100 p-6 rounded-lg text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">המכירה הסתיימה</h3>
                {item.winnerId ? (
                  <p className="text-gray-600">הפריט נמכר ל-{item.winnerId.name}</p>
                ) : (
                  <p className="text-gray-600">לא התקבלו הצעות על פריט זה</p>
                )}
              </div>
            ) : (
              <div className="bg-yellow-100 p-6 rounded-lg text-center">
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">ממתין לאישור</h3>
                <p className="text-yellow-800">הפריט ממתין לאישור מנהל</p>
              </div>
            )}
          </div>

          {/* Share Buttons */}
          <div className="lg:col-span-2">
            <ShareButtons item={item} />
          </div>
        </div>
      </div>

      {/* Bids History */}
      {bids.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">היסטוריית הצעות</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      משתמש
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      סכום
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      תאריך
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bids.map((bid, index) => (
                    <tr key={bid._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {bid.userId?.name || 'משתמש אנונימי'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {bid.amount} ₪
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDistanceToNow(new Date(bid.createdAt), { 
                          addSuffix: true, 
                          locale: he 
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemPage;


