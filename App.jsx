import React, { useContext } from 'react'; // Ensured useContext is imported (no useEffect needed here)
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View, Text } from 'react-native';

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
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
// Navegador de autenticação (Welcome, Login, Register)
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

// Componente wrapper para incluir o BottomBar
const AppContent = ({ navigation }) => (
  <>
    <AppStack.Navigator
      screenOptions={{
        headerRight: () => <HeaderDropdown />,
        headerTitleAlign: 'center',
      }}
      initialRouteName="Home"
    >
      <AppStack.Screen name="Home" component={HomeScreen} />
      <AppStack.Screen name="YourPlants" component={YourPlantsScreen} />
      <AppStack.Screen name="SettingsScreen" component={SettingsScreen} />
      <AppStack.Screen name="EditProfile" component={EditProfileScreen} />
      <AppStack.Screen name="AddPlant" component={AddPlantScreen} />
      <AppStack.Screen name="Plant" component={PlantScreen} />
      <AppStack.Screen name="EditPlantScreen" component={EditPlantScreen} />
      <AppStack.Screen name="PlantIdentification" component={PlantIdentificationScreen} />
      <AppStack.Screen name="CreateTask" component={CreateTaskScreen} />
      <AppStack.Screen name="EditTask" component={EditTaskScreen} />
      <AppStack.Screen name="Task" component={TaskScreen} />
    </AppStack.Navigator>
    <BottomBar navigation={navigation} />
  </>
);

// Navegador principal
const AppStack = createStackNavigator();
function AppNavigator() {
  return <AppContent />;
}

// Navegador raiz que decide entre autenticação e aplicativo
function RootNavigator() {
  const context = useContext(AuthContext);
  if (!context) {
    console.error('AuthContext não está disponível no RootNavigator');
    return null;
  }

  const { loggedIn, isLoading } = context;

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#468585" />
        <Text>Verificando usuário...</Text>
      </View>
    );
  }

  console.log('Estado de autenticação:', { loggedIn });
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