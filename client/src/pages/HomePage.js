import React, { useState, useEffect } from 'react';
import { itemsAPI } from '../services/api';
import ItemCard from '../components/ItemCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Logo from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const HomePage = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    activeItems: 0,
    totalUsers: 0,
    totalBids: 0,
    endingToday: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    category: 'all',
    search: '',
    sort: 'ending-soon'
  });
  const [pagination, setPagination] = useState({});

  const categories = [
    { value: 'all', label: 'כל הקטגוריות' },
    { value: 'electronics', label: 'אלקטרוניקה' },
    { value: 'furniture', label: 'ריהוט' },
    { value: 'clothing', label: 'ביגוד' },
    { value: 'books', label: 'ספרים' },
    { value: 'sports', label: 'ספורט' },
    { value: 'jewelry', label: 'תכשיטים' },
    { value: 'art', label: 'אמנות' },
    { value: 'other', label: 'אחר' }
  ];

  const sortOptions = [
    { value: 'ending-soon', label: 'מסתיים בקרוב' },
    { value: 'newest', label: 'החדשים ביותר' },
    { value: 'price-low', label: 'מחיר נמוך לגבוה' },
    { value: 'price-high', label: 'מחיר גבוה לנמוך' }
  ];

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await itemsAPI.getItems(filters);
      setItems(response.data.items);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      setError('שגיאה בטעינת הפריטים');
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await itemsAPI.getStats();
      setStats(response.data.stats);
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchStats();
  }, [filters]);

  // Update stats every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchItems();
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('האם למחוק את הפריט? פעולה זו בלתי הפיכה.')) return;
    try {
      await itemsAPI.deleteItem(itemId);
      toast.success('הפריט נמחק בהצלחה');
      fetchItems();
    } catch (error) {
      const message = error.response?.data?.message || 'שגיאה במחיקת הפריט';
      toast.error(message);
    }
  };

  if (loading && items.length === 0) {
    return <LoadingSpinner size="xl" text="טוען פריטים..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 text-white py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <Logo size="xl" showText={true} className="animate-float" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-12 text-white">
              יד שנייה במכירה פומבית
            </h1>
            
            {/* Search Bar */}
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSearch} className="flex gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-2 shadow-2xl">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="חפש פריטים, מותגים, קטגוריות..."
                    className="w-full px-6 py-4 rounded-xl text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-white/30 bg-white/90 backdrop-blur-sm"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  חפש
                </button>
              </form>
            </div>
            
            {/* Quick Stats */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  {statsLoading ? '...' : stats.activeItems}
                </div>
                <div className="text-blue-200">פריטים פעילים</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  {statsLoading ? '...' : stats.totalUsers}
                </div>
                <div className="text-blue-200">משתמשים רשומים</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  {statsLoading ? '...' : stats.totalBids}
                </div>
                <div className="text-blue-200">הצעות בסך הכל</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  {statsLoading ? '...' : stats.endingToday}
                </div>
                <div className="text-blue-200">מסתיימים היום</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-lg py-8 -mt-4 relative z-10 rounded-t-3xl">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-6 items-center justify-center">
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
              <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <label className="text-sm font-semibold text-gray-700">קטגוריה:</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white font-medium"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
              <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <label className="text-sm font-semibold text-gray-700">מיון:</label>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white font-medium"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="container mx-auto px-4 py-12">
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8 shadow-sm">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="text-gray-600 text-xl font-semibold mb-3">
              לא נמצאו פריטים
            </div>
            <p className="text-gray-500 text-lg">
              נסו לשנות את הפילטרים או לחפש משהו אחר
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {items.map((item, index) => (
                <div 
                  key={item._id} 
                  className="animate-fadeInUp"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative">
                    <ItemCard item={item} />
                    {user?.role === 'admin' && (
                      <div className="absolute top-3 left-3 z-10">
                        <button
                          onClick={() => handleDeleteItem(item._id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs shadow"
                        >
                          מחק
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center mt-12 space-x-2 space-x-reverse">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="px-6 py-3 border-2 border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  הקודם
                </button>
                
                <div className="flex space-x-2 space-x-reverse">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      const current = pagination.currentPage;
                      return page === 1 || page === pagination.totalPages || 
                             (page >= current - 1 && page <= current + 1);
                    })
                    .map((page, index, array) => {
                      if (index > 0 && page - array[index - 1] > 1) {
                        return (
                          <React.Fragment key={`ellipsis-${page}`}>
                            <span className="px-3 py-3 text-gray-400">...</span>
                            <button
                              onClick={() => handlePageChange(page)}
                              className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                                page === pagination.currentPage
                                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                  : 'border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                              }`}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        );
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                            page === pagination.currentPage
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                              : 'border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="px-6 py-3 border-2 border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium flex items-center gap-2"
                >
                  הבא
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;

