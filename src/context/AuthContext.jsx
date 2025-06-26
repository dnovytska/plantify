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
        console.log('Carregando usuário do AsyncStorage...');
        const storedUser = await AsyncStorage.getItem('user');
        console.log('Dados brutos do AsyncStorage:', storedUser);
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          console.log('Usuário parseado:', parsedUser);
          if (parsedUser && parsedUser.iduser) {
            setUser(parsedUser);
            setLoggedIn(true); // Garante que loggedIn seja true se user for válido
            console.log('Usuário carregado, definindo loggedIn como true');
          } else {
            console.warn('Usuário parseado não contém iduser:', parsedUser);
            await AsyncStorage.removeItem('user'); // Limpa dados inválidos
          }
        } else {
          console.log('Nenhum usuário encontrado no AsyncStorage');
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      } finally {
        setIsLoading(false);
        console.log('Estado final após loadUser:', { user, loggedIn, isLoading: false });
      }
    };
    loadUser();
  }, []);

  const login = async (userData) => {
    try {
      console.log('Fazendo login com userData:', userData);
      if (!userData.iduser) {
        throw new Error('Dados de login inválidos: iduser ausente');
      }
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
      console.log('Iniciando logout...');
      setUser(null);
      setLoggedIn(false);
      await AsyncStorage.removeItem('user');
      console.log('Logout concluído, estado atual:', { user: null, loggedIn: false });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  };

  const value = { user, loggedIn, login, logout, isLoading };

  console.log('AuthProvider fornecendo valor:', value);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};