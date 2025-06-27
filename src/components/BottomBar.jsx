import React from 'react';
import { TouchableOpacity, View, StyleSheet, Image } from 'react-native';

const BottomBar = ({ navigation }) => {
  return (
    <View style={styles.bottomBar}>
      <TouchableOpacity 
        style={styles.icon} 
        onPress={() => navigation.navigate('Home')}>
        <Image source={require("../../assets/images/home.png")} style={styles.iconContent} />
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.icon} 
        onPress={() => navigation.navigate('YourPlants')}>
        <Image source={require("../../assets/images/many-plants.png")} style={styles.iconContent} />
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
  },
  icon: {
    width: 60,
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContent: {
    width: 60,
    height: 60,
    backgroundColor: '#468585',
    borderRadius: 10,
  },
});

export default BottomBar;