// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (userData) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setLoggedIn(true);
    } catch (error) {
      console.error('Erro ao salvar dados do usuário:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setLoggedIn(false);
    } catch (error) {
      console.error('Erro ao remover dados do usuário:', error);
    }
  };

  const checkLoginStatus = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      setLoggedIn(!!user);
    } catch (error) {
      console.error('Erro ao verificar status de login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ loggedIn, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
