import React, { useState, useEffect, useCallback, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useNavigation, useRoute } from '@react-navigation/native';
import BottomBar from '../components/BottomBar';
import RNPickerSelect from 'react-native-picker-select';
import { openDatabase, initializeDatabase } from '../DB/db';
import * as Notifications from 'expo-notifications';
import { AuthContext } from '../context/AuthContext';
import debounce from 'lodash/debounce';

export default function AddPlantScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user, loggedIn, isLoading } = useContext(AuthContext);
  const { imageUri: initialImageUri, plantName: initialPlantName, plantTypeId: initialPlantTypeId } = route.params || {};
  const [plantName, setPlantName] = useState(initialPlantName || '');
  const [description, setDescription] = useState('');
  const [creationDate, setCreationDate] = useState(new Date().toISOString().split('T')[0]);
  const [plantTypeId, setPlantTypeId] = useState(initialPlantTypeId || null);
  const [plantTypesByType, setPlantTypesByType] = useState({});
  const [selectedPlantType, setSelectedPlantType] = useState(null);
  const [filteredPlantTypes, setFilteredPlantTypes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [imageUri, setImageUri] = useState(initialImageUri || 'https://storage.googleapis.com/tagjs-prod.appspot.com/RXQ247PXg9/820zgqtn.png');
  const [db, setDb] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [newPlantTypeName, setNewPlantTypeName] = useState('');
  const [newPlantWatering, setNewPlantWatering] = useState('');
  const [newPlantSunlight, setNewPlantSunlight] = useState('');
  const [newPlantGrowthRate, setNewPlantGrowthRate] = useState('');
  const [newPlantCareLevel, setNewPlantCareLevel] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

const wateringOptions = ['Pouca', 'Moderada', 'Regular'];
const sunlightOptions = ['Sol Pleno', 'Meia Sombra', 'Sombra'];
const growthRateOptions = ['Lento', 'Médio', 'Rápido'];
const careLevelOptions = ['Fácil', 'Moderado', 'Exigente'];


  console.log('AddPlantScreen - Estado inicial:', { user, loggedIn, isLoading });

  useEffect(() => {
    const initialize = async () => {
      if (isLoading) {
        console.log('Aguardando AuthContext carregar...');
        return;
      }

      if (!user || !user.iduser || !loggedIn) {
        console.warn('utilizador não logado ou iduser ausente:', { user, loggedIn });
        Alert.alert('Erro', 'Você precisa estar logado para adicionar uma planta. Faça login primeiro.');
        navigation.navigate('Login');
        return;
      }

      try {
        console.log('Inicializando Base de dados para AddPlantScreen...');
        const database = await openDatabase();
        await initializeDatabase(database);
        setDb(database);
        await loadPlantTypesFromLocalDb(database);

        if (initialPlantTypeId) {
          const plantTypeData = await database.getFirstAsync(
            `SELECT pt.idplant_type, pt.name AS type_name,
                    wl.name AS watering_name, sl.name AS sunlight_name,
                    gr.name AS growth_rate_name, cl.name AS care_level_name
             FROM plant_types pt
             LEFT JOIN watering_levels wl ON pt.watering_id = wl.idwatering_level
             LEFT JOIN sunlight_levels sl ON pt.sunlight_id = sl.idsunlight_level
             LEFT JOIN growth_rates gr ON pt.growth_rate_id = gr.idgrowth_rate
             LEFT JOIN care_levels cl ON pt.care_level_id = cl.idcare_level
             WHERE pt.idplant_type = ?`,
            [initialPlantTypeId]
          );
          if (plantTypeData) {
            setSelectedPlantType({
              idplant_type: plantTypeData.idplant_type,
              name: plantTypeData.type_name,
              type: 'existing',
              watering: plantTypeData.watering_name || 'Unknown',
              sunlight: plantTypeData.sunlight_name || 'Unknown',
              growth_rate: plantTypeData.growth_rate_name || 'Unknown',
              care_level: plantTypeData.care_level_name || 'Unknown',
            });
            setSearchQuery(plantTypeData.type_name);
            setPlantTypeId(plantTypeData.idplant_type);
          }
        }

        setIsDataLoaded(true);
        console.log('Inicialização concluída, user:', user);
      } catch (error) {
        console.error('Erro ao inicializar a AddPlantScreen:', error);
        Alert.alert('Erro', `Falha ao inicializar: ${error.message}`);
      }
    };
    initialize();
  }, [user, loggedIn, isLoading, initialPlantTypeId, navigation]);

  const loadPlantTypesFromLocalDb = async (database, type = null) => {
    try {
      const dbToUse = database || db;
      if (!dbToUse) {
        console.log('Base de dados não inicializado');
        return {};
      }

      const query = `
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
      const params = [];

      console.log('Executando query:', query, 'com params:', params);
      const localTypes = await dbToUse.getAllAsync(query, params);
      console.log('Resultados do Base:', localTypes);

      const typesByCategory = localTypes.reduce((acc, plantType) => {
        const typeCategory = 'existing'; // Agrupa tudo como 'existing'
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
      console.error('Erro ao carregar tipos de plantas do Base local:', error);
      Alert.alert('Erro', `Não foi possível carregar os tipos de plantas do Base local. Detalhes: ${error.message}`);
      return {};
    }
  };

  const filterPlantTypes = useCallback(
    debounce((query, selectedType, typesByType) => {
      console.log('Filtrando tipos com query:', query, 'selectedType:', selectedType, 'typesByType:', typesByType);
      if (Object.keys(typesByType).length === 0) {
        console.log('Nenhum dado de plantas disponível');
        setFilteredPlantTypes([]);
        return;
      }

      let typesToFilter = [];
      if (selectedType?.type === 'existing') {
        console.log('Buscando em tipos existentes');
        typesToFilter = typesByType['existing'] || [];
      } else {
        console.log('Nenhum tipo selecionado para filtrar');
        typesToFilter = [];
      }

      if (query.trim() === '') {
        setFilteredPlantTypes(typesToFilter);
      } else {
        const filtered = typesToFilter.filter(type =>
          type.name.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredPlantTypes(filtered);
      }
      console.log('Tipos filtrados:', filteredPlantTypes);
    }, 300),
    []
  );

  useEffect(() => {
    filterPlantTypes(searchQuery, selectedPlantType, plantTypesByType);
  }, [searchQuery, selectedPlantType, plantTypesByType, filterPlantTypes]);

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
      console.warn('Base de dados não inicializado');
      Alert.alert('Erro', 'Base de dados não inicializado. Tente novamente.');
      return;
    }

    if (!user || !user.iduser || !loggedIn) {
      console.warn('utilizador não logado ao tentar salvar:', { user, loggedIn });
      Alert.alert('Erro', 'Você precisa estar logado para adicionar uma planta. Faça login primeiro.');
      navigation.navigate('Login');
      return;
    }

    if (!plantName.trim() || !plantTypeId || !imageUri) {
      console.warn('Campos obrigatórios não preenchidos:', { plantName, plantTypeId, imageUri });
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios (nome, tipo de planta, imagem).');
      return;
    }

    try {
      let imageBlob = imageUri;
      if (!imageUri.startsWith('data:image')) {
        console.log('Convertendo imagem para Base64');
        const imageData = await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        imageBlob = `data:image/jpeg;base64,${imageData}`;
      }

      await db.withTransactionAsync(async () => {
        // Inserir em plants
        const plantResult = await db.runAsync(
          `INSERT INTO plants (name, image, plant_type_id) VALUES (?, ?, ?)`,
          [plantName.trim(), imageBlob, plantTypeId]
        );
        const newPlantId = plantResult.lastInsertRowId;
        console.log('Planta criada:', { idplant: newPlantId, name: plantName });

        // Inserir em plants_acc
        const plantAccResult = await db.runAsync(
          `INSERT INTO plants_acc (name, creation_date, description, image, iduser, idplant) VALUES (?, ?, ?, ?, ?, ?)`,
          [plantName.trim(), creationDate, description || 'Planta criada pelo utilizador', imageBlob, user.iduser, newPlantId]
        );
        const plantAccId = plantAccResult.lastInsertRowId;
        console.log('Planta associada:', { idplants_acc: plantAccId, iduser: user.iduser, idplant: newPlantId });
      });

      console.log('Planta salva com sucesso, navegando para YourPlants com user:', user);
      Alert.alert('Sucesso', 'Planta adicionada com sucesso!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('YourPlants'),
        },
      ]);
    } catch (error) {
      console.error('Erro ao adicionar a planta:', error);
      Alert.alert('Erro', `Falha ao adicionar a planta: ${error.message}`);
    }
  };

  const handleSelectPlantType = (type) => {
    console.log('Selecionando tipo:', type);
    if (type === 'existing') {
      setSelectedPlantType({ type: 'existing', name: 'Tipo Existente' });
      setPlantTypeId(null);
      setSearchQuery('');
    }
  };

  const handleCreatePlantType = async () => {
    if (!db) {
      console.warn('Base de dados não inicializado');
      Alert.alert('Erro', 'Base de dados não inicializado. Tente novamente.');
      return;
    }

    if (!newPlantTypeName.trim()) {
      console.warn('Nome do tipo de planta não preenchido');
      Alert.alert('Erro', 'Por favor, preencha pelo menos o nome do tipo de planta.');
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
      console.log('Novo tipo de planta criado:', { id: newPlantId, name: newPlantTypeName });
      Alert.alert('Sucesso', 'Novo tipo de planta criado com sucesso!');

      await loadPlantTypesFromLocalDb(db);
      setShowCreateModal(false);

      setNewPlantTypeName('');
      setNewPlantWatering('');
      setNewPlantSunlight('');
      setNewPlantGrowthRate('');
      setNewPlantCareLevel('');

      setSelectedPlantType({ type: 'existing', name: newPlantTypeName.trim() });
      setPlantTypeId(newPlantId);
      const newPlantDetails = {
        idplant_type: newPlantId,
        name: newPlantTypeName.trim(),
        type: 'existing',
        watering: newPlantWatering || 'Moderate',
        sunlight: newPlantSunlight || 'Partial Sun',
        growth_rate: newPlantGrowthRate || 'Medium',
        care_level: newPlantCareLevel || 'Moderate',
      };
      setFilteredPlantTypes([...filteredPlantTypes, newPlantDetails]);
      setSearchQuery(newPlantTypeName.trim());
    } catch (error) {
      console.error('Erro ao criar novo tipo de planta:', error);
      Alert.alert('Erro', `Não foi possível criar o novo tipo de planta. Detalhes: ${error.message}`);
    }
  };

  if (!isDataLoaded || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={[styles.scrollContainer, { paddingBottom: 80 }]}>
        <Text style={styles.title}>Adicionar Planta</Text>

        <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <Text style={styles.addImageText}>Adicionar Imagem</Text>
          )}
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Criador:</Text>
        <TextInput
          style={[styles.input, { backgroundColor: '#f0f0f0' }]}
          value={user?.name || 'Desconhecido'}
          editable={false}
        />

        <TextInput
          style={styles.input}
          value={plantName}
          onChangeText={setPlantName}
          placeholder="Nome da Planta"
          autoCapitalize="words"
        />
        <TextInput
          style={[styles.input, styles.descriptionInput]}
          value={description}
          onChangeText={setDescription}
          placeholder="Descrição"
          multiline
          numberOfLines={4}
        />
        <TextInput
          style={styles.input}
          value={creationDate}
          onChangeText={setCreationDate}
          placeholder="Data de Criação (YYYY-MM-DD)"
          autoCapitalize="none"
          editable={false}
        />

        <Text style={styles.sectionTitle}>Selecionar Tipo de Planta</Text>
        {Object.keys(plantTypesByType).length === 0 ? (
          <Text style={styles.errorText}>Nenhum tipo de planta disponível. Verifique os dados.</Text>
        ) : (
          <View style={styles.typeButtonContainer}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                selectedPlantType?.type === 'existing' && styles.typeButtonSelected,
              ]}
              onPress={() => handleSelectPlantType('existing')}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  selectedPlantType?.type === 'existing' && styles.typeButtonTextSelected,
                ]}
              >
                Escolher Tipo Existente
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, styles.createButton]}
              onPress={() => setShowCreateModal(true)}
            >
              <Text style={styles.typeButtonText}>Criar Novo Tipo</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.sectionTitle}>Buscar Plantas</Text>
        <TextInput
          style={styles.input}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={selectedPlantType?.type === 'existing' ? 'Buscar tipos existentes...' : 'Selecione "Escolher Tipo Existente" para buscar...'}
          autoCapitalize="none"
          editable={selectedPlantType?.type === 'existing'}
        />

        <View style={styles.dropdownContainer}>
          {selectedPlantType?.type === 'existing' && filteredPlantTypes.length > 0 ? (
            <RNPickerSelect
              onValueChange={(value) => {
                console.log('Selecionando planta no dropdown:', value);
                setPlantTypeId(value);
              }}
              items={filteredPlantTypes.map(type => ({
                label: type.name,
                value: type.idplant_type,
              }))}
              placeholder={{ label: 'Selecione uma planta...', value: null }}
              style={pickerSelectStyles}
              value={plantTypeId}
            />
          ) : selectedPlantType?.type === 'existing' && filteredPlantTypes.length === 0 ? (
            <Text style={styles.infoText}>
              {searchQuery.trim() ? 'Nenhuma planta encontrada com esse termo.' : 'Digite um termo para buscar plantas.'}
            </Text>
          ) : null}
        </View>

        {selectedPlantType?.type === 'existing' && filteredPlantTypes.length > 0 && plantTypeId && (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>{filteredPlantTypes.find(t => t.idplant_type === plantTypeId)?.name}</Text>
            <Text style={styles.detailsText}>Rega: {filteredPlantTypes.find(t => t.idplant_type === plantTypeId)?.watering}</Text>
            <Text style={styles.detailsText}>Luz Solar: {filteredPlantTypes.find(t => t.idplant_type === plantTypeId)?.sunlight}</Text>
            <Text style={styles.detailsText}>Taxa de Crescimento: {filteredPlantTypes.find(t => t.idplant_type === plantTypeId)?.growth_rate}</Text>
            <Text style={styles.detailsText}>Nível de Cuidado: {filteredPlantTypes.find(t => t.idplant_type === plantTypeId)?.care_level}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Salvar</Text>
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
            <Text style={styles.modalTitle}>Criar Novo Tipo de Planta</Text>
            <TextInput
              style={styles.input}
              value={newPlantTypeName}
              onChangeText={setNewPlantTypeName}
              placeholder="Nome do Tipo de Planta"
              autoCapitalize="words"
            />
            <Text style={styles.label}>Rega:</Text>
            <RNPickerSelect
              onValueChange={setNewPlantWatering}
              items={wateringOptions.map(option => ({ label: option, value: option }))}
              placeholder={{ label: 'Selecione a Rega...', value: null }}
              style={pickerSelectStyles}
              value={newPlantWatering}
            />
            <Text style={styles.label}>Luz Solar:</Text>
            <RNPickerSelect
              onValueChange={setNewPlantSunlight}
              items={sunlightOptions.map(option => ({ label: option, value: option }))}
              placeholder={{ label: 'Selecione a Luz Solar...', value: null }}
              style={pickerSelectStyles}
              value={newPlantSunlight}
            />
            <Text style={styles.label}>Taxa de Crescimento:</Text>
            <RNPickerSelect
              onValueChange={setNewPlantGrowthRate}
              items={growthRateOptions.map(option => ({ label: option, value: option }))}
              placeholder={{ label: 'Selecione a Taxa de Crescimento...', value: null }}
              style={pickerSelectStyles}
              value={newPlantGrowthRate}
            />
            <Text style={styles.label}>Nível de Cuidado:</Text>
            <RNPickerSelect
              onValueChange={setNewPlantCareLevel}
              items={careLevelOptions.map(option => ({ label: option, value: option }))}
              placeholder={{ label: 'Selecione o Nível de Cuidado...', value: null }}
              style={pickerSelectStyles}
              value={newPlantCareLevel}
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#468585'}]}
                onPress={handleCreatePlantType}
              >
                <Text style={styles.modalButtonText}>Criar</Text>
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
  label: { fontSize: 16, color: '#468585', marginBottom: 5, alignSelf: 'flex-start' },
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
    marginHorizontal: 5,
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