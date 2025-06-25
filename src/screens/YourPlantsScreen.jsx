import React, { useState, useEffect, useContext } from "react";
import { SafeAreaView, View, ScrollView, Image, Text, Alert, TouchableOpacity } from "react-native";
import * as SQLite from "expo-sqlite";
import { AuthContext } from "../context/AuthContext";
import { useNavigation } from '@react-navigation/native';
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

export default function YourPlantsScreen() {
  const [db, setDb] = useState(null);
  const [plants, setPlants] = useState([]);
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();

  useEffect(() => {
    const initializeDbAndFetchPlants = async () => {
      if (!user || !user.id) {
        console.log("Usuário não autenticado ou ID não definido:", user);
        Alert.alert("Erro", "Usuário não autenticado. Faça login novamente.");
        return; 
      }

      console.log("Usuário logado com ID:", user.id);

      const database = await openDB();
      await initializeDatabase(database);
      setDb(database);

      try {
        console.log("Executando query para buscar plantas do usuário:", user.id);
        const userPlants = await database.getAllAsync(
          `SELECT pa.idplants_acc AS id, pa.name, pt.name AS type, pa.creation_date, pa.image 
           FROM plants_acc pa 
           JOIN plants p ON pa.idplant = p.idplant 
           JOIN plant_types pt ON p.plant_type_id = pt.idplant_type 
           WHERE pa.iduser = ?`,
          [user.id]
        );

        console.log("Plantas encontradas:", userPlants);

        setPlants(userPlants.map((plant) => ({
          id: plant.id,
          name: plant.name,
          type: plant.type || "Plant Type",
          createdAt: new Date(plant.creation_date).toLocaleDateString(),
          image: plant.image || "https://storage.googleapis.com/tagjs-prod.appspot.com/RXQ247PXg9/820zgqtn.png",
        })));
      } catch (error) {
        console.error("Erro ao buscar plantas:", error);
        Alert.alert("Erro", "Falha ao carregar as plantas: " + error.message);
      }
    };

    initializeDbAndFetchPlants().catch((error) => {
      console.error("Erro ao inicializar banco de dados:", error);
      Alert.alert("Erro", "Falha ao configurar o banco de dados: " + error.message);
    });
  }, [user]);

  const handlePlantPress = (plantId) => {
    console.log("Navegando para PlantScreen com plantId:", plantId);
    if (!plantId) {
      console.error("plantId é undefined na navegação!");
      Alert.alert("Erro", "ID da planta inválido.");
      return;
    }
    navigation.navigate('Plant', { plantId });
  };

  const handleTasksPress = (plantId) => {
    console.log("Navegando para PlantScreen (tarefas) com plantId:", plantId);
    if (!plantId) {
      console.error("plantId é undefined na navegação!");
      Alert.alert("Erro", "ID da planta inválido.");
      return;
    }
    navigation.navigate('Plant', { plantId });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ backgroundColor: "#FFFFFF", padding: 10 }}>
          <View style={{ alignItems: "center", marginBottom: 10 }}>
            <Text style={{ color: "#468585", fontSize: 24 }}>Your Plants</Text>
          </View>
          {plants.length === 0 ? (
            <Text style={{ color: "#468585", textAlign: "center", marginTop: 20 }}>
              Nenhuma planta encontrada.
            </Text>
          ) : (
            plants.map((plant) => (
              <View key={plant.id} style={{
                backgroundColor: "#E9E9F9",
                borderRadius: 20,
                padding: 10,
                marginBottom: 10,
                marginHorizontal: 5,
              }}>
                <TouchableOpacity
                  style={{ flexDirection: "row", alignItems: "center" }}
                  onPress={() => handlePlantPress(plant.id)}
                >
                  <Image
                    source={{ uri: plant.image }}
                    resizeMode="contain"
                    style={{ width: 40, height: 40, marginRight: 10 }}
                  />
                  <View>
                    <Text style={{ color: "#2F2182", fontSize: 16 }}>{plant.name}</Text>
                    <Text style={{ color: "#468585", fontSize: 14 }}>{plant.type}</Text>
                    <Text style={{ color: "#468585", fontSize: 12 }}>{plant.createdAt}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}