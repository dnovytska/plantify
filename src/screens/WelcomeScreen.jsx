import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Top left flower */}
      <Image
        source={require('../../assets/topleftflower.png')}
        style={[styles.decorativeImage, styles.topLeft]}
      />

      {/* Top right flower */}
      <Image
        source={require('../../assets/toprightflower.png')}
        style={[styles.decorativeImage, styles.topRight]}
      />

      {/* Logo central */}
      <Image
        source={require('../../assets/logo.png')}
        style={styles.logo}
      />

      {/* Frase */}
      <Text style={styles.phrase}>
        Uma frase qualquer{'\n'}apenas porque sim
      </Text>

      {/* Nome do app */}
      <View style={styles.nameBox}>
        <Text style={styles.appName}>Plantify</Text>
      </View>

      {/* Botões */}
      <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate('Register')}>
        <Text style={styles.registerText}>Registrar-se</Text>
      </TouchableOpacity>

      {/* Bottom left leaf */}
      <Image
        source={require('../../assets/bottomleftleaf.png')}
        style={[styles.decorativeImage, styles.bottomLeft]}
      />

      {/* Bottom right leaf */}
      <Image
        source={require('../../assets/bottomrightleaf.png')}
        style={[styles.decorativeImage, styles.bottomRight]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#49B59E',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  decorativeImage: {
    width: 180,
    height: 180,
    position: 'absolute',
  },
  topLeft: {
    top: 0,
    left: 0,
  },
  topRight: {
    top: 0,
    right: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
  },
  logo: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  phrase: {
    fontSize: 24,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
  },
  nameBox: {
    backgroundColor: '#DDEAF0',
    paddingHorizontal: 147,
    paddingVertical: 8,
    marginBottom: 50,
  },
  appName: {
    fontSize: 28,
    color: '#235958',
    fontWeight: '500',
    fontFamily: 'sans-serif',
  },
  loginButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 60,
    borderRadius: 30,
    marginBottom: 20,
  },
  loginText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '500',
  },
  registerButton: {
    borderColor: '#FFFFFF',
    borderWidth: 2,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  registerText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
  },
});
