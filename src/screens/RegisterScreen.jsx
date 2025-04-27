import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { openDatabase, testDatabase } from '../DB/database';

export default function RegisterScreen() {
  const [db, setDb] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [loadingDb, setLoadingDb] = useState(true);

  useEffect(() => {
    async function initDb() {
      try {
        const database = await openDatabase();
        // Create table if not exists using new API
        await database.execAsync(
          `CREATE TABLE IF NOT EXISTS users (
            iduser INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            email TEXT NOT NULL,
            full_name TEXT,
            created_at TEXT NOT NULL,
            password TEXT NOT NULL
          );`
        );
        setDb(database);
        console.log('Database prepared successfully');
        // Chama comando de teste para verificar dados existentes
        await testDatabase();
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

    const createdAt = new Date().toISOString();

    try {
      const { lastInsertRowId } = await db.runAsync(
        `INSERT INTO users (username, email, full_name, created_at, password) VALUES (?, ?, ?, ?, ?);`,
        username.trim(),
        email.trim(),
        fullName.trim(),
        createdAt,
        password.trim()
      );
      console.log('User registered with ID:', lastInsertRowId);
      Alert.alert('Registration successful');
      setUsername('');
      setEmail('');
      setFullName('');
      setPassword('');
      // Após inserir, testar novamente a base
      await testDatabase();
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Registration failed');
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