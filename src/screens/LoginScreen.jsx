import React, { useState, useEffect, useContext } from 'react'; // Added useEffect to import
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import * as Crypto from 'expo-crypto';
import { AuthContext } from '../context/AuthContext';
import { openDatabase, initializeDatabase } from '../DB/db';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const [db, setDb] = useState(null);

  useEffect(() => {
    const initDb = async () => {
      try {
        const database = await openDatabase();
        await initializeDatabase(database);
        setDb(database);
        console.log('Database initialized in LoginScreen');
      } catch (error) {
        console.error('Error initializing database in LoginScreen:', error);
        Alert.alert('Erro', 'Não foi possível inicializar o banco de dados.');
      }
    };
    initDb();
  }, []);

  const getFirstAsync = async (sql, params = []) => {
    if (!db) {
      throw new Error('Banco de dados não inicializado');
    }
    try {
      const row = await db.getFirstAsync(sql, Array.isArray(params) ? params : [params]);
      console.log('Resultado da query:', row);
      return row ?? null;
    } catch (error) {
      console.error('Erro no getFirstAsync:', error);
      throw error;
    }
  };

  const handleLogin = async () => {
    if (!db) {
      Alert.alert('Erro', 'Banco de dados não inicializado. Tente novamente.');
      return;
    }

    if (!email.trim() || !password.trim()) {
      Alert.alert('Por favor, preencha todos os campos');
      return;
    }

    try {
      const user = await getFirstAsync(
        'SELECT * FROM users WHERE email = ? LIMIT 1',
        [email.trim()]
      );

      if (!user) {
        Alert.alert('Usuário não encontrado');
        return;
      }

      const hashed = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        password.trim()
      );

      if (hashed === user.password) {
        const userData = {
          id: user.iduser,
          name: user.full_name || user.username,
          email: user.email,
        };
        console.log('Salvando userData no login:', userData);
        await login(userData);
        console.log('Estado após login no AuthContext:', { loggedIn: true, user: userData });
        console.log('Rotas disponíveis:', navigation.getState()?.routeNames);
        navigation.replace('SettingsScreen');
      } else {
        Alert.alert('Senha inválida');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      Alert.alert('Falha no login', error.message || 'Ocorreu um erro desconhecido');
    }
  };

  const currentDateTime = "Monday, June 02, 2025, 09:00 PM WEST";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Login</Text>
      <Text style={styles.dateTime}>{currentDateTime}</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 10 },
  dateTime: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
});