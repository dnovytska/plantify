import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import { openDatabase, initializeDatabase } from '../DB/db';
import BottomBar from '../components/BottomBar';

export default function CreateTaskScreen() {
  const route = useRoute();
  const { plantId } = route.params || {};
  const navigation = useNavigation();
  const [selectedPlantId, setSelectedPlantId] = useState(plantId || null);
  const [message, setMessage] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [notificationTypeId, setNotificationTypeId] = useState(null);
  const [plants, setPlants] = useState([]);
  const [notificationTypes, setNotificationTypes] = useState([]);
  const [db, setDb] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      if (!plantId) {
        console.error('plantId undefined na CreateTaskScreen!');
        Alert.alert('Erro', 'ID da planta não fornecido.');
        return;
      }

      try {
        const database = await openDatabase();
        await initializeDatabase(database);
        setDb(database);

        // Load plants
        const plantData = await database.getAllAsync('SELECT idplants_acc, name FROM plants_acc');
        setPlants(plantData);

        // Load unique notification types
        const typeData = await database.getAllAsync(
          'SELECT DISTINCT idnotification_type, notification_type FROM notification_types'
        );
        const uniqueTypes = Array.from(new Map(typeData.map(item => [item.idnotification_type, item])).values());
        setNotificationTypes(uniqueTypes);

        setIsDataLoaded(true);

        // Iniciar verificação a cada minuto
        const interval = setInterval(async () => await checkPendingTasks(database), 60000); // 1 minuto
        return () => clearInterval(interval);
      } catch (error) {
        console.error('Erro ao inicializar CreateTaskScreen:', error);
        Alert.alert('Erro', `Falha ao carregar dados: ${error.message}`);
      }
    };

    initialize();
  }, [plantId]);

  const checkPendingTasks = async (database) => {
    try {
      const now = new Date();
      const tasks = await database.getAllAsync(
        `SELECT idnotification, message, due_date, notification_type 
         FROM notifications 
         LEFT JOIN notification_types ON notifications.id_notification_type = notification_types.idnotification_type 
         WHERE is_read = 0`
      );

      tasks.forEach(async (task) => {
        const due = new Date(task.due_date);
        if (isSameTime(now, due)) {
          await Notifications.scheduleNotificationAsync({
            content: { title: 'Lembrete de Tarefa', body: task.message },
            trigger: null, // Imediato
          });
          console.log('Notificação disparada para:', task.message);
        } else if (task.notification_type === 'Diária' && isSameTimeTomorrow(now, due)) {
          await Notifications.scheduleNotificationAsync({
            content: { title: 'Lembrete de Tarefa', body: task.message },
            trigger: null, // Imediato para amanhã
          });
          console.log('Notificação diária disparada para amanhã:', task.message);
        }
      });
    } catch (error) {
      console.error('Erro ao verificar tarefas pendentes:', error);
    }
  };

  const isSameTime = (date1, date2) => {
    return date1.getHours() === date2.getHours() && date1.getMinutes() === date2.getMinutes();
  };

  const isSameTimeTomorrow = (now, due) => {
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    return tomorrow.getHours() === due.getHours() && tomorrow.getMinutes() === due.getMinutes();
  };

  const handleSave = async () => {
    if (!db) {
      Alert.alert('Erro', 'Banco de dados não inicializado. Tente novamente.');
      return;
    }

    if (!selectedPlantId || !message.trim() || !notificationTypeId) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (dueDate <= new Date()) {
      Alert.alert('Erro', 'A data e hora devem ser no futuro.');
      return;
    }

    try {
      const year = dueDate.getFullYear();
      const month = String(dueDate.getMonth() + 1).padStart(2, '0');
      const day = String(dueDate.getDate()).padStart(2, '0');
      const hours = String(dueDate.getHours()).padStart(2, '0');
      const minutes = String(dueDate.getMinutes()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;

      await db.runAsync(
        `INSERT INTO notifications (idplants_acc, message, due_date, id_notification_type, is_read)
         VALUES (?, ?, ?, ?, ?)`,
        [selectedPlantId, message.trim(), formattedDate, notificationTypeId, 0]
      );

      Alert.alert('Sucesso', 'Tarefa criada com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
      console.log('Tarefa salva:', { selectedPlantId, message, dueDate, notificationTypeId });
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      Alert.alert('Erro', `Falha ao criar a tarefa: ${error.message}`);
    }
  };

  const onDateChange = (event, selectedDate) => {
    if (event.type === 'dismissed') {
      setShowDatePicker(false);
      return;
    }
    const currentDate = selectedDate || dueDate;
    setShowDatePicker(Platform.OS === 'ios');
    setDueDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), dueDate.getHours(), dueDate.getMinutes()));
  };

  const onTimeChange = (event, selectedTime) => {
    if (event.type === 'dismissed') {
      setShowTimePicker(false);
      return;
    }
    const currentTime = selectedTime || dueDate;
    setShowTimePicker(Platform.OS === 'ios');
    setDueDate(new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate(), currentTime.getHours(), currentTime.getMinutes()));
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
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Criar Tarefa</Text>

        <Text style={styles.sectionTitle}>Selecionar Planta</Text>
        {plants.length === 0 ? (
          <Text style={styles.errorText}>Nenhuma planta disponível. Adicione uma planta primeiro.</Text>
        ) : (
          <View style={styles.dropdownContainer}>
            <RNPickerSelect
              onValueChange={(value) => setSelectedPlantId(value)}
              items={plants.map((plant) => ({ label: plant.name, value: plant.idplants_acc }))}
              placeholder={{ label: 'Selecione uma planta...', value: null }}
              style={pickerSelectStyles}
              value={selectedPlantId}
            />
          </View>
        )}

        <Text style={styles.sectionTitle}>Mensagem da Tarefa</Text>
        <TextInput
          style={[styles.input, styles.messageInput]}
          value={message}
          onChangeText={setMessage}
          placeholder="Digite a mensagem da tarefa (ex.: Regar a planta)"
          multiline
          numberOfLines={4}
        />

        <Text style={styles.sectionTitle}>Tipo de Notificação</Text>
        {notificationTypes.length === 0 ? (
          <Text style={styles.errorText}>Nenhum tipo de notificação disponível.</Text>
        ) : (
          <View style={styles.dropdownContainer}>
            <RNPickerSelect
              onValueChange={(value) => setNotificationTypeId(value)}
              items={notificationTypes.map((type) => ({ label: type.notification_type, value: type.idnotification_type }))}
              placeholder={{ label: 'Selecione um tipo de notificação...', value: null }}
              style={pickerSelectStyles}
              value={notificationTypeId}
            />
          </View>
        )}

        <Text style={styles.sectionTitle}>Data de Vencimento</Text>
        <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.dateText}>{dueDate.toISOString().slice(0, 10)}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={dueDate}
            mode="date"
            display="default"
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}

        <Text style={styles.sectionTitle}>Hora de Vencimento</Text>
        <TouchableOpacity style={styles.input} onPress={() => setShowTimePicker(true)}>
          <Text style={styles.dateText}>{`${String(dueDate.getHours()).padStart(2, '0')}:${String(dueDate.getMinutes()).padStart(2, '0')}`}</Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={dueDate}
            mode="time"
            display="default"
            onChange={onTimeChange}
          />
        )}

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Criar Tarefa</Text>
        </TouchableOpacity>
      </ScrollView>
      <BottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContainer: { padding: 20, paddingBottom: 100, alignItems: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 18, color: '#468585' },
  errorText: { fontSize: 16, color: 'red', marginBottom: 15 },
  title: { fontSize: 24, color: '#468585', fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  sectionTitle: { fontSize: 18, color: '#468585', marginBottom: 10, alignSelf: 'flex-start' },
  input: { width: '100%', borderWidth: 1, borderColor: '#468585', borderRadius: 10, padding: 10, marginBottom: 15, fontSize: 16, color: '#2F2182', justifyContent: 'center' },
  messageInput: { height: 100, textAlignVertical: 'top' },
  dropdownContainer: { width: '100%', marginBottom: 15 },
  saveButton: { backgroundColor: '#468585', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, marginTop: 10, marginBottom: 20, width: '100%', alignItems: 'center' },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  dateText: { fontSize: 16, color: '#2F2182' },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: { width: '100%', borderWidth: 1, borderColor: '#468585', borderRadius: 10, padding: 10, fontSize: 16, color: '#2F2182' },
  inputAndroid: { width: '100%', borderWidth: 1, borderColor: '#468585', borderRadius: 10, padding: 10, fontSize: 16, color: '#2F2182' },
});