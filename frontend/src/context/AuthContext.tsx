import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSummary, UserRole } from '../types';
import { api, setToken, removeToken, getToken } from '../services/api';

export interface LanguageOption {
  code: string;
  name: string;
  native: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'English', name: 'English', native: 'English' },
  { code: 'Hindi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'Telugu', name: 'Telugu', native: 'తెలుగు' },
  { code: 'Tamil', name: 'Tamil', native: 'தமிழ்' },
  { code: 'Kannada', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'Bengali', name: 'Bengali', native: 'বাংলা' },
];

interface AuthContextType {
  user: UserSummary | null;
  token: string | null;
  isLoading: boolean;
  selectedLanguage: string;
  setLanguage: (lang: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  demoLogin: (role: UserRole) => Promise<void>;
  registerPatient: (data: any) => Promise<void>;
  registerWorker: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSummary | null>(() => {
    const cached = localStorage.getItem('aarogya_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(() => {
    return localStorage.getItem('aarogya_lang') || 'English';
  });

  const refreshUser = async () => {
    if (!getToken()) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const u = await api.getMe();
      setUser(u);
      localStorage.setItem('aarogya_user', JSON.stringify(u));
      if (u.preferred_language) {
        setSelectedLanguage(u.preferred_language);
        localStorage.setItem('aarogya_lang', u.preferred_language);
      }
    } catch {
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();

    const handleUnauthorized = () => {
      setUser(null);
      setTokenState(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password });
      setToken(res.access_token);
      setTokenState(res.access_token);
      setUser(res.user);
      localStorage.setItem('aarogya_user', JSON.stringify(res.user));
      if (res.user.preferred_language) {
        setSelectedLanguage(res.user.preferred_language);
        localStorage.setItem('aarogya_lang', res.user.preferred_language);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (role: UserRole) => {
    if (role === 'admin') {
      await login('admin@ruralhealth.org', 'Admin@12345');
    } else if (role === 'healthcare_worker') {
      await login('dr.rajesh@phc.in', 'Doctor@12345');
    } else {
      await login('ramesh.kumar@rural.in', 'Patient@12345');
    }
  };

  const registerPatient = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await api.registerPatient(data);
      setToken(res.access_token);
      setTokenState(res.access_token);
      setUser(res.user);
      localStorage.setItem('aarogya_user', JSON.stringify(res.user));
      if (res.user.preferred_language) {
        setSelectedLanguage(res.user.preferred_language);
        localStorage.setItem('aarogya_lang', res.user.preferred_language);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const registerWorker = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await api.registerWorker(data);
      setToken(res.access_token);
      setTokenState(res.access_token);
      setUser(res.user);
      localStorage.setItem('aarogya_user', JSON.stringify(res.user));
      if (res.user.preferred_language) {
        setSelectedLanguage(res.user.preferred_language);
        localStorage.setItem('aarogya_lang', res.user.preferred_language);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguage = async (lang: string) => {
    setSelectedLanguage(lang);
    localStorage.setItem('aarogya_lang', lang);
    if (user) {
      try {
        await api.updateProfile({ preferred_language: lang });
        setUser({ ...user, preferred_language: lang });
        localStorage.setItem('aarogya_user', JSON.stringify({ ...user, preferred_language: lang }));
      } catch (err) {
        console.error('Failed to persist language preference on backend:', err);
      }
    }
  };

  const logout = () => {
    removeToken();
    setTokenState(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        selectedLanguage,
        setLanguage,
        login,
        demoLogin,
        registerPatient,
        registerWorker,
        logout,
        refreshUser,
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

