import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      toast.error('שגיאה בהתחברות עם Google');
      navigate('/login');
      return;
    }

    if (token) {
      // Store token and redirect
      localStorage.setItem('token', token);
      
      // Trigger login in context
      login('', '', token).then(() => {
        toast.success('התחברת בהצלחה עם Google!');
        navigate('/');
      }).catch(() => {
        toast.error('שגיאה בהתחברות');
        navigate('/login');
      });
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, login]);

  return <LoadingSpinner size="xl" text="מתחבר..." />;
};

export default AuthSuccess;

