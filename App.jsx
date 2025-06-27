import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, Text } from 'react-native';
import * as Notifications from 'expo-notifications';

import { AuthProvider, AuthContext } from './src/context/AuthContext';
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import YourPlantsScreen from './src/screens/YourPlantsScreen';
import PlantScreen from './src/screens/PlantScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import AddPlantScreen from './src/screens/AddPlantScreen';
import EditPlantScreen from './src/screens/EditPlantScreen';
import PlantIdentificationScreen from './src/screens/PlantIdentificationScreen';
import HeaderDropdown from './src/components/HeaderDropDown';
import BottomBar from './src/components/BottomBar';
import CreateTaskScreen from './src/screens/CreateTaskScreen';
import EditTaskScreen from './src/screens/EditTaskScreen';
import TaskScreen from './src/screens/TaskScreen';
import CreateDiseaseScreen from './src/screens/CreateDiseaseScreen';
import AboutScreen from './src/screens/AboutScreen';
import DiseaseScreen from './src/screens/DiseaseScreen';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Navegador de autenticação
const Stack = createNativeStackNavigator();

function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Navegador principal
function AppNavigator() {
  const { loggedIn, isLoading } = useContext(AuthContext);
  console.log('AppNavigator estado:', { loggedIn, isLoading });

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#468585" />
        <Text>Verificando utilizador...</Text>
      </View>
    );
  }
  if (!loggedIn) {
    console.log('utilizador não logado no AppNavigator, aguardando RootNavigator');
    return null;
  }
  return (
    <>
      <Stack.Navigator
        screenOptions={{
          headerTitle: "", // Remove o título do cabeçalho
          headerRight: () => <HeaderDropdown />,
        }}
        initialRouteName="YourPlants"
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="YourPlants" component={YourPlantsScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="AddPlant" component={AddPlantScreen} />
        <Stack.Screen name="Plant" component={PlantScreen} />
        <Stack.Screen name="EditPlantScreen" component={EditPlantScreen} />
        <Stack.Screen name="PlantIdentification" component={PlantIdentificationScreen} />
        <Stack.Screen name="CreateTask" component={CreateTaskScreen} />
        <Stack.Screen name="EditTask" component={EditTaskScreen} />
        <Stack.Screen name="Task" component={TaskScreen} />
        <Stack.Screen name="CreateDiseaseScreen" component={CreateDiseaseScreen} />
        <Stack.Screen name="DiseaseScreen" component={DiseaseScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
      </Stack.Navigator>
      <BottomBar /> {/* Não precisa passar a prop navigation aqui */}
    </>
  );
}

// Navegador raiz
function RootNavigator() {
  const { loggedIn, isLoading } = useContext(AuthContext);
  console.log('RootNavigator estado:', { loggedIn, isLoading });

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#468585" />
        <Text>Verificando utilizador...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {loggedIn ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
