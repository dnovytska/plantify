import React from 'react';
import { View, Button, StyleSheet, Text } from 'react-native';

const WelcomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo!</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Login"
          onPress={() => navigation.navigate('LoginScreen')}
          color="#007AFF"
        />
        <View style={styles.spacer} />
        <Button
          title="Registrar"
          onPress={() => navigation.navigate('RegisterScreen')}
          color="#34C759"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 40,
    fontWeight: 'bold',
  },
  buttonContainer: {
    width: '60%',
  },
  spacer: {
    height: 20,
  },
});

export default WelcomeScreen;