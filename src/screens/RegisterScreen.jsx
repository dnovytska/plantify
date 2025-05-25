import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite'; // Importar diretamente o expo-sqlite
import * as Crypto from 'expo-crypto';

export default function RegisterScreen({ navigation }) {
  const [db, setDb] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [loadingDb, setLoadingDb] = useState(true);

  useEffect(() => {
    async function initDb() {
      try {
        // Abrir o banco de dados de forma assíncrona
        const database = await SQLite.openDatabaseAsync('plantify.db');
        // Cria a tabela se não existir
        await database.execAsync(`
          CREATE TABLE IF NOT EXISTS users (
            iduser INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            full_name TEXT,
            created_at TEXT NOT NULL,
            password TEXT NOT NULL
          );
        `);
        setDb(database);
        console.log('Database prepared successfully');
      } catch (error) {
        console.error('Error preparing database:', error);
        Alert.alert('Error preparing database');
      } finally {
        setLoadingDb(false);
      }
    }
    initDb();
  }, []);

  const handleRegister = async () => {
    if (!db) {
      Alert.alert('Database not ready');
      return;
    }

    if (!username.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Please fill in all required fields');
      return;
    }

    try {
      // Verificar se o email já está registrado
      const existingUser = await db.getFirstAsync(
        'SELECT * FROM users WHERE email = ?',
        [email.trim()]
      );
      if (existingUser) {
        Alert.alert('Error', 'Email already registered');
        return;
      }

      const createdAt = new Date().toISOString();

      // Gera o hash da senha
      const hashedPassword = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        password.trim()
      );

      const { lastInsertRowId } = await db.runAsync(
        'INSERT INTO users (username, email, full_name, created_at, password) VALUES (?, ?, ?, ?, ?);',
        [username.trim(), email.trim(), fullName.trim(), createdAt, hashedPassword]
      );
      console.log('User registered with ID:', lastInsertRowId);
      Alert.alert('Registration successful');
      setUsername('');
      setEmail('');
      setFullName('');
      setPassword('');
      // Redirecionar para a tela de login (se navigation estiver configurado)
      if (navigation) {
        navigation.navigate('Login');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Registration failed', error.message || 'Unknown error');
    }
  };

  if (loadingDb) {
    return (
      <View style={styles.container}>
        <Text>Preparing database...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Registration</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button title="Register" onPress={handleRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f0fff0',
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#aaa',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
});