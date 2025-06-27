import React from 'react';
import { TouchableOpacity, View, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const BottomBar = () => {
  const navigation = useNavigation(); // Obtenha a navegação aqui

  return (
    <View style={styles.bottomBar}>
      <TouchableOpacity 
        style={styles.icon} 
        onPress={() => navigation.navigate('PlantIdentification')}>
        <Image source={require("../../assets/images/camera.png")} style={styles.iconContent} />
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.icon} 
        onPress={() => navigation.navigate('YourPlants')}>
        <Image source={require("../../assets/images/many-plants.png")} style={styles.iconContent} />
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.icon} 
        onPress={() => navigation.navigate('AddPlant')}>
        <Image source={require("../../assets/images/plus.png")} style={styles.iconContent} />
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.icon} 
        onPress={() => navigation.navigate('Settings')}>
        <Image source={require("../../assets/images/gear.png")} style={styles.iconContent} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomBar: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    borderRadius: 35,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#468585',
    padding: 10,
    marginBottom: 40,
  },
  icon: {
    width: 60,
    height: 60,
    backgroundColor: 'transparent',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContent: {
    width: 60, // Ajuste o tamanho da imagem
    height: 60, // Ajuste o tamanho da imagem
  },
});

export default BottomBar;
