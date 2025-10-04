import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { bidsAPI } from '../services/api';
import { toast } from 'react-toastify';

const BidForm = ({ item, onBidSuccess }) => {
  const { isAuthenticated, user } = useAuth();
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('יש להתחבר כדי להציע מחיר');
      return;
    }

    if (user?._id === item.userId?._id) {
      toast.error('לא ניתן להציע על הפריט שלך');
      return;
    }

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= item.currentPrice) {
      toast.error(`ההצעה חייבת להיות גבוהה מ-${item.currentPrice} ₪`);
      return;
    }

    setLoading(true);
    try {
      await bidsAPI.createBid({
        itemId: item._id,
        amount: amount
      });
      
      toast.success('ההצעה נשלחה בהצלחה!');
      setBidAmount('');
      onBidSuccess && onBidSuccess();
    } catch (error) {
      const message = error.response?.data?.message || 'שגיאה בשליחת ההצעה';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const getMinBidAmount = () => {
    return item.currentPrice + 1; // מינימום 1 ₪ יותר מהמחיר הנוכחי
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg text-center">
        <p className="text-gray-600 mb-4">יש להתחבר כדי להציע מחיר</p>
        <a
          href="/login"
          className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          התחבר
        </a>
      </div>
    );
  }

  if (user?._id === item.userId?._id) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg text-center">
        <p className="text-gray-600">לא ניתן להציע על הפריט שלך</p>
      </div>
    );
  }

  if (new Date(item.endDate) <= new Date()) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg text-center">
        <p className="text-gray-600">המכירה הסתיימה</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">הציע מחיר</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          סכום ההצעה (₪)
        </label>
        <input
          type="number"
          value={bidAmount}
          onChange={(e) => setBidAmount(e.target.value)}
          min={getMinBidAmount()}
          step="1"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder={`מינימום: ${getMinBidAmount()} ₪`}
          required
        />
        <p className="text-sm text-gray-500 mt-1">
          ההצעה חייבת להיות לפחות {getMinBidAmount()} ₪
        </p>
      </div>

      <div className="bg-blue-50 p-3 rounded-lg mb-4">
        <p className="text-sm text-blue-800">
          <strong>מחיר נוכחי:</strong> {item.currentPrice} ₪
        </p>
        <p className="text-sm text-blue-800">
          <strong>מחיר פתיחה:</strong> {item.startPrice} ₪
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'שולח...' : 'שלח הצעה'}
      </button>
    </form>
  );
};

export default BidForm;

