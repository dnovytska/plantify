import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView, Modal } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { useRoute, useNavigation } from '@react-navigation/native';
import BottomBar from '../components/BottomBar';
import RNPickerSelect from 'react-native-picker-select';
import { openDatabase, initializeDatabase } from '../DB/db';

export default function EditPlantScreen() {
  const route = useRoute();
  const { plantId } = route.params || {};
  const navigation = useNavigation();
  const [plantName, setPlantName] = useState('');
  const [description, setDescription] = useState('');
  const [creationDate, setCreationDate] = useState('');
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

  const wateringOptions = ['Low', 'Moderate', 'Regular'];
  const sunlightOptions = ['Full Sun', 'Partial Sun', 'Shade'];
  const growthRateOptions = ['Slow', 'Medium', 'Fast'];
  const careLevelOptions = ['Easy', 'Moderate', 'High'];

  useEffect(() => {
    const fetchPlantDetails = async () => {
      if (!plantId) {
        console.error("plantId é undefined na EditPlantScreen!");
        Alert.alert("Erro", "ID da planta não fornecido.");
        return;
      }

      try {
        const database = await openDatabase();
        await initializeDatabase(database);
        setDb(database);

        // Fetch plant details
        console.log("Buscando detalhes da planta para edição com ID:", plantId);
        const plantData = await database.getFirstAsync(
          `SELECT pa.idplants_acc, pa.name, pa.creation_date, pa.description, pa.image, 
                  pt.idplant_type, pt.name AS type_name, wl.name AS watering_name, 
                  sl.name AS sunlight_name, gr.name AS growth_rate_name, cl.name AS care_level_name 
           FROM plants_acc pa 
           JOIN plants p ON pa.idplant = p.idplant 
           JOIN plant_types pt ON p.plant_type_id = pt.idplant_type 
           LEFT JOIN watering_levels wl ON pt.watering_id = wl.idwatering_level
           LEFT JOIN sunlight_levels sl ON pt.sunlight_id = sl.idsunlight_level
           LEFT JOIN growth_rates gr ON pt.growth_rate_id = gr.idgrowth_rate
           LEFT JOIN care_levels cl ON pt.care_level_id = cl.idcare_level
           WHERE pa.idplants_acc = ?`,
          [plantId]
        );

        if (!plantData) {
          console.log("Planta não encontrada com ID:", plantId);
          Alert.alert("Erro", "Planta não encontrada.");
          return;
        }

        console.log("Dados da planta encontrados para edição:", plantData);

        setPlantName(plantData.name || '');
        setDescription(plantData.description || '');
        setCreationDate(new Date(plantData.creation_date).toISOString().split('T')[0]);
        setImageUri(plantData.image || null);
        setPlantTypeId(plantData.idplant_type);
        setSelectedPlantType({
          idplant_type: plantData.idplant_type,
          name: plantData.type_name,
          type: (plantData.watering_name?.toLowerCase() || plantData.sunlight_name?.toLowerCase() || 
                 plantData.growth_rate_name?.toLowerCase() || plantData.care_level_name?.toLowerCase() || 'unknown'),
          watering: plantData.watering_name || 'Unknown',
          sunlight: plantData.sunlight_name || 'Unknown',
          growth_rate: plantData.growth_rate_name || 'Unknown',
          care_level: plantData.care_level_name || 'Unknown',
        });

        // Load plant types
        await loadPlantTypesFromLocalDb(database);
        setIsDataLoaded(true);
      } catch (error) {
        console.error("Erro ao buscar detalhes da planta para edição:", error);
        Alert.alert("Erro", "Falha ao carregar os detalhes da planta: " + error.message);
      }
    };

    fetchPlantDetails();
  }, [plantId]);

  useEffect(() => {
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
      const selectedPlant = filteredPlantTypes.find(p => p.idplant_type === plantTypeId);
      setSelectedPlantType(selectedPlant);
    }
  }, [plantTypeId, filteredPlantTypes]);

  useEffect(() => {
    if (db && selectedPlantType) {
      console.log('Carregando tipos para selectedPlantType:', selectedPlantType);
      loadPlantTypesFromLocalDb(db, selectedPlantType.type);
    }
  }, [selectedPlantType, db]);

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
          LEFT JOIN watering_levels wl ON pt.watering_id = wl.idwatering_level
          LEFT JOIN sunlight_levels sl ON pt.sunlight_id = sl.idsunlight_level
          LEFT JOIN growth_rates gr ON pt.growth_rate_id = gr.idgrowth_rate
          LEFT JOIN care_levels cl ON pt.care_level_id = cl.idcare_level
          WHERE LOWER(wl.name) = ? OR LOWER(sl.name) = ? OR LOWER(gr.name) = ? OR LOWER(cl.name) = ?
        `
        : `
          SELECT pt.*, 
                 wl.name as watering_name, 
                 sl.name as sunlight_name, 
                 gr.name as growth_rate_name, 
                 cl.name as care_level_name 
          FROM plant_types pt
          LEFT JOIN watering_levels wl ON pt.watering_id = wl.idwatering_level
          LEFT JOIN sunlight_levels sl ON pt.sunlight_id = sl.idsunlight_level
          LEFT JOIN growth_rates gr ON pt.growth_rate_id = gr.idgrowth_rate
          LEFT JOIN care_levels cl ON pt.care_level_id = cl.idcare_level
        `;
      const params = type ? [type.toLowerCase(), type.toLowerCase(), type.toLowerCase(), type.toLowerCase()] : [];

      console.log('Executando query:', query, 'com params:', params);
      const localTypes = await dbToUse.getAllAsync(query, params);
      console.log('Resultados do banco:', localTypes);

      const typesByCategory = localTypes.reduce((acc, plantType) => {
        const typeCategory = (plantType.watering_name?.toLowerCase() || plantType.sunlight_name?.toLowerCase() || 
                             plantType.growth_rate_name?.toLowerCase() || plantType.care_level_name?.toLowerCase() || 'unknown');
        if (!acc[typeCategory]) {
          acc[typeCategory] = [];
        }
        acc[typeCategory].push({
          idplant_type: plantType.idplant_type,
          name: plantType.name,
          type: typeCategory,
          watering: plantType.watering_name || 'Unknown',
          sunlight: plantType.sunlight_name || 'Unknown',
          growth_rate: plantType.growth_rate_name || 'Unknown',
          care_level: plantType.care_level_name || 'Unknown',
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

  const handleSave = async () => {
    if (!db) {
      Alert.alert('Erro', 'Banco de dados não inicializado. Tente novamente.');
      return;
    }

    if (!plantName.trim() || !plantTypeId || !imageUri) {
      Alert.alert('Por favor, preencha todos os campos obrigatórios (incluindo a imagem)');
      return;
    }

    try {
      const imageData = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const blob = `data:image/jpeg;base64,${imageData}`;

      // Update plants table
      const plantRecord = await db.getFirstAsync(
        `SELECT idplant FROM plants_acc WHERE idplants_acc = ?`,
        [plantId]
      );
      if (plantRecord) {
        await db.runAsync(
          `UPDATE plants SET name = ?, image = ?, plant_type_id = ? 
           WHERE idplant = ?`,
          [plantName.trim(), blob, plantTypeId, plantRecord.idplant]
        );
      }

      // Update plants_acc table
      await db.runAsync(
        `UPDATE plants_acc SET name = ?, description = ?, image = ? 
         WHERE idplants_acc = ?`,
        [plantName.trim(), description, blob, plantId]
      );

      Alert.alert("Sucesso", "Planta atualizada!");
      navigation.navigate('PlantScreen', { plantId });
    } catch (error) {
      console.error("Erro ao salvar edição:", error);
      Alert.alert("Erro", "Falha ao atualizar a planta: " + error.message);
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
      const watering = await db.getFirstAsync('SELECT idwatering_level FROM watering_levels WHERE name = ?', [newPlantWatering || 'Moderate']);
      const sunlight = await db.getFirstAsync('SELECT idsunlight_level FROM sunlight_levels WHERE name = ?', [newPlantSunlight || 'Partial Sun']);
      const growthRate = await db.getFirstAsync('SELECT idgrowth_rate FROM growth_rates WHERE name = ?', [newPlantGrowthRate || 'Medium']);
      const careLevel = await db.getFirstAsync('SELECT idcare_level FROM care_levels WHERE name = ?', [newPlantCareLevel || 'Moderate']);

      const result = await db.runAsync(
        'INSERT INTO plant_types (name, watering_id, sunlight_id, growth_rate_id, care_level_id) VALUES (?, ?, ?, ?, ?)',
        [
          newPlantTypeName.trim(),
          watering ? watering.idwatering_level : null,
          sunlight ? sunlight.idsunlight_level : null,
          growthRate ? growthRate.idgrowth_rate : null,
          careLevel ? careLevel.idcare_level : null
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

      const newType = (newPlantWatering?.toLowerCase() || newPlantSunlight?.toLowerCase() || 
                      newPlantGrowthRate?.toLowerCase() || newPlantCareLevel?.toLowerCase() || 'unknown');
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

  if (!isDataLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={[styles.scrollContainer, { paddingBottom: 80 }]}>
        <Text style={styles.title}>Edit Plant</Text>

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
          editable={false}
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

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Create New Plant Type</Text>
            <TextInput
              style={styles.input}
              value={newPlantTypeName}
              onChangeText={setNewPlantTypeName}
              placeholder="Plant Type Name"
              autoCapitalize="words"
            />
            <Text style={styles.label}>Watering:</Text>
            <RNPickerSelect
              onValueChange={setNewPlantWatering}
              items={wateringOptions.map(option => ({ label: option, value: option }))}
              placeholder={{ label: 'Select Watering...', value: null }}
              style={pickerSelectStyles}
              value={newPlantWatering}
            />
            <Text style={styles.label}>Sunlight:</Text>
            <RNPickerSelect
              onValueChange={setNewPlantSunlight}
              items={sunlightOptions.map(option => ({ label: option, value: option }))}
              placeholder={{ label: 'Select Sunlight...', value: null }}
              style={pickerSelectStyles}
              value={newPlantSunlight}
            />
            <Text style={styles.label}>Growth Rate:</Text>
            <RNPickerSelect
              onValueChange={setNewPlantGrowthRate}
              items={growthRateOptions.map(option => ({ label: option, value: option }))}
              placeholder={{ label: 'Select Growth Rate...', value: null }}
              style={pickerSelectStyles}
              value={newPlantGrowthRate}
            />
            <Text style={styles.label}>Care Level:</Text>
            <RNPickerSelect
              onValueChange={setNewPlantCareLevel}
              items={careLevelOptions.map(option => ({ label: option, value: option }))}
              placeholder={{ label: 'Select Care Level...', value: null }}
              style={pickerSelectStyles}
              value={newPlantCareLevel}
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#468585' }]}
                onPress={handleCreatePlantType}
              >
                <Text style={styles.modalButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomBar />
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
    backgroundColor: '#f0f0f0' 
  },
  image: { width: 96, height: 96, borderRadius: 48 },
  addImageText: { color: '#468585', fontSize: 16 },
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
    fontSize: 14 
  },
  input: { 
    width: '100%', 
    borderWidth: 1, 
    borderColor: '#468585', 
    borderRadius: 10, 
    padding: 10, 
    marginBottom: 15, 
    fontSize: 16 
  },
  descriptionInput: { height: 100, textAlignVertical: 'top' },
  typeButtonContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 15 },
  typeButton: { 
    backgroundColor: '#f0f0f0', 
    paddingVertical: 8, 
    paddingHorizontal: 15, 
    borderRadius: 20, 
    margin: 5, 
    borderWidth: 1, 
    borderColor: '#468585' 
  },
  typeButtonSelected: { backgroundColor: '#468585' },
  typeButtonText: { color: '#468585', fontSize: 14 },
  typeButtonTextSelected: { color: '#fff' },
  createButton: { backgroundColor: '#B0A8F0' },
  dropdownContainer: { width: '100%', marginBottom: 15 },
  detailsContainer: { 
    width: '100%', 
    padding: 10, 
    borderWidth: 1, 
    borderColor: '#468585', 
    borderRadius: 10, 
    marginBottom: 15 
  },
  detailsTitle: { fontSize: 18, color: '#468585', marginBottom: 5 },
  detailsText: { fontSize: 14, color: '#333', marginBottom: 3 },
  saveButton: { 
    backgroundColor: '#468585', 
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    borderRadius: 20, 
    marginBottom: 20 
  },
  saveButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    textAlign: 'center' 
  },
  modalOverlay: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0, 0, 0, 0.5)' 
  },
  modalContainer: { 
    width: '90%', 
    backgroundColor: '#fff', 
    borderRadius: 10, 
    padding: 20, 
    maxHeight: '80%' 
  },
  modalTitle: { 
    fontSize: 20, 
    color: '#468585', 
    marginBottom: 15, 
    textAlign: 'center' 
  },
  label: { fontSize: 16, color: "#468585", marginBottom: 5 },
  modalButtonContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 10 
  },
  modalButton: { 
    flex: 1, 
    paddingVertical: 10, 
    borderRadius: 10, 
    alignItems: 'center', 
    marginHorizontal: 5 
  },
  cancelButton: { backgroundColor: '#ccc' },
  modalButtonText: { color: '#fff', fontSize: 16 },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: { 
    width: '100%', 
    borderWidth: 1, 
    borderColor: '#468585', 
    borderRadius: 10, 
    padding: 10, 
    fontSize: 16, 
    color: '#000' 
  },
  inputAndroid: { 
    width: '100%', 
    borderWidth: 1, 
    borderColor: '#468585', 
    borderRadius: 10, 
    padding: 10, 
    fontSize: 16, 
    color: '#000' 
  },
});