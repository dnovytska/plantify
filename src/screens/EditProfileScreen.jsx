import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as SQLite from 'expo-sqlite';
import { AuthContext } from '../context/AuthContext';
import BottomBar from '../components/BottomBar';

// Inicializar a base de dados de forma assíncrona
const openDatabase = async () => {
  return await SQLite.openDatabaseAsync('plantifydb.db');
};

export default function EditProfileScreen({ navigation }) {
  const { user, setUser } = useContext(AuthContext);
  const [username, setUsername] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState(user.gender);
  const [imageUri, setImageUri] = useState(user.profile_image);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permissão necessária', 'Permita o acesso à galeria para escolher uma imagem.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['image'], // Corrigido para usar array em vez de MediaTypeOptions
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    try {
      const db = await openDatabase(); // Resolver a promessa para obter o objeto da base de dados
      const query = `
        UPDATE users
        SET name = ?, email = ?, gender = ?, ${password ? 'password = ?,' : ''} profile_image = ?
        WHERE iduser = ?
      `;
      const values = password
        ? [username, email, gender, password, imageUri, user.iduser]
        : [username, email, gender, imageUri, user.iduser];

      await db.runAsync(query, values); // Usar runAsync para executar a consulta
      const updatedUser = {
        ...user,
        name: username,
        email,
        gender,
        profile_image: imageUri,
        ...(password ? { password } : {}),
      };
      setUser(updatedUser);
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso.');
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o perfil.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage}>
        <Image source={{ uri: imageUri }} style={styles.image} />
        <Text style={styles.changeImageText}>Alterar imagem</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Nome de utilizador"
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
        placeholder="Nova palavra-passe (opcional)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Género"
        value={gender}
        onChangeText={setGender}
      />

      <Button title="Guardar alterações" onPress={handleSave} color="#4CAF50" />

      <BottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  image: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignSelf: 'center',
    marginBottom: 10,
  },
  changeImageText: {
    textAlign: 'center',
    color: '#007BFF',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: '#cccccc',
    borderWidth: 1,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
});