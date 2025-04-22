import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { openDatabase } from '../DB/database';

export default function RegisterScreen() {
  const [db, setDb] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [loadingDb, setLoadingDb] = useState(true);

  useEffect(() => {
    async function prepareDb() {
      try {
        const database = await openDatabase();
        setDb(database);
        console.log('Database prepared successfully');
      } catch (error) {
        console.error('Error preparing database:', error);
        Alert.alert('Error preparing database');
      } finally {
        setLoadingDb(false);
      }
    }
    prepareDb();
  }, []);

  const handleRegister = () => {
    if (!db) {
      Alert.alert('Database not ready');
      return;
    }

    if (!username || !email || !password) {
      Alert.alert('Please fill in all required fields');
      return;
    }

    const createdAt = new Date().toISOString();

    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO users (username, email, full_name, created_at, password) 
         VALUES (?, ?, ?, ?, ?)`,
        [username, email, fullName, createdAt, password],
        (_, result) => {
          Alert.alert('Registration successful');
          setUsername('');
          setEmail('');
          setFullName('');
          setPassword('');
        },
        (_, error) => {
          console.error('Registration error:', error);
          Alert.alert('Registration failed');
        }
      );
    });
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