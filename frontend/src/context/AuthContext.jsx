import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const API_URL = import.meta.env.VITE_API_URL || '';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkLoggedIn = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          
          // Verify token against backend
          const res = await fetch(`${API_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${parsedUser.token}`
            }
          });
          
          const data = await res.json();
          if (data.success) {
            // Update state with fresh info from DB
            setUser({
              ...parsedUser,
              role: data.user.role,
              status: data.user.status,
              email: data.user.email
            });
          } else {
            // Token expired or user is deactivated
            localStorage.removeItem('user');
            setUser(null);
          }
        } catch (err) {
          console.error('Failed to verify token:', err);
          // Keep offline state if server is down
          setUser(JSON.parse(storedUser));
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        const loggedInUser = {
          id: data._id,
          email: data.email,
          role: data.role,
          status: data.status,
          token: data.token,
        };
        localStorage.setItem('user', JSON.stringify(loggedInUser));
        setUser(loggedInUser);
        return { success: true };
      } else {
        setError(data.message || 'Login failed');
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error(err);
      setError('Connection to backend failed');
      return { success: false, message: 'Server is unreachable' };
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const register = async (email, password, role) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (data.success) {
        const registeredUser = {
          id: data._id,
          email: data.email,
          role: data.role,
          status: data.status,
          token: data.token,
        };
        localStorage.setItem('user', JSON.stringify(registeredUser));
        setUser(registeredUser);
        return { success: true };
      } else {
        setError(data.message || 'Registration failed');
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error(err);
      setError('Connection to backend failed');
      return { success: false, message: 'Server is unreachable' };
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
