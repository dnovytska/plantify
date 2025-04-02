import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { register } from '../services/AuthService';

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      await register(email, password);
      Alert.alert('Sucesso', 'Registro efetuado com sucesso!');
      navigation.navigate('Login'); // Navegar para a tela de Login
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Registrar" onPress={handleRegister} />
    </View>
  );
};

export default RegisterScreen;