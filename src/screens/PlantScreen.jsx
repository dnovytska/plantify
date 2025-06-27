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
  const [activeTaskView, setActiveTaskView] = useState('Pending');
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

      const taskData = await database.getAllAsync(
        `SELECT n.idnotification AS id, n.message AS name, n.due_date, n.is_read,
                nt.notification_type
         FROM notifications n
         LEFT JOIN notification_types nt ON n.id_notification_type = nt.idnotification_type
         WHERE n.idplants_acc = ?`,
        [plantId]
      );

      const organizedTasks = taskData.map((task) => ({
        id: task.id,
        name: task.name,
        dueDate: task.due_date ? new Date(task.due_date) : null,
        notificationType: task.notification_type || "Unknown",
        isRead: task.is_read,
      }));

      organizedTasks.sort((a, b) => (a.dueDate - b.dueDate));

      setTasks(organizedTasks);

      const diseaseData = await database.getAllAsync(
        `SELECT d.id, d.name, d.description
         FROM diseases_plants_acc dpa
         JOIN diseases d ON dpa.disease_id = d.id
         WHERE dpa.plants_acc_id = ?`,
        [plantId]
      );

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

  const handleTaskPress = (task) => {
    if (!plantId || !task.id) {
      console.error("plantId ou taskId inválidos:", { plantId, taskId: task.id });
      Alert.alert("Erro", "ID da planta ou tarefa não disponível.");
      return;
    }
    console.log("Navegando para Task com plantId:", plantId, "e taskId:", task.id);
    navigation.navigate('Task', { plantId, taskId: task.id });
  };

  const handleEditPress = () => {
    if (!plantId) {
      console.error("plantId undefined ao tentar editar!");
      Alert.alert("Erro", "ID da planta não disponível.");
      return;
    }
    navigation.navigate('EditPlantScreen', { plantId });
  };

  const handleDeleteDisease = async (diseaseId) => {
    if (!db) {
      Alert.alert('Erro', 'Banco de dados não inicializado.');
      return;
    }

    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja apagar esta doença?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: async () => {
            try {
              await db.runAsync('DELETE FROM diseases_plants_acc WHERE disease_id = ? AND plants_acc_id = ?', [diseaseId, plantId]);
              Alert.alert('Sucesso', 'Doença apagada com sucesso!');
              await fetchPlantDetails(); // Atualiza a lista de doenças
            } catch (error) {
              console.error('Erro ao apagar doença:', error);
              Alert.alert('Erro', `Falha ao apagar a doença: ${error.message}`);
            }
          },
        },
      ]
    );
  };

  const handleAddTaskPress = () => {
    if (!plantId) {
      console.error("plantId undefined ao tentar adicionar tarefa!");
      Alert.alert("Erro", "ID da planta não disponível.");
      return;
    }
    console.log("Navegando para CreateTaskScreen com plantId:", plantId);
    navigation.navigate('CreateTask', { plantId });
  };

  const handleAddDiseasePress = () => {
    if (!plantId) {
      console.error("plantId undefined ao tentar adicionar doença!");
      Alert.alert("Erro", "ID da planta não disponível.");
      return;
    }
    console.log("Navegando para CreateDiseaseScreen com plantId:", plantId);
    navigation.navigate('CreateDiseaseScreen', { plantId });
  };

  const handleMarkHealthy = async (diseaseId) => {
    if (!db) {
      Alert.alert('Erro', 'Banco de dados não inicializado.');
      return;
    }

    Alert.alert(
      'Confirmar',
      'Tem certeza que deseja marcar esta doença como tratada?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Marcar como Tratada',
          onPress: async () => {
            try {
              await db.runAsync('UPDATE diseases_plants_acc SET is_treated = 1 WHERE disease_id = ? AND plants_acc_id = ?', [diseaseId, plantId]);
              Alert.alert('Sucesso', 'Doença marcada como tratada!');
              await fetchPlantDetails(); // Atualiza a lista de doenças
            } catch (error) {
              console.error('Erro ao marcar doença como tratada:', error);
              Alert.alert('Erro', `Falha ao atualizar o estado: ${error.message}`);
            }
          },
        },
      ]
    );
  };

  if (!plant) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Carregando...</Text>
      </SafeAreaView>
    );
  }

  const completedTasks = tasks.filter(task => task.isRead);
  const pendingTasks = tasks.filter(task => !task.isRead);
  const overdueTasks = pendingTasks.filter(task => task.dueDate && task.dueDate < new Date());

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
          <View style={styles.plantInfoContainer}>
            <Text style={styles.title}>{plant.name}</Text>
            <Text style={styles.detail}>Tipo: {plant.type}</Text>
            <Text style={styles.detail}>Data de Criação: {plant.createdAt}</Text>
            <Text style={styles.detail}>Descrição: {plant.description}</Text>
            <Text style={styles.detail}>Rega: {plant.watering}</Text>
            <Text style={styles.detail}>Luz Solar: {plant.sunlight}</Text>
            <Text style={styles.detail}>Taxa de Crescimento: {plant.growthRate}</Text>
            <Text style={styles.detail}>Nível de Cuidado: {plant.careLevel}</Text>
          </View>

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
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Visualizar Tarefas</Text>
              <TouchableOpacity
                style={styles.addTaskButton}
                onPress={handleAddTaskPress}
              >
                <Text style={styles.addTaskButtonText}>Adicionar Tarefa</Text>
              </TouchableOpacity>

              <View style={styles.taskViewButtons}>
                <TouchableOpacity
                  style={[styles.taskViewButton, activeTaskView === 'Pending' && styles.activeTaskViewButton]}
                  onPress={() => setActiveTaskView('Pending')}
                >
                  <Text style={styles.taskViewButtonText}>Pendentes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.taskViewButton, activeTaskView === 'Completed' && styles.activeTaskViewButton]}
                  onPress={() => setActiveTaskView('Completed')}
                >
                  <Text style={styles.taskViewButtonText}>Concluídas</Text>
                </TouchableOpacity>
              </View>

              {activeTaskView === 'Pending' && (
                <>
                  <Text style={styles.sectionTitle}>Tarefas Pendentes</Text>
                  {pendingTasks.length === 0 ? (
                    <Text style={styles.noItems}>Nenhuma tarefa pendente encontrada.</Text>
                  ) : (
                    pendingTasks.map((task) => (
                      <TouchableOpacity
                        key={task.id}
                        style={styles.item}
                        onPress={() => handleTaskPress(task)}
                      >
                        <View style={styles.taskContent}>
                          <Text style={styles.itemName}>{task.name}</Text>
                          <Text style={styles.itemDetail}>Data: {task.dueDate?.toLocaleString() || 'Sem data'}</Text>
                          <Text style={styles.itemDetail}>Tipo: {task.notificationType}</Text>
                          <Text style={styles.itemDetail}>Status: Pendente</Text>
                        </View>
                        <TouchableOpacity
                          style={[styles.taskButton, styles.deleteButton]}
                          onPress={() => handleDeleteTask(task.id)}
                        >
                          <Text style={styles.taskButtonText}>🗑️</Text>
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ))
                  )}
                </>
              )}

              {activeTaskView === 'Completed' && (
                <>
                  <Text style={styles.sectionTitle}>Tarefas Concluídas</Text>
                  {completedTasks.length === 0 ? (
                    <Text style={styles.noItems}>Nenhuma tarefa concluída encontrada.</Text>
                  ) : (
                    completedTasks.map((task) => (
                      <View key={task.id} style={styles.item}>
                        <Text style={styles.itemName}>{task.name}</Text>
                        <Text style={styles.itemDetail}>Data: {task.dueDate?.toLocaleString() || 'Sem data'}</Text>
                        <Text style={styles.itemDetail}>Tipo: {task.notificationType}</Text>
                        <Text style={styles.itemDetail}>Status: Concluída</Text>
                      </View>
                    ))
                  )}
                </>
              )}

              {overdueTasks.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Tarefas Atrasadas</Text>
                  {overdueTasks.map((task) => (
                    <View key={task.id} style={styles.item}>
                      <Text style={styles.itemName}>{task.name}</Text>
                      <Text style={styles.itemDetail}>Data: {task.dueDate?.toLocaleString() || 'Sem data'}</Text>
                      <Text style={styles.itemDetail}>Tipo: {task.notificationType}</Text>
                      <Text style={styles.itemDetail}>Status: Atrasada</Text>
                    </View>
                  ))}
                </>
              )}
            </View>
          )}

          {activeTab === 'Diseases' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Doenças</Text>
              <TouchableOpacity
                style={styles.addDiseaseButton}
                onPress={handleAddDiseasePress}
              >
                <Text style={styles.addDiseaseButtonText}>Adicionar Doença</Text>
              </TouchableOpacity>

              <Text style={styles.sectionTitle}>Doenças Atuais</Text>
              {diseases.length === 0 ? (
                <Text style={styles.noItems}>Nenhuma doença encontrada.</Text>
              ) : (
                diseases.map((disease) => (
                  <View key={disease.id} style={styles.item}>
                    <Text style={styles.itemName}>{disease.name}</Text>
                    <Text style={styles.itemDetail}>{disease.description}</Text>
                    <View style={styles.diseaseButtons}>
                      <TouchableOpacity
                        style={styles.squareButton}
                        onPress={() => handleDeleteDisease(disease.id)}
                      >
                        <Text style={styles.squareButtonText}>✅</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
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
  plantInfoContainer: {
    backgroundColor: "#F0F8FF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    width: "100%",
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
  taskViewButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  taskViewButton: {
    backgroundColor: "#E0E0E0",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: "center",
  },
  activeTaskViewButton: {
    backgroundColor: "#468585",
  },
  taskViewButtonText: {
    color: "#2F2182",
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
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 24,
  },
  addTaskButton: {
    backgroundColor: "#468585",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: "center",
  },
  addTaskButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  addDiseaseButton: {
    backgroundColor: "#468585",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: "center",
  },
  addDiseaseButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  diseaseButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  squareButton: {
    backgroundColor: "#1A5E5E",
    padding: 5,
    borderRadius: 5,
    marginLeft: 10,
  },
  squareButtonText: {
    color: "#FFFFFF",
  },
});