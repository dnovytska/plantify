import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import BottomBar from '../components/BottomBar';
import { PLANTNET_API_KEY } from '@env';

export default function PlantIdentificationScreen() {
  const { user } = useContext(AuthContext);
  const [imageUri, setImageUri] = useState(null);
  const [identificationResult, setIdentificationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGalleryPermission, setHasGalleryPermission] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);

  useEffect(() => {
    (async () => {
      const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasGalleryPermission(galleryStatus.status === 'granted');
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'granted');

      if (!galleryStatus.granted || !cameraStatus.granted) {
        Alert.alert('Permissões Necessárias', 'Conceda permissões para galeria e câmera nas configurações.');
      }
    })();
  }, []);

  const pickImage = async () => {
    if (!hasGalleryPermission) {
      Alert.alert('Erro', 'Permissão para galeria não concedida.');
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (result.canceled) return;
      if (result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      } else {
        Alert.alert('Erro', 'Nenhuma imagem válida selecionada.');
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Falha ao acessar a galeria.');
    }
  };

  const takePhoto = async () => {
    if (!hasCameraPermission) {
      Alert.alert('Erro', 'Permissão para câmera não concedida.');
      return;
    }
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (result.canceled) return;
      if (result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      } else {
        Alert.alert('Erro', 'Nenhuma foto válida capturada.');
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      Alert.alert('Erro', `Falha ao usar a câmera: ${error.message}`);
    }
  };

  const identifyPlant = async () => {
    if (!imageUri) {
      Alert.alert('Erro', 'Selecione ou tire uma foto primeiro.');
      return;
    }
    if (!PLANTNET_API_KEY) {
      Alert.alert('Erro', 'Chave API do Pl@ntNet não configurada.');
      return;
    }
    setIsLoading(true);
    try {
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

      const results = resp.data.results;
      if (results && results.length > 0) {
        setIdentificationResult(results[0].species.scientificNameWithoutAuthor);
      } else {
        setIdentificationResult('Nenhuma planta identificada.');
      }
    } catch (error) {
      console.error('Erro ao identificar planta:', error);
      Alert.alert('Erro', error.response?.status === 401 ? 'Chave API inválida ou expirada.' : 'Não foi possível identificar a planta.');
    } finally {
      setIsLoading(false);
    }
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
        {identificationResult && <Text style={styles.resultText}>Planta: {identificationResult}</Text>}
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
  resultText: { fontSize: 18, color: '#333', textAlign: 'center', marginTop: 20 },
});
