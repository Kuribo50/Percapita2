'use client';

import React, { createContext, startTransition, useContext, useEffect, useState } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (rut: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  isReady: boolean;
  loginAsDevAdmin: () => void;
}

interface RegisterData {
  rut: string;
  nombre: string;
  apellido: string;
  email: string;
  establecimiento: string;
  password: string;
}

interface StoredUser extends User {
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
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

  const register = async (userData: RegisterData): Promise<{ success: boolean; message?: string }> => {
    // Validación de campos requeridos
    if (!userData.rut || !userData.nombre || !userData.apellido || !userData.email || !userData.establecimiento || !userData.password) {
      return { success: false, message: 'Todos los campos son obligatorios' };
    }

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      return { success: false, message: 'Email inválido' };
    }

    // Validación de contraseña
    if (userData.password.length < 6) {
      return { success: false, message: 'La contraseña debe tener al menos 6 caracteres' };
    }

    // Obtener usuarios registrados
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]') as StoredUser[];
    
    // Verificar si el RUT ya existe
    if (registeredUsers.some(u => u.rut === userData.rut)) {
      return { success: false, message: 'El RUT ya está registrado' };
    }

    // Crear nuevo usuario
    const newUser: StoredUser = {
      rut: userData.rut,
      nombre: userData.nombre,
      apellido: userData.apellido,
      email: userData.email,
      establecimiento: userData.establecimiento,
      password: userData.password, // En producción, esto debería ser hasheado
      rol: 'admin',
    };

    // Guardar en lista de usuarios
    registeredUsers.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));

    return { success: true, message: 'Usuario registrado exitosamente' };
  };

  const login = async (
    rut: string,
    password: string
  ): Promise<{ success: boolean; message?: string }> => {
    // Validación de campos requeridos
    if (!rut || !password) {
      return { success: false, message: 'RUT y contraseña son obligatorios' };
    }

    // Obtener usuarios registrados
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]') as StoredUser[];
    
    // Buscar usuario por RUT
    const foundUser = registeredUsers.find(u => u.rut === rut);
    
    if (!foundUser) {
      return { success: false, message: 'Usuario no encontrado' };
    }

    // Verificar contraseña
    if (foundUser.password !== password) {
      return { success: false, message: 'Contraseña incorrecta' };
    }

    // Login exitoso - guardar usuario sin la contraseña
  // Construir el usuario sin exponer la contraseña
    const userWithoutPassword: User = {
      rut: foundUser.rut,
      nombre: foundUser.nombre,
      apellido: foundUser.apellido,
      email: foundUser.email,
      establecimiento: foundUser.establecimiento,
      rol: foundUser.rol,
    };
    
    setUser(userWithoutPassword);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
    
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
  };

  // Solo para desarrollo: crear sesión con un usuario admin de prueba
  const loginAsDevAdmin = () => {
    try {
      const devUser: User = {
        rut: '11111111-1',
        nombre: 'Admin',
        apellido: 'Dev',
        email: 'admin.dev@local',
        establecimiento: 'DEV',
        rol: 'admin',
      };

      setUser(devUser);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(devUser));

      // Opcional: asegurar que exista en la lista de registrados para coherencia
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]') as StoredUser[];
      const exists = registeredUsers.some(u => u.rut === devUser.rut);
      if (!exists) {
        registeredUsers.push({
          ...devUser,
          password: 'dev',
        });
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
      }
    } catch {
      // noop
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated, isReady, loginAsDevAdmin }}>
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
