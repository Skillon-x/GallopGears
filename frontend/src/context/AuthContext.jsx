import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../services/api';


const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastCheck, setLastCheck] = useState(0);
  const CHECK_INTERVAL = 10000; // 10 seconds

  // Add token state
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Memoize checkAuth to prevent unnecessary recreations
  const checkAuth = useCallback(async (force = false) => {
    const currentTime = Date.now();
    if (!force && currentTime - lastCheck < CHECK_INTERVAL) {
      return; // Skip check if not enough time has passed
    }

    try {
      const token = localStorage.getItem('token');
      console.log('Checking auth with token:', token);
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Get user profile first to determine role
      try {
        const profileResponse = await api.auth.getProfile();
        if (profileResponse.data?.user) {
          const userData = profileResponse.data.user;
          console.log('User profile fetched:', userData);

          // If user is a seller, get additional seller info
          if (userData.role === 'seller') {
            try {
              const sellerResponse = await api.sellers.getProfile();
              if (sellerResponse.data?.seller) {
                setUser({
                  ...userData,
                  seller: sellerResponse.data.seller
                });
                setLastCheck(currentTime);
                return;
              }
            } catch (error) {
              console.error('Failed to fetch seller profile:', error);
            }
          }

          // For admin or regular user, just set the user data
          setUser(userData);
          setLastCheck(currentTime);
          return;
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []); // Remove lastCheck dependency

  useEffect(() => {
    checkAuth(true); // Force initial check

    // Set up error event listeners
    const handleAuthError = () => {
      localStorage.removeItem('token');
      setUser(null);
      setError('Authentication failed. Please log in again.');
    };

    const handleSubscriptionError = () => {
      if (user?.role === 'seller') {
        setUser(prev => ({
          ...prev,
          subscription: {
            ...prev.subscription,
            status: 'inactive',
            package: 'Starter'
          }
        }));
      }
    };

    window.addEventListener('auth-error', handleAuthError);
    window.addEventListener('subscription-error', handleSubscriptionError);

    return () => {
      window.removeEventListener('auth-error', handleAuthError);
      window.removeEventListener('subscription-error', handleSubscriptionError);
    };
  }, [checkAuth]);

  const login = async (email, password) => {
    try {
      const response = await api.auth.login({ email, password });
      if (response?.data?.token) {
        console.log('Login successful, token received:', response.data.token);
        localStorage.setItem('token', response.data.token);
        setToken(response.data.token);
        
        // Get user profile after login
        const profileResponse = await api.auth.getProfile();
        if (profileResponse?.data?.user) {
          const userData = profileResponse.data.user;
          console.log('User profile fetched:', userData);

          // If user is a seller, get additional seller info
          if (userData.role === 'seller') {
            try {
              const sellerResponse = await api.sellers.getProfile();
              if (sellerResponse.data?.seller) {
                setUser({
                  ...userData,
                  seller: sellerResponse.data.seller
                });
                return true;
              }
            } catch (error) {
              console.error('Failed to fetch seller profile:', error);
            }
          }

          // For admin or regular user, just set the user data
          setUser(userData);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await api.auth.register(userData);
      const { token, user: newUser } = response.data;
      
      localStorage.setItem('token', token);
      
      // Force immediate auth check after registration
      await checkAuth(true);
      
      return newUser;
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Registration failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
    setLastCheck(0);
    localStorage.removeItem('lastSearch');
    localStorage.removeItem('preferences');
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const response = await api.users.updateProfile(profileData);
      if (response.data?.user) {
        const updatedUser = response.data.user;
        
        if (updatedUser.role === 'seller' && profileData.seller) {
          try {
            const sellerResponse = await api.sellers.updateProfile(profileData.seller);
            if (sellerResponse.data?.seller) {
              setUser({
                ...updatedUser,
                seller: sellerResponse.data.seller
              });
            }
          } catch (error) {
            console.error('Failed to update seller profile:', error);
            throw new Error('Failed to update seller profile');
          }
        } else {
          setUser(updatedUser);
        }
        return updatedUser;
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Profile update failed');
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isSeller: user?.role === 'seller',
    isAdmin: user?.role === 'admin',
    hasActiveSubscription: user?.role === 'seller' && user?.seller?.subscription?.status === 'active',
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
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

export default AuthContext; 