import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { openDatabase } from '../DB/db';
import BottomBar from '../components/BottomBar';

export default function YourPlantsScreen({ navigation, route }) {
  const { user, loggedIn, isLoading } = useContext(AuthContext);
  const [plants, setPlants] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  console.log('YourPlantsScreen - Estado inicial:', { user, loggedIn, isLoading });

  useEffect(() => {
    const initialize = async () => {
      if (isLoading) {
        console.log('Aguardando AuthContext carregar...');
        return;
      }

      if (!user || !user.iduser) {
        console.warn('Usuário não logado ou iduser ausente:', { user, loggedIn });
        Alert.alert('Erro', 'Você precisa estar logado para visualizar suas plantas. Faça login primeiro.');
        navigation.navigate('Login');
        return;
      }

      try {
        console.log('Carregando plantas para o usuário:', user.iduser);
        const db = await openDatabase();
        const plantsData = await db.getAllAsync(
          `SELECT pa.idplants_acc, pa.name, pa.image, pa.creation_date, pa.description, pt.name AS plant_type_name
           FROM plants_acc pa
           LEFT JOIN plants p ON pa.idplant = p.idplant
           LEFT JOIN plant_types pt ON p.plant_type_id = pt.idplant_type
           WHERE pa.iduser = ?`,
          [user.iduser]
        );
        console.log('Plantas carregadas:', plantsData);
        setPlants(plantsData);
        setIsDataLoaded(true);
      } catch (error) {
        console.error('Erro ao carregar plantas:', error);
        Alert.alert('Erro', `Falha ao carregar suas plantas: ${error.message}`);
      }
    };
    initialize();
  }, [user, isLoading, navigation]); // Removido loggedIn da dependência pra evitar re-renderizações

  const renderPlantItem = ({ item }) => (
    <TouchableOpacity
      style={styles.plantItem}
      onPress={() => navigation.navigate('Plant', { plantId: item.idplants_acc })}
    >
      <View style={styles.plantImageContainer}>
        {item.image && item.image.startsWith('data:image') ? (
          <Image source={{ uri: item.image }} style={styles.plantImage} />
        ) : (
          <Text style={styles.noImageText}>Sem Imagem</Text>
        )}
      </View>
      <View style={styles.plantInfo}>
        <Text style={styles.plantName}>{item.name}</Text>
        <Text style={styles.plantType}>Tipo: {item.plant_type_name || 'Desconhecido'}</Text>
        
      </View>
    </TouchableOpacity>
  );

  if (!isDataLoaded || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando suas plantas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Suas Plantas</Text>
      {plants.length === 0 ? (
        <Text style={styles.emptyText}>Nenhuma planta encontrada. Adicione uma planta!</Text>
      ) : (
        <FlatList
          data={plants}
          renderItem={renderPlantItem}
          keyExtractor={item => item.idplants_acc.toString()}
          contentContainerStyle={[styles.listContainer, { paddingBottom: 80 }]}
        />
      )}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddPlant')}
      >
        <Text style={styles.addButtonText}>Adicionar Nova Planta</Text>
      </TouchableOpacity>
      <BottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 18, color: '#468585' },
  title: { fontSize: 24, color: '#468585', fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  emptyText: { fontSize: 16, color: '#468585', textAlign: 'center', marginTop: 20 },
  listContainer: { paddingBottom: 20 },
  plantItem: {
    flexDirection: 'row',
    backgroundColor: '#E9E9F9',
    padding: 15,
    borderRadius: 30,
    marginBottom: 10,
    borderColor: '#468585',
    alignItems: 'center',
  },
  plantImageContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#2F2182',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2F2182',
    marginRight: 15,
  },
  plantImage: { width: 75, height: 75, borderRadius: 50 },
  noImageText: { color: '#468585', fontSize: 12 },
  addIcon: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#468585',
    color: '#fff',
    width: 16,
    height: 16,
    textAlign: 'center',
    borderRadius: 8,
    fontSize: 10,
  },
  plantInfo: { flex: 1 },
  plantName: { fontSize: 18, color: '#2F2182', fontWeight: 'bold' },
  plantType: { fontSize: 14, color: '#333', marginBottom: 5 },
  plantDescription: { fontSize: 12, color: '#666' },
  addButton: {
    backgroundColor: '#B0A8F0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#468585',
  },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});