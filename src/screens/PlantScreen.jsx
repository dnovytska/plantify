import React, { useState, useEffect } from "react";
import { SafeAreaView, View, ScrollView, Image, Text, Alert, StyleSheet, TouchableOpacity } from "react-native";
import * as SQLite from "expo-sqlite";
import { useRoute, useNavigation } from '@react-navigation/native'; // Adicionado useNavigation
import BottomBar from '../components/BottomBar';
import { openDatabase, initializeDatabase } from "../DB/db";

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

export default function PlantScreen() {
  const route = useRoute();
  const { plantId } = route.params || {};
  const navigation = useNavigation(); // Adicionado para navegar para a tela de edição
  const [plant, setPlant] = useState(null);
  const [db, setDb] = useState(null);
  const [activeTab, setActiveTab] = useState('Tasks');

  const tasks = [
    { id: 1, name: "Regar a planta", dueDate: "2025-06-05" },
    { id: 2, name: "Adubar", dueDate: "2025-06-10" },
  ];

  const diseases = [
    { id: 1, name: "Míldio", description: "Folhas com manchas brancas." },
    { id: 2, name: "Ferrugem", description: "Pontos laranjas nas folhas." },
  ];

  useEffect(() => {
    const fetchPlantDetails = async () => {
      if (!plantId) {
        console.error("plantId é undefined na PlantScreen!");
        Alert.alert("Erro", "ID da planta não fornecido.");
        return;
      }

      const database = await openDB();
      await initializeDatabase(database);
      setDb(database);

      try {
        console.log("Buscando detalhes da planta com ID:", plantId);
        const plantData = await database.getFirstAsync(
          `SELECT pa.idplant_acc, pa.name, pa.creation_date, pa.description, pa.image, 
                  pt.name AS type_name, wl.name AS watering_name, sl.name AS sunlight_name, 
                  gr.name AS growth_rate_name, cl.name AS care_level_name 
           FROM plants_acc pa 
           JOIN plants p ON pa.plants_idplant = p.idplant 
           JOIN plant_types pt ON p.plant_types_idplant_type = pt.idplant_type
           LEFT JOIN watering_levels wl ON pt.watering_id = wl.id
           LEFT JOIN sunlight_levels sl ON pt.sunlight_id = sl.id
           LEFT JOIN growth_rates gr ON pt.growth_rate_id = gr.id
           LEFT JOIN care_levels cl ON pt.care_level_id = cl.id
           WHERE pa.idplant_acc = ?`,
          [plantId]
        );

        if (!plantData) {
          console.log("Planta não encontrada com ID:", plantId);
          Alert.alert("Erro", "Planta não encontrada.");
          return;
        }

        console.log("Dados da planta encontrados:", plantData);

        setPlant({
          id: plantData.idplants_acc,
          name: plantData.name,
          type: plantData.type_name,
          createdAt: new Date(plantData.creation_date).toLocaleDateString(),
          description: plantData.description || "Sem descrição",
          image: plantData.image || "https://storage.googleapis.com/tagjs-prod.appspot.com/RXQ247PXg9/820zgqtn.png",
          watering: plantData.watering_name,
          sunlight: plantData.sunlight_name,
          growthRate: plantData.growth_rate_name,
          careLevel: plantData.care_level_name,
        });
      } catch (error) {
        console.error("Erro ao buscar detalhes da planta:", error);
        Alert.alert("Erro", "Falha ao carregar os detalhes da planta: " + error.message);
      }
    };

    fetchPlantDetails();
  }, [plantId]);

  if (!plant) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.title}>Carregando...</Text>
      </SafeAreaView>
    );
  }

  const handleEditPress = () => {
    if (!plantId) {
      console.error("plantId undefined ao tentar editar!");
      Alert.alert("Erro", "ID da planta não disponível.");
      return;
    }
    console.log("Navegando para tela de edição com plantId:", plantId);
    // Navegar para a tela de edição (você precisa criar essa tela, ex.: EditPlantScreen)
    navigation.navigate('EditPlantScreen', { plantId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Image
            source={{ uri: plant.image }}
            resizeMode="contain"
            style={styles.image}
          />
          <Text style={styles.title}>{plant.name}</Text>
          <Text style={styles.detail}>Tipo: {plant.type}</Text>
          <Text style={styles.detail}>Data de Criação: {plant.createdAt}</Text>
          <Text style={styles.detail}>Descrição: {plant.description}</Text>
          <Text style={styles.detail}>Rega: {plant.watering}</Text>
          <Text style={styles.detail}>Luz Solar: {plant.sunlight}</Text>
          <Text style={styles.detail}>Taxa de Crescimento: {plant.growthRate}</Text>
          <Text style={styles.detail}>Nível de Cuidado: {plant.careLevel}</Text>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, activeTab === 'Tasks' && styles.activeButton]}
              onPress={() => setActiveTab('Tasks')}
            >
              <Text style={[styles.buttonText, activeTab === 'Tasks' && styles.activeButtonText]}>Tasks</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, activeTab === 'Diseases' && styles.activeButton]}
              onPress={() => setActiveTab('Diseases')}
            >
              <Text style={[styles.buttonText, activeTab === 'Diseases' && styles.activeButtonText]}>Diseases</Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'Tasks' ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tarefas</Text>
              {tasks.length === 0 ? (
                <Text style={styles.noItems}>Nenhuma tarefa encontrada.</Text>
              ) : (
                tasks.map((task) => (
                  <View key={task.id} style={styles.item}>
                    <Text style={styles.itemName}>{task.name}</Text>
                    <Text style={styles.itemDetail}>Data: {task.dueDate}</Text>
                  </View>
                ))
              )}
            </View>
          ) : (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Doenças</Text>
              {diseases.length === 0 ? (
                <Text style={styles.noItems}>Nenhuma doença encontrada.</Text>
              ) : (
                diseases.map((disease) => (
                  <View key={disease.id} style={styles.item}>
                    <Text style={styles.itemName}>{disease.name}</Text>
                    <Text style={styles.itemDetail}>{disease.description}</Text>
                  </View>
                ))
              )}
            </View>
          )}
        </View>
      </ScrollView>
      {/* Botão de edição flutuante no canto inferior direito */}
      <TouchableOpacity
        style={styles.editButton}
        onPress={handleEditPress}
      >
        <Text style={styles.editButtonText}>✏️</Text> {/* Placeholder, substitua por ícone se desejar */}
      </TouchableOpacity>
      <BottomBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#FFFFFF" },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 20, alignItems: 'center' },
  image: { width: 200, height: 200, borderRadius: 10, marginBottom: 20 },
  title: { fontSize: 24, color: "#468585", fontWeight: 'bold', marginBottom: 10 },
  detail: { fontSize: 16, color: "#2F2182", marginBottom: 5 },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
    width: '100%',
  },
  button: {
    flex: 1,
    backgroundColor: '#E9E9F9',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#468585',
  },
  buttonText: {
    color: '#468585',
    fontWeight: 'bold',
  },
  activeButtonText: {
    color: '#FFFFFF',
  },
  section: {
    width: '100%',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#468585',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  item: {
    backgroundColor: '#E9E9F9',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  itemName: {
    fontSize: 16,
    color: '#2F2182',
    fontWeight: 'bold',
  },
  itemDetail: {
    fontSize: 14,
    color: '#468585',
  },
  noItems: {
    fontSize: 16,
    color: '#468585',
    textAlign: 'center',
  },
  // Estilo para o botão de edição flutuante
  editButton: {
    position: 'absolute',
    bottom: 80, // Distância do fundo, ajustada para ficar acima do BottomBar
    right: 20,
    backgroundColor: '#468585',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, // Sombra no Android
    shadowColor: '#000', // Sombra no iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
});