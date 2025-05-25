import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import * as SQLite from 'expo-sqlite';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import BottomBar from '../components/BottomBar';
import RNPickerSelect from 'react-native-picker-select';

// Substitua pela sua chave válida da API da Perenual
const PERENUAL_API_KEY = 'sk-A3MD68336f5fd228d10647'; // Insira sua chave da API

export default function AddPlantScreen() {
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();
  const [plantName, setPlantName] = useState('');
  const [description, setDescription] = useState('');
  const [creationDate, setCreationDate] = useState(new Date().toISOString().split('T')[0]);
  const [plantTypeId, setPlantTypeId] = useState(null);
  const [plantTypesByType, setPlantTypesByType] = useState({}); // Agrupar plantas por tipo
  const [selectedPlantType, setSelectedPlantType] = useState(null); // Tipo selecionado (ex.: "succulent")
  const [filteredPlantTypes, setFilteredPlantTypes] = useState([]); // Plantas filtradas por tipo e busca
  const [searchQuery, setSearchQuery] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [db, setDb] = useState(null);
  const [selectedPlantDetails, setSelectedPlantDetails] = useState(null); // Detalhes da planta selecionada
  const [isDataLoaded, setIsDataLoaded] = useState(false); // Controle de carregamento de dados

  useEffect(() => {
    const initDbAndLoadTypes = async () => {
      console.log('Inicializando banco de dados...');
      try {
        const database = await SQLite.openDatabaseAsync('plantify.db', {
          useNewConnection: true,
        });
        console.log('Banco de dados aberto:', database);
        setDb(database);
        await initializeDatabase(database);

        // Limpar dados existentes na tabela plant_types
        await database.execAsync('DELETE FROM plant_types;');
        console.log('Dados existentes na tabela plant_types apagados');

        // Verificar se há dados no banco de dados
        const count = await database.getFirstAsync('SELECT COUNT(*) as count FROM plant_types;');
        console.log('Contagem de registros em plant_types após limpeza:', count.count);
        if (count.count === 0) {
          console.log('Nenhum dado encontrado no banco, carregando da API...');
          await loadPlantTypesFromApi(database);
        }

        await loadPlantTypesFromLocalDb(database);
        setIsDataLoaded(true);
      } catch (error) {
        console.error('Erro ao inicializar o banco de dados:', error);
        Alert.alert('Erro', 'Não foi possível inicializar o banco de dados. Tente novamente mais tarde.');
      }
    };
    initDbAndLoadTypes();
  }, []);

  // Filtrar plantas com base na busca dentro do tipo selecionado
  useEffect(() => {
    console.log('Filtrando plantas, selectedPlantType:', selectedPlantType, 'searchQuery:', searchQuery);
    if (!selectedPlantType || !plantTypesByType[selectedPlantType]) {
      console.log('Nenhum tipo selecionado ou dados indisponíveis');
      setFilteredPlantTypes([]);
      return;
    }

    let typesToFilter = plantTypesByType[selectedPlantType];
    console.log('Tipos a filtrar:', typesToFilter);

    if (searchQuery.trim() === '') {
      setFilteredPlantTypes(typesToFilter);
    } else {
      const filtered = typesToFilter.filter(type =>
        type.type_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPlantTypes(filtered);
    }

    // Selecionar a primeira planta por padrão ao mudar o tipo, se ainda não houver seleção
    if (typesToFilter.length > 0 && !plantTypeId && selectedPlantType) {
      console.log('Selecionando a primeira planta por padrão:', typesToFilter[0].id);
      setPlantTypeId(typesToFilter[0].id);
      setSelectedPlantDetails(typesToFilter[0]); // Mostrar detalhes da primeira planta
    }
  }, [searchQuery, selectedPlantType, plantTypesByType, plantTypeId]);

  // Atualizar detalhes da planta quando plantTypeId mudar
  useEffect(() => {
    if (plantTypeId && filteredPlantTypes.length > 0) {
      const selectedPlant = filteredPlantTypes.find(plant => plant.id === plantTypeId);
      setSelectedPlantDetails(selectedPlant);
    }
  }, [plantTypeId, filteredPlantTypes]);

  // Carregar tipos de plantas do banco de dados local quando o tipo selecionado mudar
  useEffect(() => {
    if (db && selectedPlantType) {
      console.log('Carregando tipos para selectedPlantType:', selectedPlantType);
      loadPlantTypesFromLocalDb(db, selectedPlantType);
    }
  }, [selectedPlantType, db]);

  const initializeDatabase = async (database) => {
    try {
      await database.execAsync('PRAGMA foreign_keys = ON;');
      console.log('Chaves estrangeiras habilitadas');

      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS users (
          iduser INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL,
          full_name TEXT,
          email TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          gender TEXT
        );
      `);
      console.log('Tabela users criada ou já existe');

      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS plant_types (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type_name TEXT NOT NULL UNIQUE,
          type_category TEXT,
          watering TEXT,
          sunlight TEXT,
          growth_rate TEXT,
          care_level TEXT,
          description TEXT
        );
      `);
      console.log('Tabela plant_types criada ou já existe');

      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS plants (
          idplant INTEGER PRIMARY KEY AUTOINCREMENT,
          iduser INTEGER NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          creation_date TEXT NOT NULL,
          image_uri TEXT,
          plant_type_id INTEGER NOT NULL,
          FOREIGN KEY (iduser) REFERENCES users(iduser),
          FOREIGN KEY (plant_type_id) REFERENCES plant_types(id)
        );
      `);
      console.log('Tabela plants criada ou já existe');
    } catch (error) {
      console.error('Erro ao criar tabelas:', error);
      throw error;
    }
  };

  const loadPlantTypesFromApi = async (database) => {
    try {
      if (!PERENUAL_API_KEY || PERENUAL_API_KEY === 'sk-A3MD68336f5fd228d10647') {
        throw new Error('Chave da API inválida. Por favor, forneça uma chave válida da Perenual API.');
      }

      let page = 1;
      let allPlants = [];
      let hasMoreData = true;

      while (hasMoreData) {
        console.log(`Carregando página ${page} da API...`);
        const response = await fetch(`https://perenual.com/api/species-list?key=${PERENUAL_API_KEY}&page=${page}`);
        const data = await response.json();

        if (!data || !data.data || !Array.isArray(data.data)) {
          throw new Error('Dados da API inválidos ou vazios');
        }

        const plantTypes = data.data;
        console.log(`Dados recebidos da página ${page}:`, plantTypes.length, 'plantas');
        allPlants = [...allPlants, ...plantTypes];

        // Verificar se há mais páginas
        if (plantTypes.length < 30 || allPlants.length >= 10000) {
          hasMoreData = false;
        } else {
          page++;
        }

        // Adicionar um pequeno atraso para evitar sobrecarga no servidor
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log('Total de plantas carregadas da API:', allPlants.length);

      for (const plant of allPlants) {
        const typeName = plant.common_name || 'Unknown';
        const typeCategory = (plant.type || plant.growth_habit || 'unknown').toLowerCase();
        const watering = plant.watering || 'Unknown';
        const sunlight = plant.sunlight ? plant.sunlight.join(', ') : 'Unknown';
        const growthRate = plant.growth_rate || 'Unknown';
        const careLevel = plant.care_level || 'Unknown';
        const description = plant.description || 'No description available';

        try {
          await database.runAsync(
            'INSERT OR IGNORE INTO plant_types (type_name, type_category, watering, sunlight, growth_rate, care_level, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [typeName, typeCategory, watering, sunlight, growthRate, careLevel, description]
          );
        } catch (error) {
          console.error(`Erro ao inserir planta ${typeName}:`, error);
        }
      }

      console.log('Dados da API salvos no banco de dados (carregamento único concluído)');
    } catch (error) {
      console.error('Erro ao carregar dados da API:', error);
      Alert.alert(
        'Erro na API',
        'Não foi possível carregar os dados da API. Verifique a chave da API e tente novamente.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  };

  const loadPlantTypesFromLocalDb = async (database, type = null) => {
    try {
      const dbToUse = database || db;
      if (!dbToUse) {
        console.log('Banco de dados não inicializado');
        return {};
      }

      const query = type
        ? 'SELECT * FROM plant_types WHERE type_category = ?'
        : 'SELECT * FROM plant_types';
      const params = type ? [type] : [];

      console.log('Executando query:', query, 'com params:', params);
      const localTypes = await dbToUse.getAllAsync(query, params);
      console.log('Resultados do banco:', localTypes);

      const typesByCategory = localTypes.reduce((acc, plant) => {
        const plantType = plant.type_category?.toLowerCase() || 'unknown';
        if (!acc[plantType]) {
          acc[plantType] = [];
        }
        acc[plantType].push({
          id: plant.id,
          type_name: plant.type_name,
          type: plant.type_category || 'unknown',
          watering: plant.watering,
          sunlight: plant.sunlight,
          growth_rate: plant.growth_rate,
          care_level: plant.care_level,
          description: plant.description,
        });
        return acc;
      }, {});

      console.log('Tipos agrupados por categoria:', typesByCategory);
      setPlantTypesByType(typesByCategory);

      return typesByCategory;
    } catch (error) {
      console.error('Erro ao carregar tipos de plantas do banco local:', error);
      Alert.alert('Erro', 'Não foi possível carregar os tipos de plantas do banco local.');
      return {};
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permissão negada', 'É necessário permitir o acesso à galeria para selecionar uma imagem.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleAddPlant = async () => {
    if (!db) {
      Alert.alert('Erro', 'Banco de dados não inicializado. Tente novamente.');
      return;
    }

    if (!plantName.trim() || !creationDate.trim() || !plantTypeId) {
      Alert.alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      await db.runAsync(
        'INSERT INTO plants (iduser, name, description, creation_date, image_uri, plant_type_id) VALUES (?, ?, ?, ?, ?, ?)',
        [user.id, plantName.trim(), description.trim(), creationDate, imageUri, plantTypeId]
      );

      Alert.alert('Sucesso', 'Planta adicionada com sucesso!');
      setPlantName('');
      setDescription('');
      setCreationDate(new Date().toISOString().split('T')[0]);
      setImageUri(null);
      setPlantTypeId(null);
      setSearchQuery('');
      setSelectedPlantType(null);
      setSelectedPlantDetails(null);
      navigation.navigate('YourPlants');
    } catch (error) {
      console.error('Erro ao adicionar planta:', error);
      Alert.alert('Erro', 'Não foi possível adicionar a planta. Tente novamente.');
    }
  };

  const handleSelectPlantType = (type) => {
    console.log('Selecionando tipo:', type);
    setSelectedPlantType(type);
    setPlantTypeId(null); // Resetar para forçar a seleção da primeira planta
    setSearchQuery('');
    setSelectedPlantDetails(null);
  };

  const commonPlantTypes = ['succulent', 'tree', 'flower', 'shrub', 'vine'];

  if (!isDataLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando dados da API...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Add New Plant</Text>

        <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <Text style={styles.addImageText}>Add Image</Text>
          )}
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          value={plantName}
          onChangeText={setPlantName}
          placeholder="Plant Name"
          autoCapitalize="words"
        />
        <TextInput
          style={[styles.input, styles.descriptionInput]}
          value={description}
          onChangeText={setDescription}
          placeholder="Description"
          multiline
          numberOfLines={4}
        />
        <TextInput
          style={styles.input}
          value={creationDate}
          onChangeText={setCreationDate}
          placeholder="Creation Date (YYYY-MM-DD)"
          autoCapitalize="none"
        />

        <Text style={styles.sectionTitle}>Select Plant Type</Text>
        {Object.keys(plantTypesByType).length === 0 ? (
          <Text style={styles.errorText}>Nenhum tipo de planta disponível. Verifique a chave da API.</Text>
        ) : (
          <View style={styles.typeButtonContainer}>
            {commonPlantTypes.map(type => (
              plantTypesByType[type] && plantTypesByType[type].length > 0 ? (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    selectedPlantType === type && styles.typeButtonSelected,
                  ]}
                  onPress={() => handleSelectPlantType(type)}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      selectedPlantType === type && styles.typeButtonTextSelected,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ) : null
            ))}
          </View>
        )}

        {selectedPlantType && (
          <>
            <TextInput
              style={styles.input}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={`Search ${selectedPlantType.charAt(0).toUpperCase() + selectedPlantType.slice(1)}...`}
              autoCapitalize="none"
            />

            <View style={styles.dropdownContainer}>
              <RNPickerSelect
                onValueChange={(value) => {
                  console.log('Selecionando planta no dropdown:', value);
                  setPlantTypeId(value);
                }}
                items={filteredPlantTypes.map(type => ({
                  label: type.type_name,
                  value: type.id,
                }))}
                placeholder={{ label: `Select a ${selectedPlantType}...`, value: null }}
                style={pickerSelectStyles}
                value={plantTypeId}
              />
            </View>

            {selectedPlantDetails && (
              <View style={styles.detailsContainer}>
                <Text style={styles.detailsTitle}>{selectedPlantDetails.type_name}</Text>
                <Text style={styles.detailsText}>Watering: {selectedPlantDetails.watering}</Text>
                <Text style={styles.detailsText}>Sunlight: {selectedPlantDetails.sunlight}</Text>
                <Text style={styles.detailsText}>Growth Rate: {selectedPlantDetails.growth_rate}</Text>
                <Text style={styles.detailsText}>Care Level: {selectedPlantDetails.care_level}</Text>
                <Text style={styles.detailsText}>Description: {selectedPlantDetails.description}</Text>
              </View>
            )}
          </>
        )}

        <TouchableOpacity style={styles.addButton} onPress={handleAddPlant}>
          <Text style={styles.addButtonText}>Add Plant</Text>
        </TouchableOpacity>
      </ScrollView>
      <BottomBar navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 20,
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
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#468585',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 20,
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#468585',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  addImageText: {
    color: '#468585',
    fontSize: 16,
  },
  addIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#468585',
    color: '#fff',
    width: 20,
    height: 20,
    textAlign: 'center',
    borderRadius: 10,
    fontSize: 14,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#468585',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  typeButtonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 15,
  },
  typeButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    margin: 5,
    borderWidth: 1,
    borderColor: '#468585',
  },
  typeButtonSelected: {
    backgroundColor: '#468585',
  },
  typeButtonText: {
    color: '#468585',
    fontSize: 14,
  },
  typeButtonTextSelected: {
    color: '#fff',
  },
  dropdownContainer: {
    width: '100%',
    marginBottom: 15,
  },
  detailsContainer: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#468585',
    borderRadius: 10,
    marginBottom: 15,
  },
  detailsTitle: {
    fontSize: 18,
    color: '#468585',
    marginBottom: 5,
  },
  detailsText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 3,
  },
  addButton: {
    backgroundColor: '#B0A8F0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
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