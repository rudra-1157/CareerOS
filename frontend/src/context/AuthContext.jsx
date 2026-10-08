import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('careeros_user') || sessionStorage.getItem('careeros_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('careeros_token') || sessionStorage.getItem('careeros_token') || null;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [demoUsers, setDemoUsers] = useState([]);

  useEffect(() => {
    // Fetch demo users for convenience
    authService.getDemoUsers().then((users) => {
      if (users && users.length) {
        setDemoUsers(users);
      }
    });
  }, []);

  const login = async ({ email, password, role, rememberMe = true }) => {
    setIsLoading(true);
    try {
      const res = await authService.login({
        email: email.trim(),
        password: password.trim(),
        role: role.toLowerCase(),
      });

      const { access_token, user } = res;
      setToken(access_token);
      setCurrentUser(user);

      // Save to storage
      const storage = rememberMe ? localStorage : sessionStorage;
      const otherStorage = rememberMe ? sessionStorage : localStorage;
      
      otherStorage.removeItem('careeros_token');
      otherStorage.removeItem('careeros_user');
      otherStorage.removeItem('careeros_remember');

      storage.setItem('careeros_token', access_token);
      storage.setItem('careeros_user', JSON.stringify(user));
      storage.setItem('careeros_remember', rememberMe ? 'true' : 'false');

      return { success: true, user };
    } catch (error) {
      const msg = error.response?.data?.detail || error.message || 'Login failed. Please verify credentials.';
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('careeros_token');
    localStorage.removeItem('careeros_user');
    localStorage.removeItem('careeros_remember');
    sessionStorage.removeItem('careeros_token');
    sessionStorage.removeItem('careeros_user');
    sessionStorage.removeItem('careeros_remember');

    setToken(null);
    setCurrentUser(null);
  };

  const isAuthenticated = Boolean(currentUser && token);
  const userRole = currentUser?.role?.toLowerCase() || null;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        isAuthenticated,
        userRole,
        isLoading,
        demoUsers,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
