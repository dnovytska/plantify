import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
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
import NotificationsScreen from './src/screens/NotificationsScreen';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Navegador de autenticação
const AuthStack = createStackNavigator();
function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

// Navegador principal
const AppStack = createStackNavigator();
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
      <AppStack.Navigator
        screenOptions={{
          headerRight: () => <HeaderDropdown />,
          headerTitleAlign: 'center',
        }}
        initialRouteName="YourPlants"
      >
        <AppStack.Screen name="Home" component={HomeScreen} />
        <AppStack.Screen name="YourPlants" component={YourPlantsScreen} />
        <AppStack.Screen name="Settings" component={SettingsScreen} />
        <AppStack.Screen name="EditProfile" component={EditProfileScreen} />
        <AppStack.Screen name="AddPlant" component={AddPlantScreen} />
        <AppStack.Screen name="Plant" component={PlantScreen} />
        <AppStack.Screen name="EditPlantScreen" component={EditPlantScreen} />
        <AppStack.Screen name="PlantIdentification" component={PlantIdentificationScreen} />
        <AppStack.Screen name="CreateTask" component={CreateTaskScreen} />
        <AppStack.Screen name="EditTask" component={EditTaskScreen} />
        <AppStack.Screen name="Task" component={TaskScreen} />
        <AppStack.Screen name="CreateDiseaseScreen" component={CreateDiseaseScreen} />
        <AppStack.Screen name="DiseaseScreen" component={DiseaseScreen} />
        <AppStack.Screen name="About" component={AboutScreen} />
        <AppStack.Screen name="Notifications" component={NotificationsScreen} />
      </AppStack.Navigator>
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