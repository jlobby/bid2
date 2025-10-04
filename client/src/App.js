import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ItemPage from './pages/ItemPage';
import UploadItem from './pages/UploadItem';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthSuccess from './pages/AuthSuccess';
import GoogleAuthCallback from './pages/GoogleAuthCallback';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const location = useLocation();

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <Navbar />
        <main className="relative">
          {/* Page Transition Animation */}
          <div 
            key={location.pathname}
            className="animate-fadeIn"
            style={{
              animation: 'fadeIn 0.3s ease-in-out'
            }}
          >
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/item/:id" element={<ItemPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/auth/success" element={<AuthSuccess />} />
              <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
              
              <Route path="/upload" element={
                <ProtectedRoute>
                  <UploadItem />
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/admin" element={
                <ProtectedRoute adminOnly>
                  <AdminPanel />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </main>
        
        {/* Background Decoration */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </AuthProvider>
  );
}

export default App;
