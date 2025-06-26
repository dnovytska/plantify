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
import * as Notifications from 'expo-notifications';

// Inicializar a base de dados de forma assíncrona
const openDatabase = async () => {
  try {
    const db = await SQLite.openDatabaseAsync('plantifydb.db');
    console.log('Base de dados inicializada com sucesso');
    return db;
  } catch (error) {
    console.error('Erro ao inicializar a base de dados:', error);
    throw error;
  }
};

export default function AddPlantScreen({ navigation, route }) {
  const { user } = useContext(AuthContext);
  const { plantId } = route.params || {};
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [plantType, setPlantType] = useState('');
  const [imageUri, setImageUri] = useState('https://storage.googleapis.com/tagjs-prod.appspot.com/RXQ247PXg9/820zgqtn.png');

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permissão necessária', 'Permita o acesso à galeria para escolher uma imagem.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['image'],
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name) {
      Alert.alert('Erro', 'O nome da planta é obrigatório.');
      return;
    }
    if (!user || !user.iduser) {
      console.error('Erro: autenticação inválida:', { user });
      Alert.alert('Erro', 'Utilizador não autenticado. Faça login novamente.');
      navigation.navigate('Login');
      return;
    }
    if (!plantId) {
      console.error('Erro: plantId não fornecido:', { plantId });
      Alert.alert('Erro', 'ID da planta não fornecido.');
      return;
    }

    try {
      const db = await openDatabase();

      // Verificar se a planta existe em plants
      const plantExists = await db.getFirstAsync(
        'SELECT idplant FROM plants WHERE idplant = ?',
        [plantId]
      );
      if (!plantExists) {
        console.error('Planta não encontrada:', { plantId });
        Alert.alert('Erro', 'Planta não encontrada na base de dados.');
        return;
      }

      // Inserir em plants_acc
      const plantAccResult = await db.runAsync(
        'INSERT INTO plants_acc (name, creation_date, description, image, iduser, idplant) VALUES (?, ?, ?, ?, ?, ?)',
        [name, new Date().toISOString(), description || 'Planta associada pelo utilizador', imageUri, user.iduser, plantId]
      );
      const plantAccId = plantAccResult.lastInsertRowId;
      console.log('Planta associada ao utilizador:', { name, iduser: user.iduser, idplants_acc: plantAccId, idplant: plantId });

      // Criar tarefa padrão "Regar"
      const notificationTypeResult = await db.getFirstAsync(
        'SELECT idnotification_type FROM notification_types WHERE notification_type = ?',
        ['Regar']
      );
      const notificationTypeId = notificationTypeResult ? notificationTypeResult.idnotification_type : 1;

      const dueDate = new Date();
      const notificationResult = await db.runAsync(
        'INSERT INTO notifications (message, due_date, is_read, id_notification_type, idplants_acc) VALUES (?, ?, ?, ?, ?)',
        ['Regar', dueDate.toISOString(), 0, notificationTypeId, plantAccId]
      );
      const notificationId = notificationResult.lastInsertRowId;
      console.log('Tarefa semanal criada:', { id: notificationId, message: 'Regar', due_date: dueDate.toISOString() });

      // Agendar notificação
      const notificationIdentifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Tarefa: Regar',
          body: `Hora de regar a planta ${name}!`,
        },
        trigger: { date: dueDate },
      });
      console.log('Notificação agendada:', { identifier: notificationIdentifier });

      Alert.alert('Sucesso', 'Planta associada com sucesso.');
      navigation.navigate('YourPlants');
    } catch (error) {
      console.error('Erro ao associar planta:', error);
      Alert.alert('Erro', 'Não foi possível associar a planta.');
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
        placeholder="Nome da planta"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Descrição"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <TextInput
        style={styles.input}
        placeholder="Tipo de planta"
        value={plantType}
        onChangeText={setPlantType}
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