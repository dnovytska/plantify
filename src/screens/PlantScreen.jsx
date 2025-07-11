import React, { useState, useEffect, useCallback } from "react";
import { SafeAreaView, View, ScrollView, Image, Text, Alert, StyleSheet, TouchableOpacity } from "react-native";
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
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
  const navigation = useNavigation();
  const [plant, setPlant] = useState(null);
  const [db, setDb] = useState(null);
  const [activeTab, setActiveTab] = useState('Tasks');
  const [tasks, setTasks] = useState([]);
  const [diseases, setDiseases] = useState([]);

  const fetchPlantDetails = useCallback(async () => {
    if (!plantId) {
      console.error("plantId é undefined na PlantScreen!");
      Alert.alert("Erro", "ID da planta não fornecido.");
      return;
    }

    const database = await openDB();
    await initializeDatabase(database);
    setDb(database);

    try {
      // Fetch plant details
      console.log("Buscando detalhes da planta com ID:", plantId);
      const plantData = await database.getFirstAsync(
        `SELECT pa.idplants_acc, pa.name, pa.creation_date, pa.description, pa.image, 
                pt.name AS type_name, wl.name AS watering_name, sl.name AS sunlight_name, 
                gr.name AS growth_rate_name, cl.name AS care_level_name 
         FROM plants_acc pa 
         JOIN plants p ON pa.idplant = p.idplant 
         JOIN plant_types pt ON p.plant_type_id = pt.idplant_type
         LEFT JOIN watering_levels wl ON pt.watering_id = wl.idwatering_level
         LEFT JOIN sunlight_levels sl ON pt.sunlight_id = sl.idsunlight_level
         LEFT JOIN growth_rates gr ON pt.growth_rate_id = gr.idgrowth_rate
         LEFT JOIN care_levels cl ON pt.care_level_id = cl.idcare_level
         WHERE pa.idplants_acc = ?`,
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
        type: plantData.type_name || "Unknown",
        createdAt: new Date(plantData.creation_date).toLocaleDateString(),
        description: plantData.description || "Sem descrição",
        image: plantData.image || "https://storage.googleapis.com/tagjs-prod.appspot.com/RXQ247PXg9/820zgqtn.png",
        watering: plantData.watering_name || "Unknown",
        sunlight: plantData.sunlight_name || "Unknown",
        growthRate: plantData.growth_rate_name || "Unknown",
        careLevel: plantData.care_level_name || "Unknown",
      });

      // Fetch tasks from notifications table
      const taskData = await database.getAllAsync(
        `SELECT n.idnotification AS id, n.message AS name, n.due_date, n.is_read,
                nt.notification_type
         FROM notifications n
         LEFT JOIN notification_types nt ON n.id_notification_type = nt.idnotification_type
         WHERE n.idplants_acc = ?`,
        [plantId]
      );

      console.log("Tarefas encontradas:", taskData);

      setTasks(taskData.map((task) => ({
        id: task.id,
        name: task.name,
        dueDate: task.due_date ? new Date(task.due_date).toLocaleString() : "N/A",
        notificationType: task.notification_type || "Unknown",
        isRead: task.is_read,
      })));

      // Fetch diseases from diseases_plants_acc and diseases tables
      const diseaseData = await database.getAllAsync(
        `SELECT d.id, d.name, d.description
         FROM diseases_plants_acc dpa
         JOIN diseases d ON dpa.disease_id = d.id
         WHERE dpa.plants_acc_id = ?`,
        [plantId]
      );

      console.log("Doenças encontradas:", diseaseData);

      setDiseases(diseaseData.map((disease) => ({
        id: disease.id,
        name: disease.name,
        description: disease.description || "Sem descrição",
      })));

    } catch (error) {
      console.error("Erro ao buscar detalhes da planta:", error);
      Alert.alert("Erro", "Falha ao carregar os detalhes da planta: " + error.message);
    }
  }, [plantId]);

  useEffect(() => {
    fetchPlantDetails();
  }, [fetchPlantDetails]);

  useFocusEffect(
    useCallback(() => {
      fetchPlantDetails();
    }, [fetchPlantDetails])
  );

  const handleDeleteTask = async (taskId) => {
    if (!db) {
      Alert.alert('Erro', 'Banco de dados não inicializado.');
      return;
    }

    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja apagar esta tarefa?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: async () => {
            try {
              await db.runAsync('DELETE FROM notifications WHERE idnotification = ?', [taskId]);
              Alert.alert('Sucesso', 'Tarefa apagada com sucesso!');
              await fetchPlantDetails(); // Atualiza a lista de tarefas
            } catch (error) {
              console.error('Erro ao apagar tarefa:', error);
              Alert.alert('Erro', `Falha ao apagar a tarefa: ${error.message}`);
            }
          },
        },
      ]
    );
  };

  const handleEditPress = () => {
    if (!plantId) {
      console.error("plantId undefined ao tentar editar!");
      Alert.alert("Erro", "ID da planta não disponível.");
      return;
    }
    console.log("Navegando para tela de edição com plantId:", plantId);
    navigation.navigate('EditPlantScreen', { plantId });
  };

  const handleTaskPress = (task) => {
    navigation.navigate('Task', { taskId: task.id, plantId });
  };

  const handleAddDiseasePress = () => {
    navigation.navigate('CreateDiseaseScreen', { plantId }); // Navega para a tela de criação de doenças
  };

  const handleDiseasePress = (disease) => {
    navigation.navigate('DiseaseScreen', { diseaseId: disease.id, plantId }); // Navega para a tela de detalhes da doença
  };

  if (!plant) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Carregando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
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

          {diseases.length > 0 && (
            <Text style={styles.diseaseAlert}>⚠️ Esta planta está doente!</Text>
          )}

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, activeTab === 'Tasks' && styles.activeButton]}
              onPress={() => setActiveTab('Tasks')}
            >
              <Text style={[styles.buttonText, activeTab === 'Tasks' && styles.activeButtonText]}>Tarefas</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, activeTab === 'Diseases' && styles.activeButton]}
              onPress={() => setActiveTab('Diseases')}
            >
              <Text style={[styles.buttonText, activeTab === 'Diseases' && styles.activeButtonText]}>Doenças</Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'Tasks' && (
            <TouchableOpacity
              style={styles.addTaskButton}
              onPress={() => navigation.navigate('CreateTask', { plantId })}
            >
              <Text style={styles.addTaskButtonText}>Adicionar Tarefa</Text>
            </TouchableOpacity>
          )}

          {activeTab === 'Diseases' && (
            <TouchableOpacity
              style={styles.addDiseaseButton}
              onPress={handleAddDiseasePress}
            >
              <Text style={styles.addDiseaseButtonText}>Adicionar Doença</Text>
            </TouchableOpacity>
          )}

          {activeTab === 'Tasks' ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tarefas</Text>
              {tasks.length === 0 ? (
                <Text style={styles.noItems}>Nenhuma tarefa encontrada.</Text>
              ) : (
                tasks.map((task) => (
                  <TouchableOpacity
                    key={task.id}
                    style={styles.item}
                    onPress={() => handleTaskPress(task)}
                  >
                    <View style={styles.taskContent}>
                      <Text style={styles.itemName}>{task.name}</Text>
                      <Text style={styles.itemDetail}>Data: {task.dueDate}</Text>
                      <Text style={styles.itemDetail}>Tipo: {task.notificationType}</Text>
                      <Text style={styles.itemDetail}>Status: {task.isRead ? 'Concluída' : 'Pendente'}</Text>
                    </View>
                  </TouchableOpacity>
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
                  <TouchableOpacity
                    key={disease.id}
                    style={styles.item}
                    onPress={() => handleDiseasePress(disease)}
                  >
                    <Text style={styles.itemName}>{disease.name}</Text>
                    <Text style={styles.itemDetail}>{disease.description}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
        </View>
      </ScrollView>
      <TouchableOpacity
        style={styles.editButton}
        onPress={handleEditPress}
      >
        <Text style={styles.editButtonText}>✏️</Text>
      </TouchableOpacity>
      <BottomBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
    alignItems: "center",
  },
  content: {
    paddingHorizontal: 20,
    width: "100%",
    alignItems: "center",
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: "#468585",
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detail: {
    fontSize: 16,
    color: "#2F2182",
    marginBottom: 5,
  },
  diseaseAlert: {
    fontSize: 18,
    color: "#FF0000",
    marginBottom: 10,
  },
  addTaskButton: {
    backgroundColor: "#468585",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 20,
    width: "100%",
    alignItems: "center",
  },
  addTaskButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  addDiseaseButton: {
    backgroundColor: "#FFA500",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 20,
    width: "100%",
    alignItems: "center",
  },
  addDiseaseButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  section: {
    width: "100%",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    color: "#468585",
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  item: {
    backgroundColor: "#E9E9F9",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: "#2F2182",
    fontWeight: "bold",
  },
  itemDetail: {
    fontSize: 14,
    color: "#468585",
  },
  noItems: {
    fontSize: 16,
    color: "#468585",
    textAlign: "center",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  button: {
    flex: 1,
    padding: 10,
    backgroundColor: "#E0E0E0",
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: "center",
  },
  activeButton: {
    backgroundColor: "#468585",
  },
  buttonText: {
    color: "#2F2182",
  },
  activeButtonText: {
    color: "#FFFFFF",
  },
  editButton: {
    position: "absolute",
    bottom: 80,
    right: 20,
    backgroundColor: "#468585",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 1,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  completeButton: {
    backgroundColor: "#468585",
    padding: 5,
    borderRadius: 5,
  },
  completeButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
  },
});