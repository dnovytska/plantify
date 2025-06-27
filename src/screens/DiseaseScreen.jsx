import React, { useState, useEffect, useCallback } from "react";
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

export default function DiseaseScreen() {
  const route = useRoute();
  const { plantId } = route.params || {};
  const navigation = useNavigation();
  const [diseases, setDiseases] = useState([]);
  const [db, setDb] = useState(null);

  const fetchDiseases = useCallback(async () => {
    if (!plantId) {
      console.error("plantId é undefined na DiseaseScreen!");
      Alert.alert("Erro", "ID da planta não fornecido.");
      return;
    }

    const database = await openDB();
    setDb(database);

    try {
      const diseaseData = await database.getAllAsync(
        `SELECT d.id, d.name
         FROM diseases_plants_acc dpa
         JOIN diseases d ON dpa.disease_id = d.id
         WHERE dpa.plants_acc_id = ?`,
        [plantId]
      );

      console.log("Doenças encontradas:", diseaseData);
      setDiseases(diseaseData.map((disease) => ({
        id: disease.id,
        name: disease.name,
      })));

    } catch (error) {
      console.error("Erro ao buscar doenças:", error);
      Alert.alert("Erro", "Falha ao carregar as doenças: " + error.message);
    }
  }, [plantId]);

  useEffect(() => {
    fetchDiseases();
  }, [fetchDiseases]);

  const handleMarkHealthy = async () => {
    if (!db) {
      Alert.alert('Erro', 'Banco de dados não inicializado.');
      return;
    }

    Alert.alert(
      'Confirmar',
      'Tem certeza que deseja marcar esta planta como saudável?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Marcar como Saudável',
          onPress: async () => {
            try {
              await db.runAsync('DELETE FROM diseases_plants_acc WHERE plants_acc_id = ?', [plantId]);
              Alert.alert('Sucesso', 'Planta marcada como saudável!');
              await fetchDiseases(); // Atualiza a lista de doenças
            } catch (error) {
              console.error('Erro ao marcar planta como saudável:', error);
              Alert.alert('Erro', `Falha ao marcar a planta: ${error.message}`);
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

  const handleDeletePlant = async () => {
    if (!db) {
      Alert.alert('Erro', 'Banco de dados não inicializado.');
      return;
    }

    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja apagar esta planta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: async () => {
            try {
              await db.runAsync('DELETE FROM plants_acc WHERE idplants_acc = ?', [plantId]);
              Alert.alert('Sucesso', 'Planta apagada com sucesso!');
              navigation.goBack(); // Volta para a tela anterior
            } catch (error) {
              console.error('Erro ao apagar planta:', error);
              Alert.alert('Erro', `Falha ao apagar a planta: ${error.message}`);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Doenças da Planta</Text>
        {diseases.length === 0 ? (
          <Text style={styles.noItems}>Nenhuma doença encontrada.</Text>
        ) : (
          diseases.map((disease) => (
            <View key={disease.id} style={styles.item}>
              <Text style={styles.itemName}>{disease.name}</Text>
            </View>
          ))
        )}
        <TouchableOpacity
          style={styles.markHealthyButton}
          onPress={handleMarkHealthy}
        >
          <Text style={styles.markHealthyButtonText}>Marcar como Saudável</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEditPress}
        >
          <Text style={styles.editButtonText}>✏️ Editar Planta</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeletePlant}
        >
          <Text style={styles.deleteButtonText}>🗑️ Apagar Planta</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  item: {
    backgroundColor: "#E9E9F9",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
  },
  itemName: {
    fontSize: 16,
    color: "#2F2182",
    fontWeight: "bold",
  },
  noItems: {
    fontSize: 16,
    color: "#468585",
    textAlign: "center",
  },
  markHealthyButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  markHealthyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  editButton: {
    backgroundColor: "#468585",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: "#F44336",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
});
