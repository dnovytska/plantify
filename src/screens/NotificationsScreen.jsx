// src/screens/NotificationsScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { openDatabase } from '../DB/db'; // Certifique-se de que o caminho está correto

const db = openDatabase(); // Inicialize o banco de dados aqui

export default function NotificationsScreen() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM tasks', // Substitua pelo nome da sua tabela de tarefas
        [],
        (tx, results) => {
          const tasksArray = [];
          for (let i = 0; i < results.rows.length; i++) {
            tasksArray.push(results.rows.item(i));
          }
          setTasks(tasksArray);
        },
        (tx, error) => {
          console.error('Erro ao buscar tarefas:', error);
          Alert.alert('Erro', 'Não foi possível carregar as tarefas.');
        }
      );
    });
  };

  const renderTask = ({ item }) => (
    <TouchableOpacity style={styles.taskContainer}>
      <Text style={styles.taskTitle}>{item.title}</Text>
      <Text style={styles.notification}>{item.notification}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notificações</Text>
      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={item => item.id.toString()} // Certifique-se de que o ID é uma string
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: '#468585',
    marginBottom: 20,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  taskContainer: {
    backgroundColor: '#E0E0E0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  taskTitle: {
    fontSize: 18,
    color: '#2F2182',
  },
  notification: {
    fontSize: 14,
    color: '#468585',
    marginTop: 5,
  },
});
