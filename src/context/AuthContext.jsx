import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Criar o contexto
export const AuthContext = createContext();

// Provedor do contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        console.log('Carregando usuário do AsyncStorage:', storedUser);
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          console.log('Usuário parseado:', parsedUser);
          setUser(parsedUser);
          setLoggedIn(true);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (userData) => {
    try {
      console.log('Fazendo login com userData:', userData);
      setUser(userData);
      setLoggedIn(true);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      console.log('Login concluído, estado atual:', { user: userData, loggedIn: true });
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setLoggedIn(false);
      await AsyncStorage.removeItem('user');
      console.log('Logout concluído, estado atual:', { user: null, loggedIn: false });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const value = { user, loggedIn, login, logout, isLoading };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};