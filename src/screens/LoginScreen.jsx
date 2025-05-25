import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import { AuthContext } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);

  const getFirstAsync = async (sql, params = []) => {
    const db = await SQLite.openDatabaseAsync('plantify.db');
    const row = await db.getFirstAsync(sql, Array.isArray(params) ? params : [params]);
    return row ?? null;
  };

  const handleLogin = async () => {
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
        await login(userData);
        // Depuração: Verificar rotas disponíveis
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Login</Text>
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
  title: { fontSize: 24, textAlign: 'center', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
});