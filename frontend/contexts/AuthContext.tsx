'use client';

import React, { createContext, startTransition, useContext, useEffect, useState } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (rut: string, nombre: string, establecimiento: string, email: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser) as User;
      startTransition(() => {
        setUser(parsedUser);
        setIsAuthenticated(true);
      });
    }
    startTransition(() => {
      setIsReady(true);
    });
  }, []);

  const login = async (
    rut: string,
    nombre: string,
    establecimiento: string,
    email: string
  ): Promise<boolean> => {
    // Validación de campos requeridos
    if (!rut || !nombre || !establecimiento || !email) {
      return false;
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return false;
    }

    // Crear usuario con los datos proporcionados
    const userData: User = {
      rut,
      nombre,
      establecimiento,
      email,
      rol: 'admin',
    };

    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
    return true;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isReady }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
