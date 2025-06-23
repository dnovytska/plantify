import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, ScrollView, Text, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import BottomBar from '../components/BottomBar';
import { openDatabase, initializeDatabase } from '../DB/db';

export default function TaskScreen() {
  const route = useRoute();
  const { taskId, plantId } = route.params || {};
  const navigation = useNavigation();
  const [task, setTask] = useState(null);
  const [db, setDb] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!taskId || !plantId) {
        console.error('taskId ou plantId undefined na TaskScreen!');
        Alert.alert('Erro', 'ID da tarefa ou planta não fornecido.');
        return;
      }

      try {
        const database = await openDatabase();
        await initializeDatabase(database);
        setDb(database);

        console.log('Buscando detalhes da tarefa com ID:', taskId);
        const taskData = await database.getFirstAsync(
          `SELECT n.idnotification, n.idplants_acc, n.message, n.due_date, n.is_read,
                  nt.notification_type, pa.name AS plant_name
           FROM notifications n
           LEFT JOIN notification_types nt ON n.id_notification_type = nt.idnotification_type
           JOIN plants_acc pa ON n.idplants_acc = pa.idplants_acc
           WHERE n.idnotification = ? AND n.idplants_acc = ?`,
          [taskId, plantId]
        );

        if (!taskData) {
          console.log('Tarefa não encontrada com ID:', taskId);
          Alert.alert('Erro', 'Tarefa não encontrada.');
          return;
        }

        console.log('Dados da tarefa encontrados:', taskData);

        setTask({
          id: taskData.idnotification,
          plantId: taskData.idplants_acc,
          plantName: taskData.plant_name || 'Unknown',
          message: taskData.message || 'No message',
          dueDate: taskData.due_date || 'N/A',
          notificationType: taskData.notification_type || 'Unknown',
          isRead: taskData.is_read ? 'Read' : 'Unread',
        });

        setIsDataLoaded(true);
      } catch (error) {
        console.error('Erro ao buscar detalhes da tarefa:', error);
        Alert.alert('Erro', `Falha ao carregar os detalhes da tarefa: ${error.message}`);
      }
    };

    fetchTasks();
  }, [taskId, plantId]);

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
              // Cancel scheduled notification
              await Notifications.cancelScheduledNotificationAsync(taskId.toString());
              await db.runAsync('DELETE FROM notifications WHERE idnotification = ?', [taskId]);
              Alert.alert('Sucesso', 'Tarefa apagada com sucesso!', [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (error) {
              console.error('Erro ao apagar tarefa:', error);
              Alert.alert('Erro', `Falha ao apagar a tarefa: ${error.message}`);
            }
          },
        },
      ]
    );
  };

  if (!isDataLoaded || !task) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.title}>Carregando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Task Details</Text>
          <Text style={styles.detail}>Plant: {task.plantName}</Text>
          <Text style={styles.detail}>Message: {task.message}</Text>
          <Text style={styles.detail}>Due Date: {task.dueDate}</Text>
          <Text style={styles.detail}>Notification Type: {task.notificationType}</Text>
          <Text style={styles.detail}>Status: {task.isRead}</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate('EditTask', { taskId: task.id, plantId: task.plantId })}
            >
              <Text style={styles.buttonText}>Edit Task</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteTask}
            >
              <Text style={styles.buttonText}>Delete Task</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <BottomBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
    alignItems: 'center',
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    color: '#468585',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  detail: {
    fontSize: 16,
    color: '#2F2182',
    marginBottom: 10,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  editButton: {
    backgroundColor: '#468585',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FF4D4D',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});