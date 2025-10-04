import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-xl sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 space-x-reverse group">
            <Logo size="md" showText={true} className="group-hover:scale-105 transition-transform duration-200" />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8 space-x-reverse">
            <Link
              to="/"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-lg"
            >
            </Link>
            
            {isAuthenticated && (
              <>
                <Link
                  to="/upload"
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-lg"
                >
                  העלה פריט
                </Link>
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-lg"
                >
                  הדשבורד שלי
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-lg"
                  >
                    פאנל ניהול
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4 space-x-reverse">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-gray-700 font-medium">
                    שלום, {user?.name}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  התנתק
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4 space-x-reverse">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-lg"
                >
                  התחבר
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  הרשם
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-4 pt-4 pb-6 space-y-2 bg-gradient-to-br from-gray-50 to-white rounded-b-2xl shadow-lg">
              <Link
                to="/"
                className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 rounded-xl font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                דף הבית
              </Link>
              
              {isAuthenticated && (
                <>
                  <Link
                    to="/upload"
                    className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 rounded-xl font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    העלה פריט
                  </Link>
                  <Link
                    to="/dashboard"
                    className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 rounded-xl font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    הדשבורד שלי
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 rounded-xl font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      פאנל ניהול
                    </Link>
                  )}
                </>
              )}
              
              {isAuthenticated ? (
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center space-x-3 space-x-reverse px-4 py-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {user?.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="text-gray-700 font-medium">שלום, {user?.name}</div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-right px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 rounded-xl font-medium"
                  >
                    התנתק
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <Link
                    to="/login"
                    className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 rounded-xl font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    התחבר
                  </Link>
                  <Link
                    to="/register"
                    className="block px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    הרשם
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

