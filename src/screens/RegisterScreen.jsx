import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';

export default function RegisterScreen({ navigation }) {
  const [db, setDb] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState(''); // Mudado de fullName pra name
  const [password, setPassword] = useState('');
  const [profileImage, setProfileImage] = useState(''); // Novo campo opcional
  const [loadingDb, setLoadingDb] = useState(true);

  useEffect(() => {
    async function initDb() {
      try {
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
        console.log('Database prepared successfully with all tables');
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
      const existingUser = await db.getFirstAsync(
        'SELECT * FROM users WHERE email = ?',
        [email.trim()]
      );
      if (existingUser) {
        Alert.alert('Error', 'Email already registered');
        return;
      }

      const createdAt = new Date().toISOString();

      const hashedPassword = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        password.trim()
      );

      const { lastInsertRowId } = await db.runAsync(
        'INSERT INTO users (username, email, name, created_at, password, profile_image) VALUES (?, ?, ?, ?, ?, ?);',
        [username.trim(), email.trim(), name.trim(), createdAt, hashedPassword, profileImage || null]
      );
      console.log('User registered with ID:', lastInsertRowId);
      Alert.alert('Registration successful');
      setUsername('');
      setEmail('');
      setName('');
      setPassword('');
      setProfileImage('');
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
        placeholder="Name" // Mudado de Full Name pra Name
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Profile Image URL (optional)"
        value={profileImage}
        onChangeText={setProfileImage}
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