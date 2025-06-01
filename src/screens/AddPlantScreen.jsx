import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import BottomBar from '../components/BottomBar';
import RNPickerSelect from 'react-native-picker-select';
import { openDatabase, initializeDatabase } from '../DB/db';
import { Asset } from 'expo-asset';
import { useAssets } from 'expo-asset';


/*
let SPECIES_ASSET = null;
let METADATA_ASSET = null;

// Definindo os ativos JSON
//const SPECIES_ASSET = Asset.fromModule(require('../../assets/plantnet/plantnet300K_species_id_2_name.json'));
//const METADATA_ASSET = Asset.fromModule(require('../../assets/plantnet/plantnet300K_metadata.json'));

try {
  SPECIES_ASSET = Asset.fromModule(require('../../assets/plantnet/plantnet300K_species_id_2_name.json'));
  METADATA_ASSET = Asset.fromModule(require('../../assets/plantnet/plantnet300K_metadata.json'));
  console.log('Assets JSON encontrados e carregados.');
} catch (err) {
  console.error('Erro ao carregar assets JSON:', err);
}
*/

export default function AddPlantScreen() {
  const { user } = useContext(AuthContext);
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
  
  const [assets, error] = useAssets([
    require('../../assets/plantnet/plantnet300K_species_id_2_name.json'),
    require('../../assets/plantnet/plantnet300K_metadata.json'),
  ]);

  useEffect(() => {
    const initDbAndLoadTypes = async () => {
      try {
        const database = await openDatabase();
        setDb(database);
        await initializeDatabase(database);

        // Carregar os arquivos JSON do bundle
        await SPECIES_ASSET.downloadAsync();
        await METADATA_ASSET.downloadAsync();

        const speciesData = await FileSystem.readAsStringAsync(assets[0].localUri);
        const metadataData = await FileSystem.readAsStringAsync(assets[1].localUri);
        const speciesMap = JSON.parse(speciesData);
        const metadata = JSON.parse(metadataData);

        // Limpar e carregar dados no banco
        await database.execAsync('DELETE FROM plant_types;');
        if ((await database.getFirstAsync('SELECT COUNT(*) as count FROM plant_types;')).count === 0) {
          await loadPlantNetData(database, speciesMap, metadata); // Função que você já deve ter definida
        }

        await loadPlantTypesFromLocalDb(database); // Função que você já deve ter definida
        setIsDataLoaded(true);
      } catch (error) {
        console.error('Erro ao inicializar o banco de dados:', error);
        Alert.alert('Erro', `Não foi possível carregar os dados: ${error.message}`);
      }
    };
    initDbAndLoadTypes();
  }, []);

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
      loadPlantTypesFromLocalDb(db, selectedPlantType);
    }
  }, [selectedPlantType, db]);

  const loadPlantNetData = async (database) => {
    try {
      // Carregar os arquivos JSON do sistema de arquivos
      const speciesData = await FileSystem.readAsStringAsync(SPECIES_FILE);
      const metadataData = await FileSystem.readAsStringAsync(METADATA_FILE);
      const speciesMap = JSON.parse(speciesData);
      const metadata = JSON.parse(metadataData);

      // Mapeamento simplificado de categorias baseado no nome científico
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

      // Valores padrão por categoria
      const defaultAttributes = {
        "succulent": { watering: "Low", sunlight: "Full Sun", growth_rate: "Slow", care_level: "Easy" },
        "tree": { watering: "Moderate", sunlight: "Full Sun", growth_rate: "Slow", care_level: "Moderate" },
        "flower": { watering: "Regular", sunlight: "Full Sun", growth_rate: "Medium", care_level: "Moderate" },
        "vine": { watering: "Moderate", sunlight: "Partial Sun", growth_rate: "Fast", care_level: "Moderate" },
        "shrub": { watering: "Regular", sunlight: "Partial Sun", growth_rate: "Medium", care_level: "Moderate" }
      };

      // Inserir cada espécie no banco de dados
      for (const speciesId in speciesMap) {
        const speciesName = speciesMap[speciesId];
        let category = "unknown";
        for (const genus in categoryMap) {
          if (speciesName.startsWith(genus)) {
            category = categoryMap[genus];
            break;
          }
        }
        const attributes = defaultAttributes[category] || {
          watering: "Moderate",
          sunlight: "Partial Sun",
          growth_rate: "Medium",
          care_level: "Moderate"
        };

        // Buscar os IDs correspondentes aos valores
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
        const plantType = plant.watering_name?.toLowerCase() || plant.sunlight_name?.toLowerCase() || plant.growth_rate_name?.toLowerCase() || plant.care_level_name?.toLowerCase() || 'unknown';
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

    try {
      // Converter a imagem para BLOB
      const imageData = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const blob = `data:image/jpeg;base64,${imageData}`;

      // Inserir primeiro na tabela plants
      const plantResult = await db.runAsync(
        'INSERT INTO plants (name, image, plant_types_idplant_type) VALUES (?, ?, ?)',
        [plantName.trim(), blob, plantTypeId]
      );
      const plantId = plantResult.lastInsertRowId;

      // Inserir na tabela plants_acc usando o plantId gerado
      await db.runAsync(
        'INSERT INTO plants_acc (name, creation_date, description, image, users_iduser, plants_idplant) VALUES (?, ?, ?, ?, ?, ?)',
        [plantName.trim(), creationDate, description.trim(), blob, user.iduser, plantId]
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
      Alert.alert('Erro', `Não foi possível adicionar a planta. Detalhes: ${error.message}`);
    }
  };

  const handleSelectPlantType = (type) => {
    console.log('Selecionando tipo:', type);
    setSelectedPlantType(type);
    setPlantTypeId(null);
    setSearchQuery('');
    setSelectedPlantType(null);
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
      // Buscar os IDs correspondentes aos valores selecionados
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

      // Atualizar a lista de tipos de plantas
      await loadPlantTypesFromLocalDb(db);
      setShowCreateModal(false);

      // Limpar o formulário
      setNewPlantTypeName('');
      setNewPlantWatering('');
      setNewPlantSunlight('');
      setNewPlantGrowthRate('');
      setNewPlantCareLevel('');

      // Selecionar o novo tipo de planta criado
      setSelectedPlantType(newPlantWatering?.toLowerCase() || newPlantSunlight?.toLowerCase() || newPlantGrowthRate?.toLowerCase() || newPlantCareLevel?.toLowerCase() || 'unknown');
      setPlantTypeId(newPlantId);
      const newPlantDetails = {
        idplant_type: newPlantId,
        name: newPlantTypeName.trim(),
        type: newPlantWatering?.toLowerCase() || newPlantSunlight?.toLowerCase() || newPlantGrowthRate?.toLowerCase() || newPlantCareLevel?.toLowerCase() || 'unknown',
        watering: newPlantWatering || 'Moderate',
        sunlight: newPlantSunlight || 'Partial Sun',
        growth_rate: newPlantGrowthRate || 'Medium',
        care_level: newPlantCareLevel || 'Moderate',
      };
      setSelectedPlantDetails(newPlantDetails);
      setFilteredPlantTypes([...filteredPlantTypes, newPlantDetails]);
    } catch (error) {
      console.error('Erro ao criar novo tipo de planta:', error);
      Alert.alert('Erro', `Não foi possível criar o novo tipo de planta. Detalhes: ${error.message}`);
    }
  };

  const commonPlantTypes = ['succulent', 'tree', 'flower', 'shrub', 'vine', 'low', 'moderate', 'regular', 'full sun', 'partial sun', 'shade', 'slow', 'medium', 'fast', 'easy', 'high'];

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
          <Text style={styles.errorText}>Nenhum tipo de planta disponível. Verifique os dados.</Text>
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
            <TouchableOpacity
              style={[styles.typeButton, styles.createButton]}
              onPress={() => setShowCreateModal(true)}
            >
              <Text style={styles.typeButtonText}>Create New Type</Text>
            </TouchableOpacity>
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
                  label: type.name,
                  value: type.idplant_type,
                }))}
                placeholder={{ label: `Select a ${selectedPlantType}...`, value: null }}
                style={pickerSelectStyles}
                value={plantTypeId}
              />
            </View>

            {selectedPlantDetails && (
              <View style={styles.detailsContainer}>
                <Text style={styles.detailsTitle}>{selectedPlantDetails.name}</Text>
                <Text style={styles.detailsText}>Watering: {selectedPlantDetails.watering}</Text>
                <Text style={styles.detailsText}>Sunlight: {selectedPlantDetails.sunlight}</Text>
                <Text style={styles.detailsText}>Growth Rate: {selectedPlantDetails.growth_rate}</Text>
                <Text style={styles.detailsText}>Care Level: {selectedPlantDetails.care_level}</Text>
              </View>
            )}
          </>
        )}

        <TouchableOpacity style={styles.addButton} onPress={handleAddPlant}>
          <Text style={styles.addButtonText}>Add Plant</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal para criar novo tipo de planta */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Create New Plant Type</Text>
            <ScrollView>
              <TextInput
                style={styles.input}
                value={newPlantTypeName}
                onChangeText={setNewPlantTypeName}
                placeholder="Plant Type Name (e.g., Monstera Deliciosa)"
                autoCapitalize="words"
              />
              <View style={styles.dropdownContainer}>
                <RNPickerSelect
                  onValueChange={(value) => setNewPlantWatering(value)}
                  items={wateringOptions.map(option => ({ label: option, value: option }))}
                  placeholder={{ label: 'Select Watering Level...', value: '' }}
                  style={pickerSelectStyles}
                  value={newPlantWatering}
                />
              </View>
              <View style={styles.dropdownContainer}>
                <RNPickerSelect
                  onValueChange={(value) => setNewPlantSunlight(value)}
                  items={sunlightOptions.map(option => ({ label: option, value: option }))}
                  placeholder={{ label: 'Select Sunlight Level...', value: '' }}
                  style={pickerSelectStyles}
                  value={newPlantSunlight}
                />
              </View>
              <View style={styles.dropdownContainer}>
                <RNPickerSelect
                  onValueChange={(value) => setNewPlantGrowthRate(value)}
                  items={growthRateOptions.map(option => ({ label: option, value: option }))}
                  placeholder={{ label: 'Select Growth Rate...', value: '' }}
                  style={pickerSelectStyles}
                  value={newPlantGrowthRate}
                />
              </View>
              <View style={styles.dropdownContainer}>
                <RNPickerSelect
                  onValueChange={(value) => setNewPlantCareLevel(value)}
                  items={careLevelOptions.map(option => ({ label: option, value: option }))}
                  placeholder={{ label: 'Select Care Level...', value: '' }}
                  style={pickerSelectStyles}
                  value={newPlantCareLevel}
                />
              </View>
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.createButton]}
                  onPress={handleCreatePlantType}
                >
                  <Text style={styles.modalButtonText}>Create</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowCreateModal(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

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
  createButton: {
    backgroundColor: '#B0A8F0',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    color: '#468585',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  createButton: {
    backgroundColor: '#B0A8F0',
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  modalButtonText: {
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