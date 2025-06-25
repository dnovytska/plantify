import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { AuthContext } from '../context/AuthContext';

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
  const { user, loggedIn } = useContext(AuthContext);
  const { imageUri, plantName } = route.params || {};
  const [name, setName] = useState(plantName || '');
  const [description, setDescription] = useState('Planta identificada pela API');

  console.log('Estado de autenticação em AddPlantScreen:', { loggedIn, user });

  const savePlant = async () => {
    if (!name) {
      Alert.alert('Erro', 'O nome da planta é obrigatório.');
      return;
    }
    if (!loggedIn || !user || !user.id_user) {
      console.error('Erro: autenticação inválida:', { loggedIn, user });
      Alert.alert('Erro', 'Utilizador não autenticado. Faça login novamente.');
      navigation.navigate('Login');
      return;
    }
    try {
      const db = await openDatabase();
      
      // Inserir na tabela plant_types
      const plantTypeResult = await db.runAsync(
        'INSERT INTO plant_types (name, watering_id, sunlight_id, growth_rate_id, care_level_id) VALUES (?, ?, ?, ?, ?)',
        [name, 1, 1, 1, 1]
      );
      const plantTypeId = plantTypeResult.lastInsertRowId;
      console.log('Tipo de planta adicionado:', { id: plantTypeId, name });

      // Inserir na tabela plants
      const plantResult = await db.runAsync(
        'INSERT INTO plants (name, image, plant_type_id) VALUES (?, ?, ?)',
        [name, imageUri, plantTypeId]
      );
      const plantId = plantResult.lastInsertRowId;
      console.log('Planta adicionada:', { id: plantId, name, image: imageUri });

      // Inserir na tabela plants_acc
      await db.runAsync(
        'INSERT INTO plants_acc (name, creation_date, description, image, iduser, idplant) VALUES (?, ?, ?, ?, ?, ?)',
        [name, new Date().toISOString(), description, imageUri, user.id_user, plantId]
      );
      console.log('Planta associada ao utilizador:', { name, iduser: user.id_user });

      // Criar tarefa semanal padrão
      await db.runAsync(
        'INSERT INTO tasks (plant_id, name, type, due_date, completed, iduser) VALUES (?, ?, ?, ?, ?, ?)',
        [plantId, 'Regar', 'weekly', new Date().toISOString(), 0, user.id_user]
      );
      console.log('Tarefa semanal criada:', { plantId, name: 'Regar', type: 'weekly' });

      Alert.alert('Sucesso', 'Planta e tarefa adicionadas com sucesso!');
      navigation.navigate('YourPlants');
    } catch (error) {
      console.error('Erro ao adicionar planta:', error);
      Alert.alert('Erro', 'Não foi possível adicionar a planta.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Adicionar Nova Planta</Text>
      <View style={styles.imageContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <Text style={styles.addImageText}>Nenhuma imagem disponível</Text>
        )}
      </View>
      <TextInput
        style={styles.input}
        placeholder="Nome da planta"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Descrição (opcional)"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TouchableOpacity style={styles.saveButton} onPress={savePlant}>
        <Text style={styles.saveButtonText}>Salvar Planta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, color: '#468585', marginBottom: 20, textAlign: 'center' },
  imageContainer: { marginBottom: 20, width: 200, height: 200, borderRadius: 100, borderWidth: 2, borderColor: '#468585', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0', alignSelf: 'center' },
  image: { width: 196, height: 196, borderRadius: 98 },
  addImageText: { color: '#468585', fontSize: 16, textAlign: 'center' },
  input: { height: 50, borderColor: '#cccccc', borderWidth: 1, paddingHorizontal: 15, borderRadius: 10, marginBottom: 15 },
  saveButton: { backgroundColor: '#4CAF50', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 20, alignSelf: 'center' },
  saveButtonText: { color: '#fff', fontSize: 16 },
});