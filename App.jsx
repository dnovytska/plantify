import React from 'react';
import 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { View, Text, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from './src/screens/WelcomeScreen';
import PlantScreen from './src/screens/PlantScreen';

const Tab = createMaterialTopTabNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={PlantScreen} />
        <Tab.Screen name="Welcome" component={WelcomeScreen} />
      </Tab.Navigator>
    </NavigationContainer>
    
  );
};

export default App;