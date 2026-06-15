import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const navigate = useNavigate();
  const isAuthenticated = !!sessionStorage.getItem('user');

  // Intercept browser back/forward navigation and re-check session
  useEffect(() => {
    const handlePopState = () => {
      if (!sessionStorage.getItem('user')) {
        navigate('/', { replace: true });
      }
    };


    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigate]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
