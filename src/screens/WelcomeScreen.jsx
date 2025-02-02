import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Plant from '../components/Plant';
import Button from '../components/Button';

const WelcomeScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Plant />
      <Text style={styles.text}>Uma frase qualquer apenas porque sim</Text>
      <Text style={styles.title}>Plantify</Text>
      <Button
        title="Login"
        onPress={() => navigation.navigate('Home')}
      />
      <Button
        title="Registrar-se"
        onPress={() => navigation.navigate('Home')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    fontSize: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 40,
  },
});

export default WelcomeScreen;