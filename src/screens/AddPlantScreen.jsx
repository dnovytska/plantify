import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, TextInput, Button, Image, Alert } from "react-native";
import * as SQLite from "expo-sqlite";
import * as ImagePicker from "expo-image-picker";

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

export default function AddPlantScreen({ navigation }) {
  const [db, setDb] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [usersIdUser, setUsersIdUser] = useState("");
  const [plantsIdPlant, setPlantsIdPlant] = useState("");

  // Inicializar o banco de dados e criar a tabela
  useEffect(() => {
    const initializeDb = async () => {
      const database = await openDB();
      setDb(database);

      // Criar a tabela plant_acc se não existir
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS plant_acc (
          idplant_acc INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          creation_date TEXT,
          description TEXT,
          image TEXT,
          users_iduser INTEGER,
          plants_idplant INTEGER
        );
      `);
      console.log("Tabela plant_acc criada com sucesso");
    };

    initializeDb().catch((error) => {
      console.error("Erro ao inicializar banco de dados:", error);
      Alert.alert("Erro", "Falha ao configurar o banco de dados.");
    });
  }, []);

  // Função para selecionar imagem
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão negada", "É necessário permitir acesso à galeria.");
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Função para adicionar a planta ao banco de dados
  const addPlant = async () => {
    if (!db) {
      Alert.alert("Erro", "Banco de dados não inicializado.");
      return;
    }

    if (!name || !description || !usersIdUser || !plantsIdPlant) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    const creationDate = new Date().toISOString();

    try {
      await db.runAsync(
        `INSERT INTO plant_acc (name, creation_date, description, image, users_iduser, plants_idplant) 
         VALUES (?, ?, ?, ?, ?, ?);`,
        [name, creationDate, description, image || "", parseInt(usersIdUser), parseInt(plantsIdPlant)]
      );
      Alert.alert("Sucesso", "Planta adicionada com sucesso!");
      setName("");
      setDescription("");
      setImage(null);
      setUsersIdUser("");
      setPlantsIdPlant("");
      navigation.goBack();
    } catch (error) {
      console.error("Erro ao adicionar planta:", error);
      Alert.alert("Erro", "Ocorreu um erro ao adicionar a planta.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF", padding: 10 }}>
      <View style={{ alignItems: "center", marginBottom: 10 }}>
        <Text style={{ color: "#468585", fontSize: 24 }}>Adicionar Planta</Text>
      </View>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: "#468585",
          borderRadius: 5,
          padding: 8,
          marginBottom: 10,
        }}
        placeholder="Nome da planta"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: "#468585",
          borderRadius: 5,
          padding: 8,
          marginBottom: 10,
        }}
        placeholder="Descrição"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: "#468585",
          borderRadius: 5,
          padding: 8,
          marginBottom: 10,
        }}
        placeholder="ID do Usuário"
        value={usersIdUser}
        onChangeText={setUsersIdUser}
        keyboardType="numeric"
      />
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: "#468585",
          borderRadius: 5,
          padding: 8,
          marginBottom: 10,
        }}
        placeholder="ID do Tipo de Planta"
        value={plantsIdPlant}
        onChangeText={setPlantsIdPlant}
        keyboardType="numeric"
      />
      <Button title="Selecionar Imagem" onPress={pickImage} />
      {image && (
        <Image
          source={{ uri: image }}
          style={{ width: 100, height: 100, marginVertical: 10 }}
        />
      )}
      <Button title="Adicionar Planta" onPress={addPlant} />
    </SafeAreaView>
  );
}