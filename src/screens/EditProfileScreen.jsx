import React, { useState, useContext, useEffect } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { openDatabase } from '../DB/db';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

const openDB = async () => {
  try {
    const db = await openDatabase();
    console.log("Banco de dados aberto com sucesso!");
    return db;
  } catch (error) {
    console.error("Erro ao abrir banco de dados:", error);
    Alert.alert("Erro", "Falha ao inicializar o banco de dados SQLite.");
    throw error;
  }
};

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { user, updateUser  } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [db, setDb] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      const database = await openDB();
      setDb(database);

      if (user) {
        setName(user.name || '');
        setEmail(user.email || '');
        setImageUri(user.image || 'https://via.placeholder.com/150');
      }
    };
    initialize();
  }, [user]);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permissão negada', 'É necessário permitir o acesso à galeria.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!db) {
      Alert.alert('Erro', 'Banco de dados não inicializado.');
      return;
    }

    if (!name.trim() || !email.trim()) {
      Alert.alert('Erro', 'Nome e email são obrigatórios.');
      return;
    }

    let imageBlob = imageUri;
    if (imageUri && !imageUri.startsWith('data:image')) {
      const imageData = await FileSystem.readAsStringAsync(imageUri, { encoding: FileSystem.EncodingType.Base64 });
      imageBlob = `data:image/jpeg;base64,${imageData}`;
    }

    try {
      await db.withTransactionAsync(async () => {
        const query = `
          UPDATE users 
          SET name = ?, email = ?, profile_image = ?
          ${password ? ', password = ?' : ''}
          WHERE iduser = ?`;
        const params = [name.trim(), email.trim(), imageBlob || null];
        if (password) params.push(password);
        params.push(user.iduser);

        await db.runAsync(query, params);

        const updatedUser  = { ...user, name: name.trim(), email: email.trim(), image: imageBlob || user.image };
        if (password) updatedUser .password = password; // Note: Criptografe a senha em produção
        updateUser (updatedUser );

        Alert.alert('Sucesso', 'Perfil atualizado com sucesso!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      Alert.alert('Erro', `Falha ao atualizar o perfil: ${error.message}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.background}>
        <View style={styles.card}>
          <Text style={styles.title}>Editar Perfil</Text>
          <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
            <Image
              source={{ uri: imageUri }}
              style={styles.profileImage}
            />
            <Text style={styles.changeImageText}>Alterar Imagem</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Nome"
            autoCapitalize="words"
          />
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Nova Senha (opcional)"
            secureTextEntry
          />
          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>Salvar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: {
    flex: 1,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  title: { 
    fontSize: 28, 
    color: '#468585', 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#468585',
  },
  changeImageText: {
    color: '#468585',
    fontSize: 14,
    marginTop: 5,
  },
  input: {
    height: 50,
    borderColor: '#468585',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  button: { 
    backgroundColor: '#468585', 
    padding: 15, 
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: { 
    color: '#FFFFFF', 
    textAlign: 'center', 
    fontSize: 18,
  },
});
