import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
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
      } catch (err) {
        console.error('Erro ao abrir banco de dados:', err);
        Alert.alert('Erro ao abrir banco de dados');
      } finally {
        setLoadingDb(false);
      }
    }
    prepareDb();
  }, []);

  useEffect(() => {
    if (!db) return;

    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL,
          email TEXT NOT NULL,
          full_name TEXT,
          created_at TEXT NOT NULL,
          password TEXT NOT NULL
        );`
      );
    });
  }, [db]);

  const handleRegister = () => {
    if (!db) {
      Alert.alert('Banco de dados ainda não está pronto. Aguarde um momento.');
      return;
    }

    if (!username || !email || !password) {
      Alert.alert('Preencha os campos obrigatórios!');
      return;
    }

    const createdAt = new Date().toISOString();

    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO users (username, email, full_name, created_at, password) 
         VALUES (?, ?, ?, ?, ?)`,
        [username, email, fullName, createdAt, password],
        (_, result) => {
          Alert.alert('Registrado com sucesso!');
          setUsername('');
          setEmail('');
          setFullName('');
          setPassword('');
        },
        (_, error) => {
          console.error('Erro ao registrar:', error);
          Alert.alert('Erro ao registrar');
          return false;
        }
      );
    });
  };

  if (loadingDb) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#468585" />
        <Text style={{ marginTop: 10 }}>Preparando banco de dados...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro de Usuário</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome de usuário"
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
        placeholder="Nome completo"
        value={fullName}
        onChangeText={setFullName}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button title="Registrar" onPress={handleRegister} />
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
