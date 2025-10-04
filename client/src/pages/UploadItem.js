import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import { toast } from 'react-toastify';

const UploadItem = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startPrice: '0',
    location: '',
    endDate: '',
    category: 'other',
    condition: 'good',
    pricingType: 'free'
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const categories = [
    { value: 'electronics', label: 'אלקטרוניקה' },
    { value: 'furniture', label: 'ריהוט' },
    { value: 'clothing', label: 'ביגוד' },
    { value: 'books', label: 'ספרים' },
    { value: 'sports', label: 'ספורט' },
    { value: 'jewelry', label: 'תכשיטים' },
    { value: 'art', label: 'אמנות' },
    { value: 'other', label: 'אחר' }
  ];

  const conditions = [
    { value: 'excellent', label: 'מצוין' },
    { value: 'good', label: 'טוב' },
    { value: 'fair', label: 'סביר' },
    { value: 'poor', label: 'גרוע' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      toast.error('ניתן להעלות עד 5 תמונות');
      return;
    }
    setImages([...images, ...files]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.startPrice || !formData.location || !formData.endDate) {
      toast.error('יש למלא את כל השדות החובה');
      return;
    }

    if (images.length === 0) {
      toast.error('יש להעלות לפחות תמונה אחת');
      return;
    }

    if (parseFloat(formData.startPrice) <= 0) {
      toast.error('מחיר הפתיחה חייב להיות חיובי');
      return;
    }

    const endDate = new Date(formData.endDate);
    if (endDate <= new Date()) {
      toast.error('תאריך הסיום חייב להיות בעתיד');
      return;
    }

    setLoading(true);
    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('startPrice', formData.startPrice);
      submitData.append('location', formData.location);
      submitData.append('endDate', formData.endDate);
      submitData.append('category', formData.category);
      submitData.append('condition', formData.condition);
      submitData.append('pricingType', formData.pricingType);

      images.forEach((image, index) => {
        submitData.append('images', image);
      });

      await itemsAPI.createItem(submitData);
      toast.success('הפריט הועלה בהצלחה וממתין לאישור מנהל');
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.message || 'שגיאה בהעלאת הפריט';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          העלה פריט למכירה
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              שם הפריט *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="הזן את שם הפריט"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              תיאור הפריט *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="תאר את הפריט בפירוט..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startPrice" className="block text-sm font-medium text-gray-700 mb-2">
                {formData.pricingType === 'free' ? 'מחיר פתיחה (₪)' : 'מחיר פתיחה (₪) *'}
              </label>
              <input
                type="number"
                id="startPrice"
                name="startPrice"
                value={formData.startPrice}
                onChange={handleChange}
                required={formData.pricingType === 'paid'}
                min="0"
                step="1"
                disabled={formData.pricingType === 'free'}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  formData.pricingType === 'free' ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder={formData.pricingType === 'free' ? '0 (חינם)' : 'הזן מחיר פתיחה'}
              />
              {formData.pricingType === 'free' && (
                <p className="text-sm text-green-600 mt-1">המכרז יתחיל מ-0 ₪, מי שמציע הכי הרבה משלם את המחיר שהציע</p>
              )}
              
              {/* Minimum Price Option */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    id="hasMinimumPrice"
                    checked={formData.pricingType === 'paid'}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        pricingType: e.target.checked ? 'paid' : 'free',
                        startPrice: e.target.checked ? formData.startPrice : '0'
                      });
                    }}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="hasMinimumPrice" className="mr-3 text-sm font-medium text-gray-700">
                    יש מחיר מינימום (דורש אישור מנהל)
                  </label>
                </div>
                {formData.pricingType === 'paid' && (
                  <p className="text-sm text-orange-600">
                    המכרז יתחיל מהמחיר המינימלי שתגדיר. בקשה זו תשלח לאישור מנהל.
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                תאריך סיום *
              </label>
              <input
                type="datetime-local"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                min={new Date().toISOString().slice(0, 16)}
                max={new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <div className="mt-2 text-sm text-gray-600">
                <p>אפשר לבחור: חצי יום, יום או יומיים בלבד</p>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const halfDay = new Date(Date.now() + 12 * 60 * 60 * 1000);
                      setFormData({...formData, endDate: halfDay.toISOString().slice(0, 16)});
                    }}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-xs hover:bg-blue-200"
                  >
                    חצי יום
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const oneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
                      setFormData({...formData, endDate: oneDay.toISOString().slice(0, 16)});
                    }}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-xs hover:bg-blue-200"
                  >
                    יום
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const twoDays = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
                      setFormData({...formData, endDate: twoDays.toISOString().slice(0, 16)});
                    }}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-xs hover:bg-blue-200"
                  >
                    יומיים
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                קטגוריה
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">
                מצב הפריט *
              </label>
              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {conditions.map(condition => (
                  <option key={condition.value} value={condition.value}>
                    {condition.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              מיקום איסוף *
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="הזן את מיקום איסוף הפריט"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              תמונות (עד 5) *
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              העלה תמונות ברורות של הפריט (JPG, PNG, GIF)
            </p>
            
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4 space-x-reverse">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'שולח...' : 'העלה פריט'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadItem;

