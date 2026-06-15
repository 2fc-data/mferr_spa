import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';

const IDLE_TIMEOUT = 10 * 60 * 1000; // 10 minutes

export const useIdleTimeout = () => {
  const navigate = useNavigate();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (authService.isAuthenticated()) {
      timeoutRef.current = setTimeout(() => {
        authService.logout();
      }, IDLE_TIMEOUT);
    }
  };

  useEffect(() => {
    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    // Expire session when the browser tab or window is closed (not on internal SPA navigation)
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('user');
    };

    // Re-check session when user returns to the tab (handles timeout while away)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !authService.isAuthenticated()) {
        navigate('/', { replace: true });
      }
    };

    // Listen for logout events dispatched by authService.logout()
    const handleLogoutEvent = () => {
      navigate('/', { replace: true });
    };

    if (authService.isAuthenticated()) {
      resetTimeout();
      activityEvents.forEach(event => window.addEventListener(event, resetTimeout));
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('app:logout', handleLogoutEvent);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      activityEvents.forEach(event => window.removeEventListener(event, resetTimeout));
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('app:logout', handleLogoutEvent);
    };
  }, [navigate]);

  return null;
};
