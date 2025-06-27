import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ImageBackground, Dimensions } from 'react-native';
import * as Crypto from 'expo-crypto';
import { AuthContext } from '../context/AuthContext';
import { openDatabase, initializeDatabase } from '../DB/db';

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
        console.log('Inicializando Base de dados...');
        const database = await openDatabase();
        await initializeDatabase(database);
        setDb(database);
        console.log('Base de dados inicializada com sucesso');
      } catch (error) {
        console.error('Erro ao inicializar Base de dados:', error);
        Alert.alert('Erro', 'Falha ao preparar o Base de dados');
      } finally {
        setLoadingDb(false);
      }
    }
    initDb();
  }, []);

  const handleRegister = async () => {
    if (!db) {
      console.warn('Base de dados não está pronta');
      Alert.alert('Erro', 'Base de dados não está pronta');
      return;
    }

    if (!username.trim() || !email.trim() || !password.trim()) {
      console.warn('Campos obrigatórios não preenchidos', { username, email, password });
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    try {
      console.log('Verificando se o email já está registrado:', email);
      const existingUser  = await db.getFirstAsync(
        'SELECT * FROM users WHERE email = ?',
        [email.trim()]
      );
      if (existingUser ) {
        console.warn('Email já registrado:', email);
        Alert.alert('Erro', 'Email já registrado');
        return;
      }

      const createdAt = new Date().toISOString();
      const hashedPassword = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        password.trim()
      );

      console.log('Inserindo novo utilizador:', { username, email, name, createdAt });
      const { lastInsertRowId } = await db.runAsync(
        'INSERT INTO users (username, email, name, created_at, password, profile_image) VALUES (?, ?, ?, ?, ?, ?);',
        [username.trim(), email.trim(), name.trim(), createdAt, hashedPassword, profileImage || null]
      );
      console.log('utilizador registrado com ID:', lastInsertRowId);

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
        <Text style={styles.loadingText}>Preparando Base de dados...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('../../assets/loginleaf.png')} // Use a mesma imagem de fundo que o LoginScreen
      style={styles.background}
      imageStyle={styles.imageStyle}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Criar Conta</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome de utilizador"
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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  imageStyle: {
    position: 'absolute',
    top: 0,
    right: 0,
    height: Dimensions.get('window').height * 0.6,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    backgroundColor: 'transparent',
    borderRadius: 20,
  },
  title: {
    fontSize: 64,
    fontWeight: '400',
    color: '#381d71',
    textAlign: 'center',
    marginBottom: 40,
    fontFamily: 'MIchroma',
  },
  input: {
    borderWidth: 2,
    borderColor: '#3a6e6d',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 20,
    fontSize: 18,
    color: '#333',
  },
  button: {
    backgroundColor: '#a6b5f5',
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 30,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#381d71',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  loadingText: {
    fontSize: 18,
    color: '#468585',
    textAlign: 'center',
  },
});
