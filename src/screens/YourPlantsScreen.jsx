import React, { useState, useEffect, useContext } from "react";
import { SafeAreaView, View, ScrollView, Image, Text, Alert } from "react-native";
import * as SQLite from "expo-sqlite";
import { AuthContext } from "../context/AuthContext";

// Função para abrir o banco de dados de forma assíncrona
const openDB = async () => {
  try {
    const db = await SQLite.openDatabaseAsync("plantify.db");
    console.log("Banco de dados aberto com sucesso!");
    return db;
  } catch (error) {
    console.error("Erro ao abrir banco de dados:", error);
    Alert.alert("Erro", "Falha ao inicializar o banco de dados SQLite.");
    throw error;
  }
};

export default function PlantListScreen({ navigation }) {
  const [db, setDb] = useState(null);
  const [plants, setPlants] = useState([]);
  const { user } = useContext(AuthContext); // Obter o usuário logado

  // Inicializar o banco de dados e buscar as plantas do usuário
  useEffect(() => {
    const initializeDbAndFetchPlants = async () => {
      if (!user?.id) {
        Alert.alert("Erro", "Usuário não autenticado.");
        return;
      }

      const database = await openDB();
      setDb(database);

      try {
        const userPlants = await database.getAllAsync(
          `SELECT * FROM plant_acc WHERE users_iduser = ?;`,
          [user.id]
        );
        setPlants(userPlants.map((plant) => ({
          id: plant.idplant_acc,
          name: plant.name,
          type: "Plant Type", // Você pode ajustar isso se tiver uma tabela de tipos de plantas
          createdAt: new Date(plant.creation_date).toLocaleDateString(),
          image: plant.image || "https://storage.googleapis.com/tagjs-prod.appspot.com/RXQ247PXg9/820zgqtn.png", // Imagem padrão caso não haja
        })));
      } catch (error) {
        console.error("Erro ao buscar plantas:", error);
        Alert.alert("Erro", "Falha ao carregar as plantas.");
      }
    };

    initializeDbAndFetchPlants().catch((error) => {
      console.error("Erro ao inicializar banco de dados:", error);
      Alert.alert("Erro", "Falha ao configurar o banco de dados.");
    });
  }, [user]);

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
              <View
                key={plant.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#E9E9F9",
                  borderRadius: 20,
                  padding: 10,
                  marginBottom: 10,
                  marginHorizontal: 5,
                }}
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
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}