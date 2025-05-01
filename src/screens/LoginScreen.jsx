import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { openDatabase } from '../DB/database';
import * as Crypto from 'expo-crypto';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Por favor, preencha todos os campos');
      return;
    }

    try {
      const db = await openDatabase();
      // getFirstAsync retorna o primeiro registro ou undefined
      const user = await db.getFirstAsync(
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
        Alert.alert('Login bem-sucedido');
        // navigation.navigate('HomeScreen');
      } else {
        Alert.alert('Senha inválida');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      Alert.alert('Falha no login');
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
    borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 15,
  },
});
