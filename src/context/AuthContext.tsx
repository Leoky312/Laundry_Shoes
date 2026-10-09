import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Storage from '../services/storage';
import api from '../services/api';

interface AuthContextType {
  user: any;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (data: any) => Promise<any>;
  logout: () => Promise<void>;
  updateProfile: (formData: any) => Promise<any>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

        try {
          const res = await api.get('/auth/me');
          if (res) {
            setUser(res);
            await Storage.setItem('@auth_user', JSON.stringify(res));
          }
        } catch (err: any) {
          console.log('Sinkronisasi sesi background gagal:', err.message);
        }
      }
    } catch (e) {
      console.error('Gagal memuat sesi dari storage:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res: any = await api.post('/auth/login', { email, password });
      const { user: loggedInUser, token: authToken } = res;

      setToken(authToken);
      setUser(loggedInUser);

      await Storage.setItem('@auth_token', authToken);
      await Storage.setItem('@auth_user', JSON.stringify(loggedInUser));

      return { success: true, user: loggedInUser };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };

  const register = async ({ name, email, password, phone, address }: any) => {
    try {
      const res: any = await api.post('/auth/register', {
        name,
        email,
        password,
        phone,
        address,
      });
      const { user: newUser, token: authToken } = res;

      setToken(authToken);
      setUser(newUser);

      await Storage.setItem('@auth_token', authToken);
      await Storage.setItem('@auth_user', JSON.stringify(newUser));

      return { success: true, user: newUser };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };

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

  const updateProfile = async (formData: any) => {
    try {
      const res: any = await api.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res) {
        setUser(res);
        await Storage.setItem('@auth_user', JSON.stringify(res));
      }
      return { success: true, data: res };
    } catch (error: any) {
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
