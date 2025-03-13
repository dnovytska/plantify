import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import BottomBar from './src/components/BottomBar';  // Ajuste o caminho conforme necessário
import YourPlantScreen from './src/screens/YourPlantScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import HomeScreen from './src/screens/HomeScreen'; // Adicionei para evitar erro de navegação
import YourPlantsScreen from './src/screens/YourPlantsScreen'; // Adicionei para evitar erro de navegação
import SettingsScreen from './src/screens/SettingsScreen'; // Adicionei para evitar erro de navegação
import * as Animatable from 'react-native-animatable';

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="WelcomeScreen">
        <Stack.Screen
          name="WelcomeScreen"
          component={WelcomeScreen}
          options={({ navigation }) => ({
            header: () => <CustomHeader navigation={navigation} />, 
          })}
        />
        <Stack.Screen 
          name="YourPlantScreen" 
          component={YourPlantScreen} 
          options={({ navigation }) => ({
            header: () => <CustomHeader navigation={navigation} />,
          })}
        />
        <Stack.Screen 
          name="SettingsScreen" 
          component={SettingsScreen} 
          options={({ navigation }) => ({
            header: () => <CustomHeader navigation={navigation} />,
          })}
        />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="Plants" component={YourPlantsScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />

      </Stack.Navigator>
      <BottomBar />
    </NavigationContainer>
  );
}

const CustomHeader = ({ navigation }) => {
  const [showMenu, setShowMenu] = useState(false); 

  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
        <View style={styles.headerLeft}>
          <Text style={styles.username}>Username</Text>
          <Image 
            source={require("./assets/images/menu.png")} 
            style={styles.menuIcon} 
          />
        </View>
      </TouchableOpacity>
      {showMenu && (
        <Animatable.View
          style={styles.menuContainer}
          animation="fadeInDown"
          duration={500}
        >
          <View style={styles.menuOptions}>
            <TouchableOpacity onPress={() => navigation.navigate('HomeScreen')}>
              <Text style={styles.menuOption}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('YourPlantsScreen')}>
              <Text style={styles.menuOption}>Plants</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('WelcomeScreen')}>
              <Text style={styles.menuOption}>Sair</Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    height: 80,
    backgroundColor: '#468585',
    justifyContent: 'flex-start',
    paddingTop: 30,
    position: 'relative',
  },
  headerLeft: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
  },
  username: {
    color: 'white',
    fontSize: 18,
  },
  menuIcon: {
    width: 25,
    height: 25,
    tintColor: 'white',
  },
  menuContainer: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    backgroundColor: 'rgb(0, 0, 0)',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  menuOptions: {
    backgroundColor: '#468585',
    width: '100%',
    paddingVertical: 20,
    alignItems: 'center',
  },
  menuOption: {
    paddingVertical: 10,
    fontSize: 18,
    textAlign: 'center',
    color: 'white',
  },
});

export default App;
