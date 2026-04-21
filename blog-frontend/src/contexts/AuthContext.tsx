'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import Loader from "@/components/Loader";

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  authToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("authToken");
    console.log('[AuthProvider] Token from cookie:', token);

    if (!token) {
      console.log('[AuthProvider] No token found');
      setIsLoading(false);
      return;
    }

    setAuthToken(token);

    axios
      .get(`${API_URL}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      })
      .then((res) => {
        setUser(res.data);
        console.log('[AuthProvider] User fetched:', res.data);
      })
      .catch((err) => {
        console.error('[AuthProvider] Failed to fetch user', err);
        Cookies.remove('authToken');
        setAuthToken(null);
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });

      if (response.data.success) {
        const { token, user } = response.data;

        Cookies.set("authToken", token, {
          expires: 7,
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });

        console.log('[AuthProvider] Cookie set successfully');
        toast.success("Login successful");
        setAuthToken(token);
        setUser(user);
        router.push('/');
      } else {
        toast.error(response.data.message || "Login failed");
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Login failed. Please check your credentials.';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    Cookies.remove("authToken", { path: '/' });
    setAuthToken(null);
    setUser(null);
    toast.success("Logged out successfully");
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, setIsLoading, authToken, login, logout }}
    >
      {isLoading ? <Loader /> : children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};