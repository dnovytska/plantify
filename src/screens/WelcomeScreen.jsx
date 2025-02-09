import React from 'react';
import { View, Text, StyleSheet, ImageBackground, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Button from '../components/Button';

const WelcomeScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Image source={require("../../assets/plant-logo.png")} style={styles.image}/>
      <Text style={styles.text}>Uma frase qualquer apenas porque sim</Text>
      <Text style={styles.title}>Plantify</Text>

      <Button 
        title="Login" 
        color="white" 
        width='80%'
        textColor="#1A5E5E"
        onPress={() => navigation.navigate('Login')}
      />
      <Button
        title="Registrar-se"
        color="white" 
        borderWeight='10'
        bordercolor='white'
        width='80%'
        textColor="#1A5E5E"
        onPress={() => navigation.navigate('Home')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#50B498',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    fontSize: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 40,
  },
  image: {
    width: 290,
    height: 290,
    marginBottom: 20,
  },
});

export default WelcomeScreen;