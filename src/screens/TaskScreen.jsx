import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, Alert, StyleSheet, TouchableOpacity } from "react-native";
import { useRoute, useNavigation } from '@react-navigation/native';
import { openDatabase } from "../DB/db";

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

export default function TaskScreen() {
  const route = useRoute();
  const { taskId, plantId } = route.params || {};
  const navigation = useNavigation();
  const [task, setTask] = useState(null);
  const [db, setDb] = useState(null);

  useEffect(() => {
    const fetchTaskDetails = async () => {
      const database = await openDB();
      setDb(database);

      try {
        const taskData = await database.getFirstAsync(
          `SELECT n.idnotification AS id, n.message AS name, n.due_date, n.is_read,
                  nt.notification_type
           FROM notifications n
           LEFT JOIN notification_types nt ON n.id_notification_type = nt.idnotification_type
           WHERE n.idnotification = ?`,
          [taskId]
        );

        if (!taskData) {
          Alert.alert("Erro", "Tarefa não encontrada.");
          return;
        }

        setTask({
          id: taskData.id,
          name: taskData.name,
          dueDate: taskData.due_date ? new Date(taskData.due_date).toLocaleString() : "N/A",
          notificationType: taskData.notification_type || "Unknown",
          isRead: taskData.is_read,
        });
      } catch (error) {
        console.error("Erro ao buscar detalhes da tarefa:", error);
        Alert.alert("Erro", "Falha ao carregar os detalhes da tarefa: " + error.message);
      }
    };

    fetchTaskDetails();
  }, [taskId]);

  const handleToggleTaskCompletion = async () => {
    if (!db) {
      Alert.alert('Erro', 'Banco de dados não inicializado.');
      return;
    }

    try {
      const newIsRead = task.isRead ? 0 : 1; // Toggle the completion status
      await db.runAsync(
        'UPDATE notifications SET is_read = ? WHERE idnotification = ?',
        [newIsRead, task.id]
      );

      Alert.alert('Sucesso', `Tarefa marcada como ${newIsRead ? 'concluída' : 'não concluída'}!`);
      navigation.goBack(); // Go back to the previous screen
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      Alert.alert('Erro', `Falha ao atualizar a tarefa: ${error.message}`);
    }
  };

  const handleDeleteTask = async () => {
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
              await db.runAsync('DELETE FROM notifications WHERE idnotification = ?', [task.id]);
              Alert.alert('Sucesso', 'Tarefa apagada com sucesso!');
              navigation.goBack(); // Go back to the previous screen
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
    navigation.navigate('EditTask', { taskId: task.id, plantId });
  };

  if (!task) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Carregando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{task.name}</Text>
        <Text style={styles.detail}>Data: {task.dueDate}</Text>
        <Text style={styles.detail}>Tipo: {task.notificationType}</Text>
        <Text style={styles.detail}>Status: {task.isRead ? 'Concluída' : 'Pendente'}</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.toggleButton} onPress={handleToggleTaskCompletion}>
            <Text style={styles.toggleButtonText}>{task.isRead ? 'Desmarcar Conclusão' : 'Marcar como Concluída'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.editButton} onPress={handleEditPress}>
            <Text style={styles.editButtonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteTask}>
            <Text style={styles.deleteButtonText}>Apagar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { padding: 20 },
  title: { fontSize: 24, color: "#468585", fontWeight: 'bold', marginBottom: 10 },
  detail: { fontSize: 16, color: "#2F2182", marginBottom: 5 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  toggleButton: { backgroundColor: '#468585', padding: 10, borderRadius: 5, flex: 1, marginRight: 5 },
  toggleButtonText: { color: '#FFFFFF', fontSize: 16, textAlign: 'center' },
  editButton: { backgroundColor: '#FFA500', padding: 10, borderRadius: 5, flex: 1, marginHorizontal: 5 },
  editButtonText: { color: '#FFFFFF', fontSize: 16, textAlign: 'center' },
  deleteButton: { backgroundColor: '#FF4D4D', padding: 10, borderRadius: 5, flex: 1, marginLeft: 5 },
  deleteButtonText: { color: '#FFFFFF', fontSize: 16, textAlign: 'center' },
});