import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { setAuthToken } from '@/services/auth.service';

const TOKEN_KEY = 'reliive_jwt_token';

// Cross-platform token storage (localStorage for Web, SecureStore for Native iOS/Android)
const tokenStorage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return null;
    }
    return await SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  async deleteItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

interface AuthContextType {
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  session: string | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load the token from storage when the app starts
    const loadSession = async () => {
      try {
        const storedToken = await tokenStorage.getItem(TOKEN_KEY);
        if (storedToken) {
          setSession(storedToken);
          setAuthToken(storedToken); // Update axios headers
        }
      } catch (error) {
        console.error('Failed to load session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  const signIn = async (token: string) => {
    try {
      await tokenStorage.setItem(TOKEN_KEY, token);
      setSession(token);
      setAuthToken(token); // Update axios headers
    } catch (error) {
      console.error('Failed to save session:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await tokenStorage.deleteItem(TOKEN_KEY);
      setSession(null);
      setAuthToken(null); // Clear axios headers
    } catch (error) {
      console.error('Failed to clear session:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ signIn, signOut, session, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
