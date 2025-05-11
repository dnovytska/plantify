// src/screens/WelcomeScreen.jsx
import React from 'react';
import { View, Button, StyleSheet } from 'react-native';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Button
        title="Fazer Login"
        onPress={() => navigation.navigate('Login')}
      />
      <Button
        title="Registrar-se"
        onPress={() => navigation.navigate('Register')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
