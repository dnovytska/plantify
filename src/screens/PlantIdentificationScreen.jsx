import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image, ScrollView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import BottomBar from '../components/BottomBar';
import { PLANTNET_API_KEY } from '@env'; // Importa a chave do .env

export default function PlantIdentificationScreen() {
  const { user } = useContext(AuthContext);
  const [imageUri, setImageUri] = useState(null);
  const [identificationResult, setIdentificationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    (async () => {
      console.log('Verificando permissões no Expo Go...');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('Status da permissão:', status);

      if (status === 'granted') {
        setHasPermission(true);
        console.log('Permissões confirmadas como concedidas.');
      } else {
        Alert.alert(
          'Erro Inesperado',
          'Permissões não estão como esperado. Reinstala o Expo Go ou verifica as configurações.',
          [{ text: 'OK', onPress: () => setHasPermission(false) }]
        );
        setHasPermission(false);
      }
    })();
  }, []);

  const pickImage = async () => {
    if (!hasPermission) {
      Alert.alert('Erro', 'Permissões não estão disponíveis. Reinstala o app.');
      return;
    }

    try {
      console.log('Tentando abrir galeria no Expo Go...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      console.log('Resultado completo da seleção:', JSON.stringify(result, null, 2));

      if (result.canceled) {
        console.log('Seleção cancelada pelo usuário ou falha silenciosa.');
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri; // Acessa assets corretamente
        setImageUri(uri);
        console.log('Imagem selecionada com sucesso, URI:', uri);
      } else {
        console.log('Nenhum asset retornado, resultado:', result);
        Alert.alert('Erro', 'A galeria não retornou uma imagem. Verifica se há fotos disponíveis ou reinstala o Expo Go.');
      }
    } catch (error) {
      console.error('Erro detalhado ao selecionar imagem:', error);
      Alert.alert('Erro', 'Falha ao acessar a galeria. Verifica os logs ou reinstala o Expo Go.');
    }
  };

  const identifyPlant = async () => {
    if (!imageUri) {
      Alert.alert('Erro', 'Por favor, selecione uma imagem primeiro.');
      return;
    }

    if (!PLANTNET_API_KEY) {
      Alert.alert('Erro', 'Chave API do Pl@ntNet não configurada. Verifica o arquivo .env.');
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

      const response = await axios.post(
        'https://my-api.plantnet.org/v2/identify/all',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Api-Key': PLANTNET_API_KEY,
          },
        }
      );

      const results = response.data.results;
      if (results && results.length > 0) {
        setIdentificationResult(results[0].species.scientificNameWithoutAuthor);
      } else {
        setIdentificationResult('Nenhuma planta identificada.');
      }
    } catch (error) {
      console.error('Erro ao identificar planta:', error);
      if (error.response && error.response.status === 401) {
        Alert.alert('Erro', 'Chave API inválida ou expirada. Verifica a chave no .env.');
      } else {
        Alert.alert('Erro', 'Não foi possível identificar a planta. Verifica a conexão ou a imagem.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Identificar Planta</Text>

        <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <Text style={styles.addImageText}>Selecionar Imagem</Text>
          )}
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.identifyButton}
          onPress={identifyPlant}
          disabled={isLoading}
        >
          <Text style={styles.identifyButtonText}>
            {isLoading ? 'Identificando...' : 'Identificar Planta'}
          </Text>
        </TouchableOpacity>

        {identificationResult && (
          <Text style={styles.resultText}>Planta: {identificationResult}</Text>
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
  imageContainer: {
    marginBottom: 20,
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#468585',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  image: { width: 196, height: 196, borderRadius: 98 },
  addImageText: { color: '#468585', fontSize: 16 },
  addIcon: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#468585',
    color: '#fff',
    width: 30,
    height: 30,
    textAlign: 'center',
    borderRadius: 15,
    fontSize: 20,
  },
  identifyButton: {
    backgroundColor: '#B0A8F0',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 20,
    marginBottom: 20,
  },
  identifyButtonText: { color: '#fff', fontSize: 16 },
  resultText: { fontSize: 18, color: '#333', textAlign: 'center', marginTop: 20 },
});