import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import BottomBar from './src/components/BottomBar';  // Ajuste o caminho conforme necessário
import PlantScreen from './src/screens/PlantScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import * as Animatable from 'react-native-animatable';

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="WelcomeScreen">
        <Stack.Screen
          name="WelcomeScreen"
          component={WelcomeScreen}
          options={{
            headerShown: false, // Oculta o cabeçalho padrão
          }}
        />
        <Stack.Screen 
          name="PlantScreen" 
          component={PlantScreen} 
          options={{
            header: () => <CustomHeader />, // Define o cabeçalho personalizado
          }}
        />
      </Stack.Navigator>
      <BottomBar />
    </NavigationContainer>
  );
}

const CustomHeader = () => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerLeft}>
        <Text style={styles.username}>username</Text>
        <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
          <Text style={styles.arrow}>↓</Text>
        </TouchableOpacity>
      </View>
      {showMenu && (
        <Animatable.View
          style={styles.menuContainer}
          animation="fadeInDown"
          duration={500}
        >
          <View style={styles.menuOptions}>
            <Text style={styles.menuOption}>Meu perfil</Text>
            <Text style={styles.menuOption}>Configurações</Text>
            <Text style={styles.menuOption}>Sair</Text>
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
  arrow: {
    color: 'white',
    fontSize: 18,
  },
  menuContainer: {
    position: 'absolute',
    top: 80, // Inicia logo abaixo do cabeçalho
    left: 0,
    right: 0,
    backgroundColor: 'rgb(0, 0, 0)',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  menuOptions: {
    backgroundColor: '#468585',
    borderRadius: 5,
    width: '100%',
    paddingVertical: 20,
    alignItems: 'center',
  },
  menuOption: {
    paddingVertical: 10,
    fontSize: 18,
    textAlign: 'center',
  },
});

export default App;