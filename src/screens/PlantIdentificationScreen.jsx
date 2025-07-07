import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import BottomBar from '../components/BottomBar';
import { PLANTNET_API_KEY } from '@env';
import { openDatabase } from '../DB/db';

export default function PlantIdentificationScreen({ navigation }) {
  const context = useContext(AuthContext);
  const [imageUri, setImageUri] = useState(null);
  const [identificationResult, setIdentificationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGalleryPermission, setHasGalleryPermission] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [plantTypeId, setPlantTypeId] = useState(null);

  if (!context) {
    console.error('AuthContext não está disponível no PlantIdentificationScreen');
    return (
      <View style={styles.container}>
        <Text>Erro: Contexto de autenticação não disponível.</Text>
      </View>
    );
  }

  const { user, loggedIn, logout } = context;

  console.log('PlantIdentificationScreen - Estado do contexto:', { user, loggedIn });

  useEffect(() => {
    (async () => {
      console.log('Inicializando permissões...');
      const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasGalleryPermission(galleryStatus.status === 'granted');
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'granted');
      console.log('Permissões iniciais:', { gallery: galleryStatus.status, camera: cameraStatus.status });

      if (!galleryStatus.granted || !cameraStatus.granted) {
        Alert.alert('Permissões Necessárias', 'Conceda permissões para galeria e câmera nas configurações do dispositivo.');
      }
    })();
  }, []);

  const checkLogin = async () => {
    console.log('Verificando login, user:', user, 'loggedIn:', loggedIn);
    if (!user || !user.iduser) {
      console.warn('utilizador não logado ou iduser ausente:', { user, loggedIn });
      Alert.alert('Erro', 'Você precisa estar logado para realizar esta ação. Faça login primeiro.');
      try {
        await logout();
        console.log('Logout chamado para redirecionar para Login');
      } catch (error) {
        console.error('Erro ao fazer logout:', error);
        Alert.alert('Erro', 'Falha ao redirecionar para login.');
      }
      return false;
    }
    console.log('utilizador logado, prosseguindo:', { iduser: user.iduser, name: user.name });
    return true;
  };

  const pickImage = async () => {
    if (!(await checkLogin())) return;
    if (!hasGalleryPermission) {
      console.log('Permissão de galeria não concedida, solicitando novamente...');
      const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (galleryStatus.status !== 'granted') {
        Alert.alert('Erro', 'Permissão para galeria não concedida. Vá para as configurações do dispositivo.');
        return;
      }
      setHasGalleryPermission(true);
    }
    try {
      console.log('Abrindo galeria...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      console.log('Resultado da galeria:', result);
      if (result.canceled) {
        console.log('Seleção de imagem cancelada');
        return;
      }
      if (result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
        console.log('Imagem selecionada:', result.assets[0].uri);
      } else {
        Alert.alert('Erro', 'Nenhuma imagem válida selecionada.');
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Falha ao acessar a galeria: ' + error.message);
    }
  };

  const takePhoto = async () => {
    if (!(await checkLogin())) return;
    console.log('Iniciando takePhoto, verificando permissão da câmera...');
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    console.log('Status da permissão da câmera:', status);
    if (status !== 'granted') {
      Alert.alert(
        'Permissão Negada',
        'Permissão para câmera não concedida. Vá para as configurações do dispositivo para permitir.',
        [
          { text: 'OK' },
          {
            text: 'Escolher da Galeria',
            onPress: pickImage,
          },
        ]
      );
      setHasCameraPermission(false);
      return;
    }
    setHasCameraPermission(true);
    try {
      console.log('Abrindo câmera...');
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      console.log('Resultado da câmera:', result);
      if (result.canceled) {
        console.log('Captura de foto cancelada');
        return;
      }
      if (result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        console.log('Foto tirada:', uri);
      } else {
        Alert.alert('Erro', 'Nenhuma foto válida capturada.');
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      Alert.alert('Erro', `Falha ao usar a câmera: ${error.message}`);
    }
  };

  const identifyPlant = async () => {
    if (!(await checkLogin())) return;
    if (!imageUri) {
      console.log('Nenhuma imagem selecionada para identificação');
      Alert.alert('Erro', 'Selecione ou tire uma foto primeiro.');
      return;
    }
    if (!PLANTNET_API_KEY) {
      console.log('Chave API do Pl@ntNet não configurada');
      Alert.alert('Erro', 'Chave API do Pl@ntNet não configurada.');
      return;
    }
    setIsLoading(true);
    try {
      console.log('Enviando imagem para Pl@ntNet:', imageUri);
      const formData = new FormData();
      formData.append('images', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'plant.jpg',
      });
      formData.append('organs', 'auto');

      const resp = await axios.post(
        `https://my-api.plantnet.org/v2/identify/all?include-related-images=false&no-reject=false&nb-results=10&lang=en&api-key=${PLANTNET_API_KEY}`,
        formData,
        { headers: { Accept: 'application/json', 'Content-Type': 'multipart/form-data' } }
      );
      console.log('Resposta da API Pl@ntNet:', resp.data);

      const results = resp.data.results;
      if (results && results.length > 0) {
        const scientificName = results[0].species.scientificNameWithoutAuthor;
        setIdentificationResult(scientificName);
        console.log('Planta identificada:', scientificName);

        // Criar ou buscar tipo de planta
        const db = await openDatabase();
        let plantType = await db.getFirstAsync(
          'SELECT idplant_type FROM plant_types WHERE name = ?',
          [scientificName]
        );

        let plantTypeId = null;
        if (!plantType) {
          console.log('Criando novo tipo de planta:', scientificName);
          const result = await db.runAsync(
            'INSERT INTO plant_types (name, watering_id, sunlight_id, growth_rate_id, care_level_id) VALUES (?, ?, ?, ?, ?)',
            [scientificName, 1, 1, 1, 1]
          );
          plantTypeId = result.lastInsertRowId;
          console.log('Novo tipo de planta criado:', { id: plantTypeId, name: scientificName });
        } else {
          plantTypeId = plantType.idplant_type;
          console.log('Tipo de planta encontrado:', { id: plantTypeId, name: scientificName });
        }

        setPlantTypeId(plantTypeId);
      } else {
        setIdentificationResult('Nenhuma planta identificada.');
        console.log('Nenhuma planta identificada pela API');
      }
    } catch (error) {
      console.error('Erro ao identificar planta:', error);
      Alert.alert('Erro', error.response?.status === 401 ? 'Chave API inválida ou expirada.' : 'Não foi possível identificar a planta.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPlant = () => {
    if (!identificationResult || !imageUri || !plantTypeId) {
      Alert.alert('Erro', 'Identificação incompleta. Tente novamente.');
      return;
    }
    navigation.navigate('AddPlant', {
      imageUri,
      plantName: identificationResult,
      plantTypeId,
    });
    console.log('Navegando para AddPlant com:', { imageUri, plantName: identificationResult, plantTypeId });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Identificar Planta</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
            <Text style={styles.actionButtonText}>Tirar Foto</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
            <Text style={styles.actionButtonText}>Escolher da Galeria</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.imageContainer}>
          {imageUri ? <Image source={{ uri: imageUri }} style={styles.image} /> : <Text style={styles.addImageText}>Nenhuma imagem selecionada</Text>}
        </View>
        <TouchableOpacity style={styles.identifyButton} onPress={identifyPlant} disabled={isLoading}>
          <Text style={styles.identifyButtonText}>{isLoading ? 'Identificando...' : 'Identificar Planta'}</Text>
        </TouchableOpacity>
        {identificationResult && (
          <View>
            <Text style={styles.resultText}>Planta: {identificationResult}</Text>
            <TouchableOpacity style={styles.addPlantButton} onPress={handleAddPlant}>
              <Text style={styles.addPlantButtonText}>Adicionar Planta</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      <BottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { padding: 20, alignItems: 'center' },
  title: { fontSize: 24, color: '#468585', marginBottom: 20 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 20 },
  actionButton: { backgroundColor: '#468585', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 10, flex: 1, marginHorizontal: 5 },
  actionButtonText: { color: '#fff', fontSize: 14, textAlign: 'center' },
  imageContainer: { marginBottom: 20, width: 200, height: 200, borderRadius: 100, borderWidth: 2, borderColor: '#468585', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' },
  image: { width: 196, height: 196, borderRadius: 98 },
  addImageText: { color: '#468585', fontSize: 16, textAlign: 'center' },
  identifyButton: { backgroundColor: '#B0A8F0', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 20, marginBottom: 20 },
  identifyButtonText: { color: '#fff', fontSize: 16 },
  resultText: { fontSize: 18, color: '#333', textAlign: 'center', marginTop: 20, marginBottom: 15 },
  addPlantButton: { backgroundColor: '#468585', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 20, marginTop: 10 },
  addPlantButtonText: { color: '#fff', fontSize: 16, textAlign: 'center' },
});