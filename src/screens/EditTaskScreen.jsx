import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import { openDatabase, initializeDatabase } from '../DB/db';
import BottomBar from '../components/BottomBar';
import Constants from 'expo-constants';

const scheduleNotification = async (taskId, message, dueDate, notificationType) => {
  try {
    const permission = await Notifications.getPermissionsAsync();
    console.log('Status das permissões:', permission);
    if (!permission.granted) {
      const request = await Notifications.requestPermissionsAsync();
      if (!request.granted) {
        Alert.alert('Erro', 'Permissão de notificação negada.');
        return;
      }
    }

    const projectId = Constants.expoConfig.extra.eas.projectId;
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    console.log('Enviando ao backend:', { token, taskId, message, dueDate });

    const response = await fetch('https://xxxx.ngrok.io/schedule-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pushToken: token,
        title: 'Lembrete de Tarefa',
        body: message,
        dueDate: dueDate.toISOString(),
        taskId,
        notificationType,
      }),
    });

    const result = await response.json();
    console.log('Resposta do backend:', result);

    if (result.status === 'Notificação agendada') {
      console.log('Notificação agendada com sucesso:', { taskId, message, dueDate });
    } else {
      throw new Error('Erro do backend: ' + JSON.stringify(result));
    }
  } catch (error) {
    console.error('Erro ao agendar notificação:', error);
    Alert.alert('Erro', `Falha ao agendar notificação: ${error.message}`);
  }
};
export default function EditTaskScreen() {
  const route = useRoute();
  const { taskId, plantId } = route.params || {};
  const navigation = useNavigation();
  const [selectedPlantId, setSelectedPlantId] = useState(null);
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
      if (!taskId || !plantId) {
        console.error('taskId ou plantId undefined na EditTaskScreen!');
        Alert.alert('Erro', 'ID da tarefa ou planta não fornecido.');
        return;
      }

      try {
        const database = await openDatabase();
        await initializeDatabase(database);
        setDb(database);

        // Load task details
        const taskData = await database.getFirstAsync(
          `SELECT n.idnotification, n.idplants_acc, n.message, n.due_date, n.id_notification_type
           FROM notifications n
           WHERE n.idnotification = ? AND n.idplants_acc = ?`,
          [taskId, plantId]
        );

        if (!taskData) {
          console.log('Tarefa não encontrada com ID:', taskId);
          Alert.alert('Erro', 'Tarefa não encontrada.');
          return;
        }

        setSelectedPlantId(taskData.idplants_acc);
        setMessage(taskData.message || '');
        // Parse due_date correctly
        if (taskData.due_date) {
          const dateParts = taskData.due_date.split(' ');
          if (dateParts.length === 2) {
            // Format: YYYY-MM-DD HH:MM
            setDueDate(new Date(`${dateParts[0]}T${dateParts[1]}:00`));
          } else {
            // Format: YYYY-MM-DD (sem hora)
            setDueDate(new Date(`${taskData.due_date}T00:00:00`));
          }
        } else {
          setDueDate(new Date());
        }
        setNotificationTypeId(taskData.id_notification_type || null);

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

        setIsDataLoaded(true);
      } catch (error) {
        console.error('Erro ao inicializar EditTaskScreen:', error);
        Alert.alert('Erro', `Falha ao carregar dados: ${error.message}`);
      }
    };

    initialize();
  }, [taskId, plantId]);

  const scheduleNotification = async (taskId, message, dueDate, notificationType) => {
    const permission = await Notifications.getPermissionsAsync();
    if (!permission.granted) {
      const request = await Notifications.requestPermissionsAsync();
      if (!request.granted) {
        Alert.alert('Erro', 'Permissão de notificação negada.');
        return;
      }
    }

    // Cancel existing notification
    await Notifications.cancelScheduledNotificationAsync(taskId.toString());

    const trigger = new Date(dueDate);
    if (trigger < new Date()) {
      Alert.alert('Erro', 'A data e hora devem ser no futuro.');
      return;
    }

    let repeat = null;
    if (notificationType === 'Diária') {
      repeat = 'day';
    } else if (notificationType === 'Semanal') {
      repeat = 'week';
    } else if (notificationType === 'Mensal') {
      repeat = 'month';
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Task Reminder',
        body: message,
      },
      trigger: repeat
        ? { seconds: 60 * 60 * 24, repeats: true, channelId: repeat }
        : { date: trigger },
      identifier: taskId.toString(),
    });
    console.log('Notificação agendada:', { taskId, message, dueDate, notificationType });
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

    if (dueDate < new Date()) {
      Alert.alert('Erro', 'A data e hora devem ser no futuro.');
      return;
    }

    try {
      // Formatar data/hora no fuso horário local
      const year = dueDate.getFullYear();
      const month = String(dueDate.getMonth() + 1).padStart(2, '0');
      const day = String(dueDate.getDate()).padStart(2, '0');
      const hours = String(dueDate.getHours()).padStart(2, '0');
      const minutes = String(dueDate.getMinutes()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;

      const typeData = notificationTypes.find(type => type.idnotification_type === notificationTypeId);
      const notificationType = typeData ? typeData.notification_type : 'Única';

      await db.runAsync(
        `UPDATE notifications
         SET idplants_acc = ?, message = ?, due_date = ?, id_notification_type = ?
         WHERE idnotification = ?`,
        [selectedPlantId, message.trim(), formattedDate, notificationTypeId, taskId]
      );

      await scheduleNotification(taskId, message.trim(), dueDate, notificationType);

      Alert.alert('Sucesso', 'Tarefa atualizada com sucesso!', [
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

  const onDateChange = (event, selectedDate) => {
    if (event.type === 'dismissed') {
      setShowDatePicker(false);
      return;
    }
    const currentDate = selectedDate || dueDate;
    setShowDatePicker(Platform.OS === 'ios');
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
      dueDate.getHours(),
      dueDate.getMinutes()
    );
    setDueDate(newDate);
  };

  const onTimeChange = (event, selectedTime) => {
    if (event.type === 'dismissed') {
      setShowTimePicker(false);
      return;
    }
    const currentTime = selectedTime || dueDate;
    setShowTimePicker(Platform.OS === 'ios');
    const newDate = new Date(
      dueDate.getFullYear(),
      dueDate.getMonth(),
      dueDate.getDate(),
      currentTime.getHours(),
      currentTime.getMinutes()
    );
    setDueDate(newDate);
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
        <Text style={styles.title}>Editar Tarefa</Text>

        <Text style={styles.sectionTitle}>Selecionar Planta</Text>
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
              items={notificationTypes.map((type) => ({
                label: type.notification_type,
                value: type.idnotification_type,
              }))}
              placeholder={{ label: 'Selecione um tipo de notificação...', value: null }}
              style={pickerSelectStyles}
              value={notificationTypeId}
            />
          </View>
        )}

        <Text style={styles.sectionTitle}>Data de Vencimento</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>
            {dueDate.toISOString().slice(0, 10)}
          </Text>
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
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={styles.dateText}>
            {`${String(dueDate.getHours()).padStart(2, '0')}:${String(dueDate.getMinutes()).padStart(2, '0')}`}
          </Text>
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
          <Text style={styles.saveButtonText}>Salvar Tarefa</Text>
        </TouchableOpacity>
      </ScrollView>
      <BottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#468585',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    color: '#468585',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    color: '#468585',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#468585',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    color: '#2F2182',
    justifyContent: 'center',
  },
  messageInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  dropdownContainer: {
    width: '100%',
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: '#468585',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 16,
    color: '#2F2182',
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#468585',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    color: '#2F2182',
  },
  inputAndroid: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#468585',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    color: '#2F2182',
  },
});