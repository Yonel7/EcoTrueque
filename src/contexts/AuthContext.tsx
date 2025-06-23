import React, { createContext, useContext, useState, ReactNode } from 'react';
import * as authService from '../services/auth';

interface User {
  _id: string;
  name: string;
  email: string;
  location?: string;
  bio?: string;
  phone?: string;
  rating?: number;
  totalRatings?: number;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        const parsedUser = JSON.parse(savedUser);
        console.log('Usuario cargado desde localStorage:', parsedUser);
        return parsedUser;
      }
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return null;
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Intentando login con:', { email });
      const response = await authService.login({ email, password });
      
      console.log('Login exitoso:', response);
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify({
        _id: response._id,
        name: response.name,
        email: response.email,
        location: response.location,
        bio: response.bio,
        phone: response.phone,
        rating: response.rating,
        totalRatings: response.totalRatings,
        avatar: response.avatar
      }));
      
      setUser({
        _id: response._id,
        name: response.name,
        email: response.email,
        location: response.location,
        bio: response.bio,
        phone: response.phone,
        rating: response.rating,
        totalRatings: response.totalRatings,
        avatar: response.avatar
      });
      
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      console.log('Intentando registro con:', { name, email });
      const response = await authService.register({ name, email, password });
      
      console.log('Registro exitoso:', response);
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify({
        _id: response._id,
        name: response.name,
        email: response.email,
        location: response.location,
        bio: response.bio,
        phone: response.phone,
        rating: response.rating,
        totalRatings: response.totalRatings,
        avatar: response.avatar
      }));
      
      setUser({
        _id: response._id,
        name: response.name,
        email: response.email,
        location: response.location,
        bio: response.bio,
        phone: response.phone,
        rating: response.rating,
        totalRatings: response.totalRatings,
        avatar: response.avatar
      });
      
      return true;
    } catch (error: any) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    console.log('Cerrando sesión...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      console.log('Actualizando usuario:', updatedUser);
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};