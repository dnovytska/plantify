import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Modal } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';
import { openDatabase, initializeDatabase } from '../DB/db';
import BottomBar from '../components/BottomBar';

export default function CreateTaskScreen() {
  const route = useRoute();
  const { plantId } = route.params || {};
  const navigation = useNavigation();
  const [selectedPlantId, setSelectedPlantId] = useState(plantId || null);
  const [message, setMessage] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notificationTypeId, setNotificationTypeId] = useState(null);
  const [plants, setPlants] = useState([]);
  const [notificationTypes, setNotificationTypes] = useState([]);
  const [newNotificationType, setNewNotificationType] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [db, setDb] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        const database = await openDatabase();
        await initializeDatabase(database);
        setDb(database);

        // Load plants
        const plantData = await database.getAllAsync(
          'SELECT idplants_acc, name FROM plants_acc'
        );
        setPlants(plantData);

        // Load notification types
        const typeData = await database.getAllAsync(
          'SELECT idnotification_type, notification_type FROM notification_types'
        );
        setNotificationTypes(typeData);

        // Pre-select plant if plantId is provided
        if (plantId) {
          setSelectedPlantId(plantId);
        }

        setIsDataLoaded(true);
      } catch (error) {
        console.error('Erro ao inicializar CreateTaskScreen:', error);
        Alert.alert('Erro', `Falha ao carregar dados: ${error.message}`);
      }
    };

    initialize();
  }, [plantId]);

  const handleSave = async () => {
    if (!db) {
      Alert.alert('Erro', 'Banco de dados não inicializado. Tente novamente.');
      return;
    }

    if (!selectedPlantId || !message.trim() || !dueDate.trim() || !notificationTypeId) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Validate due date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dueDate)) {
      Alert.alert('Erro', 'Data deve estar no formato YYYY-MM-DD.');
      return;
    }

    try {
      await db.runAsync(
        `INSERT INTO notifications (idplants_acc, message, due_date, is_read, id_notification_type)
         VALUES (?, ?, ?, 0, ?)`,
        [selectedPlantId, message.trim(), dueDate, notificationTypeId]
      );

      Alert.alert('Sucesso', 'Tarefa criada com sucesso!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
      Alert.alert('Erro', `Falha ao salvar a tarefa: ${error.message}`);
    }
  };

  const handleCreateNotificationType = async () => {
    if (!db) {
      Alert.alert('Erro', 'Banco de dados não inicializado. Tente novamente.');
      return;
    }

    if (!newNotificationType.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o nome do tipo de notificação.');
      return;
    }

    try {
      const result = await db.runAsync(
        'INSERT INTO notification_types (notification_type) VALUES (?)',
        [newNotificationType.trim()]
      );

      const newTypeId = result.lastInsertRowId;
      setNotificationTypes([
        ...notificationTypes,
        { idnotification_type: newTypeId, notification_type: newNotificationType.trim() },
      ]);
      setNotificationTypeId(newTypeId);
      setShowCreateModal(false);
      setNewNotificationType('');

      Alert.alert('Sucesso', 'Novo tipo de notificação criado!');
    } catch (error) {
      console.error('Erro ao criar tipo de notificação:', error);
      Alert.alert('Erro', `Falha ao criar tipo de notificação: ${error.message}`);
    }
  };

  if (!isDataLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={[styles.scrollContainer, { paddingBottom: 80 }]}>
        <Text style={styles.title}>Create Task</Text>

        <Text style={styles.sectionTitle}>Select Plant</Text>
        {plants.length === 0 ? (
          <Text style={styles.errorText}>Nenhuma planta disponível. Adicione uma planta primeiro.</Text>
        ) : (
          <View style={styles.dropdownContainer}>
            <RNPickerSelect
              onValueChange={(value) => setSelectedPlantId(value)}
              items={plants.map((plant) => ({
                label: plant.name,
                value: plant.idplants_acc,
              }))}
              placeholder={{ label: 'Select a plant...', value: null }}
              style={pickerSelectStyles}
              value={selectedPlantId}
            />
          </View>
        )}

        <Text style={styles.sectionTitle}>Task Message</Text>
        <TextInput
          style={[styles.input, styles.messageInput]}
          value={message}
          onChangeText={setMessage}
          placeholder="Enter task message (e.g., Water the plant)"
          multiline
          numberOfLines={4}
        />

        <Text style={styles.sectionTitle}>Notification Type</Text>
        {notificationTypes.length === 0 ? (
          <Text style={styles.errorText}>Nenhum tipo de notificação disponível.</Text>
        ) : (
          <View style={styles.dropdownContainer}>
            <RNPickerSelect
              onValueChange={(value) => setNotificationTypeId(value)}
              items={notificationTypes.map((type) => ({
                label: type.notification_type,
                value: type.idnotification_type,
              }))}
              placeholder={{ label: 'Select a notification type...', value: null }}
              style={pickerSelectStyles}
              value={notificationTypeId}
            />
          </View>
        )}
        <TouchableOpacity
          style={[styles.typeButton, styles.createButton]}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.typeButtonText}>Create New Notification Type</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Due Date</Text>
        <TextInput
          style={styles.input}
          value={dueDate}
          onChangeText={setDueDate}
          placeholder="Due Date (YYYY-MM-DD)"
          autoCapitalize="none"
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Task</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Create New Notification Type</Text>
            <TextInput
              style={styles.input}
              value={newNotificationType}
              onChangeText={setNewNotificationType}
              placeholder="Notification Type Name"
              autoCapitalize="words"
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#468585' }]}
                onPress={handleCreateNotificationType}
              >
                <Text style={styles.modalButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { padding: 20, alignItems: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 18, color: '#468585' },
  errorText: { fontSize: 16, color: 'red', marginBottom: 15 },
  title: { fontSize: 24, color: '#468585', marginBottom: 20 },
  sectionTitle: { fontSize: 18, color: '#468585', marginBottom: 10, alignSelf: 'flex-start' },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#468585',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  messageInput: { height: 100, textAlignVertical: 'top' },
  dropdownContainer: { width: '100%', marginBottom: 15 },
  typeButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    margin: 5,
    borderWidth: 1,
    borderColor: '#468585',
  },
  createButton: { backgroundColor: '#B0A8F0' },
  typeButtonText: { color: '#468585', fontSize: 14 },
  saveButton: {
    backgroundColor: '#468585',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    color: '#468585',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: { backgroundColor: '#ccc' },
  modalButtonText: { color: '#fff', fontSize: 16 },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#468585',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    color: '#000',
  },
  inputAndroid: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#468585',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    color: '#000',
  },
});