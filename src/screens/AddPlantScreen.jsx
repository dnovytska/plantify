import React, { useState, useEffect, useContext } from 'react'; // Ensured useEffect is imported
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import BottomBar from '../components/BottomBar';
import RNPickerSelect from 'react-native-picker-select';
import { openDatabase, initializeDatabase } from '../DB/db';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddPlantScreen() {
  const { user, isLoading, loggedIn, logout } = useContext(AuthContext);
  const navigation = useNavigation();
  const [plantName, setPlantName] = useState('');
  const [description, setDescription] = useState('');
  const [creationDate, setCreationDate] = useState(new Date().toISOString().split('T')[0]);
  const [plantTypeId, setPlantTypeId] = useState(null);
  const [plantTypesByType, setPlantTypesByType] = useState({});
  const [selectedPlantType, setSelectedPlantType] = useState(null);
  const [filteredPlantTypes, setFilteredPlantTypes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [db, setDb] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [newPlantTypeName, setNewPlantTypeName] = useState('');
  const [newPlantWatering, setNewPlantWatering] = useState('');
  const [newPlantSunlight, setNewPlantSunlight] = useState('');
  const [newPlantGrowthRate, setNewPlantGrowthRate] = useState('');
  const [newPlantCareLevel, setNewPlantCareLevel] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const wateringOptions = ['Low', 'Moderate', 'Regular'];
  const sunlightOptions = ['Full Sun', 'Partial Sun', 'Shade'];
  const growthRateOptions = ['Slow', 'Medium', 'Fast'];
  const careLevelOptions = ['Easy', 'Moderate', 'High'];

  useEffect(() => {
    const initDbAndLoadUser = async () => {
      try {
        console.log('Iniciando carregamento no AddPlantScreen:', { isLoading, loggedIn, user });
        if (isLoading) {
          console.log('Aguardando carregamento do AuthContext...');
          return;
        }

        if (!loggedIn || !user || !user.id) {
          console.log('Nenhum usuário logado ou ID inválido:', { loggedIn, user });
          const storedUser = await AsyncStorage.getItem('user');
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            console.log('Dados do AsyncStorage:', parsedUser);
            if (parsedUser && parsedUser.id) {
              setCurrentUserId(parsedUser.id);
              console.log('Usuário logado encontrado no AsyncStorage:', parsedUser.id);
            } else {
              console.error('ID do usuário não encontrado ou inválido no AsyncStorage:', parsedUser);
              throw new Error('ID do usuário não encontrado ou inválido no AsyncStorage');
            }
          } else {
            console.error('Nenhum usuário encontrado no AsyncStorage');
            throw new Error('Nenhum usuário encontrado no AsyncStorage');
          }
        } else {
          setCurrentUserId(user.id);
          console.log('Usuário logado encontrado no AuthContext:', user.id);
        }

        if (!currentUserId) {
          Alert.alert(
            'Erro de Autenticação',
            'Nenhum usuário está logado. Por favor, faça logout e tente novamente.',
            [
              {
                text: 'OK',
                onPress: () => logout(),
              },
            ]
          );
          return;
        }

        const database = await openDatabase();
        await initializeDatabase(database);
        setDb(database);

        const speciesMap = require('../../assets/plantnet/plantnet300K_species_id_2_name.json');

        const countResult = await database.getFirstAsync('SELECT COUNT(*) as count FROM plant_types;');
        if (countResult.count === 0) {
          await loadPlantNetData(database, speciesMap);
        }

        await loadPlantTypesFromLocalDb(database);
        setIsDataLoaded(true);
      } catch (error) {
        console.error('Erro ao inicializar o banco de dados ou carregar usuário:', error);
        Alert.alert('Erro', `Não foi possível carregar os dados: ${error.message}`);
        if (error.message.includes('usuário')) {
          logout();
        }
      }
    };
    initDbAndLoadUser();
  }, [isLoading, loggedIn, user, logout]);

  useEffect(() => {
    console.log('Filtrando plantas, selectedPlantType:', selectedPlantType, 'searchQuery:', searchQuery);
    
    if (Object.keys(plantTypesByType).length === 0) {
      console.log('Nenhum dado de plantas disponível');
      setFilteredPlantTypes([]);
      return;
    }

    let typesToFilter = [];
    
    if (!selectedPlantType) {
      console.log('Buscando em todas as plantas');
      typesToFilter = Object.values(plantTypesByType).flat();
    } else {
      console.log('Buscando no tipo selecionado:', selectedPlantType.type);
      typesToFilter = plantTypesByType[selectedPlantType.type] || [];
    }

    console.log('Tipos a filtrar:', typesToFilter);

    if (searchQuery.trim() === '') {
      setFilteredPlantTypes(typesToFilter);
    } else {
      const filtered = typesToFilter.filter(type =>
        type.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPlantTypes(filtered);
    }

    if (typesToFilter.length > 0 && !plantTypeId && selectedPlantType) {
      console.log('Selecionando a primeira planta por padrão:', typesToFilter[0].idplant_type);
      setPlantTypeId(typesToFilter[0].idplant_type);
      setSelectedPlantType(typesToFilter[0]);
    }
  }, [searchQuery, selectedPlantType, plantTypesByType, plantTypeId]);

  useEffect(() => {
    if (plantTypeId && filteredPlantTypes.length > 0) {
      const selectedPlant = filteredPlantTypes.find(plant => plant.idplant_type === plantTypeId);
      setSelectedPlantType(selectedPlant);
    }
  }, [plantTypeId, filteredPlantTypes]);

  useEffect(() => {
    if (db && selectedPlantType) {
      console.log('Carregando tipos para selectedPlantType:', selectedPlantType);
      loadPlantTypesFromLocalDb(db, selectedPlantType.type);
    }
  }, [selectedPlantType, db]);

  const loadPlantNetData = async (database, speciesMap) => {
    try {
      const categoryMap = {
        "Aloe": "succulent",
        "Echeveria": "succulent",
        "Quercus": "tree",
        "Pinus": "tree",
        "Rosa": "flower",
        "Tulipa": "flower",
        "Hedera": "vine",
        "Clematis": "vine",
        "Syringa": "shrub",
        "Hydrangea": "shrub"
      };

      const defaultAttributes = {
        "succulent": { watering: "Low", sunlight: "Full Sun", growth_rate: "Slow", care_level: "Easy" },
        "tree": { watering: "Moderate", sunlight: "Full Sun", growth_rate: "Slow", care_level: "Moderate" },
        "flower": { watering: "Regular", sunlight: "Full Sun", growth_rate: "Medium", care_level: "Moderate" },
        "vine": { watering: "Moderate", sunlight: "Partial Sun", growth_rate: "Fast", care_level: "Moderate" },
        "shrub": { watering: "Regular", sunlight: "Partial Sun", growth_rate: "Medium", care_level: "Moderate" },
        "unknown": { watering: "Moderate", sunlight: "Partial Sun", growth_rate: "Medium", care_level: "Moderate" }
      };

      const maxEntries = 1000;
      let count = 0;
      for (const speciesId in speciesMap) {
        if (count >= maxEntries) break;
        const speciesName = speciesMap[speciesId];
        let category = "unknown";
        for (const genus in categoryMap) {
          if (speciesName.startsWith(genus)) {
            category = categoryMap[genus];
            break;
          }
        }
        const attributes = defaultAttributes[category] || defaultAttributes["unknown"];

        const watering = await database.getFirstAsync('SELECT id FROM watering_levels WHERE name = ?', [attributes.watering]);
        const sunlight = await database.getFirstAsync('SELECT id FROM sunlight_levels WHERE name = ?', [attributes.sunlight]);
        const growthRate = await database.getFirstAsync('SELECT id FROM growth_rates WHERE name = ?', [attributes.growth_rate]);
        const careLevel = await database.getFirstAsync('SELECT id FROM care_levels WHERE name = ?', [attributes.care_level]);

        try {
          await database.runAsync(
            'INSERT OR IGNORE INTO plant_types (name, watering_id, sunlight_id, growth_rate_id, care_level_id) VALUES (?, ?, ?, ?, ?)',
            [
              speciesName,
              watering ? watering.id : null,
              sunlight ? sunlight.id : null,
              growthRate ? growthRate.id : null,
              careLevel ? careLevel.id : null
            ]
          );
        } catch (error) {
          console.error(`Erro ao inserir ${speciesName}:`, error);
        }
        count++;
      }

      console.log('Dados do Pl@ntNet carregados com sucesso:', Object.keys(speciesMap).length, 'espécies');
    } catch (error) {
      console.error('Erro ao carregar dados do Pl@ntNet:', error);
      Alert.alert(
        'Erro ao Carregar Dados',
        `Não foi possível carregar os dados do Pl@ntNet. Detalhes: ${error.message}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
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
        ? `
          SELECT pt.*, 
                 wl.name as watering_name, 
                 sl.name as sunlight_name, 
                 gr.name as growth_rate_name, 
                 cl.name as care_level_name 
          FROM plant_types pt
          LEFT JOIN watering_levels wl ON pt.watering_id = wl.id
          LEFT JOIN sunlight_levels sl ON pt.sunlight_id = sl.id
          LEFT JOIN growth_rates gr ON pt.growth_rate_id = gr.id
          LEFT JOIN care_levels cl ON pt.care_level_id = cl.id
          WHERE LOWER(wl.name) = ? OR LOWER(sl.name) = ? OR LOWER(gr.name) = ? OR LOWER(cl.name) = ?
        `
        : `
          SELECT pt.*, 
                 wl.name as watering_name, 
                 sl.name as sunlight_name, 
                 gr.name as growth_rate_name, 
                 cl.name as care_level_name 
          FROM plant_types pt
          LEFT JOIN watering_levels wl ON pt.watering_id = wl.id
          LEFT JOIN sunlight_levels sl ON pt.sunlight_id = sl.id
          LEFT JOIN growth_rates gr ON pt.growth_rate_id = gr.id
          LEFT JOIN care_levels cl ON pt.care_level_id = cl.id
        `;
      const params = type ? [type.toLowerCase(), type.toLowerCase(), type.toLowerCase(), type.toLowerCase()] : [];

      console.log('Executando query:', query, 'com params:', params);
      const localTypes = await dbToUse.getAllAsync(query, params);
      console.log('Resultados do banco:', localTypes);

      const typesByCategory = localTypes.reduce((acc, plant) => {
        const plantType = (plant.watering_name?.toLowerCase() || plant.sunlight_name?.toLowerCase() || plant.growth_rate_name?.toLowerCase() || plant.care_level_name?.toLowerCase() || 'unknown');
        if (!acc[plantType]) {
          acc[plantType] = [];
        }
        acc[plantType].push({
          idplant_type: plant.idplant_type,
          name: plant.name,
          type: plantType,
          watering: plant.watering_name || 'Unknown',
          sunlight: plant.sunlight_name || 'Unknown',
          growth_rate: plant.growth_rate_name || 'Unknown',
          care_level: plant.care_level_name || 'Unknown',
        });
        return acc;
      }, {});

      console.log('Tipos agrupados por categoria:', typesByCategory);
      setPlantTypesByType(typesByCategory);

      return typesByCategory;
    } catch (error) {
      console.error('Erro ao carregar tipos de plantas do banco local:', error);
      Alert.alert('Erro', `Não foi possível carregar os tipos de plantas do banco local. Detalhes: ${error.message}`);
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

    if (!plantName.trim() || !creationDate.trim() || !plantTypeId || !imageUri) {
      Alert.alert('Por favor, preencha todos os campos obrigatórios (incluindo a imagem)');
      return;
    }

    if (!currentUserId) {
      Alert.alert(
        'Erro de Autenticação',
        'Nenhum usuário está logado. Por favor, faça logout e tente novamente.',
        [
          {
            text: 'OK',
            onPress: () => logout(),
          },
        ]
      );
      return;
    }

    console.log('Usuário atual (ID):', currentUserId);

    try {
      const imageData = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const blob = `data:image/jpeg;base64,${imageData}`;

      const plantResult = await db.runAsync(
        'INSERT INTO plants (name, image, plant_types_idplant_type) VALUES (?, ?, ?)',
        [plantName.trim(), blob, plantTypeId]
      );
      const plantId = plantResult.lastInsertRowId;

      await db.runAsync(
        'INSERT INTO plants_acc (name, creation_date, description, image, users_iduser, plants_idplant) VALUES (?, ?, ?, ?, ?, ?)',
        [plantName.trim(), creationDate, description.trim(), blob, currentUserId, plantId]
      );

      Alert.alert('Sucesso', 'Planta adicionada com sucesso!');
      setPlantName('');
      setDescription('');
      setCreationDate(new Date().toISOString().split('T')[0]);
      setImageUri(null);
      setPlantTypeId(null);
      setSearchQuery('');
      setSelectedPlantType(null);
      navigation.navigate('YourPlants');
    } catch (error) {
      console.error('Erro ao adicionar planta:', error);
      Alert.alert('Erro', `Não foi possível adicionar a planta. Detalhes: ${error.message}`);
    }
  };

  const handleSelectPlantType = (type) => {
    console.log('Selecionando tipo:', type);
    setSelectedPlantType({ type, name: type.charAt(0).toUpperCase() + type.slice(1) });
    setPlantTypeId(null);
    setSearchQuery('');
  };

  const handleCreatePlantType = async () => {
    if (!db) {
      Alert.alert('Erro', 'Banco de dados não inicializado. Tente novamente.');
      return;
    }

    if (!newPlantTypeName.trim()) {
      Alert.alert('Por favor, preencha pelo menos o nome do tipo de planta.');
      return;
    }

    try {
      const watering = await db.getFirstAsync('SELECT id FROM watering_levels WHERE name = ?', [newPlantWatering || 'Moderate']);
      const sunlight = await db.getFirstAsync('SELECT id FROM sunlight_levels WHERE name = ?', [newPlantSunlight || 'Partial Sun']);
      const growthRate = await db.getFirstAsync('SELECT id FROM growth_rates WHERE name = ?', [newPlantGrowthRate || 'Medium']);
      const careLevel = await db.getFirstAsync('SELECT id FROM care_levels WHERE name = ?', [newPlantCareLevel || 'Moderate']);

      const result = await db.runAsync(
        'INSERT INTO plant_types (name, watering_id, sunlight_id, growth_rate_id, care_level_id) VALUES (?, ?, ?, ?, ?)',
        [
          newPlantTypeName.trim(),
          watering ? watering.id : null,
          sunlight ? sunlight.id : null,
          growthRate ? growthRate.id : null,
          careLevel ? careLevel.id : null
        ]
      );

      const newPlantId = result.lastInsertRowId;
      Alert.alert('Sucesso', 'Novo tipo de planta criado com sucesso!');

      await loadPlantTypesFromLocalDb(db);
      setShowCreateModal(false);

      setNewPlantTypeName('');
      setNewPlantWatering('');
      setNewPlantSunlight('');
      setNewPlantGrowthRate('');
      setNewPlantCareLevel('');

      const newType = (newPlantWatering?.toLowerCase() || newPlantSunlight?.toLowerCase() || newPlantGrowthRate?.toLowerCase() || newPlantCareLevel?.toLowerCase() || 'unknown');
      setSelectedPlantType({ type: newType, name: newPlantTypeName.trim() });
      setPlantTypeId(newPlantId);
      const newPlantDetails = {
        idplant_type: newPlantId,
        name: newPlantTypeName.trim(),
        type: newType,
        watering: newPlantWatering || 'Moderate',
        sunlight: newPlantSunlight || 'Partial Sun',
        growth_rate: newPlantGrowthRate || 'Medium',
        care_level: newPlantCareLevel || 'Moderate',
      };
      setFilteredPlantTypes([...filteredPlantTypes, newPlantDetails]);
    } catch (error) {
      console.error('Erro ao criar novo tipo de planta:', error);
      Alert.alert('Erro', `Não foi possível criar o novo tipo de planta. Detalhes: ${error.message}`);
    }
  };

  const commonPlantTypes = ['succulent', 'tree', 'flower', 'shrub', 'vine', 'low', 'moderate', 'regular', 'full sun', 'partial sun', 'shade', 'slow', 'medium', 'fast', 'easy', 'high'];

  if (isLoading || !isDataLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={[styles.scrollContainer, { paddingBottom: 80 }]}>
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

        <Text style={styles.sectionTitle}>Select Plant Type (Optional)</Text>
        {Object.keys(plantTypesByType).length === 0 ? (
          <Text style={styles.errorText}>Nenhum tipo de planta disponível. Verifique os dados.</Text>
        ) : (
          <View style={styles.typeButtonContainer}>
            {commonPlantTypes.map(type => (
              plantTypesByType[type] && plantTypesByType[type].length > 0 ? (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    selectedPlantType?.type === type && styles.typeButtonSelected,
                  ]}
                  onPress={() => handleSelectPlantType(type)}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      selectedPlantType?.type === type && styles.typeButtonTextSelected,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ) : null
            ))}
            <TouchableOpacity
              style={[styles.typeButton, styles.createButton]}
              onPress={() => setShowCreateModal(true)}
            >
              <Text style={styles.typeButtonText}>Create New Type</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.sectionTitle}>Search Plants</Text>
        <TextInput
          style={styles.input}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={selectedPlantType ? `Search ${selectedPlantType.type.charAt(0).toUpperCase() + selectedPlantType.type.slice(1)}...` : 'Search All Plants...'}
          autoCapitalize="none"
        />

        <View style={styles.dropdownContainer}>
          {filteredPlantTypes.length > 0 ? (
            <RNPickerSelect
              onValueChange={(value) => {
                console.log('Selecionando planta no dropdown:', value);
                setPlantTypeId(value);
              }}
              items={filteredPlantTypes.map(type => ({
                label: type.name,
                value: type.idplant_type,
              }))}
              placeholder={{ label: `Select a plant...`, value: null }}
              style={pickerSelectStyles}
              value={plantTypeId}
            />
          ) : (
            <Text style={styles.infoText}>
              {searchQuery.trim() ? 'Nenhuma planta encontrada com esse termo.' : 'Digite um termo para buscar plantas.'}
            </Text>
          )}
        </View>

        {selectedPlantType && filteredPlantTypes.length > 0 && plantTypeId && (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>{selectedPlantType.name}</Text>
            <Text style={styles.detailsText}>Watering: {selectedPlantType.watering}</Text>
            <Text style={styles.detailsText}>Sunlight: {selectedPlantType.sunlight}</Text>
            <Text style={styles.detailsText}>Growth Rate: {selectedPlantType.growth_rate}</Text>
            <Text style={styles.detailsText}>Care Level: {selectedPlantType.care_level}</Text>
          </View>
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
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { padding: 20, alignItems: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 18, color: '#468585' },
  errorText: { fontSize: 16, color: 'red', marginBottom: 15 },
  infoText: { fontSize: 16, color: '#468585', marginBottom: 15, textAlign: 'center' },
  title: { fontSize: 24, color: '#468585', marginBottom: 20 },
  sectionTitle: { fontSize: 18, color: '#468585', marginBottom: 10, alignSelf: 'flex-start' },
  imageContainer: { position: 'relative', marginBottom: 20, width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: '#468585', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' },
  image: { width: 96, height: 96, borderRadius: 48 },
  addImageText: { color: '#468585', fontSize: 16 },
  addIcon: { position: 'absolute', bottom: 5, right: 5, backgroundColor: '#468585', color: '#fff', width: 20, height: 20, textAlign: 'center', borderRadius: 10, fontSize: 14 },
  input: { width: '100%', borderWidth: 1, borderColor: '#468585', borderRadius: 10, padding: 10, marginBottom: 15, fontSize: 16 },
  descriptionInput: { height: 100, textAlignVertical: 'top' },
  typeButtonContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 15 },
  typeButton: { backgroundColor: '#f0f0f0', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, margin: 5, borderWidth: 1, borderColor: '#468585' },
  typeButtonSelected: { backgroundColor: '#468585' },
  typeButtonText: { color: '#468585', fontSize: 14 },
  typeButtonTextSelected: { color: '#fff' },
  dropdownContainer: { width: '100%', marginBottom: 15 },
  detailsContainer: { width: '100%', padding: 10, borderWidth: 1, borderColor: '#468585', borderRadius: 10, marginBottom: 15 },
  detailsTitle: { fontSize: 18, color: '#468585', marginBottom: 5 },
  detailsText: { fontSize: 14, color: '#333', marginBottom: 3 },
  addButton: { backgroundColor: '#B0A8F0', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, marginBottom: 20 },
  addButtonText: { color: '#fff', fontSize: 16 },
  createButton: { backgroundColor: '#B0A8F0' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContainer: { width: '90%', backgroundColor: '#fff', borderRadius: 10, padding: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 20, color: '#468585', marginBottom: 15, textAlign: 'center' },
  modalButtonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  modalButton: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', marginHorizontal: 5 },
  cancelButton: { backgroundColor: '#ccc' },
  modalButtonText: { color: '#fff', fontSize: 16 },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: { width: '100%', borderWidth: 1, borderColor: '#468585', borderRadius: 10, padding: 10, fontSize: 16, color: '#000' },
  inputAndroid: { width: '100%', borderWidth: 1, borderColor: '#468585', borderRadius: 10, padding: 10, fontSize: 16, color: '#000' },
});