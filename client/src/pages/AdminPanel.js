import React, { useState, useEffect } from 'react';
import { itemsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';
import { toast } from 'react-toastify';

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

const AdminPanel = () => {
  const [pendingItems, setPendingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingItem, setRejectingItem] = useState(null);

  useEffect(() => {
    fetchPendingItems();
  }, []);

  const fetchPendingItems = async () => {
    try {
      setLoading(true);
      const response = await itemsAPI.getPendingItems();
      setPendingItems(response.data.items);
      setError(null);
    } catch (err) {
      setError('שגיאה בטעינת הפריטים הממתינים');
      console.error('Error fetching pending items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (itemId) => {
    try {
      await itemsAPI.approveItem(itemId);
      toast.success('הפריט אושר בהצלחה');
      fetchPendingItems();
    } catch (error) {
      const message = error.response?.data?.message || 'שגיאה באישור הפריט';
      toast.error(message);
    }
  };

  const handleReject = async (itemId) => {
    if (!rejectReason.trim()) {
      toast.error('יש להזין סיבת דחייה');
      return;
    }

    try {
      await itemsAPI.rejectItem(itemId, rejectReason);
      toast.success('הפריט נדחה');
      setRejectingItem(null);
      setRejectReason('');
      fetchPendingItems();
    } catch (error) {
      const message = error.response?.data?.message || 'שגיאה בדחיית הפריט';
      toast.error(message);
    }
  };

  const handleClearAllData = async () => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק את כל הנתונים? פעולה זו לא ניתנת לביטול!')) {
      return;
    }

    try {
      const response = await fetch('/api/items/clear-all', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`נמחקו ${result.deleted.items} פריטים, ${result.deleted.bids} הצעות ו-${result.deleted.users} משתמשים`);
        fetchPendingItems();
      } else {
        const error = await response.json();
        toast.error(error.message || 'שגיאה במחיקת הנתונים');
      }
    } catch (err) {
      toast.error('שגיאה במחיקת הנתונים');
      console.error('Error clearing data:', err);
    }
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
    return <LoadingSpinner size="xl" text="טוען פריטים ממתינים..." />;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">פאנל ניהול</h1>
            <p className="text-gray-600">נהל פריטים ממתינים לאישור</p>
          </div>
          <button
            onClick={handleClearAllData}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            🗑️ אפס את כל הנתונים
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {pendingItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">אין פריטים ממתינים לאישור</div>
          <p className="text-gray-400">כל הפריטים עברו תהליך אישור</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingItems.map(item => (
            <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/3">
                  <img
                    src={fixImageUrl(item.images[0])}
                    alt={item.name}
                    className="w-full h-64 md:h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  />
                </div>
                
                <div className="md:w-2/3 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold text-gray-900">{item.name}</h3>
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                      ממתין לאישור
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{item.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <span className="font-medium text-gray-700">מחיר פתיחה:</span>
                      <span className="text-lg font-bold text-primary-600 mr-2">{item.startPrice} ₪</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">קטגוריה:</span>
                      <span className="mr-2">{getCategoryText(item.category)}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">מצב:</span>
                      <span className="mr-2">{getConditionText(item.condition)}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">מיקום:</span>
                      <span className="mr-2">{item.location}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">סוג מכרז:</span>
                      <span className={`mr-2 px-2 py-1 rounded-full text-xs font-medium ${
                        item.promotionStatus === 'free' 
                          ? 'bg-green-100 text-green-800' 
                          : item.promotionStatus === 'paid_requested'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.promotionStatus === 'free' ? 'מכרז רגיל (מ-0 ₪)' : 
                         item.promotionStatus === 'paid_requested' ? 'בקשה למחיר מינימום' : 
                         'לא ידוע'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">תאריך סיום:</span>
                      <span className="mr-2">
                        {new Date(item.endDate).toLocaleDateString('he-IL', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">תאריך העלאה:</span>
                      <span className="mr-2">
                        {formatDistanceToNow(new Date(item.createdAt), { 
                          addSuffix: true, 
                          locale: he 
                        })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">פרטי המוכר:</h4>
                    <p className="text-gray-700">שם: {item.userId?.name}</p>
                    <p className="text-gray-700">אימייל: {item.userId?.email}</p>
                    {item.userId?.phone && (
                      <p className="text-gray-700">טלפון: {item.userId.phone}</p>
                    )}
                  </div>
                  
                  <div className="flex justify-end space-x-4 space-x-reverse">
                    <button
                      onClick={() => handleApprove(item._id)}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      אישר
                    </button>
                    <button
                      onClick={() => setRejectingItem(item._id)}
                      className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      דחה
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectingItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">דחיית פריט</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  סיבת הדחייה:
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="הזן את סיבת הדחייה..."
                />
              </div>
              <div className="flex justify-end space-x-4 space-x-reverse">
                <button
                  onClick={() => {
                    setRejectingItem(null);
                    setRejectReason('');
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ביטול
                </button>
                <button
                  onClick={() => handleReject(rejectingItem)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  דחה
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;