import React from 'react';
import 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { View, Text, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from './src/screens/WelcomeScreen';
import PlantScreen from './src/screens/PlantScreen';
import LoginScreen from './src/screens/LoginScreen';
import YourPlantsScreen from './src/screens/YourPlantsScreen';
import YourPlantScreen from './src/screens/YourPlantScreen';

const Tab = createMaterialTopTabNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={PlantScreen} />
        <Tab.Screen name="Welcome" component={WelcomeScreen} />
        <Tab.Screen name="Login" component={LoginScreen} />
        <Tab.Screen name="Your Plants" component={YourPlantsScreen} />
        <Tab.Screen name="Your Plant" component={YourPlantScreen} />
      </Tab.Navigator>
    </NavigationContainer>
    
  );
};

export default App;