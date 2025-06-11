import React, { useState, useEffect } from "react";
import { SafeAreaView, View, ScrollView, Image, Text, Alert, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import * as SQLite from "expo-sqlite";
import { useRoute, useNavigation } from '@react-navigation/native';
import BottomBar from '../components/BottomBar';
import { initializeDatabase } from "../DB/db";
import { Picker } from "@react-native-picker/picker";

export default function EditPlantScreen() {
  const route = useRoute();
  const { plantId } = route.params || {};
  const navigation = useNavigation();
  const [plant, setPlant] = useState({
    id: '',
    name: '',
    type: '',
    createdAt: '',
    description: '',
    image: '',
    watering: '',
    sunlight: '',
    growthRate: '',
    careLevel: '',
  });
  const [db, setDb] = useState(null);
  const [wateringOptions, setWateringOptions] = useState([]);
  const [sunlightOptions, setSunlightOptions] = useState([]);
  const [growthRateOptions, setGrowthRateOptions] = useState([]);
  const [careLevelOptions, setCareLevelOptions] = useState([]);

  useEffect(() => {
    const fetchPlantDetails = async () => {
      if (!plantId) {
        console.error("plantId é undefined na EditPlantScreen!");
        Alert.alert("Erro", "ID da planta não fornecido.");
        return;
      }

      try {
        const database = await SQLite.openDatabaseAsync('plantify.db');
        if (!database) {
          throw new Error("Falha ao abrir o banco de dados.");
        }
        await initializeDatabase(database);
        setDb(database);

        // Buscar opções das tabelas
        const [wateringData, sunlightData, growthRateData, careLevelData] = await Promise.all([
          database.getAllAsync('SELECT id, name FROM watering_levels'),
          database.getAllAsync('SELECT id, name FROM sunlight_levels'),
          database.getAllAsync('SELECT id, name FROM growth_rates'),
          database.getAllAsync('SELECT id, name FROM care_levels'),
        ]);

        setWateringOptions(wateringData.map(item => item.name));
        setSunlightOptions(sunlightData.map(item => item.name));
        setGrowthRateOptions(growthRateData.map(item => item.name));
        setCareLevelOptions(careLevelData.map(item => item.name));

        console.log("Buscando detalhes da planta para edição com ID:", plantId);
        const plantData = await database.getFirstAsync(
          `SELECT pa.idplant_acc, pa.name, pa.creation_date, pa.description, pa.image, 
                  pt.name AS type_name, wl.name AS watering_name, sl.name AS sunlight_name, 
                  gr.name AS growth_rate_name, cl.name AS care_level_name 
           FROM plants_acc pa 
           JOIN plants p ON pa.plants_idplant = p.idplant 
           JOIN plant_types pt ON p.plant_types_idplant_type = pt.idplant_type 
           LEFT JOIN watering_levels wl ON pt.watering_id = wl.id
           LEFT JOIN sunlight_levels sl ON pt.sunlight_id = sl.id
           LEFT JOIN growth_rates gr ON pt.growth_rate_id = gr.id
           LEFT JOIN care_levels cl ON pt.care_level_id = cl.id
           WHERE pa.idplant_acc = ?`,
          [plantId]
        );

        if (!plantData) {
          console.log("Planta não encontrada com ID:", plantId);
          Alert.alert("Erro", "Planta não encontrada.");
          return;
        }

        console.log("Dados da planta encontrados para edição:", plantData);

        setPlant({
          id: plantData.idplant_acc,
          name: plantData.name || "",
          type: plantData.type_name || "",
          createdAt: new Date(plantData.creation_date).toLocaleDateString(),
          description: plantData.description || "",
          image: plantData.image || "https://storage.googleapis.com/tagjs-prod.appspot.com/RXQ247PXg9/820zgqtn.png",
          watering: plantData.watering_name || "",
          sunlight: plantData.sunlight_name || "",
          growthRate: plantData.growth_rate_name || "",
          careLevel: plantData.care_level_name || "",
        });
      } catch (error) {
        console.error("Erro ao buscar detalhes da planta para edição:", error);
        Alert.alert("Erro", "Falha ao carregar os detalhes da planta: " + error.message);
      }
    };

    fetchPlantDetails();
  }, [plantId]);

  const handleSave = async () => {
    if (!plantId || !db) {
      console.error("plantId ou db undefined ao tentar salvar edição!");
      Alert.alert("Erro", "ID da planta ou banco de dados não disponível.");
      return;
    }

    try {
      await db.runAsync(
        `UPDATE plants_acc SET name = ?, description = ?, image = ? WHERE idplant_acc = ?`,
        [plant.name, plant.description, plant.image, plantId]
      );
      Alert.alert("Sucesso", "Planta atualizada!");
      navigation.navigate('PlantScreen', { plantId });
    } catch (error) {
      console.error("Erro ao salvar edição:", error);
      Alert.alert("Erro", "Falha ao atualizar a planta: " + error.message);
    }
  };

  if (!plant) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.title}>Carregando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Image
            source={{ uri: plant.image ? plant.image : "https://storage.googleapis.com/tagjs-prod.appspot.com/RXQ247PXg9/820zgqtn.png" }}
            resizeMode="contain"
            style={styles.image}
            onError={(e) => console.log("Erro ao carregar imagem:", e.nativeEvent.error)}
          />
          <TextInput
            style={styles.input}
            value={plant.name}
            onChangeText={(text) => setPlant({ ...plant, name: text })}
            placeholder="Nome da Planta"
          />
          <TextInput
            style={styles.input}
            value={plant.type}
            onChangeText={(text) => setPlant({ ...plant, type: text })}
            placeholder="Tipo"
          />
          <Text style={styles.detail}>Data de Criação: {plant.createdAt}</Text>
          <TextInput
            style={styles.input}
            value={plant.description}
            onChangeText={(text) => setPlant({ ...plant, description: text })}
            placeholder="Descrição"
            multiline
          />
          <Text style={styles.label}>Rega:</Text>
          <Picker
            selectedValue={plant.watering}
            style={styles.picker}
            onValueChange={(itemValue) => setPlant({ ...plant, watering: itemValue })}
          >
            {wateringOptions.map((option, index) => (
              <Picker.Item key={index} label={option} value={option} />
            ))}
          </Picker>
          <Text style={styles.label}>Luz Solar:</Text>
          <Picker
            selectedValue={plant.sunlight}
            style={styles.picker}
            onValueChange={(itemValue) => setPlant({ ...plant, sunlight: itemValue })}
          >
            {sunlightOptions.map((option, index) => (
              <Picker.Item key={index} label={option} value={option} />
            ))}
          </Picker>
          <Text style={styles.label}>Taxa de Crescimento:</Text>
          <Picker
            selectedValue={plant.growthRate}
            style={styles.picker}
            onValueChange={(itemValue) => setPlant({ ...plant, growthRate: itemValue })}
          >
            {growthRateOptions.map((option, index) => (
              <Picker.Item key={index} label={option} value={option} />
            ))}
          </Picker>
          <Text style={styles.label}>Nível de Cuidado:</Text>
          <Picker
            selectedValue={plant.careLevel}
            style={styles.picker}
            onValueChange={(itemValue) => setPlant({ ...plant, careLevel: itemValue })}
          >
            {careLevelOptions.map((option, index) => (
              <Picker.Item key={index} label={option} value={option} />
            ))}
          </Picker>
        </View>
      </ScrollView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Salvar</Text>
        </TouchableOpacity>
      </View>
      <BottomBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#FFFFFF" },
  scrollView: { flex: 1 },
  content: { padding: 20, alignItems: 'stretch' },
  image: { width: 200, height: 200, borderRadius: 10, marginBottom: 20, alignSelf: 'center' },
  input: { 
    fontSize: 16, 
    color: "#2F2182", 
    marginBottom: 15, 
    borderWidth: 1, 
    borderColor: '#E9E9F9', 
    padding: 10, 
    borderRadius: 10, 
    width: '100%',
  },
  detail: { fontSize: 16, color: "#468585", marginBottom: 15, textAlign: 'center' },
  label: { fontSize: 16, color: "#468585", marginBottom: 5 },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E9E9F9',
    borderRadius: 10,
  },
  buttonContainer: {
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E9E9F9',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 60, // Acima do BottomBar
    left: 0,
    right: 0,
  },
  saveButton: {
    backgroundColor: '#468585',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '70%',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});