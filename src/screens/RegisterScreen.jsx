import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import { AuthContext } from '../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [db, setDb] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [loadingDb, setLoadingDb] = useState(true);

  useEffect(() => {
    async function initDb() {
      try {
        console.log('Inicializando banco de dados...');
        const database = await SQLite.openDatabaseAsync('plantifydb.db');
        await database.execAsync(`
          CREATE TABLE IF NOT EXISTS users (
            iduser INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            name TEXT,
            created_at datetime NOT NULL,
            password TEXT NOT NULL,
            profile_image TEXT
          );
          CREATE TABLE IF NOT EXISTS care_levels (
            idcare_level INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
          );
          CREATE TABLE IF NOT EXISTS growth_rates (
            idgrowth_rate INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
          );
          CREATE TABLE IF NOT EXISTS sunlight_levels (
            idsunlight_level INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
          );
          CREATE TABLE IF NOT EXISTS watering_levels (
            idwatering_level INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
          );
          CREATE TABLE IF NOT EXISTS plant_types (
            idplant_type INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            watering_id INTEGER,
            sunlight_id INTEGER,
            growth_rate_id INTEGER,
            care_level_id INTEGER,
            FOREIGN KEY (watering_id) REFERENCES watering_levels(idwatering_level),
            FOREIGN KEY (sunlight_id) REFERENCES sunlight_levels(idsunlight_level),
            FOREIGN KEY (growth_rate_id) REFERENCES growth_rates(idgrowth_rate),
            FOREIGN KEY (care_level_id) REFERENCES care_levels(idcare_level)
          );
          CREATE TABLE IF NOT EXISTS plants (
            idplant INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            image TEXT,
            plant_type_id INTEGER,
            FOREIGN KEY (plant_type_id) REFERENCES plant_types(idplant_type)
          );
          CREATE TABLE IF NOT EXISTS plants_acc (
            idplants_acc INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            creation_date TEXT NOT NULL,
            description TEXT,
            image TEXT,
            iduser INTEGER,
            idplant INTEGER,
            FOREIGN KEY (iduser) REFERENCES users(iduser),
            FOREIGN KEY (idplant) REFERENCES plants(idplant)
          );
          CREATE TABLE IF NOT EXISTS diseases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT
          );
          CREATE TABLE IF NOT EXISTS diseases_plants_acc (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            plants_acc_id INTEGER,
            disease_id INTEGER,
            FOREIGN KEY (plants_acc_id) REFERENCES plants_acc(idplants_acc),
            FOREIGN KEY (disease_id) REFERENCES diseases(id)
          );
          CREATE TABLE IF NOT EXISTS notification_types (
            idnotification_type INTEGER PRIMARY KEY AUTOINCREMENT,
            notification_type TEXT
          );
          CREATE TABLE IF NOT EXISTS notifications (
            idnotification INTEGER PRIMARY KEY AUTOINCREMENT,
            idplants_acc INTEGER,
            message TEXT NOT NULL,
            due_date TEXT,
            is_read INTEGER DEFAULT 0,
            id_notification_type INTEGER,
            FOREIGN KEY (idplants_acc) REFERENCES plants_acc(idplants_acc),
            FOREIGN KEY (id_notification_type) REFERENCES notification_types(idnotification_type)
          );
        `);
        setDb(database);
        console.log('Banco de dados inicializado com sucesso');
      } catch (error) {
        console.error('Erro ao inicializar banco de dados:', error);
        Alert.alert('Erro', 'Falha ao preparar o banco de dados');
      } finally {
        setLoadingDb(false);
      }
    }
    initDb();
  }, []);

  const handleRegister = async () => {
    if (!db) {
      console.warn('Banco de dados não está pronto');
      Alert.alert('Erro', 'Banco de dados não está pronto');
      return;
    }

    if (!username.trim() || !email.trim() || !password.trim()) {
      console.warn('Campos obrigatórios não preenchidos', { username, email, password });
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    try {
      console.log('Verificando se o email já está registrado:', email);
      const existingUser = await db.getFirstAsync(
        'SELECT * FROM users WHERE email = ?',
        [email.trim()]
      );
      if (existingUser) {
        console.warn('Email já registrado:', email);
        Alert.alert('Erro', 'Email já registrado');
        return;
      }

      const createdAt = new Date().toISOString();
      const hashedPassword = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        password.trim()
      );

      console.log('Inserindo novo usuário:', { username, email, name, createdAt });
      const { lastInsertRowId } = await db.runAsync(
        'INSERT INTO users (username, email, name, created_at, password, profile_image) VALUES (?, ?, ?, ?, ?, ?);',
        [username.trim(), email.trim(), name.trim(), createdAt, hashedPassword, profileImage || null]
      );
      console.log('Usuário registrado com ID:', lastInsertRowId);

      // Chamar login do AuthContext
      const userData = {
        iduser: lastInsertRowId,
        username: username.trim(),
        email: email.trim(),
        name: name.trim() || '',
        profile_image: profileImage || null,
      };
      console.log('Chamando login com userData:', userData);
      await login(userData);

      Alert.alert('Sucesso', 'Registro concluído com sucesso!');
      setUsername('');
      setEmail('');
      setName('');
      setPassword('');
      setProfileImage('');

      // Navegar para YourPlants
      navigation.navigate('YourPlants');
    } catch (error) {
      console.error('Erro no registro:', error);
      Alert.alert('Erro', error.message || 'Falha ao registrar');
    }
  };

  if (loadingDb) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Preparando banco de dados...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Conta</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome de Usuário"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="URL da Imagem de Perfil (opcional)"
        value={profileImage}
        onChangeText={setProfileImage}
      />
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.linkText}>Já tem uma conta? Faça login</Text>
      </TouchableOpacity>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#468585',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    height: 50,
    borderColor: '#468585',
    borderWidth: 2,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#468585',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#B0A8F0',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  loadingText: {
    fontSize: 18,
    color: '#468585',
    textAlign: 'center',
  },
});