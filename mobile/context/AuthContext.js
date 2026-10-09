import React, { createContext, useContext, useState, useEffect } from 'react';
import Storage from '../services/storage';
import api from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Periksa apakah ada sesi login tersimpan saat aplikasi pertama kali dibuka
  useEffect(() => {
    loadStoredSession();
  }, []);

  const loadStoredSession = async () => {
    try {
      const storedToken = await Storage.getItem('@auth_token');
      const storedUser = await Storage.getItem('@auth_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));

        // Sinkronisasi data user terbaru di latar belakang
        try {
          const res = await api.get('/auth/me');
          if (res.data) {
            setUser(res.data);
            await Storage.setItem('@auth_user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.log('Sinkronisasi sesi background gagal:', err.message);
        }
      }
    } catch (e) {
      console.error('Gagal memuat sesi dari storage:', e);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fungsi Login
   */
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user: loggedInUser, token: authToken } = res.data;

      setToken(authToken);
      setUser(loggedInUser);

      await Storage.setItem('@auth_token', authToken);
      await Storage.setItem('@auth_user', JSON.stringify(loggedInUser));

      return { success: true, user: loggedInUser };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  /**
   * Fungsi Registrasi Customer Baru
   */
  const register = async ({ name, email, password, phone, address }) => {
    try {
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
        phone,
        address,
      });
      const { user: newUser, token: authToken } = res.data;

      setToken(authToken);
      setUser(newUser);

      await Storage.setItem('@auth_token', authToken);
      await Storage.setItem('@auth_user', JSON.stringify(newUser));

      return { success: true, user: newUser };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  /**
   * Fungsi Logout
   */
  const logout = async () => {
    try {
      await Storage.removeItem('@auth_token');
      await Storage.removeItem('@auth_user');
      setToken(null);
      setUser(null);
    } catch (e) {
      console.error('Error saat logout:', e);
    }
  };

  /**
   * Fungsi Update Profil
   */
  const updateProfile = async (formData) => {
    try {
      const res = await api.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data) {
        setUser(res.data);
        await Storage.setItem('@auth_user', JSON.stringify(res.data));
      }
      return { success: true, data: res.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        updateProfile,
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

export default AuthContext;
