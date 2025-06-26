import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
} from 'react-native';
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
      } catch (error) {
        console.error('Erro ao inicializar o banco de dados:', error);
        Alert.alert('Erro', 'Não foi possível inicializar o banco de dados.');
      }
    };
    initDb();
  }, []);

  const getFirstAsync = async (sql, params = []) => {
    if (!db) throw new Error('Banco de dados não inicializado');
    try {
      const row = await db.getFirstAsync(sql, params);
      return row ?? null;
    } catch (error) {
      throw error;
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Por favor, preencha todos os campos');
      return;
    }

    try {
      const user = await getFirstAsync('SELECT * FROM users WHERE email = ? LIMIT 1', [email.trim()]);
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
          name: user.name || user.username,
          email: user.email,
        };
        await login(userData);
        navigation.replace('SettingsScreen');
      } else {
        Alert.alert('Senha inválida');
      }
    } catch (error) {
      Alert.alert('Erro no login', error.message || 'Erro desconhecido');
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/loginleaf.png')}
      style={styles.background}
      imageStyle={styles.imageStyle}
    >
      <View style={styles.container}>
        <Text style={styles.loginTitle}>Login</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#3a6e6d"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#3a6e6d"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity onPress={() => Alert.alert('Recuperar senha ainda não implementado')}>
          <Text style={styles.forgot}>Forget Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        <Text style={styles.signupText}>
          Don’t have an account?{' '}
          <Text style={styles.signupLink} onPress={() => navigation.navigate('Register')}>
            Sign Up
          </Text>
        </Text>
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
  loginTitle: {
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
  forgot: {
    textAlign: 'right',
    color: '#381d71',
    fontSize: 14,
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: '#a6b5f5',
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 30,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
  },
  signupText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#381d71',
  },
  signupLink: {
    fontWeight: 'bold',
  },
});
