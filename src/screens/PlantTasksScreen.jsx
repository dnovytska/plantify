import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { AuthContext } from '../context/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';

const openDatabase = async () => {
  try {
    const db = await SQLite.openDatabaseAsync('plantifydb.db');
    return db;
  } catch (error) {
    console.error('Erro ao inicializar a base de dados:', error);
    throw error;
  }
};

export default function PlantTasksScreen({ navigation, route }) {
  const { user, loggedIn } = useContext(AuthContext);
  const { plantId, plantName } = route.params || {};
  const [pendingTasks, setPendingTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);

  useEffect(() => {
    console.log('Estado de autenticação em PlantTasksScreen:', { loggedIn, user });
    if (!loggedIn || !user || !user.id_user) {
      Alert.alert('Erro', 'Utilizador não autenticado. Faça login novamente.');
      navigation.navigate('Login');
      return;
    }
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const db = await openDatabase();
      const pending = await db.getAllAsync(
        'SELECT * FROM tasks WHERE plant_id = ? AND iduser = ? AND completed = 0',
        [plantId, user.id_user]
      );
      const completed = await db.getAllAsync(
        'SELECT * FROM tasks WHERE plant_id = ? AND iduser = ? AND completed = 1',
        [plantId, user.id_user]
      );
      setPendingTasks(pending);
      setCompletedTasks(completed);
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      Alert.alert('Erro', 'Não foi possível carregar as tarefas.');
    }
  };

  const toggleTaskCompletion = async (task) => {
    try {
      const db = await openDatabase();
      const newCompletedStatus = task.completed ? 0 : 1;
      const completedDate = newCompletedStatus ? new Date().toISOString() : null;

      await db.runAsync(
        'UPDATE tasks SET completed = ?, completed_date = ? WHERE id_task = ?',
        [newCompletedStatus, completedDate, task.id_task]
      );

      if (newCompletedStatus && task.type === 'weekly') {
        const nextDueDate = new Date();
        nextDueDate.setDate(nextDueDate.getDate() + 7);
        await db.runAsync(
          'INSERT INTO tasks (plant_id, name, type, due_date, completed, iduser) VALUES (?, ?, ?, ?, ?, ?)',
          [task.plant_id, task.name, task.type, nextDueDate.toISOString(), 0, user.id_user]
        );
        console.log('Nova tarefa semanal criada:', { plantId: task.plant_id, name: task.name });
      }

      console.log('Tarefa atualizada:', { id_task: task.id_task, completed: newCompletedStatus });
      fetchTasks(); // Atualiza as listas
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      Alert.alert('Erro', 'Não foi possível atualizar a tarefa.');
    }
  };

  const renderTask = ({ item }) => (
    <View style={styles.taskItem}>
      <TouchableOpacity onPress={() => toggleTaskCompletion(item)}>
        <MaterialIcons
          name={item.completed ? 'check-box' : 'check-box-outline-blank'}
          size={24}
          color={item.completed ? '#4CAF50' : '#468585'}
        />
      </TouchableOpacity>
      <View style={styles.taskDetails}>
        <Text style={styles.taskName}>{item.name}</Text>
        <Text style={styles.taskDueDate}>Vencimento: {new Date(item.due_date).toLocaleDateString()}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tarefas para {plantName || 'Planta'}</Text>
      <Text style={styles.sectionTitle}>Pendentes</Text>
      <FlatList
        data={pendingTasks}
        keyExtractor={(item) => item.id_task.toString()}
        renderItem={renderTask}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma tarefa pendente</Text>}
      />
      <Text style={styles.sectionTitle}>Concluídas</Text>
      <FlatList
        data={completedTasks}
        keyExtractor={(item) => item.id_task.toString()}
        renderItem={renderTask}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma tarefa concluída</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, color: '#468585', marginBottom: 20, textAlign: 'center' },
  sectionTitle: { fontSize: 20, color: '#468585', marginVertical: 10 },
  taskItem: { flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  taskDetails: { marginLeft: 10, flex: 1 },
  taskName: { fontSize: 16, color: '#333' },
  taskDueDate: { fontSize: 14, color: '#666' },
  emptyText: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 20 },
});