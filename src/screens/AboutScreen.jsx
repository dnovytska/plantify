// src/screens/AboutScreen.js
import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Sobre o Aplicativo</Text>
      <Image
        source={{ uri: 'https://via.placeholder.com/150' }} // Substitua pela URL da imagem do logotipo ou uma imagem representativa
        style={styles.logo}
      />
      <Text style={styles.description}>
        Este aplicativo foi desenvolvido para ajudar você a cuidar de suas plantas de forma prática e eficiente. 
        Com funcionalidades que permitem o gerenciamento de tarefas, identificação de plantas e monitoramento de doenças, 
        nosso objetivo é facilitar a vida dos amantes de jardinagem e botânica.
      </Text>
      <Text style={styles.description}>
        Acreditamos que todos podem ter um espaço verde em suas vidas, e este aplicativo é uma ferramenta para 
        tornar isso possível. Seja você um jardineiro experiente ou um iniciante, nosso aplicativo oferece 
        recursos que atendem a todas as suas necessidades.
      </Text>
      <Text style={styles.version}>
        Versão: 1.0.0
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: '#468585',
    marginBottom: 10,
    textAlign: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#2F2182',
    marginBottom: 10,
    lineHeight: 24,
  },
  version: {
    fontSize: 16,
    color: '#468585',
    textAlign: 'center',
    marginTop: 20,
  },
});
