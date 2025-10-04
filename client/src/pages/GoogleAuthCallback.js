import React from 'react';
import useGoogleAuth from '../hooks/useGoogleAuth';
import LoadingSpinner from '../components/LoadingSpinner';

const GoogleAuthCallback = () => {
  const { token, error } = useGoogleAuth();

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">שגיאה בהתחברות</h1>
          <p className="text-gray-600">התחברות עם Google נכשלה</p>
        </div>
      </div>
    );
  }

  return <LoadingSpinner size="xl" text="מתחבר עם Google..." />;
};

export default GoogleAuthCallback;
