import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const useGoogleAuth = () => {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      console.error('Google OAuth error:', error);
      navigate('/login?error=google_auth_failed');
      return;
    }

    if (token) {
      // Store token and login
      localStorage.setItem('token', token);
      
      // Trigger login in context
      login('', '', token).then(() => {
        navigate('/');
      }).catch((error) => {
        console.error('Login error:', error);
        navigate('/login?error=login_failed');
      });
    }
  }, [searchParams, navigate, login]);

  return { token: searchParams.get('token'), error: searchParams.get('error') };
};

export default useGoogleAuth;

