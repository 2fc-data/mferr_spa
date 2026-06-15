import { useState, useEffect } from "react";

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  username: string;
  rules: string[];
  avatar_url?: string;
  profiles?: any[];
}

export const useCurrentUser = (): SessionUser | null => {
  const [user, setUser] = useState<SessionUser | null>(() => {
    try {
      const raw = sessionStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const raw = sessionStorage.getItem('user');
        setUser(raw ? JSON.parse(raw) : null);
      } catch {
        setUser(null);
      }
    };

    window.addEventListener('app:avatar-updated', handleUpdate);
    window.addEventListener('app:logout', handleUpdate);

    return () => {
      window.removeEventListener('app:avatar-updated', handleUpdate);
      window.removeEventListener('app:logout', handleUpdate);
    };
  }, []);

  return user;
};
