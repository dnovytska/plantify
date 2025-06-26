import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { openDatabase } from "../DB/db";
import { Picker } from '@react-native-picker/picker';

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

export default function CreateDiseaseScreen({ route }) {
  const { plantId } = route.params; // Recebendo o ID da planta
  const [selectedDiseaseId, setSelectedDiseaseId] = useState(null);
  const [diseases, setDiseases] = useState([]);
  const [db, setDb] = useState(null);

  useEffect(() => {
    const initializeDatabase = async () => {
      const database = await openDB();
      setDb(database);
      await fetchDiseases(database);
    };

    initializeDatabase();
  }, []);

  const fetchDiseases = async (database) => {
    try {
      const diseaseData = await database.getAllAsync('SELECT id, name FROM diseases');
      setDiseases(diseaseData);
    } catch (error) {
      console.error("Erro ao buscar doenças:", error);
      Alert.alert("Erro", "Falha ao carregar as doenças: " + error.message);
    }
  };

  const handleAddDisease = async () => {
    if (!db) {
      Alert.alert('Erro', 'Banco de dados não inicializado.');
      return;
    }

    if (!selectedDiseaseId) {
      Alert.alert('Erro', 'Por favor, selecione uma doença.');
      return;
    }

    try {
      // Associa a doença selecionada à planta
      await db.runAsync(
        'INSERT INTO diseases_plants_acc (plants_acc_id, disease_id) VALUES (?, ?)',
        [plantId, selectedDiseaseId]
      );

      Alert.alert('Sucesso', 'Doença associada à planta com sucesso!');
      setSelectedDiseaseId(null); // Limpa a seleção
    } catch (error) {
      console.error('Erro ao associar doença:', error);
      Alert.alert('Erro', `Falha ao associar a doença: ${error.message}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Adicionar Doença à Planta</Text>
        <Picker
          selectedValue={selectedDiseaseId}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedDiseaseId(itemValue)}
        >
          <Picker.Item label="Selecione uma Doença" value={null} />
          {diseases.map((disease) => (
            <Picker.Item key={disease.id} label={disease.name} value={disease.id} />
          ))}
        </Picker>
        <TouchableOpacity style={styles.button} onPress={handleAddDisease}>
          <Text style={styles.buttonText}>Salvar Doença</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF", padding: 20 },
  content: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 24, color: "#468585", fontWeight: 'bold', marginBottom: 20 },
  picker: {
    height: 50,
    width: '100%',
    borderColor: '#468585',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
  },
  button: { 
    backgroundColor: '#468585', 
    padding: 15, 
    borderRadius: 5 
  },
  buttonText: { 
    color: '#FFFFFF', 
    textAlign: 'center', 
    fontSize: 16 
  },
});
